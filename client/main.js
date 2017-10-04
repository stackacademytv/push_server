// Push server url
const pushURL = 'http://localhost:3333'

// Ref service worker registration
let swReg = null

// Register the SW
navigator.serviceWorker.register('sw.js').then(registration => {

  // Set SW Registration reference
  swReg = registration

  // Check if a subscribsion exists and if so, update the UI
  swReg.pushManager.getSubscription().then(setSubscribedStatus)

  // Catch errors
}).catch(console.error)


// Get Application Server Key
const getApplicationServerKey = () => {

  // Get Vapid Public Key from Push Server
  return fetch(`${pushURL}/key`)

    // Return response body as buffer
    .then(res => res.arrayBuffer())

    // Return a new Uint8Array from the pub key
    .then(key => new Uint8Array(key))
}


// Create push subscription
const subscribe = () => {

  // Check registration is available
  if (!swReg) return console.error('Cannot subscribe. Service Worker Registration not found')

  // Get application server key
  getApplicationServerKey()
    .then(applicationServerKey => {

      // Subscribe
      return swReg.pushManager
        .subscribe({ userVisibleOnly: true, applicationServerKey })
        .then(res => res.toJSON())
        .then(subscription => {

          // Register subscription with push server
          fetch(`${pushURL}/subscribe`, {
              method: 'post',
              body: JSON.stringify(subscription)

          // Successfully registered with push server, update UI
          }).then(setSubscribedStatus)

          // Failed to register with push server, so unsubscribe again
          .catch(unsubscribe)
        })

    }).catch(console.error)
}


// Unsubscribe from push notifications
const unsubscribe = () => {

  // Unsubscribe and update UI status
  swReg.pushManager.getSubscription().then( subscription => {
    subscription.unsubscribe().then( () => {
      setSubscribedStatus(false)
    })
  })
}


// Update UI for subscription status
const setSubscribedStatus = (state) => {

  if (state) {
    document.getElementById('subscribe').className = 'hidden'
    document.getElementById('unsubscribe').className = ''
  } else {
    document.getElementById('subscribe').className = ''
    document.getElementById('unsubscribe').className = 'hidden'
  }
}
