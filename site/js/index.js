(function() {
  var repoTemplateMap = null
  ,   repoTemplateText = null
  ,   issueTemplateMap = null
  ,   issueTemplateText = null

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
    loadRepoIssues(repoId)
    $('#repo-container').removeClass('forefront').addClass('background')
    $('#issue-container').removeClass('background').addClass('forefront')
  }

  function loadRepoIssues(repoId) {
    var target = $('#issue-list')
    fetchRepoIssues(repoId, function(issues) {
      var html = Plates.bind(issueTemplateText, issues, issueTemplateMap)
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
        .class('name').to('name')
    issueTemplateText = $('#template-issue').html()
  }

  function fetchRepoIssues(repoId, cb) {
    $.getJSON('/issues/' + repoId, cb)
  }

  function fetchRepos(cb) {
    $.getJSON('/repos/all', cb)
  }
})()
