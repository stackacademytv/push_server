// Modules
const http = require('http')
const push = require('./push')

// Create HTTP Server
http.createServer((request, response) => {

  // Enable CORS
  response.setHeader('Access-Control-Allow-Origin', '*')

  // Subscribe
  if ( request.method === 'POST' && request.url.match(/^\/subscribe\/?/) ) {

    // Get POST body
    let body = []

    // Read stream
    request.on('data', chunk => body.push(chunk)).on('end', () => {

      // Parse subscription JSON
      let subscription = JSON.parse(body.toString())

      // Store subscription
      push.addSubscription( subscription )

      // Respond 200
      response.end()
    })

  // Public Key
  } else if ( request.url.match(/^\/key\/?/) ) {

    // Respond with public key
    response.end( push.getKey() )

  // Push notification
  } else if ( request.method === 'POST' && request.url.match(/^\/push\/?/) ) {

    // Get POST body
    let body = []

    // Read stream
    request.on('data', chunk => body.push(chunk)).on('end', () => {

      // Send notifications with POST body
      push.send( body.toString() )

      // Respond 200
      response.end()
    })

  // Not Found
  } else {

    response.status = 404
    response.end('Unknown Request')
  }

  // Start server
}).listen(3333)
