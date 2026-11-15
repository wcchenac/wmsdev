import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import EditModal from '../../../../../../components/BO/User/AdminPlatform/UserManagement/EditModal';
import { UpdateUserRequest } from '../../../../../../types';

// The backend (UserService.updateUserInfo) re-hashes the password whenever newPassword is not
// null, so an empty string would set the password to "". It also calls RoleName.valueOf(role),
// which fails for "" (「請選擇...」). The name is shown read-only and sent back unchanged: an
// absent or different fullName would rename the user.

// As the user list returns it (UserService.getUserList): the role's Chinese name.
const user = { employeeId: 'E001', fullName: '王小明', role: '業務' };

const renderModal = () => {
  const handleUpdateSubmit = vi.fn<(request: UpdateUserRequest) => void>();
  render(<EditModal show userInfo={user} handleModalClose={vi.fn()} handleUpdateSubmit={handleUpdateSubmit} />);
  return { handleUpdateSubmit };
};

const startEditing = () => {
  fireEvent.click(screen.getByRole('button', { name: '編輯' }));
};

const password = () => document.querySelector<HTMLInputElement>('input[name=newPassword]')!;
const role = () => screen.getByRole('combobox');
const save = () => screen.getByRole('button', { name: '儲存' });

describe('EditModal', () => {
  test('the edit toggle is a button that keyboard users can reach', () => {
    renderModal();

    const toggle = screen.getByRole('button', { name: '編輯' });
    expect(toggle.tagName).toBe('BUTTON');
    expect(toggle).toHaveAttribute('type', 'button');
  });

  test('saving without touching the password leaves it out', () => {
    const { handleUpdateSubmit } = renderModal();
    startEditing();

    fireEvent.click(save());

    expect(handleUpdateSubmit).toHaveBeenCalledWith({
      employeeId: 'E001',
      fullName: '王小明',
      role: 'ROLE_Sales',
      newPassword: undefined,
    });
  });

  test.each([
    ['typed and then cleared', ''],
    ['only spaces', '   '],
  ])('a password that was %s is left out', (_name, value) => {
    const { handleUpdateSubmit } = renderModal();
    startEditing();
    fireEvent.change(password(), { target: { name: 'newPassword', value: 'secret' } });
    fireEvent.change(password(), { target: { name: 'newPassword', value } });

    fireEvent.click(save());

    expect(handleUpdateSubmit).toHaveBeenCalledTimes(1);
    expect(handleUpdateSubmit.mock.calls[0][0].newPassword).toBeUndefined();
  });

  test('a new password is sent as typed', () => {
    const { handleUpdateSubmit } = renderModal();
    startEditing();
    fireEvent.change(password(), { target: { name: 'newPassword', value: 'n3w pass' } });

    fireEvent.click(save());

    expect(handleUpdateSubmit.mock.calls[0][0].newPassword).toBe('n3w pass');
  });

  test('「請選擇...」 cannot be saved', () => {
    const { handleUpdateSubmit } = renderModal();
    startEditing();

    fireEvent.change(role(), { target: { name: 'role', value: '' } });

    expect(save()).toBeDisabled();
    fireEvent.click(save());
    expect(handleUpdateSubmit).not.toHaveBeenCalled();
  });

  test('a changed role is sent', () => {
    const { handleUpdateSubmit } = renderModal();
    startEditing();

    fireEvent.change(role(), { target: { name: 'role', value: 'ROLE_Admin' } });
    fireEvent.click(save());

    expect(handleUpdateSubmit.mock.calls[0][0].role).toBe('ROLE_Admin');
  });

  test('the name is read-only and sent back unchanged', () => {
    const { handleUpdateSubmit } = renderModal();
    startEditing();

    expect(document.querySelector('[name=fullName]')).toBeNull();
    expect(screen.getByText('王小明')).toBeInTheDocument();
    fireEvent.click(save());
    expect(handleUpdateSubmit.mock.calls[0][0].fullName).toBe('王小明');
    expect(handleUpdateSubmit.mock.calls[0][0].employeeId).toBe('E001');
  });
});
