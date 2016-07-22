//import { Template } from 'meteor/templating';
//import { ReactiveVar } from 'meteor/reactive-var';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import {default_resolution} from './default.js';
import {default_species} from './default.js';
import {CrossTree} from './crosstree.js';

var CTree = {};



Template.registerHelper("isSelected", (val, val2) => {
  if (val == val2)
    return "selected"
  return ""
});

//helper to simply use FlowRouter.path
Template.registerHelper("flowPath", (name, id) => {

  return FlowRouter.path(name, {id: id}, {});

});

Template.schemes.onCreated(function () {
  var self = this;
  self.autorun(function () {
    self.subscribe('schemes');
      console.log(Schemes.find().count());
    /*if(self.subscriptionsReady()) {
    }*/
  });
});


Template.schemes.helpers({
  schemeList: () => {
      return Schemes.find();
    }
});

Template.scheme.onCreated(function () {
  var self = this;
  self.autorun(function () {
    var schemeId = FlowRouter.getParam('id');
    self.subscribe('scheme', schemeId);

    if(self.subscriptionsReady()) {
      scheme = Schemes.findOne({_id: schemeId});
      CTree = new CrossTree(scheme.plants, scheme.crosses);
    }
  });
});


Template.scheme.helpers({
  scheme: () => {
    var schemeId = FlowRouter.getParam('id');
    var scheme = Schemes.findOne({_id: schemeId}) || {};
    return scheme;
  },
  speciesList: () => {
    return _.map(default_species , (val, key, list) => {
      return {name: val.name, value: key};
    });
  }
});


//Helper function to update the simulation resolution drop down & custom boxes
var resetSimulationRes = function () {

  tolerance = $('input#tolerance').val();
  minPlants = $('input#min-plants').val();
  chunkSize = $('input#chunk-size').val();

  for (res in default_resolution) {
    if(chunkSize == default_resolution[res].convergence_chunk_size &&
       minPlants == default_resolution[res].convergence_fewest_plants &&
       tolerance == default_resolution[res].convergence_tolerance) {


      $('select#resolution').val(res);
      return
    }

  }
  //else
  $('select#resolution').val('custom');

};

Template.scheme.onRendered(() => {
  /*self.autorun(() => {
    resetSimulationRes();
    TODO this will not work till you remvoe auto-publish since otherwise
    no way to tell when the data is good
  });*/
});

Template.scheme.events({
  //Config:
  "change select#species" : (evt, inst) => {

    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : {species : default_species[evt.target.value]}});

    //TODO refresh loci settings

  },
  "change input#chunk-size" : (evt, inst) => {
    var toSet = {};
    toSet['system.convergence_chunk_size'] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : toSet});
    resetSimulationRes();
  },
  "change input#tolerance" : (evt, inst) => {
    var toSet = {};
    toSet['system.convergence_tolerance'] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : toSet});
    resetSimulationRes();
  },
  "change input#min-plants" : (evt, inst) => {
    var toSet = {};
    toSet['system.convergence_fewest_plants'] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : toSet});
    resetSimulationRes();
  },
  //Plants:
  "click button#add-parent" : () => {
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$push : {'plants': {'name':'', 'loci' : []}}});
  },
  //Crosses:
  "click button#add-cross" : () => {
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$push : {'crosses': {'name':'',
                            'left' : null,
                            'right': null,
                            'loci' : [],
                            'zygosity' : 'Heterozygous'}}
      }
    );


  },
  //charts
  "click button#add-chart" : () => {
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$push : {'outputs': {'name':'', 'data' : '' }}});
  },
  //backup, revert & process

  "click button#backup": function (evt, inst) {
    Meteor.call('backupScheme', FlowRouter.getParam('id'));

  },
  "click button#revert": function (evt, inst) {
    //TODO confirm!

    Meteor.call('revertScheme', FlowRouter.getParam('id'));

  },
  "click button#process" : function (evt, inst) {
    Meteor.call('processScheme', FlowRouter.getParam('id'));

  }
});

