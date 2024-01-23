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

    const sql2 = `
      SELECT * FROM photos
    `
    db.query(sql2, (err2, result2) => {
      if (err2) {
        console.log(err2);
      }

      let photos = result2.rows
      res.render('home', {
        cafes: cafes,
        photos: photos
      })
    })
  })
})

module.exports = router