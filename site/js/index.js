(function() {
  var issueTemplateMap = null
  ,   issueTemplateText = null

  $(document).ready(function() {
    createTemplates()
    refreshIssueList()  
  })

  function refreshIssueList() {
    var target = $('#issue-list')
    fetchIssues(function(issues) {
      var html = Plates.bind(issueTemplateText, issues, issueTemplateMap) 
      target.html(html)
    })
  }

  function createTemplates() {
    issueTemplateMap = Plates.Map()
    issueTemplateMap
        .where('id').is('placeholder').insert('id')
        .class('title').to('title')
        .class('description').to('body')

    issueTemplateText = $('#template-issue').html()
  }
  function fetchIssues(cb) {
    $.getJSON('/issues/all', cb)
  }
})()
