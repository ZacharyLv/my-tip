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
  }

  document.querySelector('#setSitInterval').onclick = () => {
    const interval = Number(document.querySelector('#sitInterval').value);
    changeInterval(interval, 'sit');
  };

  document.querySelector('#setStandInterval').onclick = () => {
    const interval = Number(document.querySelector('#standInterval').value);
    changeInterval(interval, 'stand');
  };
}
