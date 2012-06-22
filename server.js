var express = require('express')
,   everyauth = require('everyauth')

var users = {}

everyauth.github
  .appId('ad2622e4ecf41b39e8eb')
  .appSecret('9b651769f9c63fa8707148b3c41e69fdb6bf41ba')
  .callbackPath('/auth/callback')
  .findOrCreateUser(function (session, accessToken, accessTokenExtra, githubUserMetadata) {
    console.log(githubUserMetadata)
    return users[githubUserMetadata.id] = githubUserMetadata
   })
   .redirectPath('/')

var server = express.createServer()
server.configure(function() {
  server.use(everyauth.middleware())
  server.use(express.bodyParser())
  server.use(server.router)
  server.use(express.static('site'))
})
server.listen(8080)

everyauth.helpExpress(server);

server.get('/issues/all', function(req, res) {
  res.send([
    { id: 'issue-1', title: "help", description: "something is wrong" }
   ,{ id: 'issue-2', title: "help again", description: "something is really wrong"}
  ])
});


