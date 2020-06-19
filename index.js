window.onload = () => {
  const { ipcRenderer } = require('electron');

  function changeInterval() {
    const interval = document.querySelector('#interval').value;
    if (!Number(interval)) {
      alert('请输入正确的数字,最小1分钟，最大60分钟');
      return;
    }
    if (interval < 1 || interval > 60) {
      alert('时间间隔为1到60分钟');
      return;
    }
    ipcRenderer.send('changeInterval', interval);
  }

  document.querySelector('#setInterval').onclick = changeInterval;
}
