const db = require("../db")

const setCurrentUser = (req, res, next) => {
  res.locals.currentUser = {}
  res.locals.isLoggedIn = false
  const sessionUserId = req.session.userId
  
  if (!sessionUserId) {
    return next()
  }

  const sql = `
    SELECT * FROM users WHERE id = $1;
  `
  
  db.query(sql, [sessionUserId], (err, result) => {
    if (err) {
      console.log(err);
    }
    
    res.locals.currentUser = result.rows[0]
    res.locals.isLoggedIn = true
    next()
  })
}

module.exports = setCurrentUser