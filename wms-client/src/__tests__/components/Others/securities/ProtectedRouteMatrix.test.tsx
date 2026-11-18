import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';
import ProtectedRoute from '../../../../components/Others/securities/ProtectedRoute';
import { createMockStore } from '../../../helpers/mockStore';

type RoleLevel = 'H' | 'M1' | 'M2' | 'L1' | 'L2' | 'L3';

const ALL_LEVELS: RoleLevel[] = ['H', 'M1', 'M2', 'L1', 'L2', 'L3'];

const ALLOWED: Record<string, RoleLevel[]> = {
  ROLE_Admin: ['H', 'M1', 'M2', 'L2', 'L3'],
  ROLE_Operator: ['M1', 'M2', 'L2'],
  ROLE_Sales: ['M2', 'L2'],
  ROLE_Normal: ['L1', 'L3'],
};

const renderProtected = (
  level: RoleLevel,
  userState: { validToken: boolean; user: Record<string, unknown> }
) => {
  const store = createMockStore({ user: { ...userState, users: [] } });
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute level={level}>
                <div data-testid="allowed-content">Allowed</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          <Route path="/" element={<div data-testid="home-page">Home</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('ProtectedRoute permission matrix (H-20)', () => {
  describe.each(Object.entries(ALLOWED))('when role is %s', (role, allowedLevels) => {
    test.each(ALL_LEVELS)('level %s enforces expected access', (level) => {
      renderProtected(level, {
        validToken: true,
        user: { role: { authority: role }, exp: Math.floor(Date.now() / 1000) + 600 },
      });

      if (allowedLevels.includes(level)) {
        expect(screen.getByTestId('allowed-content')).toBeInTheDocument();
      } else {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      }
    });
  });

  test('redirects unauthenticated users to /login', () => {
    renderProtected('H', { validToken: false, user: {} });
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  test('redirects users with expired exp to /login', () => {
    renderProtected('H', {
      validToken: true,
      user: { role: 'ROLE_Admin', exp: Math.floor(Date.now() / 1000) - 1 },
    });
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  test('redirects signed-in users without a role to /', () => {
    renderProtected('L1', { validToken: true, user: {} });
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});
