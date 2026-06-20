(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;
        var show = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    }

    var filterRoot = document.querySelector('[data-filter-root]');
    if (filterRoot) {
        var input = filterRoot.querySelector('[data-filter-input]');
        var buttons = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-filter-value]'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var activeValue = 'all';
        var applyFilter = function () {
            var query = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var type = card.getAttribute('data-type') || '';
                var region = card.getAttribute('data-region') || '';
                var category = card.getAttribute('data-category') || '';
                var matchedText = !query || text.indexOf(query) !== -1;
                var matchedFilter = activeValue === 'all' || type === activeValue || region === activeValue || category === activeValue;
                card.classList.toggle('hidden-by-filter', !(matchedText && matchedFilter));
            });
        };
        if (input) {
            var params = new URLSearchParams(window.location.search);
            var queryValue = params.get('q');
            if (queryValue) {
                input.value = queryValue;
            }
            input.addEventListener('input', applyFilter);
        }
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeValue = button.getAttribute('data-filter-value') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilter();
            });
        });
        applyFilter();
    }
})();

var MoviePlayer = (function () {
    var hlsInstance = null;
    var loadedUrl = '';

    function mount(url) {
        var video = document.querySelector('[data-player-video]');
        var overlay = document.querySelector('[data-player-overlay]');
        var poster = document.querySelector('[data-player-poster]');
        var button = document.querySelector('[data-player-button]');
        if (!video || !url) {
            return;
        }

        function begin() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            if (poster) {
                poster.classList.add('is-hidden');
            }
            if (loadedUrl !== url) {
                if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = url;
                }
                loadedUrl = url;
            }
            var request = video.play();
            if (request && typeof request.catch === 'function') {
                request.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                begin();
            });
        }
        if (overlay) {
            overlay.addEventListener('click', begin);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            }
        });
    }

    return {
        mount: mount
    };
})();
