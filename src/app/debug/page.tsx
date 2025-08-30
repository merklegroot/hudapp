import SseTerminal from '../components/SseTerminal';

export default function Debug() {
  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Debug</h1>
        
        <div className="space-y-8">
          <SseTerminal />
        </div>
      </div>
    </div>
  );
}
