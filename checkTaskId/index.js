const request = require('request');
const crypto = require('crypto');
const { tasks } = require('../index');
const Redis = require('ioredis');

const redis = new Redis(`redis://:C19prsPjHs52CHoA0vm@127.0.0.1:6379/13`, {
  reconnectOnError(err) {
    return err.message.slice(0, 'READONLY'.length) === 'READONLY';
  }
});
/**
 * 头条的接口校验方法
 * */
const getHoney = () => {
  const hash = crypto.createHash('md5');
  const t = Math.floor((new Date()).getTime() / 1e3),
    e = t.toString(16).toUpperCase(),
    n = hash.update(t.toString()).digest('hex').toUpperCase();
  if (e.length !== 8) {
    return {
      as: '479BB4B7254C150',
      cp: '7E0AC8874BB0985'
    };
  }
  let o, l, i, a, r, s;
  for (o = n.slice(0, 5), i = n.slice(-5), a = '', r = 0; r < 5; r += 1) a += o[r] + e[r];
  for (l = '', s = 0; s < 5; s += 1) l += e[s + 3] + i[s];
  return {
    as: `A1${a}${e.slice(-3)}`,
    cp: `${e.slice(0, 3) + l}E1`
  };
};

const getTask = () => new Promise((resolve, reject) => {
  const option = {
    url: 'http://spider-monitor.meimiaoip.com/api/statusMonitor?p=6',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
    }
  };
  request(option, (err, res) => {
    if (err) {
      reject(err);
      return;
    }
    if (res.statusCode !== 200) {
      reject(new Error(`status: ${res.statusCode}`));
      return;
    }
    try {
      res = JSON.parse(res.body);
    } catch (e) {
      reject(e);
      return;
    }
    const list = res.infos.filter((val) => val.videoNumber === 0);
    resolve(list);
  })
});

const getMid = list => new Promise((resolve, reject) => {
  const option = {
      method: 'GET',
    },
    listInfo = [], nodev = [];
  let i = 0;
  console.log('------', list.length);
  const cycle = () => {
    if (i >= list.length) {
      resolve({ listInfo, nodev });
      return;
    }
    option.url = `http://127.0.0.1:1234?bid=${list[i].bid}`;
    request(option, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        res = JSON.parse(res.body);
      } catch (e) {
        reject(e);
        return;
      }
      if (res.error) {
        nodev.push(list[i]);
      }
      if (res.bid) listInfo.push(res);
      i += 1;
      cycle();
    });
  };
  cycle();
});

const storageDev = list => {
  const keys = [];
  for (let i = 0; i < list.length; i += 1) {
    keys.push(['sadd', 'nodev', JSON.stringify(list[i])]);
  }
  redis.pipeline(keys)
    .exec(async (err, result) => {
      if (err) {
        return;
      }
      for (const value of result) {
        if (value[0]) console.log('*****   当前用户存储失败   *****');
        if (value[1] === 0) console.log('*****   当前用户重复   *****');
      }
    });
};

const checkMapbid = list => new Promise((resolve, reject) => {
  const option = {},
    url = 'http://ic.snssdk.com/pgc/ma/?page_type=0&output=json&is_json=1&count=20&version=2&media_id=',
    ids = [];
  let check = false, i = 0;
  const cycle = () => {
    if (i >= list.length) {
      resolve(ids);
      return;
    }
    const { as, cp } = getHoney();
    if (check) {
      option.url = `${url + list[i].encodeId}&uid=${list[i].encodeId}&cp=${cp}&as=${as}&from=user_profile_app&max_behot_time=`;
    } else {
      option.url = `${url + list[i].bid}&uid=${list[i].encodeId}&cp=${cp}&as=${as}&from=user_profile_app&max_behot_time=`;
    }
    request(option, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(res.statusCode));
        return;
      }
      try {
        res = JSON.parse(res.body);
      } catch (e) {
        reject(e);
        return;
      }
      if (res.has_more !== false && !res.data.length) {
        if (!check) {
          check = true;
          setTimeout(() => cycle(), 3000);
          return
        }
        i += 1;
        check = false;
        setTimeout(() => cycle(), 3000);
        return;
      }
      if (check) {
        console.log('需要修改的bid', list[i].bid);
        ids.push(list[i]);
      }
      console.log('验证完一个');
      i += 1;
      setTimeout(() => cycle(), 3000);
    });
  };
  setTimeout(() => cycle(), 3000);
});

