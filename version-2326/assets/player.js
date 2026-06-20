(function () {
    function start(mediaUrl) {
        var video = document.querySelector("[data-player-video]");
        var cover = document.querySelector("[data-player-cover]");
        var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-play-trigger]"));
        var hlsInstance = null;
        var loaded = false;

        function bindSource() {
            if (!video || loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = mediaUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(mediaUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = mediaUrl;
            }
        }

        function play() {
            if (!video) {
                return;
            }
            bindSource();
            video.controls = true;
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    video.muted = true;
                    video.play().catch(function () {});
                });
            }
        }

        triggers.forEach(function (trigger) {
            trigger.addEventListener("click", play);
        });
        if (cover) {
            cover.addEventListener("click", play);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    }

    window.MoviePlayer = { start: start };
})();
