const { app, Menu, BrowserWindow, Tray, Notification, ipcMain } = require('electron');
const schema = require('./schema');
const Store = require('electron-store');
const player = require('play-sound')(opts = {});
const schedule = require('node-schedule');
const store = new Store({ schema }); // 数据存储对象
const trayIcon = require.resolve('../images/grassland.png'); // 托盘图标

let audio; // 音乐播放对象
let timer; // 倒计时的定时器
let tray; // 右上角托盘菜单
let configWin; // 配置项窗口对象
let morningMeetingJob; // 晨会提醒的定时任务
let offWorkJob; // 下班的定时任务

// 晨会提醒
const morningMeetingSchedule = () => {
  const [hour, min] = store.get('morningMeetingTime').split(':');
  const disableMorningMeeting = store.get('disableMorningMeeting');

  if (morningMeetingJob) {
    morningMeetingJob.cancel();
    morningMeetingJob = null;
  }

  if (disableMorningMeeting) {
    return;
  }

  morningMeetingJob = schedule.scheduleJob(`0 ${+min} ${+hour} * * *`,() => {
    playMusic();

    new Notification({
      title: '暖洋想去放风筝',
      body: `晨会时间到了`
    }).show();
  });
}

// 下班提醒
const offWorkSchedule = () => {
  const [hour, min] = store.get('offWorkTime').split(':');
  const disableOffWork = store.get('disableOffWork');

  if (offWorkJob) {
    offWorkJob.cancel();
    offWorkJob = null;
  }

  if (disableOffWork) {
    return;
  }

  offWorkJob = schedule.scheduleJob(`0 ${+min} ${+hour} * * *`,() => {
    new Notification({
      title: '暖洋想去放风筝',
      body: `下班了，下班了`
    }).show();
  });
}

// 播放音乐
function playMusic() {
  let music;

  try {
    music = require.resolve('../audio/goodmorning.mp3'); // 早上好
  } catch(e) {}

  if (music) {
    audio = player.play(music);
  }
}

// 获取当前时间
function currentTime() {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// 配置项窗口对象
function createWindow() {
  // 创建浏览器窗口
  configWin = new BrowserWindow({
    width: 500,
    height: 300,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // 加载index.html
  configWin.loadFile('src/editTime.html');

  // 打开开发者工具
  // configWin.webContents.openDevTools();
}

// 午休时间
function isNoonBreakTime() {
  const cTime = currentTime();
  const [noonStart, noonEnd] = store.get('noonBreakTime').split('-');

  return (cTime >= noonStart && cTime <= noonEnd);
}

// 修改时间
function changeData({ key, value }) {
  store.set(key, value);
}

// 开启定时器
function startInterval() {
  const posture = store.get('posture');
  const currentInterval = store.get(posture + 'Time');

  store.set('beforeTime', currentTime());

  timer = setTimeout(() => {

    // 非午休时间才弹框
    if (!isNoonBreakTime()) {
      const date = new Date();
      new Notification({
        title: '暖洋想去放风筝',
        body: `${date.getHours()}点${date.getMinutes()}分\n该${posture === 'sit' ? '站起来' : '坐下'}了`
      }).show();
    }

    store.set('posture', posture === 'sit' ? 'stand' : 'sit');

    startInterval();
  }, currentInterval * 60 * 1000);
}

// 修改时间间隔
function changeInterval({ interval, posture }) {
  store.set(posture + 'Time', interval);
  clearTimeout(timer);
  startInterval();
}

// 重置时间，并开启定时器
function reset(posture = 'sit') {
  store.set('posture', posture);
  clearTimeout(timer);
  startInterval();
}

// 生成系统托盘的菜单
function getContextMenu() {
  const posture = store.get('posture');
  const sitTime = store.get('sitTime');
  const standTime = store.get('standTime');
  const beforeTime = store.get('beforeTime');
  const postureTime = store.get(posture + 'Time');

  const [hour, minute] = beforeTime.split(':');
  const [currentHour, currentMin] = currentTime().split(':');
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
      label: '更多设置',
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
      label: '退出',
      click: () => {
        app.quit();
      }
    }
  ]);

  return menu;
};

// 监听页面的回调事件
ipcMain.on('changeInterval', (event, arg) => {
  changeInterval(arg);
});
ipcMain.on('changeData', (event, arg) => {
  changeData(arg);
});
ipcMain.on('resetSchedule', (event, arg) => {
  eval(`${arg}()`);
});

// 在关闭窗口的时候，保持程序仍然活着
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 隐藏docker里的图标
app.dock.hide();

// 退出应用的时候停止播放音乐
app.on('before-quit', () => {
  audio && audio.kill();
});

app.on('ready', () => {

  // 重置时间，并开启定时器
  reset();

  // 生成系统托盘
  tray = new Tray(trayIcon);
  tray.on('click', () => tray.popUpContextMenu(getContextMenu()));

  // 执行定时任务
  morningMeetingSchedule();
  offWorkSchedule();
});
