const glob = require('glob')
const mongoose = require('mongoose')
const db = 'mongodb://localhost/douban-data'
const { resolve } = require('path')

mongoose.Promise = global.Promise

let maxConnectTimes = 0

const connect = () => {
  return new Promise(resolve => {
    process.env.NODE_ENV !== 'production' && mongoose.set('debug', true)
    mongoose.connect(db)
  
    mongoose.connection.once('open', () => {
      resolve()
      console.log('MongoDB Connected Successfully!')
    })
  
    mongoose.connection.on('disconnected', () => {
      maxConnectTimes++
      if (maxConnectTimes < 5) {
        mongoose.connect(db)
      } else {
        throw new Errow('Database Disconnected!')
      }
    })
  
    mongoose.connection.on('error', () => {
      maxConnectTimes++
      if (maxConnectTimes < 5) {
        mongoose.connect(db)
      } else {
        throw new Errow('Database Error Occurred!')
      }
    })
  })
}

const starter = async () => {
  await connect()
  glob.sync(resolve(__dirname, './schemas/', '**/*.js')).forEach(require)
}

exports.init = starter
