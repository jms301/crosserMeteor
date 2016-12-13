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

FlowRouter.route('/backup/:id', {
  name: 'scheme_backup_id',
  action: function() {
    BlazeLayout.render("mainLayout", {content: "backup"});
  }
});


FlowRouter.route('/backup/:id/version/:ver', {
  name: 'scheme_backup',
  action: function() {
    BlazeLayout.render("mainLayout", {content: "backup"});
  }
});

FlowRouter.route('/schemeBackups/:id' , {
  name: 'scheme_backups',
  action: function() {
    BlazeLayout.render("mainLayout", {content: "backups"});
  }
});

