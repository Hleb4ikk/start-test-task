import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { calculateFinalResult, fetchResource } from "./utils.js";
import type { ResourceFetchResult } from "./types.js";

async function main() {
  const rl = readline.createInterface({ input, output });
  const url = (await rl.question("Введите ссылку на ресурс: ")).trim();
  rl.close();
  const results: ResourceFetchResult[] = [];

  try {
    for (let i = 0; i < 10; i++) {
      const result = await fetchResource(url);
      results.push(result);
    }
  } catch (error) {
    const isError = error instanceof Error;
    if (isError) {
      console.error(error.message);
    }
    process.exit(1);
  }
  const finalResult = calculateFinalResult(results);
  console.log(
    `Среднее время скачивания: ${(finalResult.avgTime / 1000).toFixed(1)} с`,
  );
  console.log(
    `Общее кол-во скачанных данных: ${finalResult.totalBytes / 1000 / 1000} мб`,
  );
}

main();
