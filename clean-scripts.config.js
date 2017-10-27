const { Service, execAsync } = require('clean-scripts')

const tsFiles = `"*.ts" "static/**/*.ts" "spec/**/*.ts" "static_spec/**/*.ts"`
const jsFiles = `"*.config.js" "static/**/*.config.js" "static_spec/**/*.config.js"`

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
          `postcss static/index.css -o static/index.postcss.css`,
          `cleancss static/index.postcss.css -o static/index.bundle.css`
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
    ts: `tslint ${tsFiles}`,
    js: `standard ${jsFiles}`,
    export: `no-unused-export ${tsFiles}`
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
    consistency: async () => {
      const { stdout } = await execAsync('git status -s')
      if (stdout) {
        console.log(stdout)
        throw new Error(`generated files doesn't match.`)
      }
    }
  },
  fix: {
    ts: `tslint --fix ${tsFiles}`,
    js: `standard --fix ${jsFiles}`
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
  screenshot: [
    new Service(`node index.js`),
    `tsc -p screenshots`,
    `node screenshots/index.js`
  ],
  prerender: [
    new Service(`node index.js`),
    `tsc -p prerender`,
    `node prerender/index.js`,
    `clean-scripts build.front[1]`,
    `clean-scripts build.front[2]`
  ]
}
