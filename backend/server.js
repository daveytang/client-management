require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const Joi = require('joi');

const app = express();

// 数据库配置
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4'
});

// 数据库连接
db.connect(err => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
    process.exit(1);
  }
  console.log('✅ 成功连接MySQL数据库');
});

// 中间件
app.use(cors());
app.use(express.json());

// 数据校验规则
const clientSchema = Joi.object({
  client_code: Joi.string().pattern(/^JW\d{3}$/).required(),
  client_name: Joi.string().min(2).max(50).required(),
  backend_url: Joi.string().uri().required()
});

// 分页获取客户列表
app.get('/clients', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 25;
  const offset = (page - 1) * pageSize;

  const countQuery = 'SELECT COUNT(*) AS total FROM clients';
  const dataQuery = 'SELECT * FROM clients LIMIT ?, ?';

  db.query(countQuery, (err, countRes) => {
    if (err) return handleError(res, err);
    
    db.query(dataQuery, [offset, pageSize], (err, dataRes) => {
      if (err) return handleError(res, err);
      
      res.json({
        data: dataRes,
        total: countRes[0].total,
        page,
        pageSize
      });
    });
  });
});

// 添加客户
app.post('/clients', (req, res) => {
  const { error } = clientSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const query = 'INSERT INTO clients SET ?';
  db.query(query, req.body, (err, result) => {
    if (err) return handleError(res, err);
    res.status(201).json({ id: result.insertId, ...req.body });
  });
});

// 修改客户信息
app.put('/clients/:id', (req, res) => {
  const { error } = clientSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const query = 'UPDATE clients SET ? WHERE id = ?';
  db.query(query, [req.body, req.params.id], (err) => {
    if (err) return handleError(res, err);
    res.json({ message: '更新成功' });
  });
});

// 错误处理
function handleError(res, err) {
  console.error('⚠️ 数据库错误:', err);
  return res.status(500).json({ error: '服务器内部错误' });
}

// 启动服务
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 服务已启动 http://localhost:${PORT}`);
});