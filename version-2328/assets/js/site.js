(function () {
    var heroTimer = null;

    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = qs('.menu-toggle');
        var panel = qs('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initSearchForms() {
        qsa('form.site-search').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[type="search"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
            });
        });
    }

    function setHero(index) {
        var slides = qsa('[data-hero-slide]');
        var dots = qsa('[data-hero-dot]');
        if (!slides.length) {
            return;
        }
        var next = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === next);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === next);
        });
    }

    function currentHeroIndex() {
        var slides = qsa('[data-hero-slide]');
        for (var i = 0; i < slides.length; i += 1) {
            if (slides[i].classList.contains('active')) {
                return i;
            }
        }
        return 0;
    }

    function startHeroTimer() {
        if (heroTimer) {
            window.clearInterval(heroTimer);
        }
        heroTimer = window.setInterval(function () {
            setHero(currentHeroIndex() + 1);
        }, 5000);
    }

    function initHero() {
        if (!qs('[data-hero]')) {
            return;
        }
        var prev = qs('[data-hero-prev]');
        var next = qs('[data-hero-next]');
        if (prev) {
            prev.addEventListener('click', function () {
                setHero(currentHeroIndex() - 1);
                startHeroTimer();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                setHero(currentHeroIndex() + 1);
                startHeroTimer();
            });
        }
        qsa('[data-hero-dot]').forEach(function (dot) {
            dot.addEventListener('click', function () {
                setHero(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHeroTimer();
            });
        });
        startHeroTimer();
    }

    function applyCatalogFilter(input) {
        var value = (input && input.value ? input.value : '').trim().toLowerCase();
        qsa('.catalog-grid .movie-card, #movieCatalog .movie-card').forEach(function (card) {
            var haystack = card.getAttribute('data-search') || '';
            card.classList.toggle('is-hidden', value && haystack.indexOf(value) === -1);
        });
    }

    function initCatalogSearch() {
        var search = qs('#catalogSearch') || qs('#searchBox');
        if (!search) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            search.value = query;
        }
        applyCatalogFilter(search);
        search.addEventListener('input', function () {
            applyCatalogFilter(search);
        });
        var form = search.closest('form');
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                applyCatalogFilter(search);
            });
        }
    }

    function initImageFallback() {
        qsa('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('image-missing');
            }, { once: true });
        });
    }

    window.setupMoviePlayer = function (source) {
        var video = qs('#movie-player');
        var overlay = qs('.player-overlay');
        var hlsInstance = null;
        var started = false;
        if (!video || !overlay || !source) {
            return;
        }

        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        function start() {
            if (started) {
                playVideo();
                return;
            }
            started = true;
            overlay.classList.add('is-hidden');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                        video.src = source;
                        playVideo();
                    }
                });
                return;
            }
            video.src = source;
            playVideo();
        }

        overlay.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!started) {
                start();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initSearchForms();
        initHero();
        initCatalogSearch();
        initImageFallback();
    });
}());
