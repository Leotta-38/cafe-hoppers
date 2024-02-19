const express = require('express')
const router = express.Router()
const db = require('../db')
const ensureLoggedIn = require('../middlewares/ensure_logged_in')
const sortList = {
  item: ['rating_desc', 'rating_asc', 'name_desc', 'name_asc', 'date_desc', 'date_asc'],
  class: ['ave_review_point', 'name', 'date'],
  aord: ['ASC', 'DESC']
}

router.get('/cafes', (req, res) => {
  const sortBy = req.query.sortby
  let sortClass = sortList.class[0]
  let aord = sortList.aord[1]

  let ratingDesc = ''
  let ratingAsc = ''
  let nameDesc = ''
  let nameAsc = ''
  let dateDesc = ''
  let dateAsc = ''

  if (sortBy === sortList.item[1]) {
    aord = sortList.aord[0]
    ratingAsc = 'selected'
  } else if (sortBy === sortList.item[2]) {
    sortClass = sortList.class[1]
    nameDesc = 'selected'
  } else if (sortBy === sortList.item[3]) {
    sortClass = sortList.class[1]
    aord = sortList.aord[0]
    nameAsc = 'selected'
  } else if (sortBy === sortList.item[4]) {
    sortClass = sortList.class[2]
    dateDesc = 'selected'
  } else if (sortBy === sortList.item[5]) {
    sortClass = sortList.class[2]
    aord = sortList.aord[0]
    dateAsc = 'selected'
  }

  let low = 0
  let high = 5

  if (req.query.min) {
    low = Number(req.query.min)
    high = Number(req.query.max)
  }

  const sql = `
    SELECT * FROM cafes 
    WHERE ave_review_point BETWEEN ${low} AND ${high} 
    ORDER BY ${sortClass} ${aord};
  `
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    }

    let cafes = result.rows

    const sql2 = `
      SELECT * FROM photos;
    `
    db.query(sql2, (err2, result2) => {
      if (err2) {
        console.log(err2);
      }

      let photos = result2.rows
      res.render('cafes', {
        cafes: cafes,
        photos: photos,
        ratingDesc: ratingDesc,
        ratingAsc: ratingAsc,
        nameDesc: nameDesc,
        nameAsc: nameAsc,
        dateDesc: dateDesc,
        dateAsc: dateAsc
      })
    })
  })
})

router.post('/cafes', ensureLoggedIn, (req, res) => {
  let name = req.body.name
  let gmapUrl = req.body.gmapUrl
  let phone = req.body.phone
  let website = req.body.website
  let date = new Date().toLocaleString()
  let userId = req.session.userId

  const sql = `
    INSERT INTO cafes (name, gmap_url, phone, website, date, user_id, ave_review_point) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id;
  `
  db.query(sql, [name, gmapUrl, phone, website, date, userId, 0], (err, result) => {
    if (err) {
      console.log(err);
    }

    let id = result.rows[0].id
    res.redirect(`/cafes/${id}`)
  })
})

router.get('/cafes/new', ensureLoggedIn, (req, res) => {
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
      SELECT * FROM users;
    `
    db.query(sql2, (err2, result2) => {
      if (err2) {
        console.log(err2);
      }

      let users = result2.rows

      const sql3 = `
        SELECT * FROM comments 
        WHERE cafe_id = $1
        ORDER BY date DESC;
      `
      db.query(sql3, [cafeId], (err3, result3) => {
        if (err3) {
          console.log(err3);
        }

        let comments = result3.rows

        const sql4 = `
          SELECT * FROM photos 
          WHERE cafe_id = $1;
        `
        db.query(sql4, [cafeId], (err4, result4) => {
          if (err4) {
            console.log(err4);
          }

          let photos = result4.rows
          res.render('info', {
            cafe: cafe,
            users: users,
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
  let date = new Date().toLocaleString()
  let id = req.params.id

  const sql = `
    UPDATE cafes SET 
      name = $1, 
      gmap_url = $2, 
      phone = $3, 
      website = $4,
      date = $5
    WHERE id = $6;
  `
  db.query(sql, [name, gmapUrl, phone, website, date, id], (err, result) => {
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
  let date = new Date().toLocaleString()
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
      SELECT review_point FROM comments 
      WHERE cafe_id = $1;
    `
    db.query(sql2, [cafeId], (err2, result2) => {
      if (err2) {
        console.log(err2);
      }

      let reviewPoints = result2.rows
      let sumReviewPoints = 0
      for (let reviewPoint of reviewPoints) {
        sumReviewPoints += Number(reviewPoint.review_point)
      }
      let averageReviewPoints = sumReviewPoints / result2.rows.length
      let roundedAveReviewPoints = Math.round(averageReviewPoints * 10) / 10

      const sql3 = `
        UPDATE cafes SET 
          ave_review_point = $1
        WHERE id = $2;
      `
      db.query(sql3, [roundedAveReviewPoints, cafeId], (err3, result3) => {
        if (err3) {
          console.log(err3);
        }

        if (imageUrl) {
          const sql4 = `
            INSERT INTO photos (image_url, cafe_id, user_id, comment_id, date, likes) 
            VALUES ($1, $2, $3, $4, $5, $6);
          `
          db.query(sql4, [imageUrl, cafeId, userId, commentId, date, likes], (err4, result4) => {
            if (err4) {
              console.log(err4)
            }
            res.redirect(`/cafes/${cafeId}`)
          })
        } else {
          res.redirect(`/cafes/${cafeId}`)
        }
      })
    })
  })
})

