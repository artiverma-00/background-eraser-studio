import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ref as dbRef, push, serverTimestamp, query, orderByChild, equalTo, get } from "firebase/database";
import { storage, database } from "./firebase";

export const uploadProcessedImage = async (
  userId: string,
  originalFile: File,
  processedBlob: Blob
): Promise<{ originalUrl: string; processedUrl: string; historyId: string }> => {
  const timestamp = Date.now();
  const baseName = originalFile.name.replace(/\.[^/.]+$/, "");

  // Upload original
  const originalRef = ref(storage, `users/${userId}/originals/${timestamp}_${originalFile.name}`);
  await uploadBytes(originalRef, originalFile);
  const originalUrl = await getDownloadURL(originalRef);

  // Upload processed
  const processedRef = ref(storage, `users/${userId}/processed/${timestamp}_${baseName}.png`);
  await uploadBytes(processedRef, processedBlob);
  const processedUrl = await getDownloadURL(processedRef);

  // Save history entry
  const historyRef = dbRef(database, `history/${userId}`);
  const newEntry = await push(historyRef, {
    originalUrl,
    processedUrl,
    fileName: originalFile.name,
    createdAt: serverTimestamp(),
    timestamp,
  });

  return { originalUrl, processedUrl, historyId: newEntry.key! };
};

export interface HistoryEntry {
  id: string;
  originalUrl: string;
  processedUrl: string;
  fileName: string;
  createdAt: number;
  timestamp: number;
}

export const getHistory = async (userId: string): Promise<HistoryEntry[]> => {
  const historyRef = dbRef(database, `history/${userId}`);
  const snapshot = await get(historyRef);

  if (!snapshot.exists()) return [];

  const data = snapshot.val();
  return Object.entries(data)
    .map(([id, value]: [string, any]) => ({
      id,
      ...value,
    }))
    .sort((a, b) => b.timestamp - a.timestamp);
};
