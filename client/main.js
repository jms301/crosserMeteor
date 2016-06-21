//import { Template } from 'meteor/templating';
//import { ReactiveVar } from 'meteor/reactive-var';

Template.scheme.onCreated(function () {
  var self = this;

  self.autorun(function () {
    var schemeId = FlowRouter.getParam('schemeId');
    //TODO add subscription here!
  });
});

Template.scheme.helpers({
  scheme: () => {
    var schemeId = FlowRouter.getParam('schemeId');
    var scheme = Schemes.findOne({_id: schemeId}) || {};
    return scheme;
  }
});
