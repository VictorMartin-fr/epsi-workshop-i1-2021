const requestVault = function(mode, msg){
  return new Promise(function(resolve, reject){
  const http = require('http');
  var options
    switch(mode){
      case 'encrypt': 
        postData = JSON.stringify({
          'plaintext': Buffer.from(msg).toString('base64')
        });
        options = {
          hostname: '10.0.2.40',
          port: 8200,
          path: '/v1/transit/encrypt/orders',
          method: 'POST',
          headers: {
            "X-Vault-Token": "s.aeKGwZpLRoatTonWkmNja0AX",
            "Content-Length": Buffer.byteLength(postData),
            "Content-Type": "text/plain"
          }
        };
        break;
      case 'decrypt':
        postData = JSON.stringify({
          'ciphertext': msg
        });
        options = {
          hostname: '10.0.2.40',
          port: 8200,
          path: '/v1/transit/decrypt/orders',
          method: 'POST',
          headers: {
            "X-Vault-Token": "s.aeKGwZpLRoatTonWkmNja0AX",
            "Content-Length": Buffer.byteLength(postData),
            "Content-Type": "text/plain"
          }
        };
        break;
      default:
        throw 'Mode must not be equal to "encrypt" or decrypt'
    }
    var result = null
    const req = http.request(options, (res) => {
      //console.log(`STATUS: ${res.statusCode}`);
      //console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        //console.log(`BODY: ${chunk}`);
        result = chunk;
      });
      res.on('end', () => {
        //console.log('No more data in response.');
        resolve(result);
      });
    });
    
    req.on('error', (e) => {
      //console.error(`problem with request: ${e.message}`);
      reject(e)
    });
  
    // Write data to request body
    req.write(postData);
    req.end();
  })
  
}

const useVault = async function(mode,msg){
  var res = undefined
    res = await requestVault(mode,msg).then(function(result){
        return JSON.parse(result)
    })
    if('decrypt' === mode){
      return Buffer.from(res.data.plaintext, 'base64').toString();
    }else{
      return res.data.ciphertext
    }
  
}

//Exemple to use vault
/*const main = async function(){
  var test = await useVault('encrypt','hello')
  console.log(test)

  var test1 = await useVault('decrypt','vault:v1:FCQ/byaIsutumZ+sWrnQ0s6s5EAAJ7MDrcG/JsfwgnNT')
  console.log(test1)
}

main()*/
