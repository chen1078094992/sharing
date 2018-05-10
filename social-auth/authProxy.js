var express = require('express'),
  https = require('https'),
  fs = require('fs'),
  bodyParser = require('body-parser'),
  cons = require('consolidate'),
  auth = require('./middleware/auth'),
  github = require('./providers/github.js'),
  proxy = require('./middleware/proxy.js'),
  config = require('./config/config.json').config;

 var logger = require('../social-auth/common/log_start');


var key_file = './config/change_me_privateKey.pem';//服务器实际的证书文件
var cert_file = './config/change_me_caCert.pem';//服务器的私钥文件
var passphrase = 'webofthings';//私钥文件密码



var tlsConfig = {
  key: fs.readFileSync(key_file),
  cert: fs.readFileSync(cert_file),
  passphrase: passphrase
};


var app = express();
app.use(bodyParser.json());
app.use(auth.socialTokenAuth());

// configure Express
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.engine('html', cons.handlebars);
app.set('view engine', 'html');

// add the GitHub auth support and pages

github.setupGithubAuth(app);
app.use(proxy());


var httpServer = https.createServer(tlsConfig, app);
httpServer.listen(config.sourcePort, function () {
  logger.info('WoT Social Authentication Proxy started on port: %d', config.sourcePort);
});

