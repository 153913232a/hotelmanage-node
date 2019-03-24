var express = require('express');
var router = express.Router();
var connection = require('../config')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/login', function (req, res, next){
  const {username, psw}=req.query
  if (req.session[username]) { // 如果有session
    if (req.session[username] === username) { // 如果该用户已经登陆过
      res.json({
        code: 1,
        type: 'index'
      })
    }
  } else {
    let selectSql="select * from opinfo where oname='" + username + "' and pwd='" +psw+"'"
    connection.query(selectSql, function (err, rows) {
      if (err) {
        res.json({
          code: -1,
          msg: err
        })
      } else {
        if (rows.length > 0) {
          req.session[username]=username
          res.json({
            code: 0,
            msg: {username, isSuper: rows[0].isSuper}
          })
        } else {
          res.json({
            code: -1,
            msg: 'fail'
          })
        }
      }
    })
  }
})
router.get('/adduser', async (req, res, next) =>{
  let {oid, oname, name, pwd} = req.query
  let addParams = [oid, oname,name, pwd]
  let addsql = 'insert into opinfo(oid, oname, pwd,name) values(?, ?, ?, ?)'
  await connection.query(addsql, addParams)
  res.json({
    code: 0,
    msg: 'suc'
  })
})
router.get('/getuser',function (req, res, next) {
  let selectSql = "select oid, oname, name, isSuper from opinfo"
  connection.query(selectSql, function (err, rows) {
    if (err) {
      res.json({
        code: -1,
        msg: err
      })
    } else {
      if (rows.length > 0) {
        res.json({
          code: 0,
          msg: rows
        })
      } else {
        res.json({
          code: -1,
          msg: 'fail'
        })
      }
    }
  })
})
router.get('/deleteuser', function (req, res, next) {
  const {oid} = req.query
  connection.query("delete from opinfo where oid=" + oid + " and isSuper!=1", function (err, rows) {
    if (err) {
      res.json({
        code: -1,
        msg: 'nope'
      })
    } else {
      res.json({
        code: 0,
        msg: 'success'
      })
    }
  })
})
router.get('/loginout', function (req,res,next) {
  const {username} = req.query
  if (req.session[username]) {
    req.session[username]=null
    res.json({
      code: 0,
      msg: 'success'
    })
  } else {
    res.json({
      code: 0,
      msg: 'success'
    })
  }
})
router.get('/authrize',function (req, res, next) {
  const {username} = req.query
  if (req.session[username]) {
    res.json({
      code: 0,
      msg: 'ok',
      isAuth: true
    })
  } else {
    res.json({
      code: -1,
      msg: 'no auth',
      isAuth: false
    })
  }
})
router.get('/changePwd', function (req, res, next) {
  const {pwd, Npwd, oid} = req.query
  connection.query("update opinfo set pwd='" + Npwd +"'" + " where pwd='" + pwd + "'" + "and oid ='" + oid + "'", function (err, rows) {
      if (err) {
        res.json({
          code: -1,
          msg: "更新出错"
        })
        return
      } else {
        if (!rows.changedRows) {
          res.json({
            code: -1,
            msg: '密码错误'
          })

        } else {
          res.json({
            code: 0
          })
        }
      }
    })
})
router.get('/handleCZ', function (req, res, next) {
  const {gid, money} = req.query
  let originMoney = 0
  connection.query('select money from guestinfo where gid=' + gid, function (err, rows) {
    if (err) {
      res.json({
        code: -1,
        msg: '数据库select失败'
      })
    } else {
      if (rows.length > 0)  {
        originMoney = parseInt(rows[0].money) + parseInt(money)
        connection.query("update guestinfo set money='" + originMoney +"'" + " where gid='" + gid + "'", function (error, row) {
          if (error) {
            res.json({
              code: -1,
              msg: '数据库操作错误'
            })
          } else {
            if (row.changedRows > 0) {
              res.json({
                code: 0
              })
            } else {
              res.json({
                code: -1
              })
            }
          }
        })
      } else {
        res.json({
          code: -1,
          msg: '操作失败'
        })
      }
    }
  })
})
router.get('/gethy', function (req, res, next) {
  connection.query('select * from guestinfo', function (err, rows) {
    if (err){
      res.json({
        code: -1
      })
    } else {
      res.json({
        code: 0,
        msg: rows
      })
    }
  })
})
router.get('/handleGS', function (req, res, next) {
  const {gid, isgs} = req.query
  connection.query("update guestinfo set isgs='" + isgs +"'" + " where gid='" + gid + "'", function (err, rows) {
    if (err) {
      res.json({
        code: -1
      })
    } else {
      if (rows.changedRows > 0) {
        res.json({
          code: 0
        })
      }
    }
  })
})
router.get('/handleopenhy', function (req,res, next) {
  const {gid} = req.query
  console.log(gid)
  connection.query('update guestinfo set gtid=0 where gid=' + gid, function (err, rows) {
    if (err) {
      res.json({
        code: -1
      })
    } else {
      if (rows.changedRows > 0) {
        res.json({
          code: 0
        })
      }
    }
  })
})
router.get('/handleXF', function (req, res, next) {
  const {charge, gid} = req.query
  connection.query('select money, score from guestinfo where gid=' + gid, function (err, rows) {
    if (err) {
      res.json({
        code: -1
      })
    } else {
      if (rows.length === 0) {
        res.json({
          code: -1,
          msg: '无该用户'
        })
      } else {
        if (rows[0].money < charge) {
          res.json({
            code: -1,
            msg: '余额不足，请及时充值！'
          })
        } else {
          let resMoney = rows[0].money - parseInt(charge)
          let resScore = rows[0].score + Math.floor(parseInt(charge) / 10)
          connection.query("update guestinfo set money='" + resMoney +"'" +",score='" + resScore+ "'" + " where gid='" + gid + "'", function (err, rows) {
            if (err) {
              res.json({
                code: -1,
                msg:'数据库操作失败！'
              })
            } else {
              if (rows.changedRows > 0){
                res.json({
                  code: 0,
                  msg: 'success'
                })
              }
            }
          })
        }
      }
    }
  })
})
module.exports = router;
