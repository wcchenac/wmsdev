import React from 'react';
import { render, screen, RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import HeaderAdmin from '../../../../components/Layout/RoleHeader/HeaderAdmin';

const renderHeaderAdmin = (): RenderResult => {
  return render(
    <MemoryRouter>
      <HeaderAdmin />
    </MemoryRouter>
  );
};

describe('HeaderAdmin', () => {
  describe('rendering', () => {
    test('renders navigation list', () => {
      renderHeaderAdmin();
      expect(screen.getByRole('list')).toBeInTheDocument();
    });
  });

  describe('入庫作業 dropdown', () => {
    test('renders 入庫作業 dropdown', () => {
      renderHeaderAdmin();
      expect(screen.getByText('入庫作業')).toBeInTheDocument();
    });

    test('renders 進貨單入庫 link', () => {
      renderHeaderAdmin();
      expect(screen.getByText('進貨單入庫')).toBeInTheDocument();
      expect(screen.getByText('進貨單入庫').closest('a')).toHaveAttribute('href', '/stock/1/1');
    });

    test('renders 組裝單入庫 link', () => {
      renderHeaderAdmin();
      expect(screen.getByText('組裝單入庫')).toBeInTheDocument();
      expect(screen.getByText('組裝單入庫').closest('a')).toHaveAttribute('href', '/stock/1/2');
    });

    test('renders 退貨單入庫 link', () => {
      renderHeaderAdmin();
      expect(screen.getByText('退貨單入庫')).toBeInTheDocument();
      expect(screen.getByText('退貨單入庫').closest('a')).toHaveAttribute('href', '/stock/1/3');
    });

    test('renders 調撥單入庫 link', () => {
      renderHeaderAdmin();
      expect(screen.getByText('調撥單入庫')).toBeInTheDocument();
      expect(screen.getByText('調撥單入庫').closest('a')).toHaveAttribute('href', '/stock/1/4');
    });
  });

  describe('main navigation links', () => {
    test('renders 庫存查詢 link', () => {
      renderHeaderAdmin();
      expect(screen.getByText('庫存查詢')).toBeInTheDocument();
      expect(screen.getByText('庫存查詢').closest('a')).toHaveAttribute('href', '/stock/2/2');
    });

    test('renders 出庫單查詢 link', () => {
      renderHeaderAdmin();
      expect(screen.getByText('出庫單查詢')).toBeInTheDocument();
      expect(screen.getByText('出庫單查詢').closest('a')).toHaveAttribute('href', '/stock/2/3');
    });

    test('renders 拉貨明細 link', () => {
      renderHeaderAdmin();
      expect(screen.getByText('拉貨明細')).toBeInTheDocument();
      expect(screen.getByText('拉貨明細').closest('a')).toHaveAttribute('href', '/stock/4');
    });

    test('renders 歷史記錄查詢 link', () => {
      renderHeaderAdmin();
      expect(screen.getByText('歷史記錄查詢')).toBeInTheDocument();
      expect(screen.getByText('歷史記錄查詢').closest('a')).toHaveAttribute('href', '/stock/5');
    });

    test('renders 檔案總管 link', () => {
      renderHeaderAdmin();
      expect(screen.getByText('檔案總管')).toBeInTheDocument();
      expect(screen.getByText('檔案總管').closest('a')).toHaveAttribute('href', '/files');
    });

    test('renders 管理員區域 link', () => {
      renderHeaderAdmin();
      expect(screen.getByText('管理員區域')).toBeInTheDocument();
      expect(screen.getByText('管理員區域').closest('a')).toHaveAttribute('href', '/admin');
    });
  });

  describe('庫存異動作業 dropdown', () => {
    test('renders 庫存異動作業 dropdown', () => {
      renderHeaderAdmin();
      expect(screen.getByText('庫存異動作業')).toBeInTheDocument();
    });

    test('renders 庫存異動 link', () => {
      renderHeaderAdmin();
      expect(screen.getByText('庫存異動')).toBeInTheDocument();
      expect(screen.getByText('庫存異動').closest('a')).toHaveAttribute('href', '/stock/3/1');
    });

    test('renders 減肥清單 link', () => {
      renderHeaderAdmin();
      expect(screen.getByText('減肥清單')).toBeInTheDocument();
      expect(screen.getByText('減肥清單').closest('a')).toHaveAttribute('href', '/stock/3/2');
    });
  });

  describe('CSS structure', () => {
    test('has navbar-nav class', () => {
      const { container } = renderHeaderAdmin();
      expect(container.querySelector('.navbar-nav')).toBeInTheDocument();
    });

    test('has dropdown-menu elements', () => {
      const { container } = renderHeaderAdmin();
      const dropdowns = container.querySelectorAll('.dropdown-menu');
      expect(dropdowns.length).toBe(2);
    });

    test('nav links have nav-link class', () => {
      const { container } = renderHeaderAdmin();
      const navLinks = container.querySelectorAll('.nav-link');
      expect(navLinks.length).toBeGreaterThan(0);
    });
  });
});
