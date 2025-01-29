const express = require('express');
const mysql = require('mysql');
const cors = require('cors'); // 解决跨域问题
const app = express();

// 启用跨域支持（允许所有域名，生产环境建议限制为前端域名）
app.use(cors());
// 解析 JSON 请求体
app.use(express.json());

// 数据库配置（从环境变量读取）
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'client_management',
  port: process.env.DB_PORT || 3306
});

// 连接数据库
db.connect((err) => {
  if (err) throw err;
  console.log('MySQL connected...');
});

// 获取分页客户列表
app.get('/clients', (req, res) => {
  const page = parseInt(req.query.page) || 1;     // 当前页码
  const pageSize = parseInt(req.query.pageSize) || 25; // 每页条数
  const offset = (page - 1) * pageSize;

  // 查询分页数据
  const sqlData = 'SELECT * FROM clients LIMIT ?, ?';
  const sqlCount = 'SELECT COUNT(*) AS total FROM clients';

    // 先获取总条数
    db.query(sqlCount, (err, countResult) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).send('Database error');
        return;
      }
  
      const total = countResult[0].total;
  
      // 再获取当前页数据
      db.query(sqlData, [offset, pageSize], (err, dataResult) => {
        if (err) {
          console.error('Database error:', err);
          res.status(500).send('Database error');
          return;
        }
  
        res.send({
          data: dataResult,
          total: total,
          page: page,
          pageSize: pageSize
        });
      });
    });
  });

// 添加新客户
app.post('/clients', (req, res) => {
  const client = req.body;
  const sql = 'INSERT INTO clients SET ?';
  db.query(sql, client, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).send('Database error');
      return;
    }
    res.send({ message: 'Client added', id: result.insertId });
  });
});

// 启动服务器
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// 修改客户信息
app.put('/clients/:id', (req, res) => {
  const { id } = req.params;
  const { client_name, backend_url } = req.body;
  const sql = 'UPDATE clients SET client_name = ?, backend_url = ? WHERE id = ?';
  
  db.query(sql, [client_name, backend_url, id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).send('Database error');
      return;
    }
    res.send({ message: 'Client updated' });
  });
});