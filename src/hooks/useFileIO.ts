import { useState, useCallback } from 'react';

export const useFileIO = () => {
    const [currentFilePath, setCurrentFilePath] = useState<string | undefined>(undefined);
    const [savedContent, setSavedContent] = useState<string>(''); // Content on disk

    const openFile = useCallback(async () => {
        if (!window.electronAPI) {
            console.warn('Electron API not available');
            return null;
        }
        const result = await window.electronAPI.openFile();
        if (!result.canceled && result.content !== undefined) {
            setCurrentFilePath(result.filePath);
            setSavedContent(result.content); // Verify baseline
            return result.content;
        }
        return null;
    }, []);

    const saveFile = useCallback(async (content: string) => {
        if (!window.electronAPI) return false;

        const result = await window.electronAPI.saveFile({
            filePath: currentFilePath,
            content
        });

        if (result.success && result.filePath) {
            setCurrentFilePath(result.filePath);
            setSavedContent(content); // Update baseline
            return true;
        }
        return false;
    }, [currentFilePath]);

    const createNewFile = useCallback(() => {
        setCurrentFilePath(undefined);
        setSavedContent(''); // Baseline is empty
        return '';
    }, []);

    const exportPdf = useCallback(async (content: string) => {
        if (!window.electronAPI) return false;
        const result = await window.electronAPI.exportPdf(content);
        return result.success;
    }, []);

    const saveAs = useCallback(async (content: string) => {
        if (!window.electronAPI) return false;

        const result = await window.electronAPI.saveFile({
            filePath: undefined, // Force Save As dialog
            content
        });

        if (result.success && result.filePath) {
            setCurrentFilePath(result.filePath);
            setSavedContent(content); // Update baseline
            return true;
        }
        return false;
    }, []);

    // Helper to manually update baseline (e.g. for drag and drop)
    const updateSavedContent = useCallback((content: string) => {
        setSavedContent(content);
    }, []);

    return {
        currentFilePath,
        setCurrentFilePath,
        openFile,
        saveFile,
        saveAs,
        createNewFile,
        exportPdf,
        savedContent,      // Expose baseline
        updateSavedContent // Expose updater
    };
};
