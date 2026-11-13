import React from 'react';
import { render, screen, RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import HeaderSales from '../../../../components/Layout/RoleHeader/HeaderSales';

const renderHeaderSales = (): RenderResult => {
  return render(
    <MemoryRouter>
      <HeaderSales />
    </MemoryRouter>
  );
};

describe('HeaderSales', () => {
  describe('rendering', () => {
    test('renders navigation list', () => {
      renderHeaderSales();
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    test('renders exactly 2 navigation items', () => {
      renderHeaderSales();
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });
  });

  describe('navigation links', () => {
    test('renders 庫存查詢 link', () => {
      renderHeaderSales();
      expect(screen.getByText('庫存查詢')).toBeInTheDocument();
    });

    test('庫存查詢 link points to /stock/2/2', () => {
      renderHeaderSales();
      const link = screen.getByText('庫存查詢').closest('a');
      expect(link).toHaveAttribute('href', '/stock/2/2');
    });

    test('renders 歷史記錄查詢 link', () => {
      renderHeaderSales();
      expect(screen.getByText('歷史記錄查詢')).toBeInTheDocument();
    });

    test('歷史記錄查詢 link points to /stock/5', () => {
      renderHeaderSales();
      const link = screen.getByText('歷史記錄查詢').closest('a');
      expect(link).toHaveAttribute('href', '/stock/5');
    });
  });

  describe('restricted access', () => {
    test('does not render 入庫作業', () => {
      renderHeaderSales();
      expect(screen.queryByText('入庫作業')).not.toBeInTheDocument();
    });

    test('does not render 管理員區域', () => {
      renderHeaderSales();
      expect(screen.queryByText('管理員區域')).not.toBeInTheDocument();
    });

    test('does not render 拉貨明細', () => {
      renderHeaderSales();
      expect(screen.queryByText('拉貨明細')).not.toBeInTheDocument();
    });

    test('does not render 檔案總管', () => {
      renderHeaderSales();
      expect(screen.queryByText('檔案總管')).not.toBeInTheDocument();
    });

    test('does not render 庫存異動作業', () => {
      renderHeaderSales();
      expect(screen.queryByText('庫存異動作業')).not.toBeInTheDocument();
    });

    test('does not render 出庫單查詢', () => {
      renderHeaderSales();
      expect(screen.queryByText('出庫單查詢')).not.toBeInTheDocument();
    });
  });

  describe('CSS structure', () => {
    test('has navbar-nav class', () => {
      const { container } = renderHeaderSales();
      expect(container.querySelector('.navbar-nav')).toBeInTheDocument();
    });

    test('nav items have nav-item class', () => {
      const { container } = renderHeaderSales();
      const navItems = container.querySelectorAll('.nav-item');
      expect(navItems).toHaveLength(2);
    });

    test('nav links have nav-link class', () => {
      const { container } = renderHeaderSales();
      const navLinks = container.querySelectorAll('.nav-link');
      expect(navLinks).toHaveLength(2);
    });

    test('does not have dropdown menus', () => {
      const { container } = renderHeaderSales();
      expect(container.querySelector('.dropdown-menu')).not.toBeInTheDocument();
    });
  });
});
