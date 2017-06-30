module.exports = {
  inputFiles: [
    'static/*.bundle.css',
    'static/index.bundle.js',
    'static/vendor.bundle.js',
    'static/*.ejs.html'
  ],
  outputFiles: file => file.replace('.ejs', ''),
  json: 'static/version.json',
  ejsOptions: {
    rmWhitespace: true
  },
  sha: 256,
  customNewFileName: (filePath, fileString, md5String, baseName, extensionName) => baseName + '-' + md5String + extensionName,
  noOutputFiles: [
    'static/worker.bundle.js'
  ]
}
