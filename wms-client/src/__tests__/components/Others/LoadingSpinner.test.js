import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../../../components/Others/LoadingSpinner';

// Mock react-loader-spinner
jest.mock('react-loader-spinner', () => {
  return function MockLoader(props) {
    return (
      <div
        data-testid="loader"
        data-type={props.type}
        data-color={props.color}
        data-height={props.height}
        data-width={props.width}
      >
        Loading...
      </div>
    );
  };
});

// Mock react-promise-tracker
const mockUsePromiseTracker = jest.fn();
jest.mock('react-promise-tracker', () => ({
  usePromiseTracker: (options) => mockUsePromiseTracker(options)
}));

describe('LoadingSpinner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when promise is in progress', () => {
    beforeEach(() => {
      mockUsePromiseTracker.mockReturnValue({ promiseInProgress: true });
    });

    test('renders loader when promiseInProgress is true', () => {
      render(<LoadingSpinner area="default" />);
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    test('renders Loader with ThreeDots type', () => {
      render(<LoadingSpinner area="default" />);
      const loader = screen.getByTestId('loader');
      expect(loader).toHaveAttribute('data-type', 'ThreeDots');
    });

    test('renders Loader with correct color', () => {
      render(<LoadingSpinner area="default" />);
      const loader = screen.getByTestId('loader');
      expect(loader).toHaveAttribute('data-color', '#2BAD60');
    });

    test('renders Loader with correct dimensions', () => {
      render(<LoadingSpinner area="default" />);
      const loader = screen.getByTestId('loader');
      expect(loader).toHaveAttribute('data-height', '100');
      expect(loader).toHaveAttribute('data-width', '100');
    });

    test('has centered flex container', () => {
      const { container } = render(<LoadingSpinner area="default" />);
      const wrapper = container.querySelector('div');

      expect(wrapper).toHaveStyle({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      });
    });
  });

  describe('when promise is not in progress', () => {
    beforeEach(() => {
      mockUsePromiseTracker.mockReturnValue({ promiseInProgress: false });
    });

    test('does not render loader when promiseInProgress is false', () => {
      render(<LoadingSpinner area="default" />);
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    test('renders nothing (null) when not loading', () => {
      const { container } = render(<LoadingSpinner area="default" />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('area prop', () => {
    test('passes area prop to usePromiseTracker', () => {
      mockUsePromiseTracker.mockReturnValue({ promiseInProgress: false });

      render(<LoadingSpinner area="custom-area" />);

      expect(mockUsePromiseTracker).toHaveBeenCalledWith({ area: 'custom-area' });
    });

    test('handles undefined area prop', () => {
      mockUsePromiseTracker.mockReturnValue({ promiseInProgress: false });

      render(<LoadingSpinner />);

      expect(mockUsePromiseTracker).toHaveBeenCalledWith({ area: undefined });
    });

    test('handles different area values', () => {
      mockUsePromiseTracker.mockReturnValue({ promiseInProgress: true });

      const { rerender } = render(<LoadingSpinner area="area1" />);
      expect(mockUsePromiseTracker).toHaveBeenCalledWith({ area: 'area1' });

      rerender(<LoadingSpinner area="area2" />);
      expect(mockUsePromiseTracker).toHaveBeenCalledWith({ area: 'area2' });
    });
  });
});
