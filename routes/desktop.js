
/*
 * GET users listing.
 */

exports.pastSession = function(req, res, params){
  	res.render('pastSession', {session: params.session});
};