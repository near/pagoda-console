import { Box } from '@/components/lib/Box';

export default function Blockquote(props: any) {
  return (
    <>
      <Box
        as="blockquote"
        css={{
          borderLeft: '0.5rem solid var(--color-surface-5)',
          paddingLeft: 'var(--space-m)',
        }}
      >
        {props.children}
      </Box>
    </>
  );
}
