/**
 * historyStore.ts
 * ─────────────────────────────────────────────────────────
 * Persists scan history locally on-device using expo-file-system.
 * Keeps the last 50 scans, newest first.
 */
import * as FileSystem from 'expo-file-system/legacy';
import { ScanResponse } from './api';

const MAX_HISTORY = 50;

/** Returns the full path to the history JSON file (resolved at call-time, never at module level) */
function getHistoryFilePath(): string {
  // FileSystem.documentDirectory is guaranteed non-null after app init,
  // but we guard anyway to satisfy TypeScript's strict null checks.
  const dir = FileSystem.documentDirectory ?? '';
  return `${dir}scan_history.json`;
}

async function readRaw(): Promise<ScanResponse[]> {
  try {
    const path = getHistoryFilePath();
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return [];
    const raw = await FileSystem.readAsStringAsync(path);
    return JSON.parse(raw) as ScanResponse[];
  } catch (_err) {
    return [];
  }
}

/** Get all stored scans (newest first) */
export async function getHistory(): Promise<ScanResponse[]> {
  return readRaw();
}

/** Prepend a new scan result and persist */
export async function saveToHistory(scan: ScanResponse): Promise<void> {
  try {
    const path     = getHistoryFilePath();
    const existing = await readRaw();
    const updated  = [scan, ...existing.filter((s) => s.scan_id !== scan.scan_id)].slice(0, MAX_HISTORY);
    await FileSystem.writeAsStringAsync(path, JSON.stringify(updated));
  } catch (_err) {
    // Fail silently — history write should never block the scan result
    console.warn('[historyStore] Could not save scan to history:', _err);
  }
}

/** Wipe all history */
export async function clearHistory(): Promise<void> {
  try {
    const path = getHistoryFilePath();
    await FileSystem.writeAsStringAsync(path, '[]');
  } catch (_err) {
    console.warn('[historyStore] Could not clear history:', _err);
  }
}
