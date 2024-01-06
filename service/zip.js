const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

async function createZip() {
  return new Promise((resolve, reject) => {
    let output = fs.createWriteStream('public/pdfs/dowload.zip');

    let archive = archiver('zip', {
      zlib: { level: 9 },
    });

    output.on('close', () => {
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    fs.readdirSync('public/pdfs/').forEach((file) => {
      if (path.extname(file) === '.pdf') {
        archive.file(path.join('public/pdfs/', file), { name: file });
      }
    });

    archive.finalize();
  });
}

module.exports = createZip;
