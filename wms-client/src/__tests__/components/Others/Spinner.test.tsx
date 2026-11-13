import React from 'react';
import { render, screen } from '@testing-library/react';
import { Spinner } from '../../../components/Others/Spinner';

interface MockThreeDotsProps {
  color: string;
  height: number;
  width: number;
  ariaLabel?: string;
  visible?: boolean;
}

// Mock react-loader-spinner
vi.mock('react-loader-spinner', () => ({
  ThreeDots: function MockThreeDots(props: MockThreeDotsProps): JSX.Element {
    return (
      <div
        data-testid="loader"
        data-color={props.color}
        data-height={props.height}
        data-width={props.width}
      >
        Loading...
      </div>
    );
  }
}));

describe('Spinner', () => {
  test('renders without crashing', () => {
    render(<Spinner />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  test('renders ThreeDots with correct default color (CSS variable)', () => {
    render(<Spinner />);
    const loader = screen.getByTestId('loader');
    // Default color is CSS variable, which renders as the variable string
    expect(loader).toHaveAttribute('data-color', 'var(--color-accent, #2BAD60)');
  });

  test('renders ThreeDots with custom color', () => {
    render(<Spinner color="#FF0000" />);
    const loader = screen.getByTestId('loader');
    expect(loader).toHaveAttribute('data-color', '#FF0000');
  });

  test('renders ThreeDots with large dimensions by default', () => {
    render(<Spinner />);
    const loader = screen.getByTestId('loader');
    expect(loader).toHaveAttribute('data-height', '100');
    expect(loader).toHaveAttribute('data-width', '100');
  });

  test('renders ThreeDots with small dimensions when size is small', () => {
    render(<Spinner size="small" />);
    const loader = screen.getByTestId('loader');
    expect(loader).toHaveAttribute('data-height', '40');
    expect(loader).toHaveAttribute('data-width', '40');
  });

  test('renders ThreeDots with medium dimensions when size is medium', () => {
    render(<Spinner size="medium" />);
    const loader = screen.getByTestId('loader');
    expect(loader).toHaveAttribute('data-height', '70');
    expect(loader).toHaveAttribute('data-width', '70');
  });

  test('has centered flex container', () => {
    const { container } = render(<Spinner />);
    const wrapper = container.querySelector('div');

    expect(wrapper).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    });
  });

  test('container has full width and height', () => {
    const { container } = render(<Spinner />);
    const wrapper = container.querySelector('div');

    expect(wrapper).toHaveStyle({
      width: '100%',
      height: '100%'
    });
  });

  test('displays message when provided', () => {
    render(<Spinner message="Loading data..." />);
    // Message appears in both visible <p> and screen-reader-only <span>
    const messages = screen.getAllByText('Loading data...');
    expect(messages.length).toBeGreaterThan(0);
  });

  test('has correct accessibility attributes', () => {
    const { container } = render(<Spinner />);
    const wrapper = container.querySelector('div');

    expect(wrapper).toHaveAttribute('role', 'status');
    expect(wrapper).toHaveAttribute('aria-live', 'polite');
    expect(wrapper).toHaveAttribute('aria-busy', 'true');
  });
});
