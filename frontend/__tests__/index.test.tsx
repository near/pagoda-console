import { render, screen } from '@testing-library/react'
import Login from '../pages/index'

jest.mock('next/image', () => ({
  __esModule: true,
  default: () => {
    return 'Next image stub'; // whatever
  },
}));

describe('Login', () => {
  it('renders a login page', () => {
    render(<Login />)

    const terms = screen.getByText('Terms of Use');
    expect(terms).toBeInTheDocument();

  });
});