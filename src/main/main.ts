/* eslint-disable prefer-template */
/* eslint global-require: off, no-console: off, promise/always-return: off */
import path from 'path';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import MenuBuilder from './menu';

ipcMain.on('ipc-example', async (event) => {
  event.reply('ipc-example', app.getVersion());
});

function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

let mainWindow: BrowserWindow | null = null;

const createWindow = async () => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
};

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available.', 'Info:', info);
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.', 'Info:', info);
});

autoUpdater.on('error', (err) => {
  console.error('Error in auto-updater.', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = 'Download speed: ' + progressObj.bytesPerSecond;
  logMessage = logMessage + ' - Downloaded ' + progressObj.percent + '%';
  logMessage =
    logMessage + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
  console.log(logMessage);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded', 'Info:', info);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    autoUpdater.checkForUpdatesAndNotify();
    app.on('activate', () => {
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
