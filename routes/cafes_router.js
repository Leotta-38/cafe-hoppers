const express = require('express')
const router = express.Router()
const db = require('../db')
const ensureLoggedIn = require('../middlewares/ensure_logged_in')

router.post('/cafes', ensureLoggedIn, (req, res) => {
  let name = req.body.name
  let gmapUrl = req.body.gmapUrl
  let phone = req.body.phone
  let website = req.body.webiste
  let date = new Date().toLocaleDateString()
  let userId = req.session.userId

  const sql = `
    INSERT INTO cafes (name, gmap_url, phone, website, date, user_id) 
    VALUES ($1, $2, $3, $4, $5, $6)
  `
  db.query(sql, [name, gmapUrl, phone, website, date, userId], (err, result) => {
    if (err) {
      console.log(err);
    }

    res.redirect('/')
  })
})

router.get('/cafes/new', (req, res) => {
  res.render('cafe_new_form')
})

module.exports = router