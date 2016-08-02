var express = require('express');
var config = require('../config');
var https = require('https');
var http = require('http');

var router = express.Router();

function getHttp(getOptions, callback) { //simple get http with json data
  console.log('getHttp:',getOptions);
  getOptions.method='GET';
  getOptions.headers={ 'Content-Type': 'application/json' };
  var get_req = http.request(getOptions, function(res){
    var data = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk){
      data += chunk;
    });
    res.on('end', function() {
      try { //in case the website returns HTML stuff.
        var parsedData=JSON.parse(data);
      } catch (e) {
        console.error(e);
        parsedData={};
      };
      callback(parsedData);
    })
    res.on('error', function(err){
      console.error('error de getHttp');
      callback(null);
    });
  });
  get_req.end();
};

function getHttps(getOptions, callback) { //simple get https with json data
  console.log('getHttps:',getOptions);
  getOptions.method='GET';
  getOptions.headers={ 'Content-Type': 'application/json' };
  var get_req = https.request(getOptions, function(res){
    var data = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk){
      data += chunk;
    });
    res.on('end', function() {
      try { //in case the website returns HTML stuff.
        var parsedData=JSON.parse(data);
      } catch (e) {
        console.error(e);
        parsedData={};
      };
      callback(parsedData);
    })
    res.on('error', function(err){
      console.error('error de getHttps');
      callback(null);
    });
  });
  get_req.end();
};


router.get('/bcgetnewaddress',function(req,res){
  console.log('*** /api/bcgetnewaddress');
  var options = {
    host: 'api.blockchain.info',
    path: '/v2/receive?xpub='+config.blockchain_opts.xpub+
          '&callback='+encodeURIComponent(config.blockchain_opts.callbackUrl+'/api/bccallback?secret='+config.blockchain_opts.secret)+
          '&key='+config.blockchain_opts.apikey
  };
  getHttps(options,function(jsondata){
    res.json(jsondata);
  });
});

router.get('/bccallback',function(req,res){
  console.log('*** /api/bccallback',req.query);
  if (req.query.secret!=config.blockchain_opts.secret) {
    console.error('BAD callback secret:',req.query.secret);
  } else {
    console.log('Good callback secret!')
  };
  res.send('*ok*'); //necesario sino se acumulan los callbacks en blockchain.info
});

router.get('/bcdebugcallbacks',function(req,res){
  console.log('*** /api/bcdebugcallback');
  var options = {
    host: 'api.blockchain.info',
    path: '/v2/receive/callback_log'+
      '?callback='+encodeURIComponent(config.blockchain_opts.callbackUrl+'/api/bccallback')+
      '&key='+encodeURIComponent(config.blockchain_opts.apikey)
  };
  getHttps(options,function(jsondata){
    res.json(jsondata);
  });
});

module.exports = router;
