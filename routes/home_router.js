const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/', (req, res) => {
  console.log(req.session.userId);
  const sql = `
    SELECT * FROM cafes
    ORDER BY ave_review_point DESC;
  `
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    }

    let cafes1 = result.rows

    const sql2 = `
      SELECT * FROM cafes 
      ORDER BY date DESC;
    `
    db.query(sql2, (err2, result2) => {
      if (err2) {
        console.log(err2);
      }

      let cafes2 = result2.rows
      const sql3 = `
        SELECT * FROM photos;
      `
      db.query(sql3, (err3, result3) => {
        if (err3) {
          console.log(err3);
        }
  
        let photos = result3.rows
        res.render('home', {
          cafes1: cafes1,
          cafes2: cafes2,
          photos: photos
        })
      })
    })
  })
})

module.exports = router