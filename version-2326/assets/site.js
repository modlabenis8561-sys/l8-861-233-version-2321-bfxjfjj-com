(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var links = document.querySelector("[data-nav-links]");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot") || 0));
            });
        });
        setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initFilters() {
        var scope = document.querySelector("[data-filter-scope]");
        if (!scope) {
            return;
        }
        var input = document.querySelector("[data-filter-input]");
        var year = document.querySelector("[data-year-filter]");
        var genre = document.querySelector("[data-genre-filter]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var query = new URLSearchParams(location.search).get("q");
        if (query && input) {
            input.value = query;
        }
        function apply() {
            var text = normalize(input && input.value);
            var yearValue = normalize(year && year.value);
            var genreValue = normalize(genre && genre.value);
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var matchesText = !text || haystack.indexOf(text) !== -1;
                var matchesYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
                var matchesGenre = !genreValue || haystack.indexOf(genreValue) !== -1;
                card.classList.toggle("is-hidden", !(matchesText && matchesYear && matchesGenre));
            });
        }
        [input, year, genre].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
