const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
  screen,
  shell,
  nativeImage,
  Notification
} = require('electron');
const path = require('path');
const {
  menubar
} = require('menubar');
const contextMenu = require('electron-context-menu');
//const Positioner = require('electron-positioner');
const AutoLaunch = require('auto-launch');
const Store = require('electron-store');

const schema = {
  startOnStartup: {
    type: 'boolean',
    default: false
  }
};

const store = new Store({
  schema
});

contextMenu({
  showSaveImageAs: true,
  showLookUpSelection: false,
});

const appAutoLaunch = new AutoLaunch({
  name: 'Rss Miniflux'
})
appAutoLaunch.isEnabled().then((isEnabled) => store.set('startOnStartup', isEnabled))

if (require('electron-squirrel-startup')) {
  app.quit();
}
const aboutVersion = `v${app.getVersion()}${false ? '-dev':''}`;

/*
let tray
const createWindow = () => {
  let {
    width,
    height
  } = screen.getPrimaryDisplay().workAreaSize;

  const mainWindow = new BrowserWindow({
    width: 600,
    height: 600,
    x: width - 600,
    y: height - 600,
    webPreferences: {
      contextIsolation: true,
      worldSafeExecuteJavaScript: true,
    },
    thickFrame: false,
    frame: false,
    transparent: false,
    center: false,
    alwaysOnTop: false,
    skipTaskbar: true,
    resizable: false,
    icon: nativeImage.createFromPath(path.join(__dirname, 'assets/icons/png/64x64.png')),
    title: `RSS ${aboutVersion}`
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.openDevTools();

  tray = new Tray(path.join(__dirname, 'assets/logo32.png'))

  tray.setToolTip(`RSS ${aboutVersion}`)

  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  })

  const positioner = new Positioner(mainWindow)

  const bounds = tray.getBounds()

  positioner.move('trayCenter', bounds)

};

app.whenReady().then(createWindow)*/

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

const mb = menubar({
  app: app,
  icon: path.join(__dirname, 'assets/logo32.png'),
  index: MAIN_WINDOW_WEBPACK_ENTRY,
  browserWindow: {
    width: 600,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      worldSafeExecuteJavaScript: true,
      webSecurity: false,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      enableRemoteModule: false
    },
    alwaysOnTop: false,
    skipTaskbar: true,
    resizable: false,
    icon: nativeImage.createFromPath(path.join(__dirname, 'assets/icons/png/64x64.png')),
    title: `RSS ${aboutVersion}`,
  },
  windowPosition: 'trayCenter'
});

mb.on('focus-lost', () => {
  mb.hideWindow()
})

mb.on('ready', () => {
  mb.tray.setToolTip(`RSS ${aboutVersion}`)
  mb.tray.setTitle(`RSS ${aboutVersion}`)

  let temp = [{
      label: `RSS ${aboutVersion}`,
      id: 'title',
      click: () => {
        mb.window.isVisible() ? mb.hideWindow() : mb.showWindow()
      }
    },
    {
      label: 'Open On Startup',
      click() {
        appAutoLaunch.isEnabled()
          .then((isEnabled) => {
            if (isEnabled) {
              appAutoLaunch.disable();
              store.set('startOnStartup', false);
              return;
            }
            appAutoLaunch.enable();
            store.set('startOnStartup', true);
          })
          .catch((err) => {});
      },
      type: 'checkbox',
      checked: store.get('startOnStartup')
    },
    {
      type: 'separator'
    },
    {
      label: 'Exit',
      role: 'quit'
    }
  ]
  const contextMenu = Menu.buildFromTemplate(temp)
  mb.tray.setContextMenu(contextMenu)
  mb.showWindow()

  mb.window.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  ipcMain.handle('isOpen', (event) => {
    return mb.window.isVisible()
  })

  /*mb.window.on('show', () => {
    mb.window.webContents.send('update')
  })*/

  let badgeTotal
  ipcMain.on('update-badge', (event, arg) => {
    if (badgeTotal !== arg.total) {
      /*if (arg.total > badgeTotal) {
        new Notification({
          title: 'RSS',
          body: 'nouveaux articles',
          silent: true,
          icon: nativeImage.createFromPath(path.join(__dirname, 'assets/icons/png/64x64.png')),
          timeoutType: 'never'
        }).show()
      }*/
      badgeTotal = arg.total;
      mb.tray.setImage(nativeImage.createFromDataURL(arg.trayURL))
      mb.tray.setToolTip(`RSS (${arg.total}) ${aboutVersion}`)
      mb.window.setTitle(`RSS (${arg.total}) ${aboutVersion}`)
      //let myItem = contextMenu.getMenuItemById('title')
      //myItem.enabled = false
      temp[0].label = `RSS (${arg.total}) ${aboutVersion}`
      const contextMenu = Menu.buildFromTemplate(temp)
      mb.tray.setContextMenu(contextMenu)
      //mb.window.setOverlayIcon(nativeImage.createFromDataURL(arg.badgeURL), arg.total + '')
    }
  })
  ipcMain.on('hide-down', (event, arg) => {
    if (mb.window.isVisible()) {
      mb.hideWindow()
    }
  })
});

mb.on('after-create-window', () => {
  //mb.window.webContents.openDevTools({
  //  mode: 'undocked'
  //})
  //mb.window.webContents.on('devtools-opened', () => {
  //  setImmediate(function () {
  //    mb.window.focus()
  //  });
  //});
  //mb.window.setAlwaysOnTop(true)
})