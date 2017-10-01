
// Ref service worker registration
let swReg = null

// Register the SW
navigator.serviceWorker.register('sw.js').then((registration) => {

  // Set SW Registration reference
  swReg = registration

// Catch errors
}).catch(console.error)


// Subscribe for push notifications
const subscribe = () => {

  // Check registration is available
  if (!swReg) return console.error('Cannot subscribe. Service Worker Registration not found')

  // Subscribe
  swReg.pushManager.getSubscription().then((sub) => {

    // If subscription found, set status & return
    if (sub) {

      // Update suibscription status
      setSunscribedStatus(true)

      // Return subscription to promise
      return sub;
    }

    // Get Vapid Public Key from Push Server
    fetch('http://localhost:3333/key')

      // Return response body as buffer
      .then( res => res.arrayBuffer() )

      // Attempt the subscription
      .then((publicKey) => {

        // Create an  application server key
        let applicationServerKey = new Uint8Array(publicKey)

        // Subscribe
        swReg.pushManager.getSubscription().then( (sub) => {

          // Subscribe
          return swReg.pushManager.subscribe({
            userVisibleOnly: true, applicationServerKey
          })

        }).then(sub => sub.toJSON())
          .then(console.log)
          .catch(console.error)

      }).catch(console.error)
  })

}

// Unsubscribe from push notifications
const unsubscribe = () => {

  // Update subscription status
  setSunscribedStatus(false)
}

// Update UI for subscription status
const setSunscribedStatus = (status) => {

  if (status) {
    $('#subscribe').addClass('hidden')
    $('#unsubscribe').removeClass('hidden')
  } else {
    $('#subscribe').removeClass('hidden')
    $('#unsubscribe').addClass('hidden')
  }
}

// Ready
$(() => {
  $('#subscribe').click(subscribe)
  $('#unsubscribe').click(unsubscribe)
})
