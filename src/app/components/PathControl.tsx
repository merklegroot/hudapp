import SseTerminal from "./SseTerminal";

export function PathControl() {
    return (
        <SseTerminal 
            url="/api/debug/path"
            terminalTitle="Path Terminal"
            startButtonLabel="Get Path"
            stopButtonLabel="Stop"
        />
    )
}