export interface ElectronAPI {
    ping: () => Promise<string>;
    openFile: () => Promise<{ canceled: boolean; filePath?: string; content?: string; error?: string }>;
    saveFile: (data: { filePath?: string; content: string }) => Promise<{ success: boolean; filePath?: string; error?: string; canceled?: boolean }>;
    exportPdf: (content: string) => Promise<{ success: boolean; filePath?: string; error?: string; canceled?: boolean }>;
    openExternal: (url: string) => Promise<void>;
    openInfoDialog: () => Promise<void>;
    // Drag and Drop
    readFileFromPath(filePath: string): Promise<{ success: boolean; content?: string; error?: string }>;
    getPathForFile(file: File): string;
    // App Close
    onAppClosing(callback: () => void): () => void;
    quitApproved(): void;
    // Menu Actions
    onMenuAction(callback: (action: string) => void): () => void;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

import { Content } from '@tiptap/react';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        search: {
            setSearchQuery: (query: string) => ReturnType;
        };
    }
}
