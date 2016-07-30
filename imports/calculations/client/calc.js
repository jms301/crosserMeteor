import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

Template.calculations.onCreated(function () {
  var self = this;
  self.autorun(function () {
    self.subscribe('calculations');
  });
});


Template.calculations.helpers({

  calcList  : function () {
    return Calculations.find({}, {$sort: {userId: 0, schemeId: 1}});
  }
});

Template.calculation.onCreated(function () {
  var self = this;
  self.autorun(function () {
    self.subscribe('calculation', FlowRouter.getParam('id'));
  });
});


Template.calculation.helpers({
  'getCalc' :  function () {
    var calcId = FlowRouter.getParam('id');
    return (Calculations.findOne({_id: calcId}) || {});
  },

});
