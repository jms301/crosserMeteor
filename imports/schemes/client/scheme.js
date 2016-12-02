//import { Template } from 'meteor/templating';
//import { ReactiveVar } from 'meteor/reactive-var';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import {default_resolution} from './default.js';
import {default_species} from './default.js';
import {CrossTree} from './crosstree.js';
import { EJSON } from 'meteor/ejson';


var CTree = {};


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

Template.schemes.events({
  "click button#create-scheme" : function (evt,inst) {
    //TODO run this on server.
    Schemes.insert({
      userId : Meteor.userId(),
      version : 1,
      system : {
        convergence_chunk_size : 1000,
        convergence_fewest_plants : 10,
        convergence_tolerance : 0.5
      },
      plants : [],
      crosses : [],
      outputs : []
    });
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
    return Schemes.findOne({_id: schemeId}) || {};
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
  //Config:
  "change select#species" : (evt, inst) => {

    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : {species : default_species[evt.target.value]}});

  },
  "change input#scheme-name" : (evt, inst) => {
    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : {name : evt.target.value }});
  },
  "change input#chunk-size" : (evt, inst) => {
    var toSet = {};
    toSet['system.convergence_chunk_size'] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : toSet});
  },
  "change input#tolerance" : (evt, inst) => {
    var toSet = {};
    toSet['system.convergence_tolerance'] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : toSet});
  },
  "change input#min-plants" : (evt, inst) => {
    var toSet = {};
    toSet['system.convergence_fewest_plants'] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : toSet});
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
    //TODO Make a modal listing the history and allow the creation of a new version from that history.
    Meteor.call('revertScheme', FlowRouter.getParam('id'));

  },
  "click button#process" : function (evt, inst) {

    if(confirm("Are you sure you want to start processing your cross?")){
      Meteor.call('processScheme', FlowRouter.getParam('id'),
        (err, calcId)  => {
          FlowRouter.go("calculation", {id: calcId});
          //console.log(calcId);
        }
      );

    }
  }
});

Template.simulationResolution.onRendered(() => {
  this.$('.tooltipped').tooltip();
});

Template.simulationResolution.helpers({
  isSelected : (res, chunkSize, minPlants, tolerance) => {

    return (chunkSize == default_resolution[res].convergence_chunk_size &&
     minPlants == default_resolution[res].convergence_fewest_plants &&
     tolerance == default_resolution[res].convergence_tolerance) ? "selected" : "";

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

    //remove the old cross from any other cross parents
    old.crosses.forEach((cross) => {
      if(cross.left == oldName)
        cross.left = "";
      if(cross.right == oldName)
        cross.right = "";
    });

    //remove the old cross from outputs data string.
    old.outputs.forEach ((output) => {
      output.data = output.data.replace('"' + oldName + '"', '""');
    });

    //remove the old cross from cross array.
    old.crosses.splice(this.ci, 1);

    //update cross array
    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : {crosses:  old.crosses}});

    //update outputs array
    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : {outputs:  old.outputs}});
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


    for(i=0; i < old.crosses.length; i++) {
      if(old.crosses[i].name == newName) {
        evt.target.value = oldName;
        return;
      }
    }

    for(i=0; i < old.plants.length; i++) {
      if(old.plants[i].name == newName) {
        evt.target.value = oldName;
        return;
      }
    }

    // Replace the name of the cross
    old.crosses[inst.data.ci].name = newName;

    if(oldName != "") {
      //update the old cross in outputs data string.
      old.outputs.forEach((output) => {
        output.data = output.data.replace('"' + oldName + '"',
        '"' + newName + '"');
      });

      //Update the old cross in cross parents
      old.crosses.forEach((cross) => {
        if(cross.left == oldName) {
          cross.left = newName;
        }
        if(cross.right == oldName) {
          cross.right = newName;
        }
      });
    }


    //update cross array
    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : {crosses:  old.crosses}});

    //update outputs array
    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : {outputs:  old.outputs}});
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
    var scheme = Schemes.findOne({_id: FlowRouter.getParam('id')});
    var toRet = _.reduce(scheme.crosses, function (arry, obj) {
      if (obj.name) {
        arry.push(obj.name);
      }
      return arry;
    }, []);


    if(!cross || !cross.name) {
      //current cross can't be in the tree so it can have parents.
      return toRet;
    }

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

    for(i=0; i < old.crosses.length; i++) {
      if(old.crosses[i].name == newName) {
        evt.target.value = oldName;
        return;
      }
    }

    for(i=0; i < old.plants.length; i++) {
      if(old.plants[i].name == newName) {
        evt.target.value = oldName;
        return;
      }
    }

    if(oldName != "") {
      //update the old plant in outputs data string.
      old.outputs.forEach((output) => {
        output.data = output.data.replace('"' + oldName + '"',
        '"' + newName + '"');
      });

      //Update the old plant in cross parents
      old.crosses.forEach((cross) => {
        if(cross.left == oldName)
          cross.left = newName;
        if(cross.right == oldName)
          cross.right = newName;
      });
    }

    //update cross array
    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : {crosses:  old.crosses}});

    //update outputs array
    Schemes.update({_id: FlowRouter.getParam('id')},
     {$set : {outputs:  old.outputs}});


    var toSet = {};
    toSet["plants."+inst.data.pi + ".name"] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$set : toSet});

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

    //Don't allow duplicate loci names
    for(i=0; i < old.plants.length; i++) {
      for(j=0; j < old.plants[i].loci.length; j++) {
        if(old.plants[i].loci[j].name == newName) {
          evt.target.value = oldName;
          return;
        }
      }
    }

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

    if(scheme && scheme.species)
      return scheme.species.chromosome_lengths.length;
    else
      return "?";
  },
  "positionMax" : function (group) {
    var schemeId = FlowRouter.getParam('id');
    var scheme = Schemes.findOne({_id: schemeId}) || false;

    if(scheme && group && scheme.species)
      return scheme.species.chromosome_lengths[group-1];
    else
      return "?"
  }

});

