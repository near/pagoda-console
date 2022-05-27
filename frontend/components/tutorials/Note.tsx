import { Flex } from '../lib/Flex';
import { Message } from '../lib/Message';
import { P } from '../lib/Paragraph';

export default function Note(props: any) {
  let icon;
  if (props.type === 'info') {
    icon = 'alert-circle';
  } else if (props.type === 'tip') {
    icon = 'zap';
  } else {
    icon = 'help-circle';
  }

  return (
    <>
      <Message icon={icon}>
        <Flex stack gap="s">
          <P>{props.children[0] ? props.children[0].props.children : props.children.props.children}</P>
          {props.children[0] && props.children.slice(1)}
        </Flex>
      </Message>
    </>
  );
}
