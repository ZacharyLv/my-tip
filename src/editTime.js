window.onload = () => {
  const { ipcRenderer } = require('electron');
  const Store = require('electron-store');
  const store = new Store(); // 数据存储对象

  const sitTime = store.get('sitTime'); // 坐下的时间
  const standTime = store.get('standTime'); // 站起来的时间
  const noonBreakTime = store.get('noonBreakTime'); // 午休时间
  const morningMeetingTime = store.get('morningMeetingTime'); // 晨会时间
  const offWorkTime = store.get('offWorkTime'); // 下班时间
  const disableMorningMeeting = store.get('disableMorningMeeting'); // 禁用晨会提醒
  const disableOffWork = store.get('disableOffWork'); // 禁用下班提醒

  // 验证时间格式
  function matchTime(time) {
    return /^((2[0-3])|([0-1][0-9])):[0-5][0-9]$/.test(time);
  }

  function changeInterval(interval, posture) {
    if (!interval) {
      alert('请输入正确的数字,最小1分钟，最大60分钟');
      return;
    }
    if (interval < 1 || interval > 60) {
      alert('时间间隔为1到60分钟');
      return;
    }
    ipcRenderer.send('changeInterval', { interval, posture });

    alert('修改成功');
  }

  // 设置坐下的时间
  function sitInterval() {
    const sitInterval = document.querySelector('#sitInterval');
    sitInterval.value = sitTime;
    document.querySelector('#setSitInterval').onclick = () => {
      const interval = Number(sitInterval.value);
      changeInterval(interval, 'sit');
    };
  }

  // 设置站起来的时间
  function standInterval() {
    const standInterval = document.querySelector('#standInterval');
    standInterval.value = standTime;
    document.querySelector('#setStandInterval').onclick = () => {
      const interval = Number(standInterval.value);
      changeInterval(interval, 'stand');
    };
  }

  // 设置午休时间
  function noonBreak() {
    const noonBreakDom = document.querySelector('.noonBreak');
    const inputList = noonBreakDom.querySelectorAll('input');
    const [noonStart, noonEnd] = noonBreakTime.split('-');
    [...noonStart.split(':'), ...noonEnd.split(':')].forEach((v, i) => inputList[i].value = v);
    noonBreakDom.querySelector('button').onclick = () => {
      const timeList = [...inputList].map(input => input.value !== '' && input.value.padStart(2, '0'));
      const timeIsOk = timeList.every((item, idx) => {
        return item && +item >= 0 && +item <= (idx % 2 === 0 ? 23 : 59);
      });
  
      if (timeIsOk) {
        const result = `${timeList[0]}:${timeList[1]}-${timeList[2]}:${timeList[3]}`;
        ipcRenderer.send('changeData', { key: 'noonBreakTime', value: result });

        alert('修改成功');
      } else {
        alert('午休时间填写有误');
      }
    }
  }

  // 设置晨会时间
  function morningMeeting() {
    const morningMeeting = document.querySelector('.morningMeeting');
    const inputDom = morningMeeting.querySelector('input');
    const btnDom = morningMeeting.querySelector('button');
    inputDom.value = morningMeetingTime;
    btnDom.onclick = () => {
      const [hour, min] = inputDom.value.split(':');
      const value = [hour.padStart(2, '0'), min.padStart(2, '0')].join(':');
      if (matchTime(value)) {
        ipcRenderer.send('changeData', { key: 'morningMeetingTime', value });
        setTimeout(() => {
          ipcRenderer.send('resetSchedule', 'morningMeetingSchedule');
        }, 1000);
        alert('修改成功');
      } else {
        alert('请输入正确的时间');
      }
    }
  }

  // 设置禁用晨会提醒
  function setDisableMorning() {
    const disableMorningDom = document.querySelector('#disableMorningMeeting');
    disableMorningDom.checked = disableMorningMeeting;

    disableMorningDom.onchange = () => {
      ipcRenderer.send('changeData', { key: 'disableMorningMeeting', value: disableMorningDom.checked });
      setTimeout(() => {
        ipcRenderer.send('resetSchedule', 'morningMeetingSchedule');
      }, 1000);
      alert('修改成功');
    }
  }

  // 设置下班时间
  function offWork() {
    const offWork = document.querySelector('.offWork');
    const inputDom = offWork.querySelector('input');
    const btnDom = offWork.querySelector('button');
    inputDom.value = offWorkTime;
    btnDom.onclick = () => {
      const [hour, min] = inputDom.value.split(':');
      const value = [hour.padStart(2, '0'), min.padStart(2, '0')].join(':');
      if (matchTime(value)) {
        ipcRenderer.send('changeData', { key: 'offWorkTime', value });
        setTimeout(() => {
          ipcRenderer.send('resetSchedule', 'offWorkSchedule');
        }, 1000);
        alert('修改成功');
      } else {
        alert('请输入正确的时间');
      }
    }
  }

  // 设置禁用下班提醒
  function setDisableOffWork() {
    const disableOffWorkDom = document.querySelector('#disableOffWork');
    disableOffWorkDom.checked = disableOffWork;

    disableOffWorkDom.onchange = () => {
      ipcRenderer.send('changeData', { key: 'disableOffWork', value: disableOffWorkDom.checked });
      setTimeout(() => {
        ipcRenderer.send('resetSchedule', 'offWorkSchedule');
      }, 1000);
      alert('修改成功');
    }
  }

  sitInterval();
  standInterval();
  noonBreak();
  morningMeeting();
  offWork();
  setDisableMorning();
  setDisableOffWork();
}