Template.crossLoci.events({
  "click i.delete-loci" : function (evt, inst) {

    var schemeId = FlowRouter.getParam('id');
    var toSet = { };
    toSet["crosses."+this.ci + ".loci"] = this.loci;
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$pull: toSet});


  },


});

Template.chart.helpers({
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
  "change select.mean-cross-data" : function (evt, inst)  {
    var data = (inst.$("select.mean-cross-data").val() || []);
    var toSet = {};
    toSet["outputs." + this.chi + ".data"] = EJSON.stringify(
      {crosses : data});
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$set: toSet });
  },
  "change select.loci-composition" : function (evt, inst)  {
    var toSet = {};
    toSet["outputs." + this.chi + ".data"] = EJSON.stringify(
      {cross : evt.target.value});
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$set: toSet });
  },
  "change select.proportion-distribution-donor" : function (evt, inst) {
    var cross = (inst.$("select.proportion-distribution-cross").val());
    var toSet = {};
    toSet["outputs." + this.chi + ".data"] = EJSON.stringify(
      {donor : evt.target.value, cross : cross});
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$set: toSet });
  },
  "change select.proportion-distribution-cross" : function (evt, inst) {
    var donor = (inst.$("select.proportion-distribution-donor").val());
    var toSet = {};
    toSet["outputs." + this.chi + ".data"] = EJSON.stringify(
      {cross : evt.target.value, donor : donor});
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$set: toSet });
  },
  "click button.success-table-add" : function (evt, inst) {
    this.data = EJSON.parse(this.chart.data);

    // Deal with case of a new success table
    if(!('require' in this.data)) {
      this.data = {require: []};
    }

    this.data.require.push( { cross : "", confidence: 0.95, quantity : 5});
    var toSet = {};
    toSet["outputs." + this.chi + ".data"] = EJSON.stringify(this.data);
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$set: toSet });
  },

});

Template.successTable.helpers({
  "all_crosses" : function () {
    var scheme = Schemes.findOne({_id: FlowRouter.getParam('id')}) || {};
    return _.map(scheme.crosses, (cross) => { return cross.name });
  },
});

Template.successTable.events({
  "change select.stable-cross" : function (evt, inst) {
    this.data.require[this.si].cross = evt.target.value;
    var toSet = {};
    toSet["outputs." + this.chi + ".data"] = EJSON.stringify(this.data);
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$set: toSet });
  },
  "change input.stable-quantity" : function (evt, inst) {
    this.data.require[this.si].quantity = evt.target.value;
    var toSet = {};
    toSet["outputs." + this.chi + ".data"] = EJSON.stringify(this.data);
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$set: toSet });
  },
  "change input.stable-confidence" : function (evt, inst) {
    this.data.require[this.si].confidence = evt.target.value;
    var toSet = {};
    toSet["outputs." + this.chi + ".data"] = EJSON.stringify(this.data);
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$set: toSet });
  },
  "click button.stable-delete" : function (evt, inst) {
    this.data.require.splice(this.si, 1);
    var toSet = {};
    toSet["outputs." + this.chi + ".data"] = EJSON.stringify(this.data);
    Schemes.update({_id: FlowRouter.getParam('id')},
      {$set: toSet });
  },
});
