const puppeteer = require('puppeteer')
const fs = require('fs')
const URL = require('url').URL;

(async () => {
  console.log('Starting script')
  const browser = await puppeteer.launch({
    headless: false
  })
  const page = await browser.newPage()

  const responses = []
  page.on('response', resp => {
    responses.push(resp)
  })

  page.on('load', () => {
    responses.map(async (resp, i) => {
      // Only download from url that contains the extention '.jpg'
      if (resp.url.indexOf('.jpg') !== -1) {
        console.log('URL: ', resp.url)
        const request = await resp.request()
        const url = new URL(request.url)

        const split = url.pathname.split('/')
        let filename = split[split.length - 1]

        // if the filename doesnot contain a '.' then it has no extension, add one
        if (!filename.includes('.')) {
          filename += '.jpg'
        }

        const buffer = await resp.buffer()
        // Specify the path here, you need to create the folder. Right now the file is downloaded to current folder
        filename = './' + filename
        fs.writeFileSync(filename, buffer)

        console.log('File written to:', filename)
      }
    })
  })

  const redirectingURL = 'https://goo.gl/FvWi1r'

  await page.goto(redirectingURL, { waitUntil: 'networkidle' })

  // Take a screenshot just before the browser closes
  await page.screenshot({
    path: 'screenshots.png'
  })

  console.log('Closing browser now...')
  browser.close()
})()
