import { User } from '@pc/database/clients/core';
import { Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { VError } from 'verror';
import { PrismaService } from '../prisma.service';
import { ApiKeysProvisioningService } from './provisioning.service';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 20);

@Injectable()
export class ApiKeysService {
  constructor(
    private prisma: PrismaService,
    private provisioningService: ApiKeysProvisioningService,
  ) {}

  async generateKey(
    userId: User['id'],
    orgSlug: string,
    projectSlug: string,
    usersDescription?: string,
  ) {
    const slug = nanoid();
    const description = usersDescription ? usersDescription : 'default';
    const kongConsumerName = await this.getKongConsumerName(orgSlug);

    try {
      await this.prisma.apiKey.create({
        data: {
          slug,
          projectSlug,
          orgSlug,
          description,
          createdBy: userId,
          updatedBy: userId,
        },
      });
    } catch (e: any) {
      throw new VError(e, 'Failed while generating key');
    }

    try {
      // creating kong consumer object if it's the first time the org is creating a key
      const kongConsumerObj = await this.provisioningService.getOrganization(
        kongConsumerName,
      );
      if (!kongConsumerObj) {
        await this.provisioningService.createOrganization(
          kongConsumerName,
          orgSlug,
        );
      }
      // generating key for kong consumer
      await this.provisioningService.generate(kongConsumerName, slug);

      return await this.getKey(slug);
    } catch (e: any) {
      //rolling back if failed to generate keys in the provisioning service
      try {
        await this.prisma.apiKey.delete({
          where: {
            slug,
          },
        });
      } catch (e: any) {
        throw new VError(
          e,
          'Failed while rolling back after failed keys generation',
        );
      }
      throw new VError(
        e,
        'Failed while generating key in provisioning service',
      );
    }
  }

  async rotateKey(userId: User['id'], slug: string) {
    let keyDetails;
    try {
      keyDetails = await this.getKeyDetails(slug);
    } catch (e) {
      throw new VError(
        { info: { code: 'BAD_KEY' } },
        'Could not find key details',
      );
    }

    if (!keyDetails.active) {
      throw new VError(
        { info: { code: 'BAD_KEY' } },
        'Key has been already deleted',
      );
    }

    const kongConsumerName = await this.getKongConsumerName(keyDetails.orgSlug);

    try {
      await this.provisioningService.rotate(kongConsumerName, slug);
      // updating the record so that it shows that the external key was rotated
      await this.prisma.apiKey.update({
        where: {
          slug,
        },
        data: {
          updatedBy: userId,
        },
      });
      return await this.getKey(slug);
    } catch (e: any) {
      throw new VError(e, 'Failed while rotating key in provisioning service');
    }
  }

  async deleteKey(userId: User['id'], orgSlug: string, slug: string) {
    const kongConsumerName = await this.getKongConsumerName(orgSlug);

    if (!kongConsumerName) {
      throw new VError(
        { info: { code: 'BAD_ORG' } },
        'Could not find org details',
      );
    }

    let keyDetails;
    try {
      keyDetails = await this.getKeyDetails(slug);
    } catch (e) {
      throw new VError(
        { info: { code: 'BAD_KEY' } },
        'Could not find key details',
      );
    }

    if (!keyDetails.active) {
      throw new VError(
        { info: { code: 'BAD_KEY' } },
        'Key has been already deleted',
      );
    }

    try {
      await this.provisioningService.delete(kongConsumerName, slug);
    } catch (e: any) {
      throw new VError(e, 'Failed while deleting key in provisioning service');
    }

    try {
      await this.prisma.apiKey.update({
        where: {
          slug,
        },
        data: {
          active: false,
          updatedBy: userId,
        },
      });
    } catch (e: any) {
      throw new VError(e, 'Failed while deleting key');
    }
  }

