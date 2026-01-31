import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Environment Setup', () => {
    it('should pass a basic truthy test', () => {
        expect(true).toBe(true);
    });

    it('should be able to render a simple element', () => {
        render(<div data-testid="test-div">Hello World</div>);
        expect(screen.getByTestId('test-div')).toBeInTheDocument();
    });
});
