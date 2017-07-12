module.exports = {
  inputFiles: [
    'static/*.bundle.css',
    'static/*.bundle.js',
    'static/*.ejs.html'
  ],
  excludeFiles: [
    'static/worker.bundle.js',
    'static/service-worker.bundle.js'
  ],
  revisedFiles: [
  ],
  inlinedFiles: [
    'static/index.bundle.js',
    'static/index.bundle.css'
  ],
  outputFiles: file => file.replace('.ejs', ''),
  json: false,
  ejsOptions: {
    rmWhitespace: true
  },
  sha: 256,
  customNewFileName: (filePath, fileString, md5String, baseName, extensionName) => baseName + '-' + md5String + extensionName,
  base: 'static',
  fileSize: 'static/file-size.json'
}
