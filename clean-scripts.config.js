const { Service, checkGitStatus, executeScriptAsync } = require('clean-scripts')
const { watch } = require('watch-then-execute')

const tsFiles = `"*.ts" "static/**/*.ts" "spec/**/*.ts" "static_spec/**/*.ts"`
const jsFiles = `"*.config.js" "static/**/*.config.js" "static_spec/**/*.config.js"`

const tscCommand = `tsc`
const file2variableCommand = `file2variable-cli --config static/file2variable.config.js`
const tscStaticCommand = `tsc -p static`
const webpackCommand = `webpack --config static/webpack.config.js`
const revStaticCommand = `rev-static --config static/rev-static.config.js`
const cssCommand = [
  `postcss static/index.css -o static/index.postcss.css`,
  `cleancss static/index.postcss.css -o static/index.bundle.css`
]
const swCommand = [
  `sw-precache --config static/sw-precache.config.js`,
  `uglifyjs static/service-worker.js -o static/service-worker.bundle.js`
]

module.exports = {
  build: {
    back: tscCommand,
    front: [
      {
        js: [
          file2variableCommand,
          tscStaticCommand,
          webpackCommand
        ],
        css: [
          `cleancss ./node_modules/bootstrap/dist/css/bootstrap.min.css ./node_modules/github-fork-ribbon-css/gh-fork-ribbon.css ./node_modules/file-uploader-component/dist/file-uploader.min.css -o static/vendor.bundle.css`,
          cssCommand
        ],
        clean: `rimraf static/*.bundle-*.js static/*.bundle-*.css`
      },
      revStaticCommand,
      swCommand
    ]
  },
  lint: {
    ts: `tslint ${tsFiles}`,
    js: `standard ${jsFiles}`,
    export: `no-unused-export ${tsFiles}`,
    commit: `commitlint --from=HEAD~1`
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
    consistency: () => checkGitStatus()
  },
  fix: {
    ts: `tslint --fix ${tsFiles}`,
    js: `standard --fix ${jsFiles}`
  },
  watch: {
    back: `${tscCommand} --watch`,
    template: `${file2variableCommand} --watch`,
    front: `${tscStaticCommand} --watch`,
    webpack: `${webpackCommand} --watch`,
    css: () => watch(['static/index.css'], [], () => executeScriptAsync(cssCommand)),
    rev: `${revStaticCommand} --watch`,
    sw: () => watch(['static/vendor.bundle-*.js', 'static/vendor.bundle-*.css', 'static/index.html', 'static/worker.bundle.js'], [], () => executeScriptAsync(swCommand))
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
    revStaticCommand,
    swCommand
  ]
}
