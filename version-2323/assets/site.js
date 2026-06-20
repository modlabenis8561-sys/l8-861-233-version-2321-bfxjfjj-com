(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function initMobileNav() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === active);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === active);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });
        show(0);
        restart();
    }

    function initSearch() {
        var tools = document.querySelector('[data-search-tools]');
        var grid = document.querySelector('[data-search-grid]');
        if (!tools || !grid) {
            return;
        }
        var input = tools.querySelector('[data-search-input]');
        var region = tools.querySelector('[data-filter-region]');
        var type = tools.querySelector('[data-filter-type]');
        var genre = tools.querySelector('[data-filter-genre]');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.search-card'));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (initial && input) {
            input.value = initial;
        }

        function include(value, needle) {
            return !needle || String(value || '').toLowerCase().indexOf(needle.toLowerCase()) !== -1;
        }

        function apply() {
            var q = input ? input.value.trim() : '';
            var selectedRegion = region ? region.value : '';
            var selectedType = type ? type.value : '';
            var selectedGenre = genre ? genre.value : '';
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-category')
                ].join(' ');
                var matched = include(text, q) &&
                    include(card.getAttribute('data-region'), selectedRegion) &&
                    include(card.getAttribute('data-type'), selectedType) &&
                    include(card.getAttribute('data-genre'), selectedGenre);
                card.style.display = matched ? '' : 'none';
            });
        }

        [input, region, type, genre].forEach(function (element) {
            if (element) {
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            }
        });
        apply();
    }

    ready(function () {
        initMobileNav();
        initHero();
        initSearch();
    });
}());