const dev = option => new Promise((resolve, reject) => {
  // console.log('00000', option);
  request(option, (err, res) => {
    if (err) {
      console.log('11111', err.message);
      reject(err);
      return;
    }
    if (res.statusCode !== 200) {
      console.log('22222', res.statusCode);
      reject(new Error(res.statusCode));
      return;
    }
    try {
      res = JSON.parse(res.body);
    } catch (e) {
      console.log('33333', e.message);
      reject(e);
      return;
    }
    if (res.errno !== 0 && res.data !== 1) {
      console.log('44444', res);
      reject('error');
      return;
    }
    // console.log('55555', res);
    resolve(res);
  });
});

const updata = list => new Promise((resolve, reject) => {
  const options = [
    {
      method: 'POST',
      url: 'http://staging-dev.meimiaoip.com/index.php/Spider/Encode/update'
    },
    {
      method: 'POST',
      url: 'http://meimiaoip.com/index.php/Spider/Encode/update'
    }
  ];
  let i = 0, errorList = [];
  const cycle = () => {
    if (i >= list.length) {
      resolve();
      return;
    }
    options[0].formData = {
      bid: list[i].bid,
      map_bid: list[i].encodeId,
      bname: list[i].bname,
      encodeId: list[i].encodeId,
      mid: list[i].mid
    };
    options[1].formData = options[0].formData;
    Promise.all([dev(options[0]), dev(options[1])])
      .then((res) => {
        console.log('dev', options[0].url);
        console.log('meimiao', options[1].url);
        console.log('更新成功', res);
        i += 1;
        cycle();
      })
      .catch((e) => {
        console.log('错误的信息', e.message);
        errorList.push(list[i]);
        i += 1;
        cycle();
      });
  };
  cycle();
});


(async () => {
  // 第一步先获取任务列表
  const taskList = [];
  let taskInfo, spl = [];
  try {
    console.log('第一步');
    taskInfo = await getTask();
  } catch (e) {
    console.log('任务列表获取失败', e.message);
    return;
  }
  for (let i = 0; i < taskInfo.length; i += 1) {
    spl.push(taskInfo[i]);
    if (i % 10 === 0) {
      taskList.push(spl);
      spl = [];
    }
    if (i >= taskInfo.length && i % 10 !== 0) {
      taskList.push(spl);
      spl = [];
    }
  }

  // 第二步循环获取对应的mid
  let index = 0;
  const cycle = async () => {
    if (index >= taskList.length) {
      console.log('数据更新完毕', taskList.length);
      return;
    }
    let checkInfo;
    try {
      console.log('第二步', taskList.length);
      checkInfo = await getMid(taskList[index]);
    } catch (e) {
      console.log('mid获取失败', e.message);
      return;
    }
    if (checkInfo.nodev && checkInfo.nodev.length) {
      console.log('开始存储dev里边不存在的数据');
      await storageDev(checkInfo.nodev);
    }
    if (!checkInfo.listInfo || !checkInfo.listInfo.length) {
      index += 1;
      setTimeout(async () => {
        console.log('开始更新下一组', checkInfo.nodev.length);
        await cycle();
      }, 3000);
      return;
    }
    // 第三步循环验证map_bid是否可用
    let checkIds;
    try {
      console.log('第三步', checkInfo.listInfo.length);
      checkIds = await checkMapbid(checkInfo.listInfo);
    } catch (e) {
      console.log('校验map_bid失败', e.message);
      return;
    }

    // 第四步更新map_bid
    let up;
    try {
      console.log('第四步');
      up = await updata(checkIds);
    } catch (e) {
      console.log('数据更新失败', e.message);
      return;
    }
    index += 1;
    await cycle();
  };
  await cycle();
})();