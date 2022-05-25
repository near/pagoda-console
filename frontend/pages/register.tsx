import { Container } from '@/components/lib/Container';
import { RegisterForm } from '@/components/RegisterForm';
import { useSimpleLayout } from '@/hooks/layouts';
import type { NextPageWithLayout } from '@/utils/types';

const Register: NextPageWithLayout = () => {
  return (
    <Container size="xs">
      <RegisterForm />
    </Container>
  );
};

Register.getLayout = useSimpleLayout;

export default Register;
