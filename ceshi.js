const request = require('request');
const dev = (option) => new Promise((resolve, reject) => {
  request(option, (err, res) => {
    if (err) {
      console.log(err.message);
      reject(err);
      return;
    }
    if (res.statusCode !== 200) {
      console.log('res.statusCode', res.statusCode);
      reject(new Error(res.statusCode));
      return;
    }
    try {
      res = JSON.parse(res.body);
    } catch (e) {
      console.log(e.message, res.body);
      reject(e);
      return;
    }
    if (res.errno !== 0 && res.data !== 1) {
      console.log('error', res);
      reject('error');
      return;
    }
    console.log(res);
    resolve(res);
  });
});
// const a2 = (a) => new Promise(resolve => resolve(a));

const arr = [1, 2];

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
// options = { method: 'POST',
//   url: 'http://staging-dev.meimiaoip.com/index.php/Spider/Encode/update',
//   headers: { 'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' },
//   formData:
//     { bid: '1553025415149569',
//       map_bid: '6026968107',
//       bname: '大唐雷音寺',
//       encodeId: '6026968107',
//       mid: 'dff22003614641732474d0c13ba6c002' } }
// options.headers = { 'content-type': 'multipart/form-data' };
options[1].formData = options[0].formData = {
  bid: '1553025415149569',
  map_bid: '6026968107',
  bname: '大唐雷音寺',
  encodeId: '6026968107',
  mid: 'dff22003614641732474d0c13ba6c002'
};
// Object.assign(options[1], options[0]);
console.log(options);
Promise.all([dev(options[0]), dev(options[1])])
  .then((res) => {
    console.log('更新成功', res);
    i += 1;
  })
  .catch((e) => {
    console.log('错误的信息', e.message);
    // errorList.push(list[i]);
    i += 1;
  });

// Promise.all([a1(arr[0]), a1(arr[1])])
//   .then((res) => console.log('---', res))
//   .catch((e) => console.log('===', e.message));
