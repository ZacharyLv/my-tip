window.onload = () => {
  const { ipcRenderer } = require('electron');
  const Store = require('electron-store');
  const store = new Store(); // 数据存储对象
  const world = store.get('word'); // 单词本

  const contentDom = document.querySelector('#content');
  contentDom.value = world;

  document.querySelector('#btn').onclick = () => {
    const content = contentDom.value;
    try {
      JSON.parse(content);
      ipcRenderer.send('changeData', { key: 'word', value: content });
      alert('修改成功');
    } catch(e) {
      alert('内容格式错误');
    }
  };
}
