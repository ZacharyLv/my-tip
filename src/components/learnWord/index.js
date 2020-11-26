const Store = require('../../store');
const Notification = require('../../common/Notification');

let index = 0; // 需要弹出来的单词的索引

const run = () => {
  const wordList = JSON.parse(Store.get('word'));

  if (wordList[index]) {
    Notification({
      title: '暖洋想去放风筝',
      body: wordList[index]
    });
  }

  index = index >= wordList.length - 1 ? 0 : index + 1;

  setTimeout(() => {
    run();
  }, Store.get('learnWordTimeLength') * 1000 * 60);
};

module.exports = run;
