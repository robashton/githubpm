var express = require('express')
,   everyauth = require('everyauth')
,   https = require('https')

var users = {}

everyauth.github
  .appId('ad2622e4ecf41b39e8eb')
  .appSecret('9b651769f9c63fa8707148b3c41e69fdb6bf41ba')
  .moduleTimeout(-1)
  .findOrCreateUser(function (session, accessToken, accessTokenExtra, githubUserMetadata) {
    return users[githubUserMetadata.id] || (users[githubUserMetadata.id] =  githubUserMetadata)
   })
   .redirectPath('/')

everyauth
  .everymodule
  .findUserById(function(userId, cb) {
    cb(users[userId])
  })
var server = express.createServer()
server.configure(function() {
  server.use(express.static('site'))
  server.use(express.bodyParser())
  server.use(express.cookieParser())
  server.use(express.session({secret : 'ssshlol' }))
  server.use(everyauth.middleware())
  server.use(server.router)
})
server.listen(8080)

server.get('/issues/all', function(req, res) {
  makeGithubRequest('/repos', req.user, function(err, data) {
    res.send(data)
  })
});

function makeGithubRequest(path, user, cb) {
  console.log(user)
 var request = https.get({
    host: 'api.github.com', 
    path: path,
    headers: {
      'Authorization' : 'token ' + user.token  
    }
  }, 
  function(res) {
    var data = '';
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', function() {
      cb(null, JSON.parse(data));
    });
  })
  .on('error', function(e) {
      cb(e, null)
  });
}

