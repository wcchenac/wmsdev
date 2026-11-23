import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import Alert from '../../../components/UI/Alert';
import Button from '../../../components/UI/Button';
import ConfirmDialog from '../../../components/UI/ConfirmDialog';
import FormField from '../../../components/UI/FormField';
import IconButton from '../../../components/UI/IconButton';
import { ruleDeclarations } from '../../helpers/appCss';

describe('UI components polish and CSS rules', () => {
  test('FormField keeps is-valid class when numeric 0 is entered', () => {
    render(
      <FormField
        label="數量"
        name="qty"
        type="number"
        value={0}
        touched={true}
        helperText="輸入 0 或正數"
        onChange={vi.fn()}
      />
    );

    const input = screen.getByLabelText('數量');
    expect(input).toHaveClass('is-valid');
    expect(screen.getByText('輸入 0 或正數').style.color).toBe('var(--color-gray-600)');
  });

  test('IconButton does not set inline backgroundColor or color that blocks CSS hover rules', () => {
    render(<IconButton icon={<span>X</span>} label="刪除" variant="danger" />);

    const button = screen.getByRole('button', { name: '刪除' });
    expect(button.style.backgroundColor).toBe('');
    expect(button.style.color).toBe('');
    expect(button.style.getPropertyValue('--icon-btn-color')).toBe('var(--color-danger)');
    expect(button.style.getPropertyValue('--icon-btn-hover-bg')).toBe('var(--color-danger-light)');

    const componentsCss = readFileSync(join(process.cwd(), 'src', 'styles', 'components.css'), 'utf8');
    expect(ruleDeclarations(componentsCss, null, '.icon-button')).toContain('color: var(--icon-btn-color)');
    expect(ruleDeclarations(componentsCss, null, '.icon-button:not(:disabled):hover')).toContain(
      'background-color: var(--icon-btn-hover-bg)'
    );
  });

  test('ConfirmDialog, Alert, and Button use Chinese loading and accessible dismiss labels', () => {
    render(
      <>
        <ConfirmDialog show={true} onHide={vi.fn()} onConfirm={vi.fn()} loading={true} />
        <Alert dismissible={true}>已儲存</Alert>
        <Button loading={true}>送出</Button>
      </>
    );

    expect(screen.getByText('處理中...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '關閉訊息' })).toBeInTheDocument();
    expect(screen.getByText('載入中...')).toBeInTheDocument();
  });
});
