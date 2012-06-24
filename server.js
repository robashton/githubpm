var express = require('express')
,   https = require('https')
,   passport = require('passport')
,   _ = require('underscore')
,   less = require('less')
,   GitHubStrategy = require('passport-github').Strategy
,   toMarkdown = require('to-markdown').toMarkdown

var users = {}

passport.serializeUser(function(user, done) {
   done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GitHubStrategy({
        clientID: 'ad2622e4ecf41b39e8eb'
      , clientSecret: '9b651769f9c63fa8707148b3c41e69fdb6bf41ba'
      , callbackURL: "http://localhost:8080/auth/github/callback"
      , scope: [ 'public_repo' ]

    },
    function(accessToken, refreshToken, profile, done) {
      profile.token = accessToken
      return done(null, profile)
    }));

// Hack connect.js to allow relative @import statements in less.js
express.compiler.compilers.less.compile = function(str, fn) {
try {
   less.render(str, {paths: [ __dirname + '/site/css']}, fn);
 } catch (err) {
  fn(err);
 }
};

var server = express.createServer()

server.configure(function() {
  server.use(express.static('site'))
  server.use(express.bodyParser())
  server.use(express.cookieParser())
  server.use(express.session({secret : 'ssshlol' }))
  server.use(express.methodOverride());
  server.use(passport.initialize());
  server.use(passport.session());
  server.use(server.router)
  server.use(express.compiler({ src: __dirname + '/site', enable: ['less']}));
})
server.listen(8080)

server.get('/auth/github',
  passport.authenticate('github'),
  function(req, res){ });

server.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login'}),
  function(req, res) {
    res.redirect('/');
  });


server.get('/repos/all', function(req, res) {
  makeGithubRequest('/user/repos', req.user, function(err, data) {
    res.send(data)
 })
})

server.get('/issues/:repo/:issueId', function(req, res) {
  makeGithubRequest('/repos/' + req.user.username + '/' + 
                      req.params.repo + '/issues/' + 
                      req.params.issueId, 
                      req.user,
                      function(err, data) {
    res.send(data)
  })
})

server.get('/issues/:repo', function(req, res) {
  makeGithubRequest('/repos/' + req.user.username + '/' + req.params.repo + '/issues',
                    req.user, function(err, data) {
    res.send(data) 
  })
})

server.get('/issues/:repo/:issueId/comments', function(req, res) {
  makeGithubRequest('/repos/' 
                    + req.user.username + '/'
                    + req.params.repo + '/issues/' 
                    + req.params.issueId + 
                    '/comments'
                    , req.user
                    , function(err, data) {
    res.send(data)
 })
})

server.post('/issues/:repo/:issueId/comments', function(req, res) {
  postGithub('/repos/'
                  + req.user.username + '/'
                  + req.params.repo + '/issues/'
                  + req.params.issueId + '/comments'
                  , JSON.stringify({
                    body: toMarkdown(req.body.text) 
                  })
                  , req.user
                  , function(err, data) {
      res.send(data)
  })
})


function postGithub(path, data, user, cb) {
  console.log('POST', path, data, user.token)
  var req = https.request({
    host: 'api.github.com',
    path: path,
    method: 'POST',
    headers: {
      'Authorization' : 'token ' + user.token
    , 'Content-Length' : data.length
    }
  },
  function(res) {
    var ret = ''
    res.on('data', function(chunk) {
      ret += chunk 
    })
    res.on('end', function() {
      console.log(res.statusCode)
      cb(null, ret)
    })
  })
  req.write(data)
  req.end()
}

function makeGithubRequest(path, user, cb) {
  console.log('GET', path, user.token)
  https.get({
    host: 'api.github.com', 
    path: path,
    headers: {
      'Authorization' : 'token ' + user.token  
    }
  }, 
  function(res) {
    var data = ''

    res.on('data', function (chunk) {
      data += chunk
    })
    res.on('end', function() {
      cb(null, data)
    })
  })
  .on('error', function(e) {
      cb(e, null)
  })
}

