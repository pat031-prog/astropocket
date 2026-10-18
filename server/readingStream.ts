type ReadingPart = { type: string; text?: string; toolName?: string; input?: unknown; finishReason?: string };
/** Progress text before a tool call is not a completed answer. */
export async function relayReading(parts: AsyncIterable<ReadingPart>, emit: (event: unknown) => void) {
  let stepText = "", finalText = "", finishReason = "", failed = false, aborted = false;
  for await (const part of parts) {
    if (part.type === "start-step") stepText = "";
    else if (part.type === "text-delta") { stepText += part.text || ""; emit({ type: "text", text: part.text || "" }); }
    else if (part.type === "tool-call") emit({ type: "tool", name: part.toolName, input: part.input });
    else if (part.type === "finish-step") { finishReason = part.finishReason || ""; finalText = stepText; }
    else if (part.type === "abort") aborted = true;
    else if (part.type === "error") failed = true;
  }
  return { complete: finishReason === "stop" && finalText.trim().length > 0, finalText, finishReason, failed, aborted };
}
