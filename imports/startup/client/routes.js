FlowRouter.route('/', {
  name: 'landing',
  action: function() {
    BlazeLayout.render("mainLayout", {content: "landing" });
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

