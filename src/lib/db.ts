import { openDB } from 'idb';
import { LatexProject } from '@/types/latex';

const DB_NAME = 'hermes-latex-db';
const STORE_NAME = 'projects';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

export const getProjects = async (): Promise<LatexProject[]> => {
  const db = await initDB();
  // Return descending by updatedAt
  const all = await db.getAll(STORE_NAME);
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
};

export const getProject = async (id: string): Promise<LatexProject | undefined> => {
  const db = await initDB();
  return db.get(STORE_NAME, id);
};

export const saveProject = async (project: LatexProject): Promise<void> => {
  const db = await initDB();
  await db.put(STORE_NAME, project);
};

export const deleteProject = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
};
