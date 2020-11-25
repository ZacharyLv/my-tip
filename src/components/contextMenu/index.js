const { app, Menu, BrowserWindow } = require('electron');
const store = require('../../store');
const Util = require('../../util');

let timeConfigWin; // 时间窗口对象
let wordConfigWin; // 单词窗口对象

// 时间窗口对象
function createTimeWindow() {
  timeConfigWin = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    }
  })
  timeConfigWin.loadFile('src/pages/editTime/index.html');
  // timeConfigWin.webContents.openDevTools();// 打开开发者工具
}

// 单词窗口对象
function createWordWindow() {
  wordConfigWin = new BrowserWindow({
    width: 640,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  })
  wordConfigWin.loadFile('src/pages/words/index.html');
  // wordConfigWin.webContents.openDevTools(); // 打开开发者工具
}

// 生成系统托盘的菜单
function getContextMenu() {
  const posture = store.get('posture');
  const sitTime = store.get('sitTime');
  const standTime = store.get('standTime');
  const beforeTime = store.get('beforeTime');
  const postureTime = store.get(posture + 'Time');

  const [hour, minute] = beforeTime.split(':');
  const [currentHour, currentMin] = Util.currentTime().split(':');
  const nextTime = `${+hour + Math.floor((+minute + postureTime) / 60)}:${String((+minute + postureTime) % 60).padStart(2, '0')}`;
  const currentTimeLength = (+currentHour - +hour) * 60 + +currentMin - +minute;

  const menu = Menu.buildFromTemplate([
    {
      label: `时间区间：${beforeTime} ~ ${nextTime}`,
    },
    {
      label: `${posture === 'sit' ? '坐下' : '站立'}，时长：${currentTimeLength} min，目标：${postureTime} min`,
    },
    {
      label: `重新坐下 ${sitTime} min`,
      click: () => reset('sit')
    },
    {
      label: `重新站立 ${standTime} min`,
      click: () => reset('stand')
    },
    {
      label: '单词设置',
      click: () => {
        // 新建页面
        if (!wordConfigWin) {
          createWordWindow();
          return;
        }

        // 重建页面
        if (wordConfigWin.isDestroyed()) {
          createWordWindow();
          return;
        }

        // 展示页面
        wordConfigWin.show();
      }
    },
    {
      label: '更多设置',
      click: () => {
        // 新建页面
        if (!timeConfigWin) {
          createTimeWindow();
          return;
        }

        // 重建页面
        if (timeConfigWin.isDestroyed()) {
          createTimeWindow();
          return;
        }

        // 展示页面
        timeConfigWin.show();
      }
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

module.exports = getContextMenu;
