const { Notification } = require('electron');
const Store = require('../../store');
const Util = require('../../util');

// 当前是否在午休时间
function isNoonBreakTime() {
  const cTime = Util.currentTime();
  const [noonStart, noonEnd] = Store.get('noonBreakTime').split('-');

  return (cTime >= noonStart && cTime <= noonEnd);
}

const notice = ({ title, body }) => {
  if (!isNoonBreakTime()) {
    new Notification({
      title,
      body,
    }).show();
  }
}

module.exports = notice;
