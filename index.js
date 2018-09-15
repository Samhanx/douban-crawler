const puppeteer = require('puppeteer')
const url = `https://book.douban.com/latest?icn=index-latestbook-all`

const sleep = time => new Promise(resolve => {
  setTimeout(resolve, time)
})
const starter = async () => {
  console.log(`Start to visit the page:\n${url}`)

  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
  })
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'networkidle2' })
  await sleep(3000)

  const result = await page.evaluate(() => {
    var $ = window.$
    var $fictionItems = $('.article .cover-col-4 li')
    var $nonFictionItems = $('.aside .cover-col-4 li')

    var fictions = []
    var nonFictions = []

    if ($fictionItems.length >= 1) {
      $fictionItems.each((i, item) => {
        var $book = $(item)
        var bookUrl = $book.find('.cover').attr('href')
        var bookName = $book.find('h2 a').text()
        var bookRating = $book.find('.rating .color-lightgray').text().trim()
        var bookAttrs = $book.find('.color-gray').text().trim()
        var bookIntro = $book.find('.detail').text().trim()

        fictions.push({
          name: bookName,
          doubanLink: bookUrl,
          rating: bookRating || 0,
          attrs: bookAttrs,
          detail: bookIntro,
        })
      })
    }

    if ($nonFictionItems.length >= 1) {
      $nonFictionItems.each((i, item) => {
        var $book = $(item)
        var bookUrl = $book.find('.cover').attr('href')
        var bookName = $book.find('h2 a').text()
        var bookRating = $book.find('.rating .color-lightgray').text().trim()
        var bookAttrs = $book.find('.color-gray').text().trim()
        var bookIntro = $book.find('.detail-frame p:last').text().trim()

        nonFictions.push({
          name: bookName,
          doubanLink: bookUrl,
          rating: bookRating || 0,
          attrs: bookAttrs,
          detail: bookIntro,
        })
      })
    }

    return {
      fictions,
      nonFictions
    }
  })

  browser.close()
  // process.send({ result })
  console.log(result)
  process.exit(0)
}

starter()
