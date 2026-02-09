import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import * as fs from 'fs';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hiddenInset', // Mac style
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  createMenu(mainWindow);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('close', (e) => {
    e.preventDefault();
    mainWindow.webContents.send('app-closing');
  });
} // End createWindow

import { Menu, MenuItemConstructorOptions } from 'electron';

const createMenu = (win: BrowserWindow) => {
  const isMac = process.platform === 'darwin';

  const template: any[] = [
    // { role: 'appMenu' }
    ...(isMac
      ? [{
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }]
      : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click: () => win.webContents.send('menu:new')
        },
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click: () => win.webContents.send('menu:open')
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => win.webContents.send('menu:save')
        },
        {
          label: 'Save As...',
          accelerator: 'Shift+CmdOrCtrl+S',
          click: () => win.webContents.send('menu:save-as')
        },
        { type: 'separator' },
        { role: 'close' }
      ]
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac
          ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Find',
              accelerator: 'CmdOrCtrl+F',
              click: () => win.webContents.send('menu:find')
            },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [
                { role: 'startSpeaking' },
                { role: 'stopSpeaking' }
              ]
            }
          ]
          : [
            { role: 'delete' },
            { type: 'separator' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Find',
              accelerator: 'CmdOrCtrl+F',
              click: () => win.webContents.send('menu:find')
            }
          ])
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' }
          ]
          : [
            { role: 'close' }
          ])
      ]
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

app.on('ready', () => {
  createWindow();
  // We can't pass 'mainWindow' easily if we don't return it or make it global.
  // Better to create menu when window is created.
  // Refactoring createWindow to return win or set menu inside.
});
// Actually createWindow doesn't return anything. 
// I will just modify createWindow to call createMenu.


ipcMain.on('app:quit-approved', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.destroy();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Prevent accidental reload (Cmd+R, F5)
import { globalShortcut } from 'electron';
app.on('browser-window-focus', function () {
  globalShortcut.register("CommandOrControl+R", () => {
    console.log("CommandOrControl+R is pressed: Shortcut Disabled");
  });
  globalShortcut.register("F5", () => {
    console.log("F5 is pressed: Shortcut Disabled");
  });
});

app.on('browser-window-blur', function () {
  globalShortcut.unregister('CommandOrControl+R');
  globalShortcut.unregister('F5');
});

// IPC handlers
ipcMain.handle('ping', () => 'pong');

// Drag and Drop - Read file from path
ipcMain.handle('file:readFromPath', async (_, filePath: string) => {
  try {
    // Security: Only allow .md and .markdown files
    const ext = filePath.toLowerCase().split('.').pop();
    if (ext !== 'md' && ext !== 'markdown') {
      return { success: false, error: 'Only Markdown files (.md, .markdown) are supported' };
    }
    const content = fs.readFileSync(filePath, { encoding: 'utf-8' });
    return { success: true, filePath, content };
  } catch (error: any) {
    console.error('Error reading dropped file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
  });
  if (canceled) {
    return { canceled: true };
  } else {
    try {
      const content = fs.readFileSync(filePaths[0], { encoding: 'utf-8' });
      return { canceled: false, filePath: filePaths[0], content };
    } catch (error: any) {
      console.error('Error reading file:', error);
      return { canceled: false, error: error.message }; // Return error to renderer
    }
  }
});

ipcMain.handle('dialog:saveFile', async (event, { filePath, content }) => {
  try {
    if (filePath) {
      // Save to existing path
      fs.writeFileSync(filePath, content, { encoding: 'utf-8' });
      return { success: true, filePath };
    } else {
      // Save As
      const { canceled, filePath: savePath } = await dialog.showSaveDialog({
        filters: [{ name: 'Markdown', extensions: ['md'] }]
      });
      if (canceled || !savePath) {
        return { canceled: true };
      }
      fs.writeFileSync(savePath, content, { encoding: 'utf-8' });
      return { success: true, filePath: savePath };
    }
  } catch (error: any) {
    console.error('Error saving file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('app:exportPdf', async (event, htmlContent: string) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return { success: false, error: 'Window not found' };

  try {
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Export to PDF',
      defaultPath: 'document.pdf',
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });

    if (canceled || !filePath) return { canceled: true };

    // Create a hidden window for rendering
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    const printTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto; 
            color: #333;
            line-height: 1.6;
          }
          h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; line-height: 1.2; }
          p { margin-bottom: 1em; }
          code { background: #f4f4f5; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; font-size: 0.9em; }
          pre { background: #f4f4f5; padding: 1em; border-radius: 8px; overflow-x: auto; margin: 1em 0; }
          pre code { background: none; padding: 0; }
          blockquote { border-left: 4px solid #e5e7eb; padding-left: 1em; margin-left: 0; color: #6b7280; }
          img { max-width: 100%; border-radius: 4px; }
          ul, ol { padding-left: 1.5em; margin-bottom: 1em; }
          li { margin-bottom: 0.5em; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
          th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
          th { background-color: #f9fafb; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(printTemplate)}`);

    // Wait for content to render (images etc)
    await new Promise(resolve => setTimeout(resolve, 500));

    const pdfData = await printWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: {
        top: 1, // inches
        bottom: 1,
        left: 1,
        right: 1
      }
    });

    fs.writeFileSync(filePath, pdfData);
    printWindow.close();

    return { success: true, filePath };
  } catch (error: any) {
    console.error('Error exporting PDF:', error);
    return { success: false, error: error.message };
  }
});

import { shell } from 'electron';
ipcMain.handle('app:openExternal', async (_, url) => {
  await shell.openExternal(url);
});
ipcMain.handle('app:openInfoDialog', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  dialog.showMessageBox(win, {
    type: 'info',
    title: 'About MarkVista',
    message: 'MarkVista Editor',
    detail: 'Created by Omar Di Marzio\n\nGitHub: https://github.com/omardimarzio/\nLinkedIn: https://www.linkedin.com/in/omar-di-marzio/',
    buttons: ['OK', 'Visit GitHub', 'Visit LinkedIn'],
    defaultId: 0,
    cancelId: 0
  }).then(result => {
    if (result.response === 1) {
      shell.openExternal('https://github.com/omardimarzio/');
    } else if (result.response === 2) {
      shell.openExternal('https://www.linkedin.com/in/omar-di-marzio/');
    }
  });
});

