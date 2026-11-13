import React from 'react';
import { render, screen, RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import HeaderNormal from '../../../../components/Layout/RoleHeader/HeaderNormal';

const renderHeaderNormal = (): RenderResult => {
  return render(
    <MemoryRouter>
      <HeaderNormal />
    </MemoryRouter>
  );
};

describe('HeaderNormal', () => {
  describe('rendering', () => {
    test('renders navigation list', () => {
      renderHeaderNormal();
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    test('renders exactly 2 navigation items', () => {
      renderHeaderNormal();
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });
  });

  describe('navigation links', () => {
    test('renders 庫存查詢 link', () => {
      renderHeaderNormal();
      expect(screen.getByText('庫存查詢')).toBeInTheDocument();
    });

    test('庫存查詢 link points to /stock/2/1', () => {
      renderHeaderNormal();
      const link = screen.getByText('庫存查詢').closest('a');
      expect(link).toHaveAttribute('href', '/stock/2/1');
    });

    test('renders 出庫單查詢 link', () => {
      renderHeaderNormal();
      expect(screen.getByText('出庫單查詢')).toBeInTheDocument();
    });

    test('出庫單查詢 link points to /stock/2/3', () => {
      renderHeaderNormal();
      const link = screen.getByText('出庫單查詢').closest('a');
      expect(link).toHaveAttribute('href', '/stock/2/3');
    });
  });

  describe('restricted access', () => {
    test('does not render 入庫作業', () => {
      renderHeaderNormal();
      expect(screen.queryByText('入庫作業')).not.toBeInTheDocument();
    });

    test('does not render 管理員區域', () => {
      renderHeaderNormal();
      expect(screen.queryByText('管理員區域')).not.toBeInTheDocument();
    });

    test('does not render 拉貨明細', () => {
      renderHeaderNormal();
      expect(screen.queryByText('拉貨明細')).not.toBeInTheDocument();
    });

    test('does not render 檔案總管', () => {
      renderHeaderNormal();
      expect(screen.queryByText('檔案總管')).not.toBeInTheDocument();
    });
  });

  describe('CSS structure', () => {
    test('has navbar-nav class', () => {
      const { container } = renderHeaderNormal();
      expect(container.querySelector('.navbar-nav')).toBeInTheDocument();
    });

    test('nav items have nav-item class', () => {
      const { container } = renderHeaderNormal();
      const navItems = container.querySelectorAll('.nav-item');
      expect(navItems).toHaveLength(2);
    });

    test('nav links have nav-link class', () => {
      const { container } = renderHeaderNormal();
      const navLinks = container.querySelectorAll('.nav-link');
      expect(navLinks).toHaveLength(2);
    });

    test('does not have dropdown menus', () => {
      const { container } = renderHeaderNormal();
      expect(container.querySelector('.dropdown-menu')).not.toBeInTheDocument();
    });
  });
});
