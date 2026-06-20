(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;
    var carouselTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    function startCarousel() {
        if (slides.length < 2) {
            return;
        }

        carouselTimer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5600);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            window.clearInterval(carouselTimer);
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            startCarousel();
        });
    });

    startCarousel();

    var catalog = document.querySelector('[data-catalog]');

    if (catalog) {
        var searchInput = catalog.querySelector('[data-search-input]');
        var typeFilter = catalog.querySelector('[data-type-filter]');
        var yearFilter = catalog.querySelector('[data-year-filter]');
        var emptyState = catalog.querySelector('[data-empty-state]');
        var cards = Array.prototype.slice.call(catalog.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery && searchInput) {
            searchInput.value = initialQuery;
        }

        function applyFilters() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var typeValue = typeFilter ? typeFilter.value : '';
            var yearValue = yearFilter ? yearFilter.value : '';
            var shown = 0;

            cards.forEach(function (card) {
                var text = card.getAttribute('data-search') || '';
                var type = card.getAttribute('data-type') || '';
                var year = card.getAttribute('data-year') || '';
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }

                if (typeValue && type.indexOf(typeValue) === -1) {
                    matched = false;
                }

                if (yearValue && year !== yearValue) {
                    matched = false;
                }

                card.hidden = !matched;

                if (matched) {
                    shown += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = shown !== 0;
            }
        }

        [searchInput, typeFilter, yearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }

    var video = document.querySelector('[data-video-player]');
    var playButton = document.querySelector('[data-play-button]');

    if (video && playButton) {
        var loaded = false;
        var playUrl = window.__play || '';

        function attachVideo() {
            if (loaded || !playUrl) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = playUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(playUrl);
                hls.attachMedia(video);
            } else {
                video.src = playUrl;
            }

            loaded = true;
        }

        function startPlayback() {
            attachVideo();
            playButton.classList.add('is-hidden');
            video.controls = true;

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    playButton.classList.remove('is-hidden');
                });
            }
        }

        playButton.addEventListener('click', startPlayback);

        video.addEventListener('click', function () {
            if (!loaded) {
                startPlayback();
            }
        });

        video.addEventListener('play', function () {
            playButton.classList.add('is-hidden');
        });
    }
}());
