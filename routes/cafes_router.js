const express = require('express')
const router = express.Router()
const db = require('../db')
const ensureLoggedIn = require('../middlewares/ensure_logged_in')

router.get('/cafes', (req, res) => {
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
      res.render('cafes', {
        cafes: cafes,
        photos: photos
      })
    })
  })
})

router.post('/cafes', ensureLoggedIn, (req, res) => {
  let name = req.body.name
  let gmapUrl = req.body.gmapUrl
  let phone = req.body.phone
  let website = req.body.website
  let date = new Date().toLocaleDateString()
  let userId = req.session.userId

  const sql = `
    INSERT INTO cafes (name, gmap_url, phone, website, date, user_id) 
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id;
  `
  db.query(sql, [name, gmapUrl, phone, website, date, userId], (err, result) => {
    if (err) {
      console.log(err);
    }

    let id = result.rows[0].id
    res.redirect(`/cafes/${id}`)
  })
})

router.get('/cafes/new', (req, res) => {
  res.render('cafe_new_form')
})

router.get('/cafes/:id', (req, res) => {

  const cafeId = req.params.id

  const sql = `
    SELECT * FROM cafes 
    WHERE id = $1;
  `
  db.query(sql, [cafeId], (err, result) => {
    if (err) {
      console.log(err);
    }

    let cafe = result.rows[0]

    const sql2 = `
      SELECT * FROM users 
      WHERE id = $1;
    `
    db.query(sql2, [cafe.user_id], (err, result2) => {
      if (err) {
        console.log(err);
      }

      let user = result2.rows[0]

      const sql3 = `
        SELECT * FROM comments 
        WHERE cafe_id = $1;
      `
      db.query(sql3, [cafeId], (err, result3) => {
        if (err) {
          console.log(err);
        }

        let comments = result3.rows

        const sql4 = `
          SELECT * FROM photos 
          WHERE cafe_id = $1;
        `
        db.query(sql4, [cafeId], (err, result4) => {
          if (err) {
            console.log(err);
          }

          let photos = result4.rows
          res.render('info', {
            cafe: cafe,
            user: user,
            comments: comments,
            photos: photos
          })
        })
      })
    })
  })
})

router.put('/cafes/:id', ensureLoggedIn, (req, res) => {
  let name = req.body.name
  let gmapUrl = req.body.gmapUrl
  let phone = req.body.phone
  let website = req.body.website
  let id = req.params.id

  const sql = `
    UPDATE cafes SET 
      name = $1, 
      gmap_url = $2, 
      phone = $3, 
      website = $4
    WHERE id = $5;
  `
  db.query(sql, [name, gmapUrl, phone, website, id], (err, result) => {
    if (err) {
      console.log(err);
    }

    res.redirect(`/cafes/${id}`)
  })
})

router.delete('/cafes/:id', ensureLoggedIn, (req, res) => {
  const sql = `
    DELETE FROM cafes
    WHERE id = $1;
  `
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.log(err);
    }

    res.redirect('/cafes')
  })
})

router.get('/cafes/:id/edit', ensureLoggedIn, (req, res) => {
  
  const sql = `
    SELECT * FROM cafes
    WHERE id = $1
  `
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.log(err);
    }

    let cafe = result.rows[0]
    res.render('cafe_edit_form', {
      cafe: cafe
    })
  })
})

router.post('/cafes/:id/comment', ensureLoggedIn, (req, res) => {
  let comment = req.body.comment
  let imageUrl = req.body.imageUrl
  let cafeId = req.params.id
  let userId = req.session.userId
  let date = new Date().toLocaleDateString()
  let reviewPoint = req.body.reviewPoint
  let likes = 0

  const sql = `
    INSERT INTO comments (comment, cafe_id, user_id, date, review_point, likes) 
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id;
  `
  db.query(sql, [comment, cafeId, userId, date, reviewPoint, likes], (err, result) => {
    if (err) {
      console.log(err);
    }

    let commentId = result.rows[0].id

    const sql2 = `
      INSERT INTO photos (image_url, cafe_id, user_id, comment_id, date, likes) 
      VALUES ($1, $2, $3, $4, $5, $6);
    `
    db.query(sql2, [imageUrl, cafeId, userId, commentId, date, likes], (err2, result2) => {
      if (err2) {
        console.log(err2)
      }
    })

    const sql3 = `
      SELECT review_point FROM comments 
      WHERE cafe_id = $1
    `
    db.query(sql3, [cafeId], (err3, result3) => {
      if (err3) {
        console.log(err3);
      }

      let reviewPoints = result3.rows
      let sumReviewPoints = 0
      for (let reviewPoint of reviewPoints) {
        sumReviewPoints += Number(reviewPoint.review_point)
      }
      let averageReviewPoints = sumReviewPoints / result3.rows.length

      const sql4 = `
        UPDATE cafes SET 
          ave_review_point = $1
        WHERE id = $2;
      `
      db.query(sql4, [averageReviewPoints, cafeId], (err4, result4) => {
        if (err4) {
          console.log(err4);
        }

        res.redirect(`/cafes/${cafeId}`)
      })
    })
  })

})

router.get('/cafes/*/comment/:id', ensureLoggedIn, (req, res) => {

  const sql = `
    SELECT * FROM comments
    WHERE id = $1
  `
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.log(err);
    }

    let comment = result.rows[0]

    const sql2 = `
      SELECT * FROM photos 
      WHERE comment_id = $1
    `
    db.query(sql2, [req.params.id], (err2, result2) => {
      if (err2) {
        console.log(err2);
      }

      let photo = result2.rows[0]
      res.render('comment_edit_form', {
        comment: comment,
        photo: photo
      })
    })
  })
})

router.put('/cafes/:cafeId/comment/:id', ensureLoggedIn, (req, res) => {
  let comment = req.body.comment
  let imageUrl = req.body.imageUrl
  let reviewPoint = req.body.reviewPoint
  let id = req.params.id

  const sql = `
    UPDATE comments SET 
      comment = $1, 
      review_point = $2 
    WHERE id = $3;
  `
  db.query(sql, [comment, reviewPoint, id], (err, result) => {
    if (err) {
      console.log(err);
    }

    const sql2 = `
      UPDATE photos SET 
        image_url = $1
      WHERE comment_id = $2;
    `
    db.query(sql2, [imageUrl, id], (err2, result2) => {
      if (err2) {
        console.log(err2);
      }

      res.redirect(`/cafes/${req.params.cafeId}`)
    })
  })
})

router.delete('/cafes/:cafeId/comment/:id', ensureLoggedIn, (req, res) => {
  const sql = `
    DELETE FROM comments
    WHERE id = $1;
  `
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.log(err);
    }

    const sql2 = `
      DELETE FROM photos
      WHERE comment_id = $1;
    `
    db.query(sql2, [req.params.id], (err2, result2) => {
      if (err2) {
        console.log(err2);
      }

      res.redirect(`/cafes/${req.params.cafeId}`)
    })
  })
})


module.exports = router