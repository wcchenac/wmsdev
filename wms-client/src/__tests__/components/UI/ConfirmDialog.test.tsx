import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ConfirmDialog from '../../../components/UI/ConfirmDialog';

// A focused button already reacts to Enter by clicking itself, so the dialog must not add its
// own Enter handling on top: Enter on 取消 must not confirm (the dialog guards deleting
// users), and Enter on the confirm button must confirm once, not twice. Enter right after the
// dialog opens (focus on the dialog itself) does nothing: confirming takes a deliberate press.

const renderDialog = () => {
  const onConfirm = vi.fn();
  const onHide = vi.fn();
  render(
    <ConfirmDialog show onHide={onHide} onConfirm={onConfirm} title="刪除員工" confirmText="刪除" cancelText="取消" />
  );
  return { onConfirm, onHide };
};

// A real keyboard Enter on a button fires keydown and then click on that button.
const pressEnterOn = (element: HTMLElement) => {
  fireEvent.keyDown(element, { key: 'Enter', code: 'Enter' });
  fireEvent.click(element);
};

describe('ConfirmDialog keyboard', () => {
  test('Enter on the cancel button cancels without confirming', () => {
    const { onConfirm, onHide } = renderDialog();

    pressEnterOn(screen.getByRole('button', { name: '取消' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  test('Enter on the confirm button confirms exactly once', () => {
    const { onConfirm } = renderDialog();

    pressEnterOn(screen.getByRole('button', { name: '刪除' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('Enter right after opening does not confirm', () => {
    const { onConfirm } = renderDialog();
    const dialog = screen.getByRole('dialog');
    expect(document.activeElement).toBe(dialog);

    fireEvent.keyDown(dialog, { key: 'Enter', code: 'Enter' });
    fireEvent.keyDown(dialog.querySelector('.modal-content')!, { key: 'Enter', code: 'Enter' });

    expect(onConfirm).not.toHaveBeenCalled();
  });
});
