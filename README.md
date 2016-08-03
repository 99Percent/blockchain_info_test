# blockchain_info_test
Testing del api de blockchain.info para generar y recibir pagos en bitcoin

### Requisitos

Node JS, npm etc
Wallet de Blockchain.info
localtunnnel con ruby (solo para modo desarollo)

### config

Es necesario tener un archivo config.js en el mismo directorio de app.js así:

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
Una vez puesto en producción (copiar manualmente config.js!), cambiar el callbackUrl para que sea directo al url del servidor de producción.
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

### Uso de Express Session

Para guardar el dato de la direccion de bitcoin para recibir el pago usamos express session con MemomryStore. Esto no es recomendable en modo de producción, y es mejor usar una base de datos como mongodb o mysql para la session o las formas de pago


### Funcionalidad

1. Primero obtenemos una wallet con blockchain.info
2. Solicitamos la api key. Tardan uno o dos días en aprobar la solicitud y mandarla por correo.
3. Para hacer cobros, pedimos con la api una nueva direccion de bitcoin que está relacionada con la cartera de blockchain.info. Esta dirección es única y se usa solamente una vez. 
4. El cliente manda los fondos a esta dirección.
5. Blockchain.info nos manda un callback indicando que la dirección ya tiene fondos.
6. En el frontend, presentamos al cliente un código QR con los datos para hacer el pago. 
7. Hacemos un polling (idealmente sería con un websocket), a nuestro api para checar si blockchain ya hio el callback.
8. Tambien se puede ver publicamente la direccion con un explorador de bloques de bitcoin como el mismo blockchain.info o blockexplorer.com
9. Cerramos el código QR, y confirmamos con el cliente los fondos recibidos.