FlowRouter.route('/', {
  name: 'landing',
  action: function() {
    BlazeLayout.render("mainLayout", {content: "landing" });
  }
});

FlowRouter.route('/scheme/:schemeId', {
  name: 'scheme',
  action: function() {
    BlazeLayout.render("mainLayout", {content: "scheme"});
  }
});

FlowRouter.route('/calculation/:calcId', {
  name: 'calculation',
  action: function() {
    BlazeLayout.render("mainLayout", {content: "calculation"});
  }
});

FlowRouter.route('/schemes', {
  name: 'schemes',
  action: function() {
    BlazeLayout.render("mainLayout", {content: "scheme"});
  }
});

FlowRouter.route('/calculations', {
  name: 'calculations',
  action: function() {
    BlazeLayout.render("mainLayout", {content: "calculations"});
  }
});
