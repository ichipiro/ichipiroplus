import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const parseJson = <T>(jsonText: string): T => {
  return JSON.parse(jsonText) as T;
};

export const readJson = async <T>(
  relativePath: string,
  baseImportMetaUrl: string,
): Promise<T> => {
  const filename = fileURLToPath(baseImportMetaUrl);
  const dirname = path.dirname(filename);
  const jsonPath = path.join(dirname, relativePath);
  const jsonText = await readFile(jsonPath, "utf-8");
  return parseJson<T>(jsonText);
};