Template.simulationResolution.events({
  "change select#resolution" : (evt, inst) => {
    if(evt.target.value == 'custom') {


    } else {
      values = default_resolution[evt.target.value];

      Schemes.update({_id: FlowRouter.getParam('id')},
        {$set : {
          "system.convergence_chunk_size" : values.convergence_chunk_size,
          "system.convergence_tolerance"  : values.convergence_tolerance,
          "system.convergence_fewest_plants"  : values.convergence_fewest_plants
        }
      });
    }
  }
});

Template.cross.events({

 "click button.delete-cross" : function (evt, inst) {

    var old = Schemes.findOne({_id: FlowRouter.getParam('id')});
    var oldName = this.cross.name;// old.crosses[inst.data.ci].name;

    //TODO remove cross from charts.

    old.crosses.forEach((cross) => {
      if(cross.left == oldName)
        cross.left = "";
      if(cross.right == oldName)
        cross.right = "";
    });

    old.crosses.splice(this.ci, 1);

    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : {crosses:  old.crosses}});

  },
  "change select.zygosity" : function (evt, inst) {
    var toSet = {};
    toSet["crosses."+inst.data.ci + ".zygosity"] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : toSet });

  },
  "change select.add-loci" : function (evt, inst) {
    var schemeId = FlowRouter.getParam('id');
    var toSet = { };

    if(evt.target.value == "add-all-ZTU2YTdkODc4Njk0NDk0NGNhNzc5ZjFi") {
      //Get all anscestors loci.
      var loci = _.uniq(CTree.availableLoci(this.cross));
      loci.forEach((loci) => {
        toSet["crosses."+this.ci + ".loci"] = loci.name;
        Schemes.update({_id: schemeId},
          {$addToSet: toSet});
      });

    } else {
      // normal loci select

      toSet["crosses."+this.ci + ".loci"] = evt.target.value;

      //Update the DB
      Schemes.update({_id: schemeId},
        {$addToSet: toSet});

    }

    //reset the drop down.
    inst.$('select.add-loci').val("default");

  },
  "change input.cross-name": function (evt, inst) {

    var old = Schemes.findOne({_id: FlowRouter.getParam('id')});
    var oldName = old.crosses[inst.data.ci].name;
    var newName = evt.target.value;

    //TODO updated charts with new cross names.
    //TODO barf if name already in use in cross OR plants.

    old.crosses.forEach((cross) => {
      if(cross.left == oldName)
        cross.left = newName;
      if(cross.right == oldName)
        cross.right = newName;
    });
    old.crosses[inst.data.ci].name = newName;

    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : {crosses:  old.crosses}});

  },
  "change select.lparent": (evt, inst) =>
  {
    var toSet = {};
    toSet["crosses."+inst.data.ci + ".left"] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : toSet });
  },
  "change select.rparent": (evt, inst) =>
  {
    var toSet = {};
    toSet["crosses."+inst.data.ci + ".right"] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : toSet });
  }
});

Template.cross.helpers({
  optionsPlantsForSelect: function () {
    var scheme = Schemes.findOne({_id: FlowRouter.getParam('id')});
    return _.map(scheme.plants, (plant) => { return plant.name});

  },
  optionsCrossesForSelect: function (cross) {
    if(!cross || !cross.name) {
      return;
    }

    var scheme = Schemes.findOne({_id: FlowRouter.getParam('id')});
    var toRet = _.map(scheme.crosses, (c) => { return c.name});

    if(Template.instance().subscriptionsReady())
    {
      descFound = CTree.getDescendants(cross);
    }
    toRet = _.filter(toRet, (item, index, list)=> {

      return !_.contains(descFound, item);

    });
    return toRet;

  },

  optionsAvailableLoci: function (cross) {
    var toRet = _.uniq(CTree.availableLoci(cross));

    toRet = _.filter(toRet, (item) => {
      return !_.contains(cross.loci, item.name);
    });
    return toRet;
  }
});


