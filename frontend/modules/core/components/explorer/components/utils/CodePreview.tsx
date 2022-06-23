// import ReactTextCollapse from "react-text-collapse";

export interface CollapseOptions {
  collapseText: string;
  expandText: string;
  minHeight: number;
  maxHeight: number;
}

export interface Props {
  collapseOptions: CollapseOptions;
  value: string;
}

// TODO Text collapse
const CodePreview = (props: Props) => {
  return (
    <>
      {/* <ReactTextCollapse options={props.collapseOptions}> */}
      <textarea readOnly className="code-preview" value={props.value} />
      {/* </ReactTextCollapse> */}
      <style jsx>{`
        .code-preview {
          font-family: var(--font-code);
          background: #424957;
          color: white;
          padding: 20px;
          width: 100%;
          height: 99%;
        }
      `}</style>
    </>
  );
};

export default CodePreview;
