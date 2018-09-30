const request = require('request');

exports.getTask = () => new Promise((resolve, reject) => {
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
    const list = res.body.infos.filter((val) => val.videoNumber === 0);
    resolve(list);
  })
});