const express = require('express')
const router = express.Router()
const db = require('../db')
const bcrypt = require('bcrypt')

const saltRound = 10

router.get('/login', (req, res) => {
  res.render('login', {
    error: ''
  })
})

router.post('/login', (req, res) => {
  let email = req.body.email
  let password = req.body.password

  const sql = `
    SELECT * FROM users 
    WHERE email = $1;
  `
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.log(err);
      res.redirect('/login')
      return
    }

    if (result.rows.length === 0) {
      console.log('user not found');
      res.render('login', {
        error: 'Your email is not found.'
      })
      return
    }

    const hashedPassword = result.rows[0].hashed_password

    bcrypt.compare(password, hashedPassword, (err, isCorrect) => {
      if (!isCorrect) {
        console.log('password not correct');
        res.render('login', {
          error: 'Your password is not correct.'
        })
        return
      }

      req.session.userId = result.rows[0].id
      res.redirect('/')
    })
  })
})

router.get('/signup', (req, res) => {
  res.render('signup', {
    error: ''
  })
})

router.post('/signup', (req, res) => {
  let username = req.body.username
  let email = req.body.email
  let password = req.body.password
  let rePassword = req.body.rePassword

  if (password !== rePassword) {
    res.render('signup', {
      error: 'Your passwards are not the same.'
    })
    return
  } else if (password.length < 7) {
    res.render('signup', { 
      error: 'Password must be at least 7 characters long.'
    })
    return
  }

  const sql = `
    SELECT id FROM users 
    WHERE email = $1;
  `
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.log(err)
      res.redirect('/signup')
      return
    }

    if (result.rows.length !== 0) {
      res.render('signup', { 
        error: 'Your email is already registered.'
      })
      return  
    }

    bcrypt.genSalt(saltRound, (err, salt) => {
      bcrypt.hash(password, salt, (err, hashedPassword) => {
        const iconUrl = '/img/user_icon.png'
        const sql2 = `
          INSERT INTO users (username, email, hashed_password, icon_url)
          VALUES ($1, $2, $3, $4);
        `
        db.query(sql2, [username, email, hashedPassword, iconUrl], (err, result2) => {
          if (err) {
            console.log(err)
            res.redirect('/signup')
            return
          }
          const sql3 = `
            SELECT id FROM users 
            WHERE email = $1;
          `
          db.query(sql3, [email], (err, result3) => {
            if (err) {
              console.log(err);
              res.redirect('/signup')
              return
            }
            req.session.userId = result3.rows[0].id
            res.redirect('/')
          })
        })
      })
    })
  })
})

router.delete('/logout', (req, res) => {
  req.session.userId = null
  res.redirect('/')
})

module.exports = router