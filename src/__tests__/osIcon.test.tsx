import { render } from '@testing-library/react';
import OSIcon from '../app/components/OSIcon';

describe('OSIcon Component', () => {
  it('should render Amazon Linux icon for Amazon Linux 2023', () => {
    const { container } = render(<OSIcon osName="Amazon Linux 2023.8.20250721 (2023)" />);
    
    // Check if the Amazon icon is rendered (SiAmazon component)
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('text-orange-500');
  });

  it('should render Amazon Linux icon for various Amazon Linux formats', () => {
    const testCases = [
      'Amazon Linux 2023.8.20250721 (2023)',
      'Amazon Linux 2',
      'amazon linux',
      'AMAZON LINUX 2023'
    ];

    testCases.forEach(osName => {
      const { container } = render(<OSIcon osName={osName} />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-orange-500');
    });
  });

  it('should render Ubuntu icon for Ubuntu', () => {
    const { container } = render(<OSIcon osName="Ubuntu 22.04.3 LTS" />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('text-orange-500');
  });

  it('should render generic Linux icon for unknown Linux distribution', () => {
    const { container } = render(<OSIcon osName="Some Custom Linux 1.0" />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('text-gray-700');
  });

  it('should render question mark for unknown OS', () => {
    const { container } = render(<OSIcon osName="Unknown OS" />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('text-gray-500');
  });
});
