    var log4js = require("log4js");
    var log4js_config = require("./log4js.json");
    log4js.configure(log4js_config);

    var LogFile = log4js.getLogger('log_file');
//    var errorFile=log4js.getLogger('log_error');
        module.exports=LogFile;

