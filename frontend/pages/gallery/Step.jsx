import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { styled } from '@/styles/stitches';

const StepFlex = styled(Flex, {
  padding: '120px 0 60px',
});

const IconBackground = styled(Flex, {
  width: '80px',
  height: '80px',
  backgroundColor: '#26292B',
  borderRadius: '32px',
  marginBottom: '12px',
});

const Step = ({ icon, header, text }) => (
  <StepFlex stack>
    <IconBackground align="center" justify="center">
      {icon}
    </IconBackground>
    <Text size="h5" weight="regular" color="text1">
      {header}
    </Text>
    <Text color="text3">{text}</Text>
  </StepFlex>
);

export default Step;
