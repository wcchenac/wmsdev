import React from 'react';
import { render, screen } from '@testing-library/react';
import StockInfo from '../../../../../components/BO/User/AdminPlatform/InStockRollback/StockInfo';
import type { StockInfo as StockInfoType } from '../../../../../types';

const stock = (quantity: number): StockInfoType =>
  ({ stockIdentifier: { quantity, unit: '碼' } }) as StockInfoType;

const renderRow = (quantities: number[]) =>
  render(
    <table>
      <tbody>
        <StockInfo productNo="CF1001" list={quantities.map(stock)} handleInStockRollback={vi.fn()} />
      </tbody>
    </table>
  );

describe('InStockRollback StockInfo total quantity', () => {
  test('sums the rows and shows the unit', () => {
    renderRow([10.5, 5.25]);
    expect(screen.getByText('15.75碼')).toBeInTheDocument();
  });

  // 0.505 + 0.5 is 1.005 in floating point; Math.round(x * 100) / 100 gave 1.
  test('rounds to 2 decimals without floating-point drift', () => {
    renderRow([0.505, 0.5]);
    expect(screen.getByText('1.01碼')).toBeInTheDocument();
  });

  test('10.075 rounds up to 10.08', () => {
    renderRow([10.075]);
    expect(screen.getByText('10.08碼')).toBeInTheDocument();
  });
});
