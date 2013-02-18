var request = require('superagent');
request.get('http://search.twitter.com/search.json')
    .send({ q: 'つらみ' })
    .end(function (res) { console.log(res.body); });
