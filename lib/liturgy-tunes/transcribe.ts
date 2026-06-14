export async function transcribeAudio(audioUrl: string): Promise<string | null> {
  const apiKey = process.env.AI_PROVIDER_API_KEY;
  if (!apiKey) {
    return null;
  }

  const audioResponse = await fetch(audioUrl);
  if (!audioResponse.ok) {
    throw new Error(`Failed to fetch audio for transcription (${audioResponse.status})`);
  }

  const audioBlob = await audioResponse.blob();
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  formData.append("model", "whisper-1");
  formData.append("language", "he");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Transcription failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { text?: string };
  return data.text?.trim() ?? null;
}