Template.plant.events({

  "click button.delete-parent" : (evt, inst) => {

    toDel = {};
    toDel["plants."+inst.data.pi] = "";
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$unset: toDel});
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$pull: {"plants" : null }});

  },
  "click button.add-locus" : (evt, inst) => {
    toAdd = {};
    toAdd["plants."+inst.data.pi + ".loci"] = {
        "name" : "",
        "type" : "Marker",
        "location" : null,
        "linkage_group" : null};
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$push : toAdd});
  },
  "change input.parent-name" : (evt, inst) => {
    var old = Schemes.findOne({_id: FlowRouter.getParam('id')});
    var oldName = old.plants[inst.data.pi].name;
    var newName = evt.target.value;

    //TODO barf if name already in use in cross OR plants.
    //TODO update chart 'donor' fields.
    //TODO should re-factor into function?
    old.crosses.forEach((cross) => {
      if(cross.left == oldName)
        cross.left = newName;
      if(cross.right == oldName)
        cross.right = newName;
    });

    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : {crosses:  old.crosses}});

    var toSet = {};
    toSet["plants."+inst.data.pi + ".name"] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$set : toSet});
    //TODO Update the lists of plants in crosses & Charts

  }
});

Template.loci.events({
  "click button.delete-loci" : (evt, inst) => {
    toDel = {};

    toDel["plants."+inst.data.pi + ".loci."+inst.data.li] = "";
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$unset: toDel});

    toDel = {};
    toDel["plants."+inst.data.pi + ".loci"] = null;

    Schemes.update({_id: FlowRouter.getParam('id')},
      {$pull: toDel});

  },
  "change input.loci-name" : (evt, inst) => {
    var old = Schemes.findOne({_id: FlowRouter.getParam('id')});
    var oldName = old.plants[inst.data.pi].loci[inst.data.li].name;
    var newName = evt.target.value;

    //TODO barf if name already in use in loci
    //TODO update chart 'donor' fields.
    //TODO should re-factor into function?
    old.crosses.forEach((cross) => {
      var i = _.indexOf(cross.loci, oldName, false);
      if(i)
        cross.loci[i] = newName;
    });

    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : {crosses:  old.crosses}});

    var toSet = {};
    toSet["plants."+inst.data.pi + ".loci."+inst.data.li +
      ".name"] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$set : toSet});
    //TODO Update the lists of Loci in crosses & Charts
  },
  "change select.loci-type" : (evt, inst) => {
    var toSet = {};
    toSet["plants."+inst.data.pi + ".loci."+inst.data.li +
      '.type'] = evt.target.value;

    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : toSet });

  },
  "change input.linkage-group" : (evt, inst) => {
    var toSet = { };
    toSet["plants."+inst.data.pi + ".loci."+inst.data.li +
      '.linkage_group'] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : toSet });

  },
  "change input.position" : (evt, inst) => {
    var toSet = { };
    toSet["plants."+inst.data.pi + ".loci."+inst.data.li +
      '.position'] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : toSet });

  }


});

Template.loci.helpers({
  "linkageGroupMax" : function () {
    var schemeId = FlowRouter.getParam('id');
    var scheme = Schemes.findOne({_id: schemeId}) || false;

    if(scheme)
      return scheme.species.chromosome_lengths.length;
    else
      return "?";
  },
  "positionMax" : function (group) {
    var schemeId = FlowRouter.getParam('id');
    var scheme = Schemes.findOne({_id: schemeId}) || false;

    if(scheme && group)
      return scheme.species.chromosome_lengths[group-1];
    else
      return "?"

  }

});

Template.crossLoci.events({
  "click button.delete-loci" : function (evt, inst) {

    var schemeId = FlowRouter.getParam('id');
    var toSet = { };
    toSet["crosses."+this.ci + ".loci"] = this.loci;
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$pull: toSet});


  },


});


Template.chart.events({
  "change select.chart-type" : function (evt, inst) {

    toSet = {};
    toSet["outputs."+ this.chi + ".type"] = evt.target.value;

    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : toSet});

  },
  "change input.chart-custom" : function (evt, inst) {
    toSet = {};
    toSet["outputs."+ this.chi + ".data"] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : toSet});
  },
 "click button.chart-delete" : function (evt, inst) {

    toDel = {};
    toDel["outputs."+inst.data.chi] = "";
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$unset: toDel});
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$pull: {"outputs" : null }});

  },


});
