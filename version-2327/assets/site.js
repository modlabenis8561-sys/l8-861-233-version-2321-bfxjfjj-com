
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
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }

            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
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

    var filterInput = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    if (filterInput && cards.length) {
        var params = new URLSearchParams(window.location.search);
        var keyword = params.get('keyword') || params.get('q') || '';

        if (keyword) {
            filterInput.value = keyword;
        }

        function filterCards() {
            var query = filterInput.value.trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase() + ' ' + (card.getAttribute('data-title') || '').toLowerCase() + ' ' + (card.getAttribute('data-tags') || '').toLowerCase() + ' ' + (card.getAttribute('data-region') || '').toLowerCase() + ' ' + (card.getAttribute('data-year') || '').toLowerCase();
                var matched = !query || text.indexOf(query) !== -1;

                card.hidden = !matched;

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        filterInput.addEventListener('input', filterCards);
        filterCards();
    }
})();
