import React from 'react';
import { render, screen } from '@testing-library/react';
import { Spinner } from '../../../components/Others/Spinner';

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

describe('Spinner', () => {
  test('renders without crashing', () => {
    render(<Spinner />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  test('renders Loader with ThreeDots type', () => {
    render(<Spinner />);
    const loader = screen.getByTestId('loader');
    expect(loader).toHaveAttribute('data-type', 'ThreeDots');
  });

  test('renders Loader with correct color', () => {
    render(<Spinner />);
    const loader = screen.getByTestId('loader');
    expect(loader).toHaveAttribute('data-color', '#2BAD60');
  });

  test('renders Loader with correct dimensions', () => {
    render(<Spinner />);
    const loader = screen.getByTestId('loader');
    expect(loader).toHaveAttribute('data-height', '100');
    expect(loader).toHaveAttribute('data-width', '100');
  });

  test('has centered flex container', () => {
    const { container } = render(<Spinner />);
    const wrapper = container.querySelector('div');

    expect(wrapper).toHaveStyle({
      display: 'flex',
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
});
