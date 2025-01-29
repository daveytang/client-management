const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();

// 数据库连接配置
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// 连接数据库
db.connect((err) => {
    if (err) throw err;
    console.log('MySQL connected...');
});

app.use(bodyParser.json());

// 获取所有客户链接
app.get('/clients', (req, res) => {
    let sql = 'SELECT * FROM clients';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

// 添加新客户链接
app.post('/clients', (req, res) => {
    let client = req.body;
    let sql = 'INSERT INTO clients SET ?';
    db.query(sql, client, (err, result) => {
        if (err) throw err;
        res.send('Client added...');
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

app.use(express.static('frontend'));