const mysql = require('mysql');

const connection = mysql.createConnection({

  // host: '118.190.82.151',
  // user: 'qiaosuan',
  // password: '4Dfd8FaDsV3IO1j0',
  // database: 'qiaosuan'
  host: 'rr-m5e0pv62m8jk57mkc.mysql.rds.aliyuncs.com',
  user: 'qiaosuan',
  password: '4DszV34xfsqIsOfi19lj0',
  database: 'qiaosuan'

});

connection.connect();

module.exports = { connection };