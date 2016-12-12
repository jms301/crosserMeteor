//import { Template } from 'meteor/templating';
//import { ReactiveVar } from 'meteor/reactive-var';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import {default_resolution} from './default.js';
import {default_species} from './default.js';
import { EJSON } from 'meteor/ejson';



Template.schemes.onCreated(function () {
  var self = this;
  self.autorun(function () {
    self.subscribe('schemes');
    if(self.subscriptionsReady()) {

    }
  });
});


Template.schemes.helpers({
  schemeList: () => {
      return Schemes.find();
    }
});

Template.schemeDisplay.onCreated(function () {
  var self = this;

  self.autorun(function () {

    var schemeId = FlowRouter.getParam('id');
    var ver = parseInt(FlowRouter.getParam('ver'));
    self.subscribe('historic_scheme', schemeId, ver);

    if(self.subscriptionsReady()) {

    }
  });
});


Template.schemeDisplay.helpers({
  scheme: () => {
    var schemeId = FlowRouter.getParam('id');
    var ver = parseInt(FlowRouter.getParam('ver'));

    return SchemeHistory.findOne({schemeId: schemeId, version: ver}) || {};
  },
  speciesList: () => {
    return _.map(default_species , (val, key, list) => {
      return {name: val.name, value: key};
    });
  }
});


Template.scheme.onRendered(() => {
  Template.instance().autorun(() => {
    if(Template.instance().subscriptionsReady())
    {

    }
  });
});

Template.scheme.events({

});

Template.simulationResolution.onRendered(() => {
  this.$('.tooltipped').tooltip();
});


Template.simulationResolution.events({

});

Template.cross.events({

});

Template.cross.helpers({

});


Template.plant.events({

});

Template.loci.events({

});

Template.loci.helpers({

});

Template.crossLoci.events({

});

Template.chartDisplay.helpers({
  "plusOne" : function (index) {
    return index + 1;
  },
  "custom_type" : function (type ) {
    known_types = ["mean_cross_composition", "proportion_distribution",
     "loci_composition", "success_table"];
    return _.contains(known_types, type);
  },
  "parsed_data" : function () {
    return EJSON.parse(this.chart.data);

  },
  "all_crosses" : function () {
    var scheme = Schemes.findOne({_id: FlowRouter.getParam('id')}) || {};

    return _.map(scheme.crosses, (cross) => { return cross.name });
  },
  "all_plants" : function () {
    var scheme = Schemes.findOne({_id: FlowRouter.getParam('id')}) || {};

    return _.map(scheme.plants, (plant) => { return plant.name });
  },
});

Template.chart.events({

});

Template.successTable.helpers({
});

Template.successTable.events({

});
