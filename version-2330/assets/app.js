(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }
    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    restart();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-root]").forEach(function (panel) {
      var section = panel.closest("section") || document;
      var input = panel.querySelector(".movie-filter-input");
      var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-category-chip]"));
      var grid = section.querySelector("[data-movie-grid]") || document.querySelector("[data-movie-grid]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card, .ranking-row"));
      var currentCategory = "";
      function apply() {
        var term = normalize(input ? input.value : "");
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-category")
          ].join(" "));
          var cardCategory = card.getAttribute("data-category") || "";
          var matchText = !term || haystack.indexOf(term) !== -1;
          var matchCategory = !currentCategory || cardCategory === currentCategory;
          card.classList.toggle("is-hidden", !(matchText && matchCategory));
        });
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          currentCategory = chip.getAttribute("data-category-chip") || "";
          chips.forEach(function (item) {
            item.classList.toggle("active", item === chip);
          });
          apply();
        });
      });
    });
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movie-video");
    var overlay = document.getElementById("play-overlay");
    if (!video || !source) {
      return;
    }
    var hls = null;
    var attached = false;
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }
    function start() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
