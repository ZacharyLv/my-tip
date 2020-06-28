window.onload = () => {
  const { ipcRenderer } = require('electron');
  const Store = require('electron-store');
  const store = new Store(); // 数据存储对象

  const sitTime = store.get('sitTime'); // 坐下的时间
  const standTime = store.get('standTime'); // 站起来的时间
  const noonBreakTime = store.get('noonBreakTime'); // 午休时间
  const morningMeetingTime = store.get('morningMeetingTime'); // 晨会时间
  const offWorkTime = store.get('offWorkTime'); // 下班时间

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
        ipcRenderer.send('changeTime', { key: 'noonBreakTime', value: result });

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
      ipcRenderer.send('changeTime', { key: 'morningMeetingTime', value: inputDom.value });

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
      ipcRenderer.send('changeTime', { key: 'offWorkTime', value: inputDom.value });

      alert('修改成功');
    }
  }

  sitInterval();
  standInterval();
  noonBreak();
  morningMeeting();
  offWork();
}
