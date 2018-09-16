const db = require('./db')
const puppeteer = require('puppeteer')
const url = `https://book.douban.com/latest?icn=index-latestbook-all`

const sleep = time => new Promise(resolve => {
  setTimeout(resolve, time)
})

const starter = async () => {
  console.log(`Start to init Database...`)
  await db.init()

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

    var books = []

    if ($fictionItems.length >= 1) {
      $fictionItems.each((i, item) => {
        var $book = $(item)
        var bookUrl = $book.find('.cover').attr('href') // https://book.douban.com/subject/27138720/
        var bookName = $book.find('h2 a').text()
        var bookRating = Number($book.find('.rating .color-lightgray').text().trim())
        var bookAttrs = $book.find('.color-gray').text().trim()
        var bookIntro = $book.find('.detail').text().trim()
        var doubanId = bookUrl.split('/')[4]

        books.push({
          doubanId,
          name: bookName,
          link: bookUrl,
          rating: bookRating || 0,
          attrs: bookAttrs,
          detail: bookIntro,
          type: 'fiction',
        })
      })
    }

    if ($nonFictionItems.length >= 1) {
      $nonFictionItems.each((i, item) => {
        var $book = $(item)
        var bookUrl = $book.find('.cover').attr('href')
        var bookName = $book.find('h2 a').text()
        var bookRating = Number($book.find('.rating .color-lightgray').text().trim())
        var bookAttrs = $book.find('.color-gray').text().trim()
        var bookIntro = $book.find('.detail-frame p:last').text().trim()
        var doubanId = bookUrl.split('/')[4]

        books.push({
          doubanId,
          name: bookName,
          link: bookUrl,
          rating: bookRating || 0,
          attrs: bookAttrs,
          detail: bookIntro,
          type: 'nonfiction',
        })
      })
    }

    return books
  })

  browser.close()

  const NewBook = require('mongoose').model('NewBook')

  for (const item of result) {
    let book = await NewBook.findOne({
      doubanId: item.doubanId,
    })
    if (!book) {
      book = new NewBook(item)
      await book.save()
    }
  }

  process.exit(0)
}

starter()
