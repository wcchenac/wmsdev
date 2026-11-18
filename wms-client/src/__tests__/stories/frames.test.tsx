import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AppNavbar } from '../../stories/frames';
import HeaderAdmin from '../../components/Layout/RoleHeader/HeaderAdmin';
import HeaderSales from '../../components/Layout/RoleHeader/HeaderSales';

// Storybook's navbar frame uses the app Header's per-role expand breakpoint and NavbarContext,
// so the Layout stories show the menus as the app does (no squeezed links between 576px and
// the role's breakpoint, dropdowns laid out by Bootstrap's navbar CSS instead of Popper).

const renderFrame = (authority: string | undefined, menu: React.ReactNode) =>
  render(
    <MemoryRouter>
      <AppNavbar authority={authority}>{menu}</AppNavbar>
    </MemoryRouter>
  );

test.each([
  ['ROLE_Admin', 'navbar-expand-xl'],
  ['ROLE_Operator', 'navbar-expand-lg'],
  ['ROLE_Sales', 'navbar-expand-sm'],
  [undefined, 'navbar-expand-sm'],
])('authority %s expands at %s', (authority, expandClass) => {
  const { container } = renderFrame(authority, <HeaderSales />);

  const nav = container.querySelector('nav')!;
  expect([...nav.classList].filter((c) => c.startsWith('navbar-expand'))).toEqual([expandClass]);
});

test('dropdowns in the frame are left to Bootstrap navbar CSS, not Popper', async () => {
  renderFrame('ROLE_Admin', <HeaderAdmin />);

  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: '入庫作業' }));
  });

  const menu = screen.getByRole('button', { name: '入庫作業' }).parentElement!.querySelector<HTMLElement>('.dropdown-menu')!;
  expect(menu).toHaveAttribute('data-bs-popper', 'static');
  expect(menu.style.position).toBe('');
});
