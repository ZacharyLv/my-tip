const Notification = require('../../common/Notification');
const schedule = require('node-schedule');
const store = require('../../store');

let offWorkJob; // 下班的定时任务

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
    Notification({
      title: '暖洋想去放风筝',
      body: `下班了，下班了`
    });
  });
}

module.exports = offWorkSchedule;
