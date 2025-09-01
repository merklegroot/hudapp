'use client';

import { SiDotnet } from 'react-icons/si';

interface DotNetIconProps {
  className?: string;
}

export default function DotNetIcon({ className = "w-6 h-6" }: DotNetIconProps) {
  return <SiDotnet className={`${className} text-purple-600`} />;
}
