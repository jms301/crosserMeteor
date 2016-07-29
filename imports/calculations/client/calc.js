import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

Template.calculations.onCreated(function () {
  var self = this;
  self.autorun(function () {
    self.subscribe('calculations');
    if(self.subscriptionsReady()) {
      console.log("Calculation subs ready:");
      console.log(Calculations.find().count());
    }
  });
});


Template.calculations.helpers({

  calcList  : function () {
    console.log(Calculations.find().count());
    return Calculations.find({}, {$sort: {userId: 0, schemeId: 1}});
  }
});
