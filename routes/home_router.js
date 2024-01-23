const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/', (req, res) => {
  console.log(req.session.userId);
  const sql = `
    SELECT * FROM cafes
  `
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    }

    let cafes = result.rows
    res.render('home', {
      cafes: cafes
    })
  })
})

module.exports = router