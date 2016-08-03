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

router.get('/mxnbtcrate',function(req,res){
  //obtener el tipo de cambio de bitcoins - pesos en este momento
  var options = {
    host : 'api.bitcoinaverage.com',
    path : '/ticker/global/all'
  };
  getHttps(options,function(jsondata){
    res.send({btcrate: jsondata['MXN'].ask}); //puede ser .bid .last
  });
});

router.get('/bcgetnewaddress',function(req,res){
  //obtener una nueva direccion para enviar pago
  //todo: usar arrays para poder tener varios pagos pendientes simultaneamente (o base de datos)
  console.log('*** /api/bcgetnewaddress');
  var options = {
    host: 'api.blockchain.info',
    path: '/v2/receive?xpub='+config.blockchain_opts.xpub+
          '&callback='+encodeURIComponent(config.blockchain_opts.callbackUrl+'/api/bccallback?secret='+config.blockchain_opts.secret+'&sessionid='+req.session.id)+
          '&key='+config.blockchain_opts.apikey
  };
  getHttps(options,function(jsondata){
    req.session.satoshis=0;
    req.session.btcaddress=jsondata.address;
    req.session.save();
    res.send({address: jsondata.address});
  });
});

router.get('/bccallback',function(req,res){
  //blockchain.info hace el callback a esta direccion indicando que ya esta el pago en la red
  //se usa el session del usuario que efectua el pago, para actualizarlo
  console.log('*** /api/bccallback',req.query);
  if (req.query.secret!=config.blockchain_opts.secret) {
    console.error('BAD callback secret:',req.query.secret);
    res.end();
  } else {
    global.sessionStore.get(req.query.sessionid,function(err,session){
      if (err) {
        console.error('global.sessionStore.get error:',err)
      };
      if (typeof session=='undefined') {
        console.error('session not found, has probably expired');
        res.send('*ok*'); //mandar de todos modos
      } else {
        session.satoshis=req.query.value;
        session.address=req.query.address;
        session.confirmations=req.query.confirmations;
        session.transaction_hash=req.query.transaction_hash;
        global.sessionStore.set(req.query.sessionid,session,function(err){
          if (err) {
            console.err('global.sessionStore.save error:',err);
          }
          res.send('*ok*'); //necesario sino se acumulan los callbacks en blockchain.info
        });
      }
    });
  };
});

router.get ('/bcconfirm',function(req,res){
  //checar si el pago esta confirmado
  console.log('*** /api/bcconfirm');
  var result=false;
  if (req.session.satoshis>0) {
    result=true;
    req.session.satoshis=0;
    req.session.address='';
    req.session.confirmations=-1;
  } else {
    result=false;
  }
  res.send({result:result,session: req.session});
});

router.get('/bcdebugcallbacks',function(req,res){
  //utileria para checar si hay callbacks atorados en blockchain.info
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
