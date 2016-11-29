var defaultAllow = {
  insert: function (userId, doc) {
    // the user must be logged in, and the document must be owned by the user
    return (userId && doc.userId === userId);
  },
  update: function (userId, doc, fields, modifier) {
    // can only change your own documents
    return doc.userId === userId;
  },
/*
  remove: function (userId, doc) {
    // can only remove your own documents
    return doc.userId === userId;
  },*/
  fetch: ['userId']
};

var defaultDeny = {

  update: function (userId, doc, fields, modifier) {
    // can't change owners
    return _.contains(fields, 'userId');
  },
  remove: function (userId, doc) {
    // can't  documents
    return true;
  },
  fetch: ['locked'] // no need to fetch 'owner'
};


Schemes = new Meteor.Collection("schemes");
Schemes.allow(defaultAllow);
Schemes.deny(defaultDeny);

SchemeHistory = new Meteor.Collection("scheme_history");
Calculations = new Meteor.Collection("calculations");
WorkingTasks = new Meteor.Collection("working_tasks");
QueuedTasks = new Meteor.Collection("queued_tasks");
