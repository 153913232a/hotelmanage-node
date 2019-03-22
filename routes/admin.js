var express = require('express');
var router = express.Router();
var connection = require('../config')
import {formatDate} from "../util/utils";

router.get('/addrecord',(req, res, next) =>{
  const {id, floorId, name, charge, phone, idCard,xb,startDay, daysNum}=req.query
  connection.query("select * from guestinfo where idCard='" + idCard+"'",async (err, row) => {
    if (err) {
      res.json({
        code: -1,
        msg: err
      })
    } else {
      if (!row.length) {
        const addPerson="insert into guestinfo(gid,name,gtid,xb,phone,idCard) values(?,?,?,?,?,?)"
        const addPersonParam=[name, 1,xb,phone,idCard]
        await connection.query(addPerson, addPersonParam)
      }
      console.log(row)
      const addSql="insert into record(gid, floorId,startDay,outtime,facttime,daysnum,charge,djState) values(?,?,?,?,?,?,?,?)"
      const addSqlParam=[row[0].Gid, floorId,formatDate(new Date(startDay)), formatDate(new Date(new Date(startDay).getTime() + daysNum * 86400 * 1000)), "暂未离开",daysNum,charge,0]
      await connection.query(addSql, addSqlParam)
      res.json({
        code: 0,
        msg: 'ok'
      })
    }
  })

})
router.get('/getrecord', function (req, res, next) {
  connection.query('select * from record r left join guestinfo g on r.gid = g.gid order by r.startDay desc',function (err, row) {
    if (err) {
      res.json({
        code: -1,
        msg: err
      })
    } else {
      res.json({
        code: 0,
        msg: row
      })
    }
  })
})
router.get('/getrecords', function (req, res, next) {
  connection.query('select sum(charge) as allCharge from record r left join guestinfo g on r.gid = g.gid',function (err, row) {
    if (err) {
      res.json({
        code: -1,
        msg: err
      })
    } else {
      res.json({
        code: 0,
        msg: row
      })
    }
  })
})
router.get('/updateFloorState', async (req, res, next) =>{
  const {number, state} = req.query
  if (!number || !state) {
    res.json({
      code: -1,
      msg: 'fail'
    })
  } else {
    await connection.query("update roominfo set state='" + state +"'" + " where number='" + number + "'")
    res.json({
      code: 0,
      msg: 'ok'
    })
  }
})
router.get('/updateDjState', async (req, res, next) => {
  const {djState, idCard} = req.query
  connection.query("select * from guestinfo where idCard='" + idCard+"'",async (err, row) => {
    if (err) {
      res.json({
        code: -1,
        msg: err
      })
    } else {
      console.log(row[0])
      await connection.query("update record set djState='" + djState +"'" + " where gid='" + row[0].Gid + "'")
      res.json({
        code: 0,
        msg: 'ok'
      })
    }
  })
})
router.get('/getFloorState', function (req,res, next) {
  connection.query("select * from roominfo",function (err, row) {
    if (err) {
      res.json({
        code: -1,
        msg: err
      })
    } else {
      if (row) {
        res.json({
          code: 0,
          msg: row
        })
      }
    }
  })
})
router.get('/recordhy', async (req, res, next) => {
  const {gid, charge, floorId, daysNum,djState} = req.query
  const addSql="insert into record(gid, floorId,startDay,outtime,facttime,daysnum,charge,djState) values(?,?,?,?,?,?,?,?)"
  const addSqlParam=[gid, floorId,formatDate(new Date()), formatDate(new Date(new Date().getTime() + daysNum * 86400 * 1000)), '暂未离开', daysNum, charge,djState]
  await connection.query(addSql, addSqlParam)
  res.json({
    code: 0
  })
})
module.exports = router