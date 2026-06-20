(function() {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function() {
            mobileNav.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;

        const showSlide = function(index) {
            current = index;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        };

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function() {
                showSlide((current + 1) % slides.length);
            }, 5200);
        }
    }

    const pageFilter = document.querySelector('[data-page-filter]');
    const filterList = document.querySelector('[data-filter-list]') || document;
    const yearButtons = Array.from(document.querySelectorAll('[data-filter-year]'));
    const regionButtons = Array.from(document.querySelectorAll('[data-filter-region]'));
    let activeYear = '';
    let activeRegion = '';

    const normalize = function(value) {
        return (value || '').toString().trim().toLowerCase();
    };

    const applyLocalFilter = function() {
        const keyword = normalize(pageFilter ? pageFilter.value : '');
        const cards = Array.from(filterList.querySelectorAll('.movie-card'));

        cards.forEach(function(card) {
            const haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.textContent
            ].join(' '));
            const year = card.getAttribute('data-year') || '';
            const region = card.getAttribute('data-region') || '';
            const matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            const matchedYear = !activeYear || year === activeYear;
            const matchedRegion = !activeRegion || region === activeRegion;
            card.classList.toggle('hidden-by-filter', !(matchedKeyword && matchedYear && matchedRegion));
        });
    };

    if (pageFilter) {
        pageFilter.addEventListener('input', applyLocalFilter);
    }

    yearButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            activeYear = button.getAttribute('data-filter-year') || '';
            yearButtons.forEach(function(item) {
                item.classList.toggle('active', item === button);
            });
            applyLocalFilter();
        });
    });

    regionButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            activeRegion = button.getAttribute('data-filter-region') || '';
            regionButtons.forEach(function(item) {
                item.classList.toggle('active', item === button);
            });
            applyLocalFilter();
        });
    });

    const globalSearch = document.querySelector('[data-global-search]');
    const searchResults = document.querySelector('[data-search-results]');
    const searchKeywordButtons = Array.from(document.querySelectorAll('[data-search-keyword]'));

    const renderSearchResults = function(keyword) {
        if (!searchResults || !window.SITE_MOVIES) {
            return;
        }

        const query = normalize(keyword);
        const source = query
            ? window.SITE_MOVIES.filter(function(movie) {
                return normalize([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.genre,
                    movie.type,
                    movie.tags,
                    movie.intro
                ].join(' ')).indexOf(query) !== -1;
            })
            : window.SITE_MOVIES.slice(0, 60);

        searchResults.innerHTML = source.slice(0, 120).map(function(movie) {
            return [
                '<article class="movie-card">',
                '<a class="poster-link" href="' + movie.url + '">',
                '<div class="poster-wrap">',
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="poster-play">▶</span>',
                '<span class="poster-year">' + escapeHtml(movie.year) + '</span>',
                '<span class="poster-region">' + escapeHtml(movie.region) + '</span>',
                '</div>',
                '<div class="movie-card-body">',
                '<h3>' + escapeHtml(movie.title) + '</h3>',
                '<p>' + escapeHtml(movie.intro) + '</p>',
                '<div class="movie-meta"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
                '</div>',
                '</a>',
                '</article>'
            ].join('');
        }).join('');
    };

    const escapeHtml = function(value) {
        return (value || '').toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    if (globalSearch) {
        renderSearchResults('');
        globalSearch.addEventListener('input', function() {
            renderSearchResults(globalSearch.value);
        });
    }

    searchKeywordButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const value = button.getAttribute('data-search-keyword') || '';
            if (globalSearch) {
                globalSearch.value = value;
            }
            renderSearchResults(value);
        });
    });
})();
