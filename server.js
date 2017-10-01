
// Modules
const http = require('http')
const urlsafeBase64 = require('urlsafe-base64')
const webpush = require('web-push')
const vapid = require('./vapid.json')

// Configure keys
webpush.setVapidDetails(
  'mailto:ray@stackacademy.tv',
  vapid.publicKey,
  vapid.privateKey
)

// Create HTTP Server
http.createServer( (request, response) => {

    // Enable CORS
    response.setHeader('Access-Control-Allow-Origin', '*')

    // Subscribe
    if ( request.url.match(/^\/subscribe\/?/) ) {

        // // Check for subscriptiion credentials
        // const pushSubscription = {
        //     endpoint: 'kjelkgjew',
        //     keys: { auth: 'eknmgeklg', p256dh: 'keknkgnmew' }
        // }

        response.end('subscribed')
        
    // Public Key
    } else if ( request.url.match(/^\/key\/?/) ) {

        // Create URL safe vapid public key
        let decodedVapidPublicKey = urlsafeBase64.decode(vapid.publicKey)
        response.end(decodedVapidPublicKey)
        
    // Unsubscribe
    } else if ( request.url.match(/^\/unsubscribe\/?/) ) {

        response.end('unsubscribed')
    
    // Not Found
    } else {
        response.status = 404
        response.end('Unknown Request')
    }

    
    // // POST Requests
    // if (method === 'POST') {

    //     let body = [];

    //     request
    //         .on( 'error', console.error )
    //         .on('data', body.push )
    //         .on('end', () => {

    //             // Prepare body
    //             body = Buffer.concat(body).toString()

    //             // 
    //             response.statusCode = 200
    //             response.end( 'POSTED' )

    //     });
    // }

// Start server
}).listen( 3333 )


