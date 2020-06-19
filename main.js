const { app, Menu, BrowserWindow, Tray, Notification, ipcMain } = require('electron');
const Store = require('electron-store');
const store = new Store(); // 数据存储对象
const DefaultInterval = 40; // 默认时间间隔为40分钟
const trayIcon = require.resolve('./grassland.png'); // 托盘图标

let timer; // 倒计时的定时器
let tray; // 右上角托盘菜单
let configWin; // 配置项窗口对象

// 获取当前时间
function currentTime() {
  const date = new Date();
  return `${date.getHours()}:${date.getMinutes()}`;
}

// 配置项窗口对象
function createWindow () {
  // 创建浏览器窗口
  configWin = new BrowserWindow({
    width: 400,
    height: 200,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // 加载index.html
  configWin.loadFile('index.html');

  // 打开开发者工具
  // configWin.webContents.openDevTools();
}

// 在时间到达后弹出提示
function showNotification() {
  const currentInterval = Number(store.get('interval')) || DefaultInterval;

  store.set('beforeTime', currentTime());

  timer = setTimeout(() => {
    const date = new Date();
    const currentTime = `${date.getHours()}点${date.getMinutes()}分\n该换姿势了`;
    const myNotification = new Notification({
      title: '暖洋想去放风筝',
      body: currentTime
    });

    myNotification.show();

    showNotification();
  }, currentInterval * 60 * 1000);
}

// 修改时间间隔
function changeInterval(interval) {
  store.set('interval', interval);
  clearTimeout(timer);
  showNotification();
}

// 生成系统托盘的菜单
function getContextMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: `上次提示时间：${store.get('beforeTime')}`,
    },
    {
      label: `当前时间间隔：${store.get('interval')}`,
    },
    {
      label: '设置为30分钟',
      click: () => changeInterval(30)
    },
    {
      label: '设置为40分钟',
      click: () => changeInterval(40)
    },
    {
      label: '设置其他时间',
      click: () => {
        // 新建页面
        if (!configWin) {
          createWindow();
          return;
        }

        // 重建页面
        if (configWin.isDestroyed()) {
          createWindow();
          return;
        }

        // 展示页面
        configWin.show();
      }
    },
    {
      label: '重新计时',
      click: () => changeInterval(store.get('interval'))
    },
    {
      label: '退出',
      click: () => {
        app.quit();
      }
    }
  ]);

  return menu;
};

// 监听页面传过来的时间间隔
ipcMain.on('changeInterval', (event, arg) => {
  changeInterval(arg);
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 隐藏docker里的图标
app.dock.hide();

// app.whenReady(() => { });

app.on('ready', () => {
  // 开启定时器
  showNotification();

  // 生成系统托盘
  tray = new Tray(trayIcon);
  tray.on('click', () => tray.popUpContextMenu(getContextMenu()));
});
