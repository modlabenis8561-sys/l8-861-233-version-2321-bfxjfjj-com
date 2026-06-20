(function () {
  function norm(value) {
    return String(value || "").toLowerCase().trim();
  }

  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", mobileMenu.classList.contains("is-open") ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-search-box]").forEach(function (box) {
    var input = box.querySelector("input");
    var panel = box.querySelector("[data-search-panel]");
    var items = window.MOVIE_SEARCH_INDEX || [];
    if (!input || !panel) {
      return;
    }

    input.addEventListener("input", function () {
      var keyword = norm(input.value);
      if (!keyword) {
        panel.classList.remove("is-open");
        panel.innerHTML = "";
        return;
      }

      var results = items.filter(function (item) {
        return norm(item.title + " " + item.region + " " + item.type + " " + item.year + " " + item.genre + " " + item.tags).indexOf(keyword) !== -1;
      }).slice(0, 12);

      if (!results.length) {
        panel.innerHTML = '<div class="search-empty">没有找到相关影片</div>';
        panel.classList.add("is-open");
        return;
      }

      panel.innerHTML = results.map(function (item) {
        return '<a class="search-result" href="' + item.url + '"><img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '"><span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span></span></a>';
      }).join("");
      panel.classList.add("is-open");
    });

    document.addEventListener("click", function (event) {
      if (!box.contains(event.target)) {
        panel.classList.remove("is-open");
      }
    });
  });

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var textInput = scope.querySelector("[data-filter-input]");
    var typeSelect = scope.querySelector("[data-filter-type]");
    var yearSelect = scope.querySelector("[data-filter-year]");

    function applyFilter() {
      var keyword = norm(textInput ? textInput.value : "");
      var selectedType = norm(typeSelect ? typeSelect.value : "");
      var selectedYear = norm(yearSelect ? yearSelect.value : "");

      cards.forEach(function (card) {
        var haystack = norm(card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-year") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-tags"));
        var typeOk = !selectedType || norm(card.getAttribute("data-type")) === selectedType;
        var yearOk = !selectedYear || norm(card.getAttribute("data-year")) === selectedYear;
        var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle("is-hidden", !(typeOk && yearOk && keywordOk));
      });
    }

    [textInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    if (slides.length) {
      showSlide(0);
      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(active - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showSlide(active + 1);
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          showSlide(i);
        });
      });
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  window.initMoviePlayer = function (url) {
    var video = document.querySelector(".movie-video");
    var cover = document.querySelector(".player-cover");
    var button = document.querySelector(".player-play");
    var started = false;
    var hlsInstance = null;

    if (!video || !url) {
      return;
    }

    function requestPlay() {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    function start() {
      if (!started) {
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          video.addEventListener("loadedmetadata", requestPlay, { once: true });
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, requestPlay);
        } else {
          video.src = url;
          video.addEventListener("loadedmetadata", requestPlay, { once: true });
        }
        video.controls = true;
        if (cover) {
          cover.classList.add("is-hidden");
        }
      }
      requestPlay();
    }

    if (cover) {
      cover.addEventListener("click", start);
      cover.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          start();
        }
      });
    }
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
      });
    }
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
