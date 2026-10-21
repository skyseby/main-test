import type { PhotoEntry, Settings, StoredEntry } from '../types';

const DB_NAME = 'dayframe-photos';
const DB_VERSION = 2;
const STORE = 'entries';
const SETTINGS_KEY = 'dayframe-settings-v1';

export class StorageLimitError extends Error {
  constructor() {
    super('Device storage is full. Export or remove some photos, then try again.');
    this.name = 'StorageLimitError';
  }
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Database request failed.'));
  });
}

export async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'date' });
        store.createIndex('date', 'date', { unique: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('The local database could not be opened.'));
  });
}

export async function listPhotos(): Promise<PhotoEntry[]> {
  const db = await openDatabase();
  try {
    const tx = db.transaction(STORE, 'readonly');
    const rows = await requestResult(tx.objectStore(STORE).getAll());
    return (rows as StoredEntry[])
      .map(row => ({ ...row, image: row.image }))
      .sort((a, b) => b.timestamp - a.timestamp);
  } finally {
    db.close();
  }
}

export async function savePhoto(entry: PhotoEntry): Promise<void> {
  const db = await openDatabase();
  try {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const existing = await requestResult(store.get(entry.date));
    const record: StoredEntry = {
      ...entry,
      id: existing?.id ?? entry.id,
      updatedAt: Date.now(),
    };
    store.put(record);

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('The save was cancelled.'));
    });
  } catch (error) {
    if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22)) {
      throw new StorageLimitError();
    }
    throw error;
  } finally {
    db.close();
  }
}

export async function deletePhoto(date: string): Promise<void> {
  const db = await openDatabase();
  try {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(date);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export async function clearPhotos(): Promise<void> {
  const db = await openDatabase();
  try {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...JSON.parse(raw) } as Settings : {} as Settings;
  } catch {
    return {} as Settings;
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}