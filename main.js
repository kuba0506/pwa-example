// Progressive Enhancement
if (navigator.serviceWorker) {
    // Notification.requestPermission().then(p => {
    //     console.log('ss')
    // })
    // Register SW
    navigator.serviceWorker.register('sw.js')
        .then(x => {
            if (Notification.permission == 'granted') {
                console.log('permisson granted')
                showNotification();
                return;
            }

            if (Notification.permission !== 'denied') {
                Notification.requestPermission()
                    .then(p => {
                        if (p === 'granted') showNotification();
                        // if (p === 'granted') console.log('permission granted');
                    })
            }
        })
        .catch(console.error);

    // Giphy cache clean
    function giphyCacheClean(giphys) {
        // Get service worker registration object
        navigator.serviceWorker.getRegistration()
            .then(registration => {
                // console.log(giphys)
                // Only post message to active SW
                if (registration.active) registration.active.postMessage({ action: 'cleanGiphyCache', giphys: giphys });
            });
    }
}

const showNotification = () => {
    var n = new Notification('Notification', {
        body: 'Service worker successfully installed',
        icon: './images/icons/favicon-96x96.png',
        // image: './images/logo.png',
        tag: 'test',
        renotify: false,
        requiredInteraction: true,
        // actions: [
        //     {
        //         action: 'id',
        //         title: 'Action title',
        //         icon: 'path/to/some/icon.ext'
        //     }
        // ], //buttons
        // silent: false,
        // sound: 'path/to/sound',
        // vibrate: [200, 100, 200]

    //     badge: './images/icons/favicon-96x96.png',
    //     actions: [{ action: 'view', title: 'Action title', icon: './images/icons/favicon-96x96.png' }]
    });

    n.addEventListener('error', e => {
        console.error('Upps there was a problem', e);
    });

    n.addEventListener('click', e => {
        console.log('Notification clicked');
        n.close();
    });
};


// Giphy API object
var giphy = {
    url: 'https://api.giphy.com/v1/gifs/trending',
    query: {
        api_key: '54452c59b31e4d14aca213ec76014baa',
        limit: 12
    }
};

// Update trending giphys
function update() {

    // Toggle refresh state
    $('#update .icon').toggleClass('d-none');

    // Call Giphy API
    $.get(giphy.url, giphy.query)

        // Success
        .done(function (res) {

            // Empty Element
            $('#giphys').empty();

            let latestGiphys = [];

            // Loop Giphys
            $.each(res.data, function (i, giphy) {
                // Add to latest Giphys
                latestGiphys.push(giphy.images.downsized_large.url);

                // Add Giphy HTML
                $('#giphys').prepend(
                    '<div class="col-sm-6 col-md-4 col-lg-3 p-1">' +
                    '<img class="w-100 img-fluid" src="' + giphy.images.downsized_large.url + '">' +
                    '</div>'
                );

            });
            // Inform the SW (if available) of current Giphys
            if (navigator.serviceWorker) giphyCacheClean(latestGiphys);
        })

        // Failure
        .fail(function () {

            $('.alert').slideDown();
            setTimeout(function () { $('.alert').slideUp() }, 2000);
        })

        // Complete
        .always(function () {

            // Re-Toggle refresh state
            $('#update .icon').toggleClass('d-none');
        });

    // Prevent submission if originates from click
    return false;
}

// Manual refresh
$('#update a').click(update);

// Update trending giphys on load
update();
