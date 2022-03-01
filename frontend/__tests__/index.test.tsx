import { render, screen } from '@testing-library/react'
import Login from '../pages/index'

describe('Login', () => {
    it('renders a login page', () => {
        render(<Login />)

        const terms = screen.getByText('Terms of Use');
        expect(terms).toBeInTheDocument();

        const privacy = screen.getByText('Privacy Policy');
        expect(privacy).toBeInTheDocument();

    });
});