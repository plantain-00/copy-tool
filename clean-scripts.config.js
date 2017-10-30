const { Service, execAsync } = require('clean-scripts')

const tsFiles = `"*.ts" "static/**/*.ts" "spec/**/*.ts" "static_spec/**/*.ts"`
const jsFiles = `"*.config.js" "static/**/*.config.js" "static_spec/**/*.config.js"`

const tscCommand = `tsc`
const file2variableCommand = `file2variable-cli static/app.template.html -o static/variables.ts --html-minify --base static`
const tscStaticCommand = `tsc -p static`
const webpackCommand = `webpack --display-modules --config static/webpack.config.js`
const revStaticCommand = `rev-static --config static/rev-static.config.js`

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
          `cleancss ./node_modules/bootstrap/dist/css/bootstrap.min.css ./node_modules/github-fork-ribbon-css/gh-fork-ribbon.css ./node_modules/file-uploader-component/file-uploader.min.css -o static/vendor.bundle.css`,
          [
            `postcss static/index.css -o static/index.postcss.css`,
            `cleancss static/index.postcss.css -o static/index.bundle.css`
          ]
        ],
        clean: `rimraf static/*.bundle-*.js static/*.bundle-*.css`
      },
      revStaticCommand,
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
    back: `${tscCommand} --watch`,
    template: `${file2variableCommand} --watch`,
    front: `${tscStaticCommand} --watch`,
    webpack: `${webpackCommand} --watch`,
    css: `watch-then-execute "static/index.css" --script "clean-scripts build.front[0].css[1]"`,
    rev: `${revStaticCommand} --watch`,
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
