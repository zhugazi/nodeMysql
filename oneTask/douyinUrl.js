const Redis = require('ioredis');
const { connection } = require('../lib/mysql');

// const redis = new Redis('redis://:C19prsPjHs52CHoA0vm@127.0.0.1:6379/9', {
//   reconnectOnError(err) {
//     return err.message.slice(0, 'READONLY'.length) === 'READONLY';
//   }
// });

// const waitFor = time => new Promise((resolve) => { setTimeout(resolve(), timeout) });

exports.getBid = (req, res) => {
  const sql = 'select aid,v_url from qs_video_info where platform=47 and v_url not like \'%&utm_medium=%\' and v_url not like \'%https://www.amemv.com/share/video%\' limit 0, 10000';
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
    console.log('数据已返回', result.length);
    res.statusCode = 200;
    res.end(JSON.stringify({
      errmsg: 'add success',
      data: result
    }))
  });
};

// const storageBid = (bids) => {
//   let i = 0;
//   const cycle = async () => {
//     if (i >= bids.length) return 'OK';
//     if (!bids[i] || !bids[i].v_url) {
//       redis.sadd('douyinInfoAA', JSON.stringify(bids[i]));
//       console.log('存储...', i);
//       i += 1;
//       return cycle();
//     }
//     redis.sadd('douyinInfo', bids[i].v_url);
//     if (i % 1000 === 0) await waitFor(3000);
//     console.log('存储。。。', i);
//     i += 1;
//     return cycle();
//   };
//   return cycle();
// };

// const begin = async () => {
//   let bids;
//   try {
//     console.log('开始获取');
//     bids = await getBid();
//   } catch (e) {
//     console.log('bid 获取失败', e.message);
//     return;
//   }
//   console.log(`一共获取到 ${bids.length} 条数据`);
//   try {
//     console.log('开始存储');
//     await storageBid(bids);
//   } catch (e) {
//     console.log('存储失败', e.message);
//     return;
//   }
//   console.log('存储完成');
// };
// begin();