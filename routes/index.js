var express = require('express');
var router = express.Router();
var generatePdf = require('../service/pdfGenerator');
var createZip = require('../service/zip');
const path = require('path');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/create', async function (req, res, next) {
  // 处理 POST 请求
  const email = req.body.email;
  const password = req.body.password;

  const pdf = await generatePdf(email,password);

  if (pdf) {
    await createZip();
    res.send('yes');
  }
});

router.get('/download', function (req, res, next) {
  const file = path.resolve(__dirname, '../public/pdfs/download.zip'); // 设置文件路径
  res.setHeader('Cache-Control', 'no-store');
  res.download(file, function (err) {
    if (err) {
      // 错误处理
      console.log(err);
      res.status(500).send('Error occurred while downloading file');
    }
  }); // 发送文件
});

module.exports = router;
