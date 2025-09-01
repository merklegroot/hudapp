'use client';

import { PathControl } from '../components/PathControl';

export default function Path() {
  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Path</h1>          
          <PathControl />
      </div>
    </div>
  )
}
