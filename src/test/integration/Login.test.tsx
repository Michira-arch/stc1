import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Login } from '../../../pages/auth/Login';
import { useApp } from '../../../store/AppContext';
import { supabase } from '../../../store/supabaseClient';

// Mock the modules
vi.mock('../../../store/AppContext', () => ({
    useApp: vi.fn(),
}));

vi.mock('../../../store/supabaseClient', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
        },
    },
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, ...props }: any) => (
            <div className={className} {...props}>
                {children}
            </div>
        ),
        button: ({ children, className, ...props }: any) => (
            <button className={className} {...props}>
                {children}
            </button>
        ),
    },
}));

describe('Login Integration', () => {
    const mockOnNavigate = vi.fn();
    const mockLoginAsGuest = vi.fn();
    const mockShowToast = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useApp as any).mockReturnValue({
            loginAsGuest: mockLoginAsGuest,
            showToast: mockShowToast,
        });
    });

    it('renders login form correctly', () => {
        render(<Login onNavigate={mockOnNavigate} />);
        expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByText('Sign In')).toBeInTheDocument();
        expect(screen.getByText('Continue as Guest')).toBeInTheDocument();
    });

    it('handles successful login', async () => {
        (supabase.auth.signInWithPassword as any).mockResolvedValue({ error: null });

        render(<Login onNavigate={mockOnNavigate} />);

        fireEvent.change(screen.getByPlaceholderText('Email Address'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'password123' },
        });
        fireEvent.click(screen.getByText('Sign In'));

        await waitFor(() => {
            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(mockOnNavigate).toHaveBeenCalledWith('feed');
        });
    });

    it('handles login failure', async () => {
        const errorMsg = 'Invalid credentials';
        (supabase.auth.signInWithPassword as any).mockResolvedValue({
            error: { message: errorMsg },
        });

        render(<Login onNavigate={mockOnNavigate} />);

        fireEvent.change(screen.getByPlaceholderText('Email Address'), {
            target: { value: 'wrong@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'wrongpass' },
        });
        fireEvent.click(screen.getByText('Sign In'));

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(errorMsg, 'error');
            expect(mockOnNavigate).not.toHaveBeenCalled();
        });
    });

    it('handles guest login', () => {
        render(<Login onNavigate={mockOnNavigate} />);
        fireEvent.click(screen.getByText('Continue as Guest'));

        expect(mockLoginAsGuest).toHaveBeenCalled();
        expect(mockOnNavigate).toHaveBeenCalledWith('feed');
    });
});
