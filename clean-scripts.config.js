const childProcess = require('child_process')

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
      [
        `sw-precache --config static/sw-precache.config.js`,
        `uglifyjs static/service-worker.js -o static/service-worker.bundle.js`
      ]
    ]
  },
  lint: {
    ts: `tslint index.ts "static/*.ts"`,
    js: `standard "**/*.config.js"`,
    export: `no-unused-export index.ts "static/*.ts"`
  },
  test: {
    jasmine: [
      'tsc -p spec',
      'jasmine'
    ],
    karma: [
      'tsc -p static_spec',
      'karma start static_spec/karma.config.js'
    ],
    consistency: () => new Promise((resolve, reject) => {
      childProcess.exec('git status -s', (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          if (stdout) {
            reject(new Error(`generated files doesn't match.`))
          } else {
            resolve()
          }
        }
      }).stdout.pipe(process.stdout)
    })
  },
  fix: {
    ts: `tslint --fix index.ts "static/*.ts"`,
    js: `standard --fix "**/*.config.js"`
  },
  release: `clean-release`,
  watch: {
    back: `tsc --watch`,
    template: `file2variable-cli static/app.template.html -o static/variables.ts --html-minify --base static --watch`,
    front: `tsc -p static --watch`,
    webpack: `webpack --config static/webpack.config.js --watch`,
    css: `watch-then-execute "static/index.css" --script "clean-scripts build.front[0].css[1]"`,
    rev: `rev-static --config static/rev-static.config.js --watch`,
    sw: `watch-then-execute "static/vendor.bundle-*.js" "static/vendor.bundle-*.css" "static/index.html" "static/worker.bundle.js" --script "clean-scripts build.front[2]"`
  },
  prerender: [
    async () => {
      const { createServer } = require('http-server')
      const { prerender } = require('prerender-js')
      const server = createServer()
      server.listen(8000)
      await prerender('http://localhost:8000/static', '#prerender-container', 'static/prerender.html')
      server.close()
    },
    `clean-scripts build.front[1]`,
    `clean-scripts build.front[2]`
  ]
}
