import type { ResourceFetchResult } from "./types.js";

const REQUEST_TIMEOUT_MS = 30_000;

export const toMbPerSecond = (bytes: number, elapsedTime: number) => {
  return bytes / (1000 * 1000) / (elapsedTime / 1000);
};
export const getProgress = (downloadedBytes: number, totalBytes: number) => {
  return ((downloadedBytes / totalBytes) * 100).toFixed(1);
};

export const fetchResource = async (
  url: string,
): Promise<ResourceFetchResult> => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok || !response.body) {
    throw new Error(`Ошибка загрузки: ${response.status}`);
  }

  const totalBytes = Number(response.headers.get("content-length")) || 0;
  const reader = response.body.getReader();

  let downloadedBytes = 0;
  const startTime = performance.now();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    downloadedBytes += value.length;
    const elapsedMs = Math.max(performance.now() - startTime, 1);
    const avgMbPerSec = toMbPerSecond(downloadedBytes, elapsedMs);

    const progress = totalBytes
      ? ` (${getProgress(downloadedBytes, totalBytes)}%)`
      : "";

    console.log(`${avgMbPerSec.toFixed(2)} МБ/с${progress}`);
  }
  return { requestTime: performance.now() - startTime, totalBytes };
};

export const calculateFinalResult = (results: ResourceFetchResult[]) => {
  let avgTime =
    results.reduce((sum, currentValue) => sum + currentValue.requestTime, 0) /
    results.length;
  let totalBytes = results.reduce(
    (sum, currentValue) => sum + currentValue.totalBytes,
    0,
  );
  return { avgTime, totalBytes };
};
