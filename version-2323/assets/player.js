function createMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var cover = document.getElementById(options.coverId);
    var button = document.getElementById(options.buttonId);
    var source = options.source;
    var loaded = false;
    var hls = null;

    function load() {
        if (loaded || !video || !source) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls();
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
        loaded = true;
    }

    function play() {
        if (!video) {
            return;
        }
        load();
        video.controls = true;
        if (button) {
            button.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener('click', play);
    }
    if (cover) {
        cover.addEventListener('click', play);
    }
    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    }
    window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
    });
}
