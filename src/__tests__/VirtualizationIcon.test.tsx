import React from 'react';
import { render } from '@testing-library/react';
import VirtualizationIcon from '../app/components/Icons/VirtualizationIcon';

describe('VirtualizationIcon', () => {
  it('should render Docker icon for Docker Container', () => {
    const { container } = render(<VirtualizationIcon virtualization="Docker Container" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-blue-500');
  });

  it('should render Kubernetes icon for Kubernetes', () => {
    const { container } = render(<VirtualizationIcon virtualization="Kubernetes" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-blue-600');
  });

  it('should render VMware icon for VMware Virtual Machine', () => {
    const { container } = render(<VirtualizationIcon virtualization="VMware Virtual Machine" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-green-600');
  });

  it('should render VirtualBox icon for VirtualBox Virtual Machine', () => {
    const { container } = render(<VirtualizationIcon virtualization="VirtualBox Virtual Machine" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-blue-700');
  });

  it('should render Microsoft icon for WSL', () => {
    const { container } = render(<VirtualizationIcon virtualization="WSL (Windows Subsystem for Linux)" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-blue-600');
  });

  it('should render QEMU icon for KVM Virtual Machine', () => {
    const { container } = render(<VirtualizationIcon virtualization="KVM Virtual Machine" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-purple-500');
  });

  it('should render QEMU icon for QEMU Virtual Machine', () => {
    const { container } = render(<VirtualizationIcon virtualization="QEMU Virtual Machine" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-purple-600');
  });

  it('should render Xen icon for Xen Virtual Machine', () => {
    const { container } = render(<VirtualizationIcon virtualization="Xen Virtual Machine" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-orange-600');
  });

  it('should render Parallels icon for Parallels Virtual Machine', () => {
    const { container } = render(<VirtualizationIcon virtualization="Parallels Virtual Machine" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-blue-500');
  });

  it('should render Oracle icon for Oracle Virtual Machine', () => {
    const { container } = render(<VirtualizationIcon virtualization="Oracle Virtual Machine" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-red-600');
  });

  it('should render container icon for LXC Container', () => {
    const { container } = render(<VirtualizationIcon virtualization="LXC Container" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-cyan-600');
  });

  it('should render server icon for generic Virtual Machine', () => {
    const { container } = render(<VirtualizationIcon virtualization="Virtual Machine (unknown)" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-indigo-600');
  });

  it('should render Vercel icon for Vercel Serverless', () => {
    const { container } = render(<VirtualizationIcon virtualization="Vercel Serverless" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-black');
  });

  it('should render AWS icon for AWS Lambda', () => {
    const { container } = render(<VirtualizationIcon virtualization="AWS Lambda" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-orange-500');
  });

  it('should render Azure icon for Azure Functions', () => {
    const { container } = render(<VirtualizationIcon virtualization="Azure Functions" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-blue-500');
  });

  it('should render Google Cloud icon for Google Cloud Platform', () => {
    const { container } = render(<VirtualizationIcon virtualization="Google Cloud Platform" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-blue-600');
  });

  it('should render Heroku icon for Heroku', () => {
    const { container } = render(<VirtualizationIcon virtualization="Heroku" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-purple-500');
  });

  it('should render cloud icon for generic cloud environments', () => {
    const { container } = render(<VirtualizationIcon virtualization="Cloud Platform" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-sky-500');
  });

  it('should render desktop icon for Physical Hardware', () => {
    const { container } = render(<VirtualizationIcon virtualization="Physical Hardware" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-gray-700');
  });

  it('should render question mark icon for unknown virtualization', () => {
    const { container } = render(<VirtualizationIcon virtualization="Unknown" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-gray-500');
  });

  it('should apply custom className when provided', () => {
    const { container } = render(<VirtualizationIcon virtualization="Docker Container" className="w-8 h-8" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toHaveClass('w-8', 'h-8');
  });

  it('should use default className when none provided', () => {
    const { container } = render(<VirtualizationIcon virtualization="Docker Container" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toHaveClass('w-6', 'h-6');
  });

  it('should handle case insensitive virtualization matching', () => {
    const { container } = render(<VirtualizationIcon virtualization="docker container" />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('text-blue-500');
  });
});
