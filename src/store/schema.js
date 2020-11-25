module.exports = {
  posture: { // 姿势： sit、stand
    type: 'string',
    default: 'sit'
  },
  sitTime: { // 坐位的时间
		type: 'number',
		default: 40
  },
  standTime: { // 站立的时间
		type: 'number',
		default: 20
  },
  beforeTime: { // 前一次切换姿势的时间
    type: 'string',
    default: ''
  },
  noonBreakTime: { // 午休时间
    type: 'string',
    default: '12:00-13:30'
  },
  morningMeetingTime: { // 晨会时间
    type: 'string',
    default: '8:59'
  },
  disableMorningMeeting: { // 禁用晨会提醒
    type: 'boolean',
    default: false
  },
  offWorkTime: { // 下班时间
    type: 'string',
    default: '18:00'
  },
  disableOffWork: { // 禁用下班提醒
    type: 'boolean',
    default: false
  },
  learnWordTimeLength: { // 单词提示的时间间隔
    type: 'number',
    default: 10, // 单位分钟
  },
  word: { // 单词本
    type: 'string',
    default: '[]'
  }
}
