//import { Template } from 'meteor/templating';
//import { ReactiveVar } from 'meteor/reactive-var';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import {default_resolution} from './imports/default.js';
import {default_species} from './imports/default.js';
import {CrossTree} from './imports/crosstree.js';

var CTree = {};

Template.registerHelper("isSelected", (val, val2) => {
  if (val == val2)
    return "selected"
  return ""
});


Template.scheme.onCreated(function () {
  var self = this;
  self.autorun(function () {
    var schemeId = FlowRouter.getParam('schemeId');
    self.subscribe('scheme', schemeId);

    if(self.subscriptionsReady()) {
      scheme = Schemes.findOne({_id: schemeId});
      CTree = new CrossTree(scheme.plants, scheme.crosses);
    }
  });
});


Template.scheme.helpers({
  scheme: () => {
    var schemeId = FlowRouter.getParam('schemeId');
    var scheme = Schemes.findOne({_id: schemeId}) || {};
    return scheme;
  },
  selectedSpecies: (species, currSpecies) => {
    return species.name == currSpecies ? "selected" : "";

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

    Schemes.update({_id: FlowRouter.getParam('schemeId')},
     {$set : {species : default_species[evt.target.value]}});

    //TODO refresh loci settings

  },
  "change input#chunk-size" : (evt, inst) => {
    var toSet = {};
    toSet['system.convergence_chunk_size'] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
     {$set : toSet});
    resetSimulationRes();
  },
  "change input#tolerance" : (evt, inst) => {
    var toSet = {};
    toSet['system.convergence_tolerance'] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
     {$set : toSet});
    resetSimulationRes();
  },
  "change input#min-plants" : (evt, inst) => {
    var toSet = {};
    toSet['system.convergence_fewest_plants'] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
     {$set : toSet});
    resetSimulationRes();
  },
  //Plants:
  "click button#add-parent" : () => {
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
      {$push : {'plants': {'name':'', 'loci' : []}}});
  }
});

Template.simulationResolution.onRendered(() => {


});

Template.simulationResolution.events({
  "change select#resolution" : (evt, inst) => {
    if(evt.target.value == 'custom') {


    } else {
      values = default_resolution[evt.target.value];

      Schemes.update({_id: FlowRouter.getParam('schemeId')},
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
  "change select.add-loci" : function (evt, inst) {
    var schemeId = FlowRouter.getParam('schemeId');
    var toSet = { };
    toSet["crosses."+this.ci + ".loci"] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
      {$push: toSet});

    inst.$('select.add-loci').val("default");

  },
  "change input.cross-name": (evt, inst) =>
  {
    var toSet = {};
    toSet["crosses."+inst.data.ci + ".name"] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
     {$set : toSet });

  },
  "change select.lparent": (evt, inst) =>
  {
    var toSet = {};
    toSet["crosses."+inst.data.ci + ".left"] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
     {$set : toSet });
  },
  "change select.rparent": (evt, inst) =>
  {
    var toSet = {};
    toSet["crosses."+inst.data.ci + ".right"] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
     {$set : toSet });
  }
});

Template.cross.helpers({
  optionsPlantsForSelect: function () {
    var scheme = Schemes.findOne({_id: FlowRouter.getParam('schemeId')});
    return _.map(scheme.plants, (plant) => { return plant.name});

  },
  optionsCrossesForSelect: function (cross) {
    if(!cross || !cross.name) {
      return;
    }

    var scheme = Schemes.findOne({_id: FlowRouter.getParam('schemeId')});
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

    console.log(toRet);
    console.log(cross.loci);

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
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
      {$unset: toDel});
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
      {$pull: {"plants" : null }});

  },
  "click button.add-locus" : (evt, inst) => {
    toAdd = {};
    toAdd["plants."+inst.data.pi + ".loci"] = {
        "name" : "",
        "type" : "Marker",
        "location" : null,
        "linkage_group" : null};
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
      {$push : toAdd});
  },
  "change input.parent-name" : (evt, inst) => {
    var toSet = {};
    toSet["plants."+inst.data.pi + ".name"] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
      {$set : toSet});
    //TODO Update the lists of plants in crosses & Charts

  }
});

Template.loci.events({
  "click button.delete-loci" : (evt, inst) => {
    toDel = {};

    toDel["plants."+inst.data.pi + ".loci."+inst.data.li] = "";
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
      {$unset: toDel});

    toDel = {};
    toDel["plants."+inst.data.pi + ".loci"] = null;

    Schemes.update({_id: FlowRouter.getParam('schemeId')},
      {$pull: toDel});

  },
  "change input.loci-name" : (evt, inst) => {
    var toSet = {};
    toSet["plants."+inst.data.pi + ".loci."+inst.data.li +
      ".name"] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
      {$set : toSet});
    //TODO Update the lists of Loci in crosses & Charts
  },
  "change select.loci-type" : (evt, inst) => {
    var toSet = {};
    toSet["plants."+inst.data.pi + ".loci."+inst.data.li +
      '.type'] = evt.target.value;

    Schemes.update({_id: FlowRouter.getParam('schemeId')},
     {$set : toSet });

  },
  "change input.linkage-group" : (evt, inst) => {
    var toSet = { };
    toSet["plants."+inst.data.pi + ".loci."+inst.data.li +
      '.linkage_group'] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
     {$set : toSet });

  },
  "change input.position" : (evt, inst) => {
    var toSet = { };
    toSet["plants."+inst.data.pi + ".loci."+inst.data.li +
      '.position'] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
     {$set : toSet });

  }


});

Template.loci.helpers({
  "linkageGroupMax" : function () {
    var schemeId = FlowRouter.getParam('schemeId');
    var scheme = Schemes.findOne({_id: schemeId}) || false;

    if(scheme)
      return scheme.species.chromosome_lengths.length;
    else
      return "?";
  },
  "positionMax" : function (group) {
    var schemeId = FlowRouter.getParam('schemeId');
    var scheme = Schemes.findOne({_id: schemeId}) || false;

    if(scheme && group)
      return scheme.species.chromosome_lengths[group-1];
    else
      return "?"

  }

});

Template.crossLoci.events({
  "click button.delete-loci" : function (evt, inst) {

    var schemeId = FlowRouter.getParam('schemeId');
    var toSet = { };
    toSet["crosses."+this.ci + ".loci"] = this.loci;
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
      {$pull: toSet});


  },


});
