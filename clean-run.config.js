module.exports = {
  include: [
    'index.js',
    'package.json',
    'yarn.lock'
  ],
  exclude: [
  ],
  postScript: [
    'cd "[dir]" && yarn --production && node index.js'
  ]
}
