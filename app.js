var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var http = require('http')
var WebSocket=require('ws')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin')

var app = express();
var server = http.createServer(app)
var wss = new WebSocket.Server({server})
var connectionM = require('./config')
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000*60*30
  }
}))

wss.on('connection', function connection(ws) {
  console.log('链接成功！');
  ws.on('message', function incoming(data) {
    /**
     * 把消息发送到所有的客户端
     * wss.clients获取所有链接的客户端
     */
    setInterval(() => {
      let ans = []
      connectionM.query('select * from record where djState=1',function (err, row) {
        if (err) {
          return
        } else {
          if (row) {
            row.forEach(item => {
              if (((new Date(item.startDay).getTime() + item.daysNum * 86400 * 1000) < new Date().getTime() + 3600 * 1000)
                  &&((new Date(item.startDay).getTime() + item.daysNum * 86400 * 1000)> new Date().getTime())) {
                ans.push({
                  floorId: item.floorId
                })
              }
            })
            wss.clients.forEach(function each(client) {
              client.send(JSON.stringify(ans));
            });
          }
        }
      })
    },3600000)
  });

  wss.clients.forEach(function each(client) {
    client.send(JSON.stringify({data: '数据'}));
  });
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
server.listen(9093, function listening() {
  console.log('服务器启动成功！');
});
module.exports = app;
