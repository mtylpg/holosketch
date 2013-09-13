
/*
 * GET users listing.
 */

exports.view = function(req, res){
  res.render('mobile', {});
};

exports.create = function(req, res){
  res.render('create', {});
};

exports.loadSession = function(req, res, params){
  	res.render('loadSession', {sessions: params.sessions});
};