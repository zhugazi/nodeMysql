const Redis = require('ioredis');
const { connection } = require('../lib/mysql');

const redis = new Redis('redis://:C19prsPjHs52CHoA0vm@127.0.0.1:6379/9', {
  reconnectOnError(err) {
    return err.message.slice(0, 'READONLY'.length) === 'READONLY';
  }
});

const waitFor = time => new Promise((resolve) => { setTimeout(resolve(), timeout) });

const getBid = () => new Promise((resolve, reject) => {
  const sql = 'select distinct bid from qs_video_info where platform=47 and v_url like \'%https://www.amemv.com/share/video%\'';
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
    console.log('数据已返回', result.length);
    resolve(result)
  });
});

const storageBid = (bids) => {
  // let index = 30000;
  // const length = bids,
  //   cycle = async () => {
  //     if (index >= length) return 'OK';
  //     if (!bids[index] || !bids[index].bid) {
  //       redis.sadd('douyinInfoAA', JSON.stringify(bids[index]));
  //       index += 1;
  //       return cycle();
  //     }
  //     redis.sadd('douyinInfo', bids[index].bid);
  //     index += 1;
  //     console.log('存储。。。', index);
  //     return cycle();
  //   };
  // return cycle();
  let i = 0;
  const cycle = async () => {
    if (i >= bids.length) return 'OK';
    if (!bids[i] || !bids[i].bid) {
      redis.sadd('douyinInfoAA', JSON.stringify(bids[i]));
      console.log('存储...', i);
      i += 1;
      return cycle();
    }
    redis.sadd('douyinInfo', bids[i].bid);
    if (i % 1000 === 0) await waitFor(3000);
    console.log('存储。。。', i);
    i += 1;
    return cycle();
  };
  return cycle();
};

const begin = async () => {
  let bids;
  try {
    console.log('开始获取');
    bids = await getBid();
  } catch (e) {
    console.log('bid 获取失败', e.message);
    return;
  }
  console.log(`一共获取到 ${bids.length} 条数据`);
  try {
    console.log('开始存储');
    await storageBid(bids);
  } catch (e) {
    console.log('存储失败', e.message);
    return;
  }
  console.log('存储完成');
};
begin();