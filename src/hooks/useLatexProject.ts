import { useState, useEffect, useCallback } from 'react';
import { LatexProject } from '@/types/latex';
import { openDB } from 'idb';

const DB_NAME = 'hermes-latex-db';
const STORE_NAME = 'projects';

export function useLatexProject() {
  const [project, setProject] = useState<LatexProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initDB = async () => {
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  };

  const saveProject = useCallback(async (p: LatexProject) => {
    try {
      const db = await initDB();
      await db.put(STORE_NAME, p);
      setProject(p);
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  }, []);

  const updateFile = useCallback((fileId: string, content: string) => {
    if (!project) return;
    const updatedFiles = project.files.map(f => 
      f.id === fileId ? { ...f, content, updatedAt: Date.now() } : f
    );
    const updatedProject = { ...project, files: updatedFiles, updatedAt: Date.now() };
    setProject(updatedProject);
    saveProject(updatedProject);
  }, [project, saveProject]);

  const createProject = useCallback(async (name: string) => {
    const newProject: LatexProject = {
      id: Date.now().toString(),
      name,
      files: [{ id: 'main', name: 'main.tex', content: '\\documentclass{article}\n\\usepackage{amsmath}\n\n\\begin{document}\n\\section{Schr\\"odinger Equation}\nIn quantum mechanics, the time-independent\nequation is given by:\n\n\\begin{equation}\n  \\hat{H}\\psi = E\\psi\n\\end{equation}\n\nWhere \\hat{H} is the Hamiltonian operator:\n\\hat{H} = -\\frac{\\hbar^2}{2m}\\nabla^2 + V\n\n\\end{document}', createdAt: Date.now(), updatedAt: Date.now() }],
      mainFileId: 'main',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await saveProject(newProject);
    return newProject;
  }, [saveProject]);

  useEffect(() => {
    const loadInitial = async () => {
      const db = await initDB();
      const all = await db.getAll(STORE_NAME);
      if (all.length > 0) {
        setProject(all[0]);
      } else {
        await createProject('Quantum_Mechanics_Notes.tex');
      }
      setIsLoading(false);
    };
    loadInitial();
  }, [createProject]);

  return { project, isLoading, saveProject, updateFile, createProject };
}
