import * as puppeteer from 'puppeteer'

(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.emulate({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36' })
  await page.goto(`http://localhost:8000/#test`)
  await page.waitFor(2000)
  await page.screenshot({ path: `screenshots/initial.png` })

  const page2 = await browser.newPage()
  await page2.emulate({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36' })
  await page2.goto(`http://localhost:8000/#test`)
  await page2.waitFor(2000)
  await page2.screenshot({ path: `screenshots/second-client.png` })
  await page.screenshot({ path: `screenshots/first-client.png` })

  await (page.type as any)('textarea', 'hello world!')
  await page.click('.btn-primary')
  await page.waitFor(500)
  await page.screenshot({ path: `screenshots/client-1-send-text.png` })
  await page2.screenshot({ path: `screenshots/client-2-send-text.png` })

  await (await page.$('input[type=file]'))!.uploadFile(`./foo.txt`)
  await page.waitFor(500)
  await page.screenshot({ path: `screenshots/client-1-send-file.png` })
  await page2.screenshot({ path: `screenshots/client-2-send-file.png` })

  await page.click('.btn-default')
  await page.waitFor(3000)
  await page.click('.btn-default')
  await page.waitFor(500)
  await page.screenshot({ path: `screenshots/client-1-try-to-connect.png` })
  await page2.screenshot({ path: `screenshots/client-2-try-to-connect.png` })

  await (page.type as any)('textarea', 'hello world!')
  await page.click('.btn-primary')
  await page.waitFor(500)
  await page.screenshot({ path: `screenshots/client-1-send-text-by-webrtc.png` })
  await page2.screenshot({ path: `screenshots/client-2-send-text-by-webrtc.png` })

  browser.close()
})()
