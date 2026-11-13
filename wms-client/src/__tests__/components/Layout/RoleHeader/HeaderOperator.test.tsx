import React from 'react';
import { render, screen, RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HeaderOperator from '../../../../components/Layout/RoleHeader/HeaderOperator';

const renderHeaderOperator = (): RenderResult => {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <HeaderOperator />
    </MemoryRouter>
  );
};

describe('HeaderOperator', () => {
  describe('rendering', () => {
    test('renders navigation list', () => {
      renderHeaderOperator();
      expect(screen.getByRole('list')).toBeInTheDocument();
    });
  });

  describe('入庫作業 dropdown', () => {
    test('renders 入庫作業 dropdown', () => {
      renderHeaderOperator();
      expect(screen.getByText('入庫作業')).toBeInTheDocument();
    });

    test('renders 進貨單入庫 link', () => {
      renderHeaderOperator();
      expect(screen.getByText('進貨單入庫')).toBeInTheDocument();
      expect(screen.getByText('進貨單入庫').closest('a')).toHaveAttribute('href', '/stock/1/1');
    });

    test('renders 組裝單入庫 link', () => {
      renderHeaderOperator();
      expect(screen.getByText('組裝單入庫')).toBeInTheDocument();
      expect(screen.getByText('組裝單入庫').closest('a')).toHaveAttribute('href', '/stock/1/2');
    });

    test('renders 退貨單入庫 link', () => {
      renderHeaderOperator();
      expect(screen.getByText('退貨單入庫')).toBeInTheDocument();
      expect(screen.getByText('退貨單入庫').closest('a')).toHaveAttribute('href', '/stock/1/3');
    });

    test('renders 調撥單入庫 link', () => {
      renderHeaderOperator();
      expect(screen.getByText('調撥單入庫')).toBeInTheDocument();
      expect(screen.getByText('調撥單入庫').closest('a')).toHaveAttribute('href', '/stock/1/4');
    });
  });

  describe('main navigation links', () => {
    test('renders 庫存查詢 link', () => {
      renderHeaderOperator();
      expect(screen.getByText('庫存查詢')).toBeInTheDocument();
      expect(screen.getByText('庫存查詢').closest('a')).toHaveAttribute('href', '/stock/2/2');
    });

    test('renders 拉貨明細 link', () => {
      renderHeaderOperator();
      expect(screen.getByText('拉貨明細')).toBeInTheDocument();
      expect(screen.getByText('拉貨明細').closest('a')).toHaveAttribute('href', '/stock/4');
    });

    test('renders 歷史記錄查詢 link', () => {
      renderHeaderOperator();
      expect(screen.getByText('歷史記錄查詢')).toBeInTheDocument();
      expect(screen.getByText('歷史記錄查詢').closest('a')).toHaveAttribute('href', '/stock/5');
    });
  });

  describe('庫存異動作業 dropdown', () => {
    test('renders 庫存異動作業 dropdown', () => {
      renderHeaderOperator();
      expect(screen.getByText('庫存異動作業')).toBeInTheDocument();
    });

    test('renders 庫存異動 link', () => {
      renderHeaderOperator();
      expect(screen.getByText('庫存異動')).toBeInTheDocument();
      expect(screen.getByText('庫存異動').closest('a')).toHaveAttribute('href', '/stock/3/1');
    });

    test('renders 減肥清單 link', () => {
      renderHeaderOperator();
      expect(screen.getByText('減肥清單')).toBeInTheDocument();
      expect(screen.getByText('減肥清單').closest('a')).toHaveAttribute('href', '/stock/3/2');
    });
  });

  describe('restricted access', () => {
    test('does not render 管理員區域', () => {
      renderHeaderOperator();
      expect(screen.queryByText('管理員區域')).not.toBeInTheDocument();
    });

    test('does not render 檔案總管', () => {
      renderHeaderOperator();
      expect(screen.queryByText('檔案總管')).not.toBeInTheDocument();
    });

    test('does not render 出庫單查詢', () => {
      renderHeaderOperator();
      expect(screen.queryByText('出庫單查詢')).not.toBeInTheDocument();
    });
  });

  describe('CSS structure', () => {
    test('has navbar-nav class', () => {
      const { container } = renderHeaderOperator();
      expect(container.querySelector('.navbar-nav')).toBeInTheDocument();
    });

    test('has dropdown-menu elements', () => {
      const { container } = renderHeaderOperator();
      const dropdowns = container.querySelectorAll('.dropdown-menu');
      expect(dropdowns.length).toBe(2);
    });
  });
});
