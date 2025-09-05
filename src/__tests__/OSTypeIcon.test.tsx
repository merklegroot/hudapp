import React from 'react';
import { render, screen } from '@testing-library/react';
import OSTypeIcon from '../app/components/Icons/OSTypeIcon';

describe('OSTypeIcon', () => {
  it('should render Windows icon for Windows OS type', () => {
    const { container } = render(<OSTypeIcon osType="Windows" />);
    
    // Check that the component renders without crashing
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-blue-600');
  });

  it('should render macOS icon for MacOS OS type', () => {
    const { container } = render(<OSTypeIcon osType="MacOS" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-gray-600');
  });

  it('should render Linux icon for Linux OS type', () => {
    const { container } = render(<OSTypeIcon osType="Linux" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-gray-700');
  });

  it('should render FreeBSD icon for FreeBSD OS type', () => {
    const { container } = render(<OSTypeIcon osType="FreeBSD" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-red-600');
  });

  it('should render OpenBSD icon for OpenBSD OS type', () => {
    const { container } = render(<OSTypeIcon osType="OpenBSD" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-red-600');
  });

  it('should render BSD icon for generic BSD OS type', () => {
    const { container } = render(<OSTypeIcon osType="BSD" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-gray-600');
  });

  it('should render question mark icon for unknown OS type', () => {
    const { container } = render(<OSTypeIcon osType="Unknown" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-gray-500');
  });

  it('should apply custom className when provided', () => {
    const { container } = render(<OSTypeIcon osType="Linux" className="w-8 h-8" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toHaveClass('w-8', 'h-8');
  });

  it('should use default className when none provided', () => {
    const { container } = render(<OSTypeIcon osType="Linux" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toHaveClass('w-6', 'h-6');
  });

  it('should handle case insensitive OS type matching', () => {
    const { container } = render(<OSTypeIcon osType="windows" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-blue-600');
  });
});
