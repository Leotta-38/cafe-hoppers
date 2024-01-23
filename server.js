require('dotenv').config()

const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const methodOverride = require('method-override')
const requestLogger = require('./middlewares/request_logger')
const setCurrentUser = require('./middlewares/set_current_user')
const homeRouter = require('./routes/home_router')
const sessionRouter = require('./routes/session_router')
const userRouter = require('./routes/user_router')
const cafesRouter = require('./routes/cafes_router')

const app = express()
const port = process.env.PORT || 8080;

app.set('view engine', 'ejs')


app.use(express.static('public'))

app.use(methodOverride('_method'))

app.use(requestLogger)

app.use(
  session({
    secret: process.env.SESSION_SECRET || "cafehoppers",
    resave: false,
    saveUninitialized: true,
  })
)

app.use(setCurrentUser)

app.use(expressLayouts)

app.use(express.urlencoded({ extended: true}))


app.use(homeRouter)
app.use(sessionRouter)
app.use(userRouter)
app.use(cafesRouter)

app.listen(port, () => {
  console.log(`listening on port ${port}`);
})