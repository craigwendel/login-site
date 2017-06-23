const express = require('express')
const session = require('express-session')
const mustache = require('mustache-express')
const bodyParser = require('body-parser')
const parseurl = require('parseurl')
const app = express()
var sess = ''
var database = [{username: 'craig', password: '123'}]
var invalidPassword = ''
var userTrue = 0 // determines if username and password are in the database

app.engine('mustache', mustache())
app.set('view engine', 'mustache')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({
  secret: 'ssshhhhh',
  resave: false,
  saveUninitialized: true
}))

app.use(function (req, res, next) {
  var views = req.session.views

  if (!views) {
    views = req.session.views = {}
  }
  var pathname = parseurl(req).pathname
  views[pathname] = (views[pathname] || 0) + 1
  next()
})

app.get('/', function (req, res, next) {
  sess = req.session

  for (var i = 0; i < database.length; i++) {
    if (database[i].username === sess.username && database[i].password === sess.password) {
      userTrue = 1
    // says that username and password are in the database
    }
  }
  if (userTrue === 1) {
    return res.render('index', {
      user: sess.username,
      password: sess.password,
      views: (sess.views['/count'])
    })
  }
  else {
    return res.redirect('/login')
  }
})

app.get('/login', function (req, res, next) {
  return res.render('login', {invalid: invalidPassword})
})

app.post('/login', function (req, res) {
  sess = req.session
  sess.username = req.body.username
  sess.password = req.body.password
  for (var i = 0; i < database.length; i++) {
    if (database[i].username === sess.username && database[i].password === sess.password) {
      return res.redirect('/')
    } else if (database[i].username === sess.username && database[i].password !== sess.password) {
      invalidPassword = 'Your password was incorrect'
      return res.redirect('/login')
    }
  }
  return res.redirect('/signup')
})
app.get('/signup', function (req, res) {
  return res.render('signup')
})
app.post('/signup', function (req, res) {
  sess = req.session
  sess.username = req.body.username
  sess.password = req.body.password

  let newUser = {username: sess.username, password: sess.password}
  database.push(newUser)

  return res.redirect('/')
})

app.post('/counter', function (req, res) {
  return res.redirect('/count')
})
app.get('/count', function (req, res, next) {
  return res.redirect('/')
})
app.post('/logout', function (req, res) {
  userTrue = 0
  sess = req.session
  sess.username = ''
  sess.password = ''
  sess.views['/count'] = 0
  invalidPassword = ''
  return res.redirect('/')
})

app.post('/create', function (req, res) {
  return res.redirect('/signup')
})

app.listen(3000, function () {
  console.log('Started application')
})
