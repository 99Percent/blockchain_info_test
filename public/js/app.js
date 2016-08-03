$("#pagar").click(function() {
  console.log('pagar button clicked!');
  console.log('importe a pagar:',$("[name=importe]").val());
  var qrcode = new QRCode("qrcode");
  qrcode.makeCode("sometext243ee");
  $("#paymentinfo").append('sometext234 goes here');
  $(function(){
    $('#timeleft').countdowntimer({
      minutes: 1,
      timeUp: timeIsUp,
    });
  })
})

function timeIsUp(){
  console.log('time to pay has expired!!');
};
