import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import StockInfo from '../../../../../components/BO/User/AdminPlatform/ShrinkRollback/StockInfo';
import type { ShrinkRollbackObject } from '../../../../../types';

function makeObject(id: number | undefined): ShrinkRollbackObject {
  return {
    stockInfo: {
      stockIdentifier: {
        id,
        productNo: 'CF1001',
        lotNo: 'L1',
        type: '整支',
        quantity: 10,
        unit: '碼',
        eliminateDate: '2026-11-15',
      },
    },
    nodes: [],
  };
}

describe('ShrinkRollback StockInfo id guard', () => {
  test('submits when stockIdentifier.id is 0', () => {
    const handleShrinkRollback = vi.fn();
    render(
      <table>
        <tbody>
          <StockInfo object={makeObject(0)} handleShrinkRollback={handleShrinkRollback} />
        </tbody>
      </table>
    );

    fireEvent.click(screen.getByRole('button', { name: '詳細資料' }));
    fireEvent.click(screen.getByRole('button', { name: '確認' }));

    expect(handleShrinkRollback).toHaveBeenCalledWith(0);
  });

  test('does not submit when stockIdentifier.id is undefined', () => {
    const handleShrinkRollback = vi.fn();
    render(
      <table>
        <tbody>
          <StockInfo object={makeObject(undefined)} handleShrinkRollback={handleShrinkRollback} />
        </tbody>
      </table>
    );

    fireEvent.click(screen.getByRole('button', { name: '詳細資料' }));
    fireEvent.click(screen.getByRole('button', { name: '確認' }));

    expect(handleShrinkRollback).not.toHaveBeenCalled();
  });
});
