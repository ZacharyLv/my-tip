const { app, Tray, ipcMain } = require('electron');
const store = require('./store');
const Notification = require('./common/Notification');
const trayIcon = require.resolve('../images/grassland.png'); // 托盘图标
const morningMeetingSchedule = require('./components/morningMeeting'); // 晨会提醒
const offWorkSchedule = require('./components/offWork'); // 下班提醒
const getContextMenu = require('./components/contextMenu'); // 配置项窗口对象
const learnWorld = require('./components/learnWord'); // 单词提示
const Util = require('./util');

let timer; // 倒计时的定时器
let tray; // 右上角托盘菜单

// 修改时间
function changeData({ key, value }) {
  store.set(key, value);
}

// 开启定时器
function startInterval() {
  const posture = store.get('posture');
  const currentInterval = store.get(posture + 'Time');

  store.set('beforeTime', Util.currentTime());

  timer = setTimeout(() => {
    const date = new Date();
    Notification({
      title: '暖洋想去放风筝',
      body: `${date.getHours()}点${date.getMinutes()}分\n该${posture === 'sit' ? '站起来' : '坐下'}了`
    });

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

app.on('ready', () => {

  // 重置时间，并开启定时器
  reset();

  // 生成系统托盘
  tray = new Tray(trayIcon);
  tray.on('click', () => tray.popUpContextMenu(getContextMenu()));

  // 执行定时任务
  morningMeetingSchedule();
  offWorkSchedule();
  learnWorld();
});
