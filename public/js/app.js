var btcaddress, btcrate, pagado=0, tx='', bcresult=false;

$("#pagar").click(function() {
  console.log('importe a pagar:',$("[name=importe]").val());

  $("#qrcode").empty();
  $("#paymentinfo").empty();
  $("#timeleft").show();

  $.getJSON('api/mxnbtcrate',function(data){
     btcrate=data.btcrate;
    $.getJSON('api/bcgetnewaddress',function(data){
      btcaddress=data.address;
      console.log('new btcaddress=',btcaddress)
      var amount=($("[name=importe]").val()/btcrate).toFixed(8);
      //BIP 021 https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki
      var paymentinfo='bitcoin:'+btcaddress+'?amount='+amount+'&label=ChelaJS'
      var qrcode = new QRCode("qrcode");
      qrcode.makeCode(paymentinfo);
      $("#paymentinfo").append(paymentinfo);
      $(function(){
        $('#timeleft').countdowntimer({
           minutes: 1, //recomendable dejar entre 5 a 15 minutos
        });
      });
      doPoll();
    });
  });
});

function doPoll(){
  //TODO: mas elegante y correcto sería usar una websocket
  console.log('polling..['+$("#timeleft").text()+'] bcresult='+bcresult);
  $.getJSON('api/bcconfirm',function(data){
    bcresult=data.result;
    pagado=data.paid;
    tx=data.tx;
    if (!bcresult && !($("#timeleft").text()=='00:00')) {
      setTimeout(doPoll,10000)
    } else {
      $("#qrcode").empty();
      $("#paymentinfo").empty();
      $("#timeleft").hide();
      if (bcresult) {
        //falta checar si se pago el importe correcto con el dato de pagado
        $("#paymentinfo").append('Pagado, gracias! tx='+tx);
      } else {
        $("#paymentinfo").append('No se recibió el pago a tiempo. Vuelva a intentar.');
      }
    }
  });
};
