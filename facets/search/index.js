var path = require('path'), 
	  internals = {};

exports.register = function Search (facet, options, next){
	facet.views({	
		engines: {hbs: 'handlebars'},
		path: path.resolve(__dirname, 'templates')
	}); 
	
	facet.route({
		path: "/search", 
		method: "GET", 
    handler: require('./search-controller')
}); 
		next(); 
} 
	
