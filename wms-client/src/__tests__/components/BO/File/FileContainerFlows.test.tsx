import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import FileContainer from '../../../../components/BO/File/FileContainer';
import FileContainerForCategory from '../../../../components/BO/File/FileContainerForCategory';

describe('FileContainer and FileContainerForCategory workflows (H-20)', () => {
  test('FileContainer queries today files, opens interval modal to confirm, and downloads files', () => {
    const onCurrent = vi.fn();
    const onPeriod = vi.fn();
    const onDownload = vi.fn();

    render(
      <FileContainer
        filenames={['daily-1.xlsx', 'File Not Found']}
        containerTitle="每日存貨調整記錄"
        fileType="adjustment"
        handleFileCategoryCurrentQuery={onCurrent}
        handleFileCategoryPeriodQuery={onPeriod}
        downloadFile={onDownload}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '檔案查詢' }));
    expect(onCurrent).toHaveBeenCalledWith('adjustment');

    fireEvent.click(screen.getByRole('button', { name: '特定日期區間查詢' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: '確認' }));
    expect(onPeriod).toHaveBeenCalledWith('adjustment', expect.any(String), expect.any(String));

    const downloadButtons = screen.getAllByRole('button', { name: '下載' });
    expect(downloadButtons).toHaveLength(1);
    fireEvent.click(downloadButtons[0]);
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  test('FileContainerForCategory queries categories on mount and submits selected categories', () => {
    const onQueryList = vi.fn();
    const onCreateCategory = vi.fn();
    const onDownload = vi.fn();

    const { container } = render(
      <FileContainerForCategory
        categoryList={[
          { label: '棉布', value: 'COTTON' },
          { label: '絲綢', value: 'SILK' },
        ]}
        fileType="categoryDetail"
        filenames={['cotton.xlsx']}
        queryCategoryDetailList={onQueryList}
        createCategoryDetailFilename={onCreateCategory}
        downloadFile={onDownload}
      />
    );

    expect(onQueryList).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '選擇分類' }));
    const dialog = screen.getByRole('dialog');
    const selectInput = dialog.querySelector<HTMLInputElement>('input[id^="react-select"]')!;
    fireEvent.keyDown(selectInput, { key: 'ArrowDown', code: 'ArrowDown' });
    fireEvent.click(dialog.querySelector('[id*="-option-0"]')!);
    fireEvent.click(within(dialog).getByRole('button', { name: '確認' }));

    expect(onCreateCategory).toHaveBeenCalledWith(['COTTON']);
    fireEvent.click(screen.getByRole('button', { name: '下載' }));
    expect(onDownload).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('cotton.xlsx');
  });
});
