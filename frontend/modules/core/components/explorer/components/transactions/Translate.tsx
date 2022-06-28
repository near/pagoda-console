export default function Translate(props: any) {
  return (
    <div>
      {props.id}
      {props.data ? ` > ${props.data}` : ''}
    </div>
  );
}
