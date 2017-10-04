// Modules
const http = require('http')
const url = require('url')
const urlsafeBase64 = require('urlsafe-base64')
const Storage = require('node-storage')
const webpush = require('web-push')
const vapid = require('./vapid.json')

// Configure keys
webpush.setVapidDetails(
  'mailto:ray@stackacademy.tv',
  vapid.publicKey,
  vapid.privateKey
)

// Create store
const store = new Storage('./db')
let subscriptions = store.get('subscriptions') || []

// Create HTTP Server
http.createServer((request, response) => {

  // Enable CORS
  response.setHeader('Access-Control-Allow-Origin', '*')

  // Subscribe
  if (request.method === 'POST' && request.url.match(/^\/subscribe\/?/)) {

    // Get POST body
    let body = []

    // Read stream
    request.on('data', chunk => body.push(chunk)).on('end', () => {

      // Parse subscription data
      subscriptions.push(JSON.parse(body.toString()))

      // Persist subscriptions
      store.put('subscriptions', subscriptions)

      // Respond
      response.end('Succesfully Subscribed')
    })

    // Public Key
  } else if (request.url.match(/^\/key\/?/)) {

    // Create URL safe vapid public key
    let decodedVapidPublicKey = urlsafeBase64.decode(vapid.publicKey)
    response.end(decodedVapidPublicKey)

    // Unsubscribe
  } else if (request.url.match(/^\/push\/?/)) {

    // Collect all notification promises
    let notifications = []

    // Send the notification to each of the registered recipients
    subscriptions.forEach( (subscription, i) => {

      // Send notification
      notifications.push(
        
        webpush.sendNotification(subscription, 'Your Push Payload Text')
          .catch( status => {

            // Check for "410 - Gone" status code
            if (status.statusCode === 410) subscriptions.splice( i, 1 )

            // Return a value to the promise
            return 'deleted'
          })
      )
    })

    // Handle notifications sent
    Promise.all(notifications).then( () => {
      
      // Persist 'cleaned' subscriptions
      store.put('subscriptions', subscriptions)

      // Respond
      response.end('Push Notifications sent')
    })

    // Not Found
  } else {

    response.status = 404
    response.end('Unknown Request')
  }

  // Start server
}).listen(3333)
