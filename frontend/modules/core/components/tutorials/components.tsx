import { Anchor, H1Anchor, H2Anchor, H3Anchor } from './Anchors';
import Blockquote from './Blockquote';
import MdxCodeBlock from './MdxCodeBlock';
import Note from './Note';
import SetApiKey from './SetApiKey';

// A component map between markdown syntax and custom JSX components.
// This allows customizing the markdown output while the leaving customizations outside of markdown itself.
// For more info: https://mdxjs.com/table-of-components/
const components = {
  h1: H1Anchor,
  h2: H2Anchor,
  h3: H3Anchor,
  a: Anchor,
  Anchor: Anchor,
  code: MdxCodeBlock,
  Info: (props: any) => {
    return <Note type="info">{props.children}</Note>;
  },
  Tip: (props: any) => {
    return <Note type="tip">{props.children}</Note>;
  },
  Note: Note,
  Table: (props: any) => {
    return <table>{props.children}</table>;
  },
  blockquote: Blockquote,
  SetApiKey: SetApiKey,
};

export default components;