router.get('/cafes/*/comment/:id', ensureLoggedIn, (req, res) => {

  const sql = `
    SELECT * FROM comments
    WHERE id = $1;
  `
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.log(err);
    }

    let comment = result.rows[0]

    const sql2 = `
      SELECT * FROM photos 
      WHERE comment_id = $1;
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
  let date = new Date().toLocaleString()
  let reviewPoint = req.body.reviewPoint
  let id = req.params.id
  let cafeId = req.params.cafeId

  const sql = `
    UPDATE comments SET 
      comment = $1, 
      date = $2,
      review_point = $3 
    WHERE id = $4;
  `
  db.query(sql, [comment, date, reviewPoint, id], (err, result) => {
    if (err) {
      console.log(err);
    }

    const sql2 = `
      SELECT review_point FROM comments 
      WHERE cafe_id = $1;
    `
    db.query(sql2, [cafeId], (err2, result2) => {
      if (err2) {
        console.log(err2);
      }

      let reviewPoints = result2.rows
      let sumReviewPoints = 0
      for (let reviewPoint of reviewPoints) {
        sumReviewPoints += Number(reviewPoint.review_point)
      }
      let averageReviewPoints = sumReviewPoints / result2.rows.length
      let roundedAveReviewPoints = Math.round(averageReviewPoints * 10) / 10

      const sql3 = `
        UPDATE cafes SET 
          ave_review_point = $1
        WHERE id = $2;
      `
      db.query(sql3, [roundedAveReviewPoints, cafeId], (err3, result3) => {
        if (err3) {
          console.log(err3);
        }

        const sql4 = `
          SELECT * FROM photos 
          WHERE comment_id = $1
        `
        db.query(sql4, [id], (err4, result4) => {
          if (err4) {
            console.log(err4);
          }

          if (result4.rows.length === 0) {
            const sql5 = `
              INSERT INTO photos (image_url, cafe_id, user_id, comment_id, date, likes) 
              VALUES ($1, $2, $3, $4, $5, $6);
            `
            db.query(sql5, [imageUrl, cafeId, req.session.userId, id, date, 0], (err5, result5) => {
              if (err5) {
                console.log(err5)
              }
              res.redirect(`/cafes/${cafeId}`)
            })
          } else if (imageUrl) {
            const sql5 = `
              UPDATE photos SET 
                image_url = $1, 
                date = $2
              WHERE comment_id = $3;
            `
            db.query(sql5, [imageUrl, date, id], (err5, result5) => {
              if (err5) {
                console.log(err5)
              }
              res.redirect(`/cafes/${cafeId}`)
            })
          } else {
            const sql5 = `
              DELETE FROM photos 
              WHERE comment_id = $1;
            `
            db.query(sql5, [id], (err5, result5) => {
              if (err5) {
                console.log(err5)
              }
              res.redirect(`/cafes/${cafeId}`)
            })
          }
        })
      })
    })
  })
})

router.delete('/cafes/:cafeId/comment/:id', ensureLoggedIn, (req, res) => {
  const cafeId = req.params.cafeId
  const commentId = req.params.id

  const sql = `
    DELETE FROM comments
    WHERE id = $1;
  `
  db.query(sql, [commentId], (err, result) => {
    if (err) {
      console.log(err);
    }

    const sql2 = `
      DELETE FROM photos
      WHERE comment_id = $1;
    `
    db.query(sql2, [commentId], (err2, result2) => {
      if (err2) {
        console.log(err2);
      }

      const sql3 = `
        SELECT review_point FROM comments 
        WHERE cafe_id = $1;
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
        let roundedAveReviewPoints = Math.round(averageReviewPoints * 10) / 10

        const sql4 = `
          UPDATE cafes SET 
            ave_review_point = $1
          WHERE id = $2;
        `
        db.query(sql4, [roundedAveReviewPoints, cafeId], (err4, result4) => {
          if (err4) {
            console.log(err4);
          }
          res.redirect(`/cafes/${req.params.cafeId}`)
        })
      })
    })
  })
})


module.exports = router