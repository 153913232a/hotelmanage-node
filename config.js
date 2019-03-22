var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '123456',
  database : 'hotelmanage'
});
//执行创建连接
connection.connect();
module.exports = connection