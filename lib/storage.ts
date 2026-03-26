import type { SavedSettings } from "./types";

const SETTINGS_KEY = "snappy_settings";
const WALLPAPERS_KEY = "snappy_wallpapers";

export async function loadSettings(): Promise<SavedSettings | null> {
  try {
    const result = await browser.storage.local.get(SETTINGS_KEY);
    return result[SETTINGS_KEY] ?? null;
  } catch {
    return null;
  }
}

export async function saveSettings(settings: SavedSettings): Promise<void> {
  try {
    await browser.storage.local.set({ [SETTINGS_KEY]: settings });
  } catch {
    // silently ignore storage errors
  }
}

export async function loadWallpapers(): Promise<string[]> {
  try {
    const result = await browser.storage.local.get(WALLPAPERS_KEY);
    return result[WALLPAPERS_KEY] ?? [];
  } catch {
    return [];
  }
}

export async function saveWallpapers(dataUrls: string[]): Promise<void> {
  try {
    await browser.storage.local.set({ [WALLPAPERS_KEY]: dataUrls });
  } catch {
    // silently ignore — might exceed quota with large images
  }
}
