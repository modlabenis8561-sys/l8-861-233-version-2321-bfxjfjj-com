
(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-stream]'));

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play]');
        var errorBox = player.querySelector('[data-player-error]');
        var stream = player.getAttribute('data-stream');
        var loaded = false;
        var hls = null;

        if (!video || !stream) {
            return;
        }

        function showError() {
            if (errorBox) {
                errorBox.hidden = false;
            }
        }

        function loadStream() {
            if (loaded) {
                return;
            }

            loaded = true;
            player.classList.add('is-ready');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(stream);
                hls.attachMedia(video);

                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                        return;
                    }

                    if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                        return;
                    }

                    showError();
                });

                return;
            }

            video.src = stream;
        }

        function start() {
            loadStream();
            player.classList.add('is-playing');

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    player.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            player.classList.remove('is-playing');
        });

        video.addEventListener('error', showError);

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
