const express = require('express')
const router = express.Router()
const db = require('../db')
const ensureLoggedIn = require('../middlewares/ensure_logged_in')

router.get('/user', ensureLoggedIn, (req, res) => {
  res.render('user')
})

router.put('/user', ensureLoggedIn, (req, res) => {
  let username = req.body.username
  let email = req.body.email
  let iconUrl = req.body.iconUrl
  if (!iconUrl) {
    iconUrl = '/img/user_icon.png'
  }
  let id = req.session.userId

  const sql = `
    UPDATE users SET 
      username = $1, 
      email = $2, 
      icon_url = $3 
    WHERE id = $4;
  `
  db.query(sql, [username, email, iconUrl, id], (err, result) => {
    if (err) {
      console.log(err);
    }

    res.redirect('/user')
  })
})

router.delete('/user', ensureLoggedIn, (req, res) => {
  const sql = `
    DELETE FROM users
    WHERE id = $1;
  `
  db.query(sql, [req.session.userId], (err, result) => {
    if (err) {
      console.log(err);
    }
    
    req.session.userId = null
    res.redirect('/')
  })
})

router.get('/user/edit', ensureLoggedIn, (req, res) => {
  res.render('user_edit_form')
})


module.exports = router