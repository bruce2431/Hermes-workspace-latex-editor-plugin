import { useState, useEffect, useCallback } from 'react';
import { LatexProject } from '@/types/latex';
import * as db from '@/lib/db';

export function useLatexProject(projectId?: string) {
  const [project, setProject] = useState<LatexProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateFile = useCallback((fileId: string, content: string) => {
    if (!project) return;
    const updatedFiles = project.files.map(f => 
      f.id === fileId ? { ...f, content, updatedAt: Date.now() } : f
    );
    const updatedProject = { ...project, files: updatedFiles, updatedAt: Date.now() };
    setProject(updatedProject);
    db.saveProject(updatedProject).catch(e => console.error('Failed to save', e));
  }, [project]);

  useEffect(() => {
    const loadProject = async () => {
      setIsLoading(true);
      if (projectId) {
        const bgProject = await db.getProject(projectId);
        if (bgProject) {
          setProject(bgProject);
        } else {
          setProject(null);
        }
      } else {
        // Fallback for editor without ID: maybe load latest?
        const all = await db.getProjects();
        if (all.length > 0) {
          setProject(all[0]);
        } else {
          setProject(null);
        }
      }
      setIsLoading(false);
    };

    loadProject();
  }, [projectId]);

  const saveAndSetProject = useCallback(async (newProj: LatexProject) => {
    setProject(newProj);
    await db.saveProject(newProj);
  }, []);

  const deleteProject = useCallback(async () => {
    if (!project) return;
    await db.deleteProject(project.id);
  }, [project]);

  return { project, isLoading, updateFile, setProject, saveProject: saveAndSetProject, deleteProject };
}

