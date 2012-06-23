(function() {
  var issueTemplateMap = null
  ,   issueTemplateText = null

  $(document).ready(function() {
    createTemplates()
    refreshIssueList()  
  })

  function refreshIssueList() {
    var target = $('#repo-list')
    fetchIssues(function(issues) {
      var html = Plates.bind(issueTemplateText, issues, issueTemplateMap) 
      target.html(html)
    })
  }

  function createTemplates() {
    issueTemplateMap = Plates.Map()
    issueTemplateMap
        .where('id').is('placeholder').insert('id')
        .class('title').to('name')
        .class('issuecount').to('open_issues')

    issueTemplateText = $('#template-repo').html()
  }
  function fetchIssues(cb) {
    $.getJSON('/issues/all', cb)
  }
})()
