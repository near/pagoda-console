import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';

const HeaderText = ({ children, ...rest }) => (
  <Flex align="center">
    <FeatherIcon size="m" {...rest} />
    <Text size="h5" family="number" color="text1">
      {children}
    </Text>
  </Flex>
);

export default HeaderText;
