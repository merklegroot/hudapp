'use client';

import { SiPython } from 'react-icons/si';

interface PythonIconProps {
  className?: string;
}

export default function PythonIcon({ className = "w-6 h-6" }: PythonIconProps) {
  return <SiPython className={`${className} text-blue-500`} />;
}
