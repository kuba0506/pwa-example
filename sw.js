// SW Version
const version = 1.4;

// Static Cache - App Shell
const appAssets = [
    'offline.html',
    'index.html',
    'main.js',
    'images/flame.png',
    'images/logo.png',
    'images/sync.png',
    'vendor/bootstrap.min.css',
    'vendor/jquery.min.js'
];

// SW Install
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(`static-${version}`)
            .then(cache => cache.addAll(appAssets))
    );
});

// SW Activate
self.addEventListener('activate', e => {
    // Clean static cache
    let cleaned = caches.keys().then(keys => {
        keys.forEach(key => {
            if (key !== `static-${version}` && key.match(`static-`)) { 
                // delete other cache verion
                return caches.delete(key);
            }
        });
    });

    // self.registration.showNotification('Message from SW', {
    //     body: 'Service worker successfully installed',
    //     // image: './images/logo.png',
    //     icon: './images/icons/favicon-96x96.png',
    //     badge: './images/icons/favicon-96x96.png',
    //     actions: [{ action: 'view', title: 'Action title', icon: './images/icons/favicon-96x96.png' }]
    //     //other options
    // });
    
    e.waitUntil(cleaned);
});

// Static cache strategy - Cache with Network fallback
const staticCache = (req, cacheName = `static-${version}`) => {
    return caches.match(req).then(cachedRes => {
        if (!navigator.onLine)
           return caches.match(new Request('offline.html'))

        // Return cached response if found
        if(cachedRes) return cachedRes;

        // Fallback to network
        return fetch(req).then(networkRes => {
            // Update cache with new response
            caches.open(cacheName)
                .then(cache => cache.put(req, networkRes));
            
                return networkRes.clone();
        });
    });
};

// Network 1st with cache Fallback  - if fails try to load last success request in cache
const fallbackCache = req => {

    // Try Network
    return fetch(req).then(networkRes => {

        // Check res is OK or if network fails, else go to cache
        if (!networkRes.ok) throw 'Fetch Error';

        // Update cache
        caches.open(`static-${version}`)
            .then(cache => {
                cache.put(req, networkRes)});
        
        // Return Clone of Network Response
        return networkRes.clone();
    })
    // Try cache
    .catch(err => caches.match(req));
};

// Clean old Giphys from the 'giphy' cache
const cleanGiphyCache = giphys => {
    caches.open('giphy').then(cache => {

        // Get all cache entries
        cache.keys(keys => {

            // Loop entries (requests)
            keys.forEach(key => {

                // If entry is NOT part of current Giphys, Delete
                if (!giphys.includes(key.url)) cache.delete(key);
            });
        });
    });
};

// SW Fetch
self.addEventListener('fetch', e => {
    // App shell cache
    if (e.request.url.match(location.origin)) {
        e.respondWith(staticCache(e.request));
    
    // Giphy API cache
    } else if (e.request.url.match('api.giphy.com/v1/gifs/trending')) {
        e.respondWith(fallbackCache(e.request));
    // Giphy Media cache
    } 
    else if (e.request.url.match('giphy.com/media')) {
        e.respondWith(staticCache(e.request, 'giphy'));
    }
});

// Listen for message from client
self.addEventListener('message', e => {
    // Identify the message
    if (e.data.action === 'cleanGiphyCache') cleanGiphyCache(e.data.giphys)
});


//Notification
// if (Notification.permission == 'granted') {
//     showNotification();
//     return;
// }

// if (Notification.permission !== 'denied') {
//     Notification.requestPermission()
//         .then(p => {
//             if (p === 'granted') showNotification();
//         })
// }

//sw - persistent notifications
// self.registration.showNotification('Title', {
//     body: 'Some body text',
//     image: './images/logo.png',
//     icon: './images/icons/favicon-96x96.png',
//     badge: './images/icons/favicon-96x96.png',
//     actions: [{ action: 'view', title: 'Action title', icon: './images/icons/favicon-96x96.png'}]
//     //other options
// });

// self.addEventListener('notificationclick', e => {
//     if (!e.action) {// if there is no button,
//         console.log('Notification clicked'); //clicked on notification body
//         return;
//     } 
//     //handle action clicks
//     switch (e.action) {
//         case 'view':
//             console.log('View action clicked');
//             break;
//         default:
//             console.warn(`${e.action} action clicked`);
//             break;
//     }
// });


//non-persistent notification
// var n = new Notification('Title', {
//     body: 'body text',
//     tag: 'test',
//     renotify: false,
//     requiredInteraction: true,
//     actions: [
//         {
//             action: 'id',
//             title: 'Action title',
//             icon: 'path/to/some/icon.ext'
//         }
//     ], //buttons
//     silent: false,
//     // sound: 'path/to/sound',
//     // vibrate: [200, 100, 200]
// });

// n.addEventListener('error', e => {
//     console.error('Upps there was a problem', e);
// });

// n.addEventListener('click', e => {
//     console.log('Notification clicked');
//     n.close();
// });
