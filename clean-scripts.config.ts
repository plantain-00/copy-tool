import { executeScriptAsync, Program } from 'clean-scripts'
import { watch } from 'watch-then-execute'

const tsFiles = `"*.ts" "static/**/*.ts"`

const isDev = process.env.NODE_ENV === 'development'

const tscCommand = `tsc`
const file2variableCommand = `file2variable-cli --config static/file2variable.config.ts`
const webpackCommand = `webpack --config static/webpack.config.ts`
const revStaticCommand = `rev-static --config static/rev-static.config.ts`
const cssCommand = [
  `postcss static/index.css -o static/index.postcss.css`,
  `cleancss static/index.postcss.css -o static/index.bundle.css`
]
const swCommand = isDev ? undefined : [
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
    ts: `eslint --ext .js,.ts,.tsx ${tsFiles}`,
    export: `no-unused-export ${tsFiles}`,
    markdown: `markdownlint README.md`,
    typeCoverage: 'type-coverage -p . --strict --ignore-catch',
    typeCoverageStatic: 'type-coverage -p static --strict --ignore-catch --ignore-files "static/variables.ts"'
  },
  test: {
    start: new Program('clean-release --config clean-run.config.ts', 30000)
  },
  fix: `eslint --ext .js,.ts,.tsx ${tsFiles} --fix`,
  watch: {
    back: `${tscCommand} --watch`,
    template: `${file2variableCommand} --watch`,
    webpack: `${webpackCommand} --watch`,
    css: () => watch(['static/index.css'], [], () => executeScriptAsync(cssCommand)),
    rev: `${revStaticCommand} --watch`,
    sw: () => watch(['static/vendor.bundle-*.js', 'static/vendor.bundle-*.css', 'static/index.html', 'static/worker.bundle.js'], [], () => executeScriptAsync(swCommand))
  }
}
