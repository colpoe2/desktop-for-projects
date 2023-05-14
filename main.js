const { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog  } = require("electron");
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("index.html");
  // win.webContents.openDevTools();
  // 以下是打开子窗口功能
  ipcMain.on('openWindow', (event, file, project) => {
    const newWindow = new BrowserWindow({
      width: 400,
      height: 300,
      modal: true,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      parent: BrowserWindow.getFocusedWindow()
    });
    newWindow.loadFile(file)
      .then(() => {
        newWindow.webContents.send('project', project);
      })
      .catch((err) => {
        console.log(err);
      });
  });
  // 监听渲染进程发来的reload事件
  ipcMain.on('reload', (event, page) => {
    if (page === 'index.html') {
      win.webContents.reload();
    }
  });
  // 监听渲染进程发来的open-directory-dialog事件
  ipcMain.on('open-directory-dialog', (event) => {
    console.log('open-directory-dialog');
    const options = {
      properties: ['openDirectory'],
      depth: 2 // 设置目录选择器的最大深度为2层
    };
    dialog.showOpenDialog(options).then((result) => {
      if (!result.canceled) {
        event.reply('selected-directory', result.filePaths[0]);
      }
    }).catch((err) => {
      console.log(err);
    });
  });
};

app.whenReady().then(createWindow).then(() => {
  const menu = Menu.getApplicationMenu();
  let fileMenu = null;
  for (const item of menu.items) {
    if (item.commandId === 2) {
      fileMenu = item;
      break;
    }
  }
  const newProjectMenuItem = new MenuItem({
    label: '新的项目',
    click: () => {
      const newProjectWindow = new BrowserWindow({
        width: 400,
        height: 300,
        modal: true,
        frame: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        },
        parent: BrowserWindow.getFocusedWindow()
      });
      newProjectWindow.loadFile('new-project.html');
    }
  });
  fileMenu.submenu.append(newProjectMenuItem);
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});