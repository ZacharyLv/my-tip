const Store = require('electron-store');
const schema = require('./schema');
const store = new Store({ schema }); // 数据存储对象

module.exports = store;
