const HTTP = require('http');
const { connection } = require('../lib/mysql');
const { getMid } = require('./sqlDate');


const server = HTTP.createServer((req, res) => {
  if (req.method === 'GET') {
    getMid(req, res, connection);
  }
});

server.listen(1234, () => console.log('获取数据库数据服务已启动端口号是1234'));