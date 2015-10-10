this.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open("1").then(function(cache) {
      var files = ["index.html", "main.js"]
      for(var file of files) {
        return cache.add(file) //cache.addall in Chrome 46+
      }
    })
  )
})

this.addEventListener("fetch", function(event) {
  event.respondWith(
    fetch(event.request).then(function(response) {
      return caches.open("1").then(function(cache) {
        return cache.put(event.request, response.clone()).then(function() {
          return response
        })
      })
    }).catch(function() {
      return caches.match(event.request)
    })
  )
})
