Picker.route('/api/:_id' , (params, req, res, next) => {
  var scheme = Schemes.findOne(params._id);
  res.end(JSON.stringify(scheme));
});
