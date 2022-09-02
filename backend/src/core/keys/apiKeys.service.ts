import { User } from '@/generated/prisma/core';
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
    orgSlug: string,
    projectSlug: string,
    userId: User['id'],
    usersDescription?: string,
  ) {
    const slug = nanoid();
    let kongConsumerObj;

    try {
      kongConsumerObj = await this.prisma.apiKey.findFirst({
        where: {
          orgSlug,
        },
        select: {
          kongConsumerName: true,
        },
      });
    } catch (e) {
      throw new VError('Failed while getting org from db.');
    }

    const description = usersDescription ? usersDescription : 'default';
    const kongConsumerName = kongConsumerObj
      ? kongConsumerObj.kongConsumerName
      : nanoid();
    try {
      await this.prisma.apiKey.create({
        data: {
          slug,
          projectSlug,
          orgSlug,
          kongConsumerName,
          description,
          createdBy: userId,
          updatedBy: userId,
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while generating key');
    }

    try {
      // creating kong consumer object if it's the first time the org is creating a key
      if (!kongConsumerObj) {
        await this.provisioningService.createOrganization(
          kongConsumerName,
          orgSlug,
        );
      }

      // generating key for kong consumer
      await this.provisioningService.generate(kongConsumerName, slug);

      return await this.getKey(slug);
    } catch (e) {
      //rolling back if failed to generate keys in the provisioning service
      try {
        await this.prisma.apiKey.delete({
          where: {
            slug,
          },
        });
      } catch (e) {
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

  async rotateKey(orgSlug: string, slug: string, userId: User['id']) {
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
      await this.provisioningService.rotate(keyDetails.kongConsumerName, slug);
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
    } catch (e) {
      throw new VError(e, 'Failed while rotating key in provisioning service');
    }
  }

  async deleteKey(orgSlug: string, slug: string, userId: User['id']) {
    let kongConsumerObj;
    try {
      kongConsumerObj = await this.prisma.apiKey.findFirst({
        where: {
          orgSlug,
        },
        select: {
          kongConsumerName: true,
        },
      });
    } catch (e) {
      throw new VError('Failed while getting org from db.');
    }

    if (!kongConsumerObj) {
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
      await this.provisioningService.delete(
        kongConsumerObj.kongConsumerName,
        slug,
      );
    } catch (e) {
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
    } catch (e) {
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
        },
      });
      if (projectKeySlugs.length === 0) {
        return [];
      }

      const keys: { keySlug: string; description: string; key: string }[] = [];
      const keyPromises = [];
      projectKeySlugs.forEach((el) => {
        keyPromises.push(
          this.provisioningService.fetch(el.slug).then((key) => {
            keys.push({
              keySlug: el.slug,
              description: el.description,
              key,
            });
          }),
        );
      });

      await Promise.all(keyPromises);

      return keys;
    } catch (e) {
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
    } catch (e) {
      throw new VError(e, 'Failed while getting a key from DB');
    }

    if (!keyDetails) {
      throw new VError({ info: { code: 'BAD_KEY' } }, 'Could not find key');
    }

    try {
      const key = await this.provisioningService.fetch(slug);
      return { keySlug: slug, description: keyDetails.description, key };
    } catch (e) {
      throw new VError(e, 'Failed while getting a key');
    }
  }

  async deleteOrg(orgSlug: string, userId: User['id']) {
    let kongConsumerObj;
    try {
      kongConsumerObj = await this.prisma.apiKey.findFirst({
        where: {
          orgSlug,
        },
        select: {
          kongConsumerName: true,
        },
      });
    } catch (e) {
      throw new VError('Failed while getting org from db.');
    }

    if (!kongConsumerObj) {
      throw new VError(
        { info: { code: 'BAD_REQUEST' } },
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
        orgKeySlugs.map((el) => this.deleteKey(orgSlug, el.slug, userId)),
      );

      await this.provisioningService.deleteOrganization(
        kongConsumerObj.kongConsumerName,
      );
    } catch (e) {
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
          kongConsumerName: true,
        },
      });
    } catch (e) {
      throw new VError(e, `Failed to get api key details for keySlug ${slug}`);
    }
    return keyDetails;
  }

  async deleteProjectKeys(projectSlug: string, userId: User['id']) {
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

      const keyPromises = [];
      projectKeySlugs.forEach((el) => {
        keyPromises.push(this.deleteKey(el.orgSlug, el.slug, userId));
      });

      await Promise.all(keyPromises);
    } catch (e) {
      return new VError('Deleting project keys failed.', e);
    }
  }
}
