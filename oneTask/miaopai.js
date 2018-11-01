const { connection } = require('../lib/mysql');

exports.getAid = (req, res) => {
  const sql = 'select aid from qs_video_info where platform=7';
  connection.query(sql, (err, result) => {
    if (err) {
      console.log(err.message);
      res.statusCode = 502;
      res.end(JSON.stringify({
        errmsg: 'data error db error',
        data: null
      }));
      return;
    }
    if (!result[0]) {
      console.log('当前的数据错误');
      res.statusCode = 502;
      res.end(JSON.stringify({
        errmsg: 'data error',
        data: null
      }));
      return;
    }
    // console.log('数据已返回', result);
    res.statusCode = 200;
    res.end(JSON.stringify({
      errmsg: 'add success',
      data: result
    }))
  });
};