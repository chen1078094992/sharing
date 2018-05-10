var log4js = require("log4js");
var log4js_config = require("../common/log4js.json");
exports.logger = function () {
  return function(req, res, next) {
      log4js.configure(log4js_config);
      var LogFile = log4js.getLogger('log_file');
      var path = req.path;
      switch (path) {
          case '/account':
              LogFile.info(req.user.id+' 登录成功')
              break;
          case'/login':
              LogFile.info(' 用户请求登录')
              break;
          case'/temperature':
              LogFile.info(req.user.id+' 访问温度传感器')
              break;
          case'/leds':
              LogFile.info(req.user.id+' 访问led灯')
              break;
          case'/logout':
              LogFile.info(req.user.id+' 登出成功')
              break;
      }
      next();
  }
};