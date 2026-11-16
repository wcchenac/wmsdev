import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import StockInfo from '../../../../components/BO/Stock/InStock/Common/StockInfo';
import ModifyRequest from '../../../../components/BO/Stock/ModifyStock/ShrinkBoard/ModifyRequest';
import { NewStockInfoItem } from '../../../../components/BO/Stock/ModifyStock/ShrinkBoard/ModifyRequestBoard';

interface ShipFields {
  directShip: boolean;
  outStockReason: string;
}

const stockRow = {
  productNo: 'CT-2048',
  lotNo: 'L1',
  type: '整支',
  quantity: '1',
  unit: '碼',
  color: '1',
  defect: [],
  record: '',
  remark: '',
  inStockType: '',
  orderNo: '',
  directShip: false,
  outStockReason: '',
  errors: { quantity: '' },
};

const shrinkRow: NewStockInfoItem = {
  productNo: 'CT-2048',
  lotNo: 'L1',
  type: '整支',
  quantity: '1',
  unit: '碼',
  color: 1,
  defect: [],
  record: '',
  remark: '',
  inStockType: 'shrink',
  directShip: false,
  outStockReason: '',
  parentId: 1,
  errors: { quantity: '' },
};

function blankBox(): HTMLElement {
  const icon = screen.queryByTestId('CheckBoxOutlineBlankRoundedIcon');
  if (icon === null) {
    throw new Error('blank direct-ship box was not rendered');
  }
  return icon;
}

function openAndChooseReason(reason: string): void {
  fireEvent.click(blankBox());
  fireEvent.click(screen.getByRole('button', { name: reason }));
}

function InStockHarness({ initial }: { initial: ShipFields }) {
  const [info, setInfo] = useState({ ...stockRow, ...initial });
  return (
    <table>
      <tbody>
        <StockInfo
          typeValidation
          errors={info.errors}
          stockInfo={info}
          index={0}
          typeList={['整支']}
          handleInfoChange={(event) => {
            const name = event.target.name;
            if (name === 'outStockReason') {
              setInfo((prev) => ({ ...prev, outStockReason: event.target.value }));
            }
          }}
          handleDefectChange={() => undefined}
          handleShipCheck={(checked) => {
            setInfo((prev) => ({
              ...prev,
              directShip: checked,
              outStockReason: checked ? prev.outStockReason : '',
            }));
          }}
          handleReasonButton={(value) => {
            setInfo((prev) => ({ ...prev, outStockReason: value }));
          }}
        />
      </tbody>
    </table>
  );
}

function ShrinkHarness({ initial }: { initial: ShipFields }) {
  const [info, setInfo] = useState<NewStockInfoItem>({ ...shrinkRow, ...initial });
  return (
    <table>
      <tbody>
        <ModifyRequest
          typeValidation
          stockInfo={info}
          index={0}
          onRequestChange={(request) => {
            if (request.target.name === 'outStockReason') {
              setInfo((prev) => ({ ...prev, outStockReason: request.target.value }));
            }
          }}
          handleDefectChange={() => undefined}
          handleShipCheck={(checked) => {
            setInfo((prev) => ({
              ...prev,
              directShip: checked,
              outStockReason: checked ? prev.outStockReason : '',
            }));
          }}
          handleReasonButton={(value) => {
            setInfo((prev) => ({ ...prev, outStockReason: value }));
          }}
        />
      </tbody>
    </table>
  );
}

describe.each([
  ['in-stock row', InStockHarness],
  ['shrink row', ShrinkHarness],
] as const)('%s direct ship', (_label, Harness) => {
  test('a reason without directShip leaves the box unchecked', () => {
    render(<Harness initial={{ directShip: false, outStockReason: '中壢' }} />);
    expect(screen.getByTestId('CheckBoxOutlineBlankRoundedIcon')).toBeInTheDocument();
    expect(screen.queryByTestId('CheckBoxRoundedIcon')).not.toBeInTheDocument();
  });

  test('closing the modal from the X restores the previous reason and does not set directShip', () => {
    render(<Harness initial={{ directShip: false, outStockReason: '舊原因' }} />);

    openAndChooseReason('中壢');
    expect(screen.getByPlaceholderText('請輸入出庫原因')).toHaveValue('中壢');
    expect(screen.queryByTestId('CheckBoxRoundedIcon')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByTestId('CheckBoxRoundedIcon')).not.toBeInTheDocument();

    fireEvent.click(blankBox());
    expect(screen.getByPlaceholderText('請輸入出庫原因')).toHaveValue('舊原因');
  });

  test('closing the modal from the backdrop restores the previous reason and does not set directShip', () => {
    render(<Harness initial={{ directShip: false, outStockReason: '' }} />);

    openAndChooseReason('中壢');
    fireEvent.click(screen.getByRole('dialog'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByTestId('CheckBoxRoundedIcon')).not.toBeInTheDocument();

    fireEvent.click(blankBox());
    expect(screen.getByPlaceholderText('請輸入出庫原因')).toHaveValue('');
  });

  test('confirming the modal sets directShip and keeps the reason', () => {
    render(<Harness initial={{ directShip: false, outStockReason: '' }} />);

    openAndChooseReason('中壢');
    fireEvent.click(screen.getByRole('button', { name: '確認' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('CheckBoxRoundedIcon')).toBeInTheDocument();
    expect(screen.queryByTestId('CheckBoxOutlineBlankRoundedIcon')).not.toBeInTheDocument();
  });
});
