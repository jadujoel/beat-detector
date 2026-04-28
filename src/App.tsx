import { useState } from "react";
import { analyze } from "web-audio-beat-detector";
import "./index.css";

type Status =
  | { kind: "idle" }
  | { kind: "analyzing"; name: string }
  | { kind: "done"; name: string; tempo: number }
  | { kind: "error"; message: string };

export function App() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    setStatus({ kind: "analyzing", name: file.name });
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = new AudioContext();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const tempo = await analyze(audioBuffer);
      audioCtx.close();
      setStatus({ kind: "done", name: file.name, tempo });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Failed to analyze file",
      });
    }
  }

  return (
    <div className="app">
      <h1>Tempo Detector</h1>
      <div
        className={`dropzone ${dragging ? "dropzone--active" : ""}`}
        onDragOver={e => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        {status.kind === "idle" && <p>Drop an audio file here</p>}
        {status.kind === "analyzing" && <p>Analyzing {status.name}…</p>}
        {status.kind === "done" && (
          <>
            <p className="filename">{status.name}</p>
            <p className="bpm">
              <span className="bpm-value">{Math.round(status.tempo)}</span> BPM
            </p>
          </>
        )}
        {status.kind === "error" && <p className="error">{status.message}</p>}
      </div>
    </div>
  );
}

export default App;
