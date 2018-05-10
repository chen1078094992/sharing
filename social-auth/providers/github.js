var passport = require('passport'),
    GithubStrategy = require('passport-github').Strategy,
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  auth = require('../middleware/auth'),
    logger=require('../middleware/logger'),
  methodOverride = require('method-override')
  limit = require('../middleware/limit');

//加载基本信息
var acl = require('../config/config.json');
var githubAppId = acl.config.AppID;
var githubAppSecret =acl.config.AppSecret;
var socialNetworkName = 'github';
var callbackResource = '/auth/github/callback';
var callbackUrl = 'https://localhost:' + acl.config.sourcePort + callbackResource;


//初始化Passport并保存用户信息到session中
module.exports.setupGithubAuth = setupGithubAuth;
function setupGithubAuth(app) {
  app.use(cookieParser());
  app.use(methodOverride());
  app.use(session({secret: 'keyboard cat', resave: true, saveUninitialized: true}));
  app.use(passport.initialize()); //#B
  app.use(passport.session());


  //存取用户信息
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });


  //Github用来验证你的认证代理凭证
  passport.use(new  GithubStrategy({
        clientID: githubAppId,
        clientSecret: githubAppSecret,
        callbackURL: callbackUrl,
          proxy: true//Strategy 信任所有代理设置
      },
      function (accessToken, refreshToken, profile, done) {

    //验证函数，在成功认证后被调用，检查代理是否知道用户，存储对应的token
        auth.checkUser(socialId(profile.id), accessToken, function (err, res) {
          if (err) return done(err, null);
          else return done(null, profile);
        });
      }));


  app.get('/auth/github', limit.peripperday('login', 1000, {showJson: true}),
    passport.authenticate('github'),
    function (req, res) {});

    //github在用户认证后调用
  app.get(callbackResource,
    passport.authenticate('github', {session: true, failureRedirect: '/login'}),
    function (req, res) {
      res.redirect('/account');
    });

//启用日志中间件
  app.get('/account', ensureAuthenticated, logger.logger(), function (req, res) {
    auth.getToken(socialId(req.user.id), function (err, user) {
      if (err) res.redirect('/login');
      else {
        req.user.token = user.token;
        res.render('account', {user: req.user});
      }
    });
  });

  //唯一的社交网络身份由用户ID和用户名组成
  function socialId(userId) {
    return socialNetworkName + ':' + userId;
  };

  app.get('/', ensureAuthenticated, function (req, res) {
    res.render('index', {user: req.user});
  });

  app.get('/login', function (req, res) {
    res.render('login', {user: req.user});
  });

  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  };

};

