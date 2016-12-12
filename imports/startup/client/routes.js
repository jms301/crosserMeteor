FlowRouter.route('/', {
  name: 'landing',
  action: function() {
    BlazeLayout.render("mainLayout", {content: "landing" });
  }
});

FlowRouter.route('/contact', {
  name: 'contact',
  action: function() {
    BlazeLayout.render("mainLayout", {content: "contact" });
  }
});

FlowRouter.route('/scheme/:id', {
  name: 'scheme',
  action: function() {
    BlazeLayout.render("mainLayout", {content: "scheme"});
  }
});

FlowRouter.route('/calculation/:id', {
  name: 'calculation',
  action: function() {
    BlazeLayout.render("mainLayout", {content: "calculation"});
  }
});

FlowRouter.route('/schemes', {
  name: 'schemes',
  action: function() {
    BlazeLayout.render("mainLayout", {content: "schemes"});
  }
});

FlowRouter.route('/calculations', {
  name: 'calculations',
  action: function() {
    BlazeLayout.render("mainLayout", {content: "calculations"});
  }
});

FlowRouter.route('/admin', {
  name: 'admin',
  action: function() {
    BlazeLayout.render("mainLayout", {content: "admin"});
  }
});

FlowRouter.route('/schemeBackup/:id/version/:ver', {
  name: 'historic_scheme',
  action: function() {
    BlazeLayout.render("mainLayout", {content: "schemeDisplay"});
  }
});
