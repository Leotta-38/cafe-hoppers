const express = require('express')
const router = express.Router()
const db = require('../db')


router.get('/user', (req, res) => {
  res.render('user')
})

module.exports = router