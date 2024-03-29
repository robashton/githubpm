(function() {
  var repoTemplateMap = null
  ,   repoTemplateText = null
  ,   issueTemplateMap = null
  ,   issueTemplateText = null
  ,   itemTemplateMap = null
  ,   itemTemplateText = null
  ,   commentTemplateMap = null
  ,   commentTemplateText = null

  ,   selectedRepo = null
  ,   selectedIssue = null

  $(document).ready(function() {
    createTemplates()
    refreshIssueList()  
  })

  function refreshIssueList() {
    var target = $('#repo-list')
    fetchRepos(function(repos) {
      var html = Plates.bind(repoTemplateText, repos, repoTemplateMap) 
      target.html(html)
      $('.repo').click(onRepoSelected)
    })
  }

  function onRepoSelected() {
    var repoElement = $(this)
    ,   repoId = repoElement.data('repo')
    selectedRepo = repoId
    loadRepoIssues(repoId)
    $('#repo-container').removeClass('forefront').addClass('background').addClass('hidden')
    $('#issue-container').removeClass('background').addClass('forefront')
  }

  function loadRepoIssues(repoId) {
    var target = $('#issue-list')
    fetchRepoIssues(repoId, function(issues) {
      var html = Plates.bind(issueTemplateText, issues, issueTemplateMap)
      target.html(html)
      $('.issue').click(onIssueSelected)
    })
  }

  function onIssueSelected() {
    var issueElement = $(this)
    ,   issueId = issueElement.data('issue')

    selectedIssue = issueId

    loadIssue(issueId)
    $('#issue-container').removeClass('forefront').addClass('background')
    $('#item-container').removeClass('background').addClass('foreground')
  }

  function loadIssue(issueId) { 
    var target = $('#item-details')
    var commentTarget = $('#item-comments')

    fetchIssue(selectedRepo, issueId, function(issue) {
      var html = Plates.bind(itemTemplateText, {
        body: issue.body,
        title: issue.title,
        avatar: issue.user.avatar_url
      }, itemTemplateMap)
      target.html(html)
    })

    fetchIssueComments(selectedRepo, issueId, function(comments) {
      var html = '';
      for(var i = 0 ; i < comments.length ; i++) {
        var comment = comments[i]
        html += Plates.bind(commentTemplateText, {
           body: comment.body,
           avatar: comment.user.avatar_url
        },
        commentTemplateMap)
      }
      commentTarget.html(html)
    })
  }

  function createTemplates() {
    repoTemplateMap = Plates.Map()
    repoTemplateMap    
        .where('id').is('placeholder').insert('id')
        .class('title').to('name')
        .class('issuecount').to('open_issues')
        .where('data-repo').is('repoid').insert('name')

    repoTemplateText = $('#template-repo').html()

    issueTemplateMap = Plates.Map()
    issueTemplateMap
        .where('id').is('placeholder').insert('id')
        .class('title').to('title')
        .where('data-issue').is('issueid').insert('number')

    issueTemplateText = $('#template-issue').html()

    itemTemplateMap = Plates.Map()
    itemTemplateMap
        .class('title').to('title')
        .class('body').to('body')
        .where('src').is('image').insert('avatar')

    itemTemplateText = $('#template-item').html()
   
    commentTemplateMap = Plates.Map()
    commentTemplateMap
        .class('body').to('body')
        .where('src').is('image').insert('avatar')
    
    commentTemplateText = $('#template-comment').html()

    $('#newcomment').wysihtml5({
      "font-styles": false, 
      "emphasis": false, 
      "lists": false, 
      "html": false,
      "link": false, 
      "image": false 
    })
    $('#btn-newcomment').click(createNewComment)

  }

  function createNewComment() {
    var text = $('#newcomment').val()
    console.log(text)
    saveComment(selectedRepo, selectedIssue, text, function(data) {
      var target = $('#item-comments')      
      target.append(Plates.bind(
           commentTemplateText, {
           body: data.body,  
           avatar: data.user.avatar_url
           },
           commentTemplateMap))
      $('#newcomment').val('')
    })
  }

  function saveComment(repoId, issueId, text, cb) {
    $.post('/issues/' + repoId + '/' + issueId + '/comments', 
        {text : text}, 
        cb, 
    "json");
  }

  function fetchIssueComments(repoId, issueId, cb) {
    $.getJSON('/issues/' + repoId + '/' + issueId + '/comments', cb)
  }

  function fetchIssue(repoId, issueId, cb) {
    $.getJSON('/issues/' + repoId + '/' + issueId, cb)
  }

  function fetchRepoIssues(repoId, cb) {
    $.getJSON('/issues/' + repoId, cb)
  }

  function fetchRepos(cb) {
    $.getJSON('/repos/all', cb)
  }
})()
