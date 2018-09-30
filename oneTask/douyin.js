const HTTP = require('http');
const { connection } = require('../lib/mysql');

const getAccount = (req, res, connection) => {
  const sql = 'SELECT * FROM qs_video_info where platform=47 and bid=60205035925';
  connection.query(sql, (err, result) => {
    if (err) {
      console.log(err.message);
      res.end(JSON.stringify({ message: `数据库查询失败: ${err.message}` }));
      return;
    }
    res.end(JSON.stringify(result));
  });
};

const server = HTTP.createServer((req, res) => {
  if (req.method === 'GET') {
    getAccount(req, res, connection);
  }
});

server.listen(1234, () => console.log('获取数据库数据服务已启动端口号是1234'));