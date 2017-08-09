module.exports = {
  build: {
    back: `tsc`,
    front: [
      {
        js: [
          `file2variable-cli static/app.template.html -o static/variables.ts --html-minify --base static`,
          `tsc -p static`,
          `webpack --display-modules --config static/webpack.config.js`
        ],
        css: [
          `cleancss ./node_modules/bootstrap/dist/css/bootstrap.min.css ./node_modules/github-fork-ribbon-css/gh-fork-ribbon.css ./node_modules/file-uploader-component/file-uploader.min.css -o static/vendor.bundle.css`,
          `cleancss static/index.css -o static/index.bundle.css`
        ],
        clean: `rimraf static/*.bundle-*.js static/*.bundle-*.css`
      },
      `rev-static --config static/rev-static.config.js`,
      `sw-precache --config static/sw-precache.config.js`,
      `uglifyjs static/service-worker.js -o static/service-worker.bundle.js`
    ]
  },
  lint: {
    ts: `tslint index.ts "static/*.ts"`,
    js: `standard "**/*.config.js"`
  },
  test: {
    jasmine: [
      'tsc -p spec',
      'jasmine'
    ],
    karma: [
      'tsc -p static_spec',
      'karma start static_spec/karma.config.js'
    ]
  },
  fix: {
    ts: `tslint --fix index.ts "static/*.ts"`,
    js: `standard --fix "**/*.config.js"`
  },
  release: `clean-release`
}
