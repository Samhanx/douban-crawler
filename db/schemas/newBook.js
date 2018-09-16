const mongoose = require('mongoose')
const Schema = mongoose.Schema

const newBookSchema = new Schema({
  doubanId: {
    unique: true,
    type: String,
  },
  link: String,
  name: String,
  rating: Number,
  attrs: String,
  detail: String,
  type: String,
  meta: {
    createdAt: {
      type: Date,
      default: Date.now() + 28800000, // +8 hours
    },
    updatedAt: {
      type: Date,
      default: Date.now() + 28800000,
    },
  }
})

newBookSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now() + 28800000
  } else {
    this.meta.updatedAt = Date.now() + 28800000
  }
  next()
})

mongoose.model('NewBook', newBookSchema)
