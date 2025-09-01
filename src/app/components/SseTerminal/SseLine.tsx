import { SSEEventData } from '../../types/sse';

export function SseLine({ event }: { event: SSEEventData }) {
    return (
      <div className="font-mono text-sm">
        <span className="text-gray-500">
          [{new Date(event.timestamp).toLocaleTimeString()}]
          <span className={event.isRunning ? 'text-yellow-400' : 'text-green-400'}>
            &nbsp;{event.stageDisplayText}
          </span>
        </span>
      </div>
    );
  }
  