// Modules
const webpush = require('web-push')
const urlsafeBase64 = require('urlsafe-base64')
const Storage = require('node-storage')
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

// Store new subscription
module.exports.addSubscription = (subscription) => {

  // Add to subscriptions array
  subscriptions.push(subscription)

  // Persist subscriptions
  store.put('subscriptions', subscriptions)
}


// Create URL safe vapid public key
module.exports.getKey = () => urlsafeBase64.decode( vapid.publicKey )


// Send notifications to all registered subscriptions
module.exports.send = (message) => {

    // Collect all notification promises
    let notifications = []

    // Send the notification to each of the registered recipients
    subscriptions.forEach( (subscription, i) => {

      // Send notification
      let p = webpush.sendNotification(subscription, message)
        .catch( status => {

          // Check for "410 - Gone" status code
          if (status.statusCode === 410) subscriptions[i]['delete'] = true

          // Return any value to the promise
          return null
        })

      // Add notification promise to notifications array
      notifications.push(p)
    })

    // Handle notifications sent
    Promise.all(notifications).then( () => {

      // Clean subscriptions marked for deletion
      subscriptions = subscriptions.filter( subscription => !subscription.delete )
      
      // Persist 'cleaned' subscriptions
      store.put('subscriptions', subscriptions)
    })
}
