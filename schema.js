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
  }
}
