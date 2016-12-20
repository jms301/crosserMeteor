//import { Template } from 'meteor/templating';
//import { ReactiveVar } from 'meteor/reactive-var';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import {default_resolution} from './default.js';
import {default_species} from './default.js';
import { EJSON } from 'meteor/ejson';



Template.backups.onCreated(function () {
  var self = this;

  self.autorun(function () {
    self.subscribe('historic_schemes', FlowRouter.getParam('id'));

    if(self.subscriptionsReady()) {

    }
  });
});

Template.backups.helpers({
  backupList: () => {
    var schemeId = FlowRouter.getParam('id');
    return SchemeHistory.find({schemeId: schemeId}, {sort: {version: -1}});
  },

});


Template.backup.onCreated(function () {
  var self = this;

  self.autorun(function () {

    var id = FlowRouter.getParam('id');
    var ver = parseInt(FlowRouter.getParam('ver'));

//It is possible to load backup template from one of two routes so
// Detect which route and subscribe to the right data.
    if(FlowRouter.getRouteName() == 'scheme_backup_id') {
      self.subscribe('historic_scheme_id', id);
    } else {
      self.subscribe('historic_scheme', id, ver);
    }
  });
});


Template.backup.events({
  "click button#revert" : function () {
    //It is possible to load backup template from one of two routes so
    // Detect which route and subscribe to the right data.

    var id = FlowRouter.getParam('id');
		var hist_scheme;
    if(FlowRouter.getRouteName() == 'scheme_backup_id') {
      hist_scheme = SchemeHistory.findOne({_id: id});
    } else {
	    var ver = parseInt(FlowRouter.getParam('ver'));
      hist_scheme = SchemeHistory.findOne({schemeId: id, version: ver});
    }

    if(hist_scheme) {
      Meteor.call('revertScheme', hist_scheme._id, (err, rev_id) => {
        if(err) {
          console.log(err);
          alert("Revert failed!");
        } else {
          FlowRouter.go("scheme", {id: rev_id});
        }
      });
    }
  }
});

Template.backup.helpers({
  scheme: () => {
    var id = FlowRouter.getParam('id');


    if(FlowRouter.getRouteName() == 'scheme_backup_id')
      return SchemeHistory.findOne({_id: id}) || {};
    var ver = parseInt(FlowRouter.getParam('ver'));

    return SchemeHistory.findOne({schemeId: id, version: ver}) || {};
  },
  speciesList: () => {
    return _.map(default_species , (val, key, list) => {
      return {name: val.name, value: key};
    });
  },
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

