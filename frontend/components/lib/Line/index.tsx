import { styled } from '@/styles/stitches';

const CustomBox = styled('div', {
  height: '1px',
  background: '#313538',
  margin: '80px 0',
});

const Line = () => <CustomBox />;

export default Line;
