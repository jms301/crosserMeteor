export var CrossTree = function CrossTree(plants, crosses) {
  this._nodes = {};

  plants.forEach ((plant) => {
    if(plant.name)
      this._nodes[plant.name] = new Plant(plant.name, plant.loci);
  });

  crosses.forEach ((cross) => {
    if(cross.name)
      this._nodes[cross.name] = new Cross(cross.name);
  });

  crosses.forEach((cross) => {
    if(cross.name) {

      if (cross.left && this._nodes[cross.left]) {
        this._nodes[cross.name].lParent = this._nodes[cross.left];
        this._nodes[cross.left].children.push(this._nodes[cross.name]);
      }
      if (cross.right && this._nodes[cross.right]) {
        this._nodes[cross.name].rParent = this._nodes[cross.right];
        this._nodes[cross.right].children.push(this._nodes[cross.name]);
      }
    }
  });

};


CrossTree.prototype.getDescendants = function (cross) {
  var loopWarning = 0;

  var toRet = [];
  var toVisit = [];
  toRet.push(cross.name);


  toVisit = toVisit.concat(this._nodes[cross.name].children);

  while(toVisit.length > 0) {
    item = toVisit.pop();
    toRet.push(item.name);
    toVisit = toVisit.concat(item.children);

    loopWarning++;
    if(loopWarning > 1000) {
      console.log("loop in cross tree!");
      break;
    }
  }

  return toRet;
};

CrossTree.prototype.getAnscestors = function (cross) {

  var loopWarning = 0;
  var toRet = [];
  var toVisit = [];

  if(cross && cross.name)
  {
    toVisit.push(this._nodes[cross.name]);
  }

  while(toVisit.length > 0) {
    item = toVisit.pop();
    var itemNode = this._nodes[item.name];

    if(item instanceof Plant) {
      //We are at a parent node.
      toRet.push(item.name);
    } else if(item instanceof Cross) {
      //Cross node, keep going up.
      if(item.rParent) {
        toVisit.push(item.rParent);
      }
      if(item.lParent) {
        toVisit.push(item.lParent);
      }
    }

    loopWarning++;
    if(loopWarning > 1000) {
      console.log("loop in cross tree!");
      break;
    }
  }

  return toRet;

};

CrossTree.prototype.availableLoci = function (cross) {
  var toRet = [];
  var plants = this.getAnscestors(cross);
  plants = _.uniq(plants);
  plants.forEach((plant) =>  {
    toRet = toRet.concat(this._nodes[plant].loci);
  });
  return toRet;
}

function Cross(name) {
  this.name = name;
  this.lParent = null;
  this.rParent = null;
  this.children = [];
};

function Plant(name, loci) {
  this.name = name;
  this.children = [];
  this.loci = loci;
};
