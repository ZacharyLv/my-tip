window.onload = () => {
  const { ipcRenderer } = require('electron');

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

  document.querySelector('#setSitInterval').onclick = () => {
    const interval = Number(document.querySelector('#sitInterval').value);
    changeInterval(interval, 'sit');
  };

  document.querySelector('#setStandInterval').onclick = () => {
    const interval = Number(document.querySelector('#standInterval').value);
    changeInterval(interval, 'stand');
  };

  const noonBreakDom = document.querySelector('.noonBreak');
  noonBreakDom.querySelector('button').onclick = () => {
    const inputList = noonBreakDom.querySelectorAll('input');
    const timeList = [...inputList].map(input => input.value !== '' && input.value.padStart(2, '0'));
    const timeIsOk = timeList.every((item, idx) => {
      return item && +item >= 0 && +item <= (idx % 2 === 0 ? 23 : 59);
    });

    if (timeIsOk) {
      const result = `${timeList[0]}:${timeList[1]}-${timeList[2]}:${timeList[3]}`;
      ipcRenderer.send('noonBreakTime', result);

      alert('修改成功');
    } else {
      alert('午休时间填写有误');
    }
  }
}
