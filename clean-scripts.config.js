module.exports = {
  build: [
    `rimraf static/*.bundle-*.js static/*.bundle-*.css`,
    `file2variable-cli static/app.template.html -o static/variables.ts --html-minify --base static`,
    `tsc`,
    `cleancss ./node_modules/bootstrap/dist/css/bootstrap.min.css ./node_modules/github-fork-ribbon-css/gh-fork-ribbon.css ./node_modules/file-uploader-component/dist/file-uploader.min.css -o static/vendor.bundle.css`,
    `cleancss static/index.css -o static/index.bundle.css`,
    `tsc -p static`,
    `webpack --config static/webpack.config.js`,
    `rev-static --config static/rev-static.config.js`,
    `sw-precache --config static/sw-precache.config.js`,
    `uglifyjs static/service-worker.js -o static/service-worker.bundle.js`
  ],
  lint: [
    `tslint index.ts "static/*.ts"`,
    `standard "**/*.config.js"`
  ],
  test: [
    'tsc -p spec',
    'jasmine',
    'tsc -p static_spec',
    'karma start static_spec/karma.config.js'
  ],
  fix: [
    `standard --fix "**/*.config.js"`
  ],
  release: [
    `clean-release`
  ]
}
