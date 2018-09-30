const Redis = require('ioredis');
const crypto = require('crypto');

const redis = new Redis('redis://:C19prsPjHs52CHoA0vm@127.0.0.1:6379/9', {
  reconnectOnError(err) {
    return err.message.slice(0, 'READONLY'.length) === 'READONLY';
  }
});

const getBidInfo = () => new Promise((resolve, reject) => {
  const keys = [], list = [];
  for (let i = 0; i < 2; i += 1) {
    keys.push(['spop', 'douyinInfo']);
  }
  redis.pipeline(keys)
    .exec(async (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      for (const value of result) {
        if (value[0]) console.log('*****   当前用户删除失败   *****');
        list.push(value[1])
      }
      resolve(list);
    });

});

const getSignInfo = (bids, connection) => {
  let index = 0;
  const list = [], bidInfo = {};
  const getInfo = (bid) => new Promise((resolve, reject) => {
    const md5 = crypto.createHash('md5');
    const mid = md5.update(`p47bid${bid}`).digest('hex');
    const sql = `select aid from qs_video_info where mid='${mid}' and v_url like '%https://www.amemv.com/share/video%' limit 10000`;
    connection.query(sql, (err, result) => {
      if (err) {
        console.log(err.message);
        reject(new Error(`数据库查询失败: ${err.message}`));
        return;
      }
      if (!result[0]) {
        console.log('当前的数据错误');
        reject(new Error('当前的数据错误'));
        return;
      }
      bidInfo.bid = bid;
      bidInfo.aids = [];
      for (const val of result) {
        bidInfo.aids.push(val.aid);
      }
      console.log('数据已返回', result.length);
      resolve(bidInfo)
    });
  });
  const cycle = async () => {
    if (index >= bids.length) return list;
    try {
      list.push(await getInfo(bids[index]));
    } catch (e) {
      console.log('aid 获取失败', e.message);
    }
    index += 1;
    return cycle();
  };
  return cycle();
};

const getMid = async (req, res, connection) => {
  let bids;
  try {
    bids = await getBidInfo();
  } catch (e) {
    res.end(JSON.stringify({ errno: 1, message: 'bid取出失败', data: null }));
    return;
  }
  // if (!bids || !bids.length || !bids[0]) {
  //   try {
  //     bids = await getBid(connection);
  //     console.log('开始存储', bids.length);
  //     await storageBid(bids);
  //     bids = await getBidInfo();
  //   } catch (e) {
  //     res.end(JSON.stringify({ errno: 1, message: e.message, data: null }));
  //     return;
  //   }
  // }
  if (!bids || !bids.length) {
    res.end(JSON.stringify({ errno: 0, message: '数据已经更新完毕', data: null }));
    return;
  }
  let bidInfo;
  try {
    bidInfo = await getSignInfo(bids, connection);
  } catch (e) {
    res.end(JSON.stringify({ errno: 1, message: `获取过滤之后的数据失败: ${e.message}`, data: null }));
    return;
  }
  if (!bidInfo || !bidInfo.length) {
    res.end(JSON.stringify({ errno: 1, message: '没有找到过滤之后的数据', data: null }));
    return;
  }
  res.end(JSON.stringify({ errno: 0, message: '数据返回成功', data: bidInfo }));
};

module.exports = { getMid };