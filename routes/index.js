var express = require('express');
var router = express.Router();
var generatePdf = require('../service/pdfGenerator');
var createZip = require('../service/zip');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/create', async function (req, res, next) {
  // 处理 POST 请求
  const pdf = await generatePdf();

  if (pdf) {
    await createZip();
    res.send('yes');
  }
});

router.get('/download', function (req, res, next) {
  // 处理 POST 请求
  res.send('yes');
});

module.exports = router;
