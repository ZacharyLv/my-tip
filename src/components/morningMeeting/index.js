const { app } = require('electron');
const Notification = require('../../common/Notification');
const store = require('../../store');
const schedule = require('node-schedule');
const player = require('play-sound')(opts = {});

let audio; // 音乐播放对象
let morningMeetingJob; // 晨会提醒的定时任务

// 播放音乐
function playMusic() {
  let music;

  try {
    music = require.resolve('../../../audio/morningMeeting.mp3'); // 晨会提醒
  } catch(e) {}

  if (music) {
    audio = player.play(music);
  }
}

const run = () => {
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
    Notification({
      title: '暖洋想去放风筝',
      body: `晨会时间到了`
    });
  });
}

const morningMeetingSchedule = () => {
  run();
  // 退出应用的时候停止播放音乐
  app.on('before-quit', () => {
    audio && audio.kill();
  });
}

module.exports = morningMeetingSchedule;
