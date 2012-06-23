(function() {
  var repoTemplateMap = null
  ,   repoTemplateText = null
  ,   issueTemplateMap = null
  ,   issueTemplateText = null
  ,   itemTemplateMap = null
  ,   itemTemplateText = null
  ,   selectedRepo = null

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
    var target = $('#item-container')
    fetchIssue(selectedRepo, issueId, function(issue) {
      var html = Plates.bind(itemTemplateText, issue, itemTemplateMap)
      target.html(html)
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

    itemTemplateText = $('#template-item').html()
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
