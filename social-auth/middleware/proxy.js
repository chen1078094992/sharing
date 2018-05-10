var https = require('https'),
  fs = require('fs'),
    //加载可以被代理的产品
  config = require('../config/config.json').things[0],
  httpProxy = require('http-proxy');

//初始化代理服务，让它成为HTTPS代理
var proxyServer = httpProxy.createProxyServer({
  ssl: {
    key: fs.readFileSync('./config/change_me_privateKey.pem', 'utf8'),
    cert: fs.readFileSync('./config/change_me_caCert.pem', 'utf8'),
    passphrase: 'webofthings'
  },
  secure: false
});


module.exports = function() {
  return function proxy(req, res, next) {
    req.headers['authorization'] = config.token; 
      //代理请求，最后一个，不调用next()
    proxyServer.web(req, res, {target: config.url}); 
  }
};



