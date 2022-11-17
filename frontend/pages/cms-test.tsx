// THIS PAGE IS FOR DEVELOPMENT PURPOSES ONLY

import type { GetStaticProps } from 'next';

import { Section } from '@/components/lib/Section';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { useSimpleLayout } from '@/hooks/layouts';
import type { NextPageWithLayout } from '@/utils/types';

interface TemplateResponse {
  data: Template[];
  meta?: {
    pagination: {
      page?: number;
      pageSize?: number;
      pageCount?: number;
      total?: number;
    };
  };
}

interface Template {
  id: number;
  attributes: {
    githubUrl: string;
    name: string;
    nameSlug: string;
    contractLanguage?: 'rust' | 'javascript' | 'typescript';
    tools: { data: Tool[] };
    categories: { data: Category[] };
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

interface Tool {
  id: number;
  attributes: {
    name: string;
  };
}
interface Category {
  id: number;
  attributes: {
    name: string;
  };
}

export const getStaticProps: GetStaticProps = async (_) => {
  const res = await fetch(`${process.env.CMS_URL}/templates?populate[0]=tools&populate[1]=categories`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.CMS_API_KEY}`,
    },
  });
  debugger;
  if (res.status !== 200) {
    throw new Error('Failed to fetch templates');
  }

  return {
    props: {
      templates: ((await res.json()) as TemplateResponse).data,
    },
  };
};

const CmsTest: NextPageWithLayout<{ templates: Template[] }> = ({ templates }) => {
  return (
    <Section>
      <Table.Root>
        <Table.Head css={{ top: 0 }}>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Github URL</Table.HeaderCell>
            <Table.HeaderCell>Contract Language</Table.HeaderCell>
            <Table.HeaderCell>Tools</Table.HeaderCell>
            <Table.HeaderCell>Categories</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {templates.map((row) => {
            return (
              <Table.Row key={row.id}>
                <Table.Cell>
                  <Text>{row.attributes.name}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text>{row.attributes.githubUrl}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text>{row.attributes.contractLanguage}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text>{row.attributes.tools.data.map((tool) => tool.attributes.name).join(', ')}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text>{row.attributes.categories.data.map((cat) => cat.attributes.name).join(', ')}</Text>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Section>
  );
};

CmsTest.getLayout = useSimpleLayout;

export default CmsTest;
