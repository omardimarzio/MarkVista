import { contextBridge, ipcRenderer, webUtils } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    ping: () => ipcRenderer.invoke('ping'),
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    saveFile: (data: { filePath?: string; content: string }) => ipcRenderer.invoke('dialog:saveFile', data),
    exportPdf: (content: string) => ipcRenderer.invoke('app:exportPdf', content),
    openExternal: (url: string) => ipcRenderer.invoke('app:openExternal', url),
    openInfoDialog: () => ipcRenderer.invoke('app:openInfoDialog'),
    // Drag and Drop support
    readFileFromPath: (filePath: string) => ipcRenderer.invoke('file:readFromPath', filePath),
    getPathForFile: (file: File) => webUtils.getPathForFile(file),
    // App Close
    onAppClosing: (callback: () => void) => {
        ipcRenderer.on('app-closing', callback);
        return () => ipcRenderer.removeListener('app-closing', callback);
    },
    quitApproved: () => ipcRenderer.send('app:quit-approved'),
    // Menu Actions
    onMenuAction: (callback: (action: string) => void) => {
        const handler = (_: any, action: string) => callback(action);
        // We need to listen to multiple channels or send a single channel with argument.
        // My main.ts sends 'menu:new', 'menu:open', etc.
        // I should set up listeners for each or change main.ts to send 'menu:action', 'new'.
        // Changing main.ts is annoying now. I will just listen to all using a list.
        const channels = ['menu:new', 'menu:open', 'menu:save', 'menu:save-as', 'menu:find'];
        const listeners: Record<string, any> = {};

        channels.forEach(channel => {
            const l = () => callback(channel.replace('menu:', ''));
            listeners[channel] = l;
            ipcRenderer.on(channel, l);
        });

        return () => {
            channels.forEach(channel => {
                ipcRenderer.removeListener(channel, listeners[channel]);
            });
        };
    }
});
