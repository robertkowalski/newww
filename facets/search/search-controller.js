var elasticsearch = require('elasticsearch'), 
    config = require('../../config'),
    client = new elasticsearch.Client({
      host: config.search.url
    });

module.exports = function(request, reply){
  var page = parseInt(request.page || '0', 10); 
  client.search({
  fields : ['name', 'keywords','description','author','version', 'stars', 'dlScore', 'dlDay', 'dlWeek'],
  query :{ 
        "dis_max": {
        "tie_breaker": 0.7,
        "boost": 1.2,
        "queries": [
          {
            "function_score": {
              "query": {
                "match": {
                  "name.untouched": request.q
                }
              },
              "boost_factor": 100
            }
          },
          {
            "bool": {
              "should": [
                {"match_phrase": {"name": request.q} },
                {"match_phrase": {"keywords": request.q} },
                {"match_phrase": {"description": request.q} },
                {"match_phrase": {"readme": request.q} }
              ],
              "minimum_should_match": 1,
              "boost": 50
            }
          },
        {
            "function_score": {
              "query": {
                "multi_match": {
                  "query": request.q,
                  "fields": ["name^4", "keywords", "description", "readme"]
                }
              },
              "functions": [
                {
                  "script_score": {
                    "script": "(doc['dlScore'].isEmpty() ? 0 : doc['dlScore'].value)"
                  }
                },
                {
                  "script_score": {
                    "script": "doc['stars'].isEmpty() ? 0 : doc['stars'].value"
                  }
                }
              ],
              "score_mode": "sum",
              "boost_mode": "multiply"
            }
          }
        ]
      }
  }}, function (error, response){
   if (error) { 
      reply("error with elastic search"); //change this later, when I get the thign workign 
    return;
    }
    console.log(response.hits);
    reply.view("index", {
        hits: response.hits
      });  
});
}
