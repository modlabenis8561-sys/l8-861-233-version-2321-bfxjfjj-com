(function() {
    window.initMoviePlayer = function(videoSource) {
        const video = document.querySelector('[data-player-video]');
        const cover = document.querySelector('[data-player-cover]');
        let hlsReady = false;
        let hlsInstance = null;

        if (!video || !cover || !videoSource) {
            return;
        }

        const playVideo = function() {
            cover.classList.add('is-hidden');
            video.controls = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.src) {
                    video.src = videoSource;
                }
                video.play().catch(function() {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsReady) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(videoSource);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
                        video.play().catch(function() {});
                    });
                    hlsReady = true;
                } else {
                    video.play().catch(function() {});
                }
                return;
            }

            if (!video.src) {
                video.src = videoSource;
            }
            video.play().catch(function() {});
        };

        const directButtons = Array.from(document.querySelectorAll('[data-scroll-play]'));

        directButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                setTimeout(playVideo, 120);
            });
        });

        cover.addEventListener('click', playVideo);
        video.addEventListener('click', function() {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', function() {
            cover.classList.add('is-hidden');
        });
        window.addEventListener('beforeunload', function() {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
