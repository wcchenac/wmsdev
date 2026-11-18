import React from 'react';
import type { AxiosResponse } from 'axios';
import { act, fireEvent, render, screen } from '@testing-library/react';
import ScheduleMission from '../../../../../components/BO/User/AdminPlatform/ScheduleMission';
import { missionTrigger } from '../../../../../actions/StockActions';

vi.mock('../../../../../actions/StockActions', () => ({
  missionTrigger: vi.fn(),
}));

vi.mock('react-toastify', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-toastify')>();
  return { ...actual, toast: { ...actual.toast, success: vi.fn(), error: vi.fn() } };
});

vi.mock('@achmadk/react-loading-overlay', () => ({
  default: function MockLoadingOverlay({ active, children }: { active: boolean; children: React.ReactNode }) {
    return <div data-testid="loading-overlay" data-active={String(active)}>{children}</div>;
  },
}));

describe('ScheduleMission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('disables trigger buttons while a mission request is pending', async () => {
    let resolveMission!: (value: AxiosResponse) => void;
    vi.mocked(missionTrigger).mockImplementation(
      () =>
        new Promise<AxiosResponse>((resolve) => {
          resolveMission = resolve;
        })
    );

    render(<ScheduleMission />);

    const compareBtn = screen.getByRole('button', { name: '每日比對' });
    const syncBtn = screen.getByRole('button', { name: '貨號類別同步' });

    fireEvent.click(compareBtn);
    expect(missionTrigger).toHaveBeenCalledTimes(1);
    expect(compareBtn).toBeDisabled();
    expect(syncBtn).toBeDisabled();

    fireEvent.click(syncBtn);
    expect(missionTrigger).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveMission({ status: 200 } as AxiosResponse);
    });

    expect(compareBtn).toBeEnabled();
    expect(syncBtn).toBeEnabled();
  });
});
