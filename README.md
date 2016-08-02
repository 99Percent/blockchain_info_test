# blockchain_info_test
Testing of blockchain info bitcoin address creation and payment

### Requisitos

Node JS, npm etc
localtunnnel con ruby (para modo desarollo solamente)

### config

Es necesario tener un archivo config.js en el mismo directorio de app.js que tenga el siguiente contenido:

```javascript

var config = { 
  blockchain_opts : {
    xpub : "[xpub de la cuenta de bitcoin en blockchain.info]",
    apikey : "[llave api que te proporciona blockchain.info (soliticitarla en  ] ",
    callbackUrl : "https://[subddomain escogido para localtunnel].localtunnel.me",
    secret : "[cualquier texto al azar]"
  }
};

module.exports = config;

```

Este archivo obviamente contiene datos sensibles por lo tanto esta en el .gitignore.
Una vez puesto en producción, cambiar el callbackUrl para que sea directo al url del servidor de producción.
xpub: es la llave pública de la wallet, y lo puedes obtener en el portal de blockchain.info
apikey: Lo puedes solicitar a blockchain.info una vez dada de alta la cuenta de bitcoin
secret: sirve para filtrar callbacks falsos y puede ser cualquier texto al azar.

### Webhook para callback.

Para el callback de blockchain a localhost (en modo desarollo) es necesario tener corriendo localtunnel. Puesta la pagina web al internet, ya no será necesario esto.

```
npm install -g localtunnel
```

debido a que localtunnel tiene un bug (https://github.com/localtunnel/localtunnel/issues/81) que lo hace inestable es necesario instalar un script en ruby para que lo reinicie a cada rato:

```
ruby localtunnel.rb --port 3000 --subdomain [cualquier nombre de subdominio que desees]
```