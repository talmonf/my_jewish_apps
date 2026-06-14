"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";

type RecordingPanelProps = {
  disabled?: boolean;
};

export function RecordingPanel({ disabled = false }: RecordingPanelProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  async function uploadBlob(blob: Blob, filename: string) {
    setIsUploading(true);
    setStatus("Uploading recording...");

    try {
      const result = await upload(filename, blob, {
        access: "public",
        handleUploadUrl: "/api/liturgy-tunes/upload",
      });
      setAudioUrl(result.url);
      setStatus("Recording saved.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Failed to upload recording.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function startRecording() {
    if (disabled || isUploading) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const previewUrl = URL.createObjectURL(blob);
        setAudioUrl(previewUrl);
        await uploadBlob(blob, `liturgy-recording-${Date.now()}.webm`);
      };

      recorder.start();
      setIsRecording(true);
      setStatus("Recording...");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Microphone access is required to record.",
      );
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || disabled || isUploading) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAudioUrl(previewUrl);
    await uploadBlob(file, file.name);
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="audioUrl" value={audioUrl?.startsWith("http") ? audioUrl : ""} />

      <div className="flex flex-wrap gap-2">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled || isUploading}
            className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Start recording
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-medium text-white"
          >
            Stop recording
          </button>
        )}

        <label className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          Upload audio
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
          />
        </label>
      </div>

      {audioUrl ? (
        <audio controls src={audioUrl} className="w-full" />
      ) : (
        <p className="text-sm text-slate-500">
          Record or upload a short clip of the tune (optional but helpful).
        </p>
      )}

      {status ? <p className="text-sm text-slate-600">{status}</p> : null}
    </div>
  );
}