  async getKeys(projectSlug: string) {
    try {
      const projectKeySlugs = await this.prisma.apiKey.findMany({
        where: {
          projectSlug,
          active: true,
        },
        select: {
          slug: true,
          description: true,
          id: true,
          orgSlug: true,
        },
      });
      if (projectKeySlugs.length === 0) {
        return [];
      }

      const kongConsumerName = await this.getKongConsumerName(
        projectKeySlugs[0].orgSlug,
      );

      const keys: {
        id: number;
        keySlug: string;
        description: string;
        key: string;
        kongConsumerName: string;
      }[] = [];
      const keyPromises: Promise<void>[] = [];
      projectKeySlugs.forEach((el) => {
        keyPromises.push(
          this.provisioningService.fetch(el.slug).then((key) => {
            keys.push({
              id: el.id,
              keySlug: el.slug,
              description: el.description,
              key,
              kongConsumerName,
            });
          }),
        );
      });

      await Promise.all(keyPromises);

      return keys
        .sort((a, b) => a.id - b.id) // sorting in ascending order by id
        .map(({ id: _id, ...el }) => el); // cutting out the id
    } catch (e: any) {
      throw new VError(e, 'Failed while getting keys');
    }
  }

  async getKey(slug: string) {
    let keyDetails;
    try {
      keyDetails = await this.prisma.apiKey.findUnique({
        where: {
          slug,
        },
        select: {
          description: true,
        },
      });
    } catch (e: any) {
      throw new VError(e, 'Failed while getting a key from DB');
    }

    if (!keyDetails) {
      throw new VError({ info: { code: 'BAD_KEY' } }, 'Could not find key');
    }

    try {
      const key = await this.provisioningService.fetch(slug);
      return {
        keySlug: slug,
        description: keyDetails.description,
        key,
      };
    } catch (e: any) {
      throw new VError(e, 'Failed while getting a key');
    }
  }

  async deleteOrg(userId: User['id'], orgSlug: string) {
    const kongConsumerName = await this.getKongConsumerName(orgSlug);

    if (!kongConsumerName) {
      throw new VError(
        { info: { code: 'BAD_ORG' } },
        'Could not find org details',
      );
    }
    try {
      const orgKeySlugs = await this.prisma.apiKey.findMany({
        where: {
          orgSlug,
          active: true,
        },
        select: {
          slug: true,
        },
      });

      await Promise.all(
        orgKeySlugs.map((el) => this.deleteKey(userId, orgSlug, el.slug)),
      );

      await this.provisioningService.deleteOrganization(kongConsumerName);
    } catch (e: any) {
      throw new VError(e, 'Failed while deleting org');
    }
  }

  async getKeyDetails(slug: string) {
    let keyDetails;
    try {
      keyDetails = await this.prisma.apiKey.findUnique({
        where: {
          slug,
        },
        select: {
          orgSlug: true,
          projectSlug: true,
          active: true,
        },
      });
    } catch (e: any) {
      throw new VError(e, `Failed to get api key details for keySlug ${slug}`);
    }
    return keyDetails;
  }

  async deleteProjectKeys(userId: User['id'], projectSlug: string) {
    try {
      const projectKeySlugs = await this.prisma.apiKey.findMany({
        where: {
          projectSlug,
          active: true,
        },
        select: {
          slug: true,
          orgSlug: true,
        },
      });
      if (projectKeySlugs.length === 0) {
        return [];
      }

      const keyPromises: Promise<void>[] = [];
      projectKeySlugs.forEach((el) => {
        keyPromises.push(this.deleteKey(userId, el.orgSlug, el.slug));
      });

      await Promise.all(keyPromises);
    } catch (e) {
      throw new VError('Deleting project keys failed.', e);
    }
  }

  async createOrganization(kongConsumerName: string, orgSlug: string) {
    try {
      await this.provisioningService.createOrganization(
        kongConsumerName,
        orgSlug,
      );
    } catch (e) {
      throw new VError(
        'Creating a kong consumer for an organization failed.',
        e,
      );
    }
  }

  private async getKongConsumerName(orgSlug: string) {
    try {
      const res = (await this.prisma.org.findFirst({
        where: {
          slug: orgSlug,
        },
        select: {
          emsId: true,
        },
      }))!;
      return res.emsId;
    } catch (e) {
      throw new VError('Getting emsId from org table failed', e);
    }
  }
}
