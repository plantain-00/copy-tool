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
      ],
      async () => {
        const puppeteer = require('puppeteer')
        const fs = require('fs')
        const beautify = require('js-beautify').html
        const server = childProcess.spawn('node', ['index.js'])
        server.stdout.pipe(process.stdout)
        server.stderr.pipe(process.stderr)
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.emulate({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36' })
        await page.waitFor(1000)
        await page.goto(`http://localhost:8000/#test`)
        await page.waitFor(1000)
        await page.screenshot({ path: `static/screenshot.png`, fullPage: true })
        const content = await page.content()
        fs.writeFileSync(`static/screenshot-src.html`, beautify(content))
        server.kill('SIGINT')
        browser.close()
      }
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
      process.env.APPVEYOR ? 'echo "skip karma test"' : 'karma start static_spec/karma.config.js'
    ],
    consistency: [
      'git checkout static/screenshot.png',
      () => new Promise((resolve, reject) => {
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
    ]
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
      const puppeteer = require('puppeteer')
      const fs = require('fs')
      const server = childProcess.spawn('node', ['index.js'])
      server.stdout.pipe(process.stdout)
      server.stderr.pipe(process.stderr)
      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      await page.emulate({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36' })
      await page.waitFor(1000)
      await page.goto('http://localhost:8000/#test')
      await page.waitFor(1000)
      const content = await page.evaluate(() => {
        const element = document.querySelector('#prerender-container')
        return element ? element.innerHTML : ''
      })
      fs.writeFileSync('static/prerender.html', content)
      server.kill('SIGINT')
      browser.close()
    },
    `clean-scripts build.front[1]`,
    `clean-scripts build.front[2]`
  ]
}
