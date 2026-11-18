import React from 'react';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fireEvent, render, screen, within } from '@testing-library/react';
import StockInfoContainer from '../../../../../../components/BO/Stock/ModifyStock/ModifyBoard/StockInfoContainer';
import InformationModal from '../../../../../../components/BO/Stock/ModifyStock/ModifyBoard/InformationModal';
import { StockIdentifierType } from '../../../../../../enums/Enums';
import type { StockInfo } from '../../../../../../types';

// 瑕疵 (defect) was written "瑡疵", which renders 瑡疵: U+7461 瑡 instead of U+7455 瑕.

const stockInfo: StockInfo = {
  id: 8,
  color: '2',
  defect: 'GA',
  record: '',
  remark: '',
  stockIdentifier: { id: 7, productNo: 'CF1001', lotNo: 'L1', type: StockIdentifierType.roll, quantity: 10, unit: '碼' },
};

test('the 庫存異動 table heads the defect column 瑕疵', () => {
  render(
    <StockInfoContainer
      typeValidation={false}
      stockInfoes={[stockInfo]}
      handleShip={vi.fn()}
      handleShrink={vi.fn()}
      handleStockInfoUpdate={vi.fn()}
    />
  );

  expect(screen.getByRole('columnheader', { name: '瑕疵' })).toBeInTheDocument();
  expect(document.body).not.toHaveTextContent('瑡');
});

test('詳細資料 labels the defect 瑕疵 when showing and when editing', () => {
  render(
    <InformationModal
      show
      onHide={vi.fn()}
      index={0}
      typeValidation={false}
      stockInfo={stockInfo}
      handleStockInfoUpdate={vi.fn()}
    />
  );
  const dialog = screen.getByRole('dialog');

  expect(within(dialog).getByText('瑕疵')).toBeInTheDocument();
  expect(dialog).not.toHaveTextContent('瑡');

  fireEvent.click(within(dialog).getByRole('button', { name: '編輯' }));

  expect(within(dialog).getByText('瑕疵')).toBeInTheDocument();
  expect(dialog).not.toHaveTextContent('瑡');
});

// 瑡 has no use in this app's vocabulary; it only appears as a mistyped 瑕.
test('no source file uses 瑡, written out or as \\u7461', () => {
  const src = join(process.cwd(), 'src');
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(tsx?|css)$/.test(name) && path !== __filename) files.push(path);
    }
  };
  walk(src);

  const offenders = files.filter((f) => /瑡|\\u7461/i.test(readFileSync(f, 'utf8')));
  expect(files.length).toBeGreaterThan(100);
  expect(offenders.map((f) => relative(src, f))).toEqual([]);
});
