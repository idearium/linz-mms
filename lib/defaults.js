
// define all of the defaults for Linz, these can be overriden
var defaults = module.exports = {

	'user model': 'user',
	'username key': 'username',
	'password key': 'password',
	'verify password': function (first, second) {

		return (first === second);

	}

};