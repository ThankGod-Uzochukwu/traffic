import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Location, Summary } from "./types";

const DATA_DIR = path.join(process.cwd(), "public", "data");

async function readJson<T>(fileName: string): Promise<T> {
  const contents = await readFile(path.join(DATA_DIR, fileName), "utf8");
  return JSON.parse(contents) as T;
}

export async function getLocations(): Promise<Location[]> {
  return readJson<Location[]>("locations.json");
}

export async function getSummary(): Promise<Summary> {
  return readJson<Summary>("summary.json");
}
