import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import HeaderUserFunctions from '../../../components/Layout/HeaderUserFunctions';

const renderUserFunctions = (props: Partial<React.ComponentProps<typeof HeaderUserFunctions>> = {}) =>
  render(
    <MemoryRouter>
      <HeaderUserFunctions isAuthencated={false} logout={vi.fn()} {...props} />
    </MemoryRouter>
  );

describe('HeaderUserFunctions', () => {
  test('shows the login link when signed out', () => {
    renderUserFunctions();
    expect(screen.getByText('登入').closest('a')).toHaveAttribute('href', '/login');
    expect(screen.queryByText('登出')).not.toBeInTheDocument();
  });

  test('shows the user name and a logout button when signed in', () => {
    const logout = vi.fn();
    renderUserFunctions({ isAuthencated: true, fullName: '陳管理', logout });
    expect(screen.getByText('陳管理')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: '登出' });
    expect(button.closest('a')).toBeNull();
    fireEvent.click(button);
    expect(logout).toHaveBeenCalledTimes(1);
  });

  test('spaces the avatar icon from the user name with a Bootstrap 5 margin utility', () => {
    renderUserFunctions({ isAuthencated: true, fullName: '陳管理' });
    const icon = screen.getByText('陳管理').closest('a')!.querySelector('i.fa-user-circle-o');
    expect(icon).not.toBeNull();
    // Bootstrap 5 renamed mr-* to me-*; mr-1 no longer exists and leaves no gap.
    expect(icon).toHaveClass('me-1');
    expect(icon).not.toHaveClass('mr-1');
  });
});
