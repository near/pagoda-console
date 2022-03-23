export default function Blockquote(props: any) {
  return (
    <>
      <blockquote>{props.children}</blockquote>
      <style jsx>{`
        blockquote {
          border-left: 0.5rem solid black;
          padding-left: 1rem;
        }
      `}</style>
    </>
  );
}
