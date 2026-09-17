const ITEMS_PER_PAGE = 20;

const slider = document.querySelector(".genre-slider");
const prevBtn = document.querySelector(".nav-btn.prev");
const nextBtn = document.querySelector(".nav-btn.next");

function updateButtons() {
  prevBtn.disabled = slider.scrollLeft <= 0;

  nextBtn.disabled =
    slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 1;
}

nextBtn.addEventListener("click", () => {
  slider.scrollBy({
    left: 300,
    behavior: "smooth",
  });
});

prevBtn.addEventListener("click", () => {
  slider.scrollBy({
    left: -300,
    behavior: "smooth",
  });
});

slider.addEventListener("scroll", updateButtons);
window.addEventListener("load", updateButtons);
window.addEventListener("resize", updateButtons);

const customSelects = document.querySelectorAll(".custom-select-wrapper");
const filterSection = document.querySelector(".section-top-searches");
const recentSection = document.querySelector(".tamil-content");
const topSearchHeading = filterSection?.querySelector(".section-title");
const searchInputField = document.querySelector(".search-filter input");
const searchIconBtn = document.querySelector(".search-filter .search-icon");
const genreItems = document.querySelectorAll(".genre-slider .genre-item");

const filterState = {
  genre: [],
  genreId: [],
  mediaType: [],
  releaseYear: [],
  language: [],
  query: "",
};

const genreToTmdbId = {
  adventure: 12,
  drama: 18,
  comedy: 35,
  thriller: 53,
  horror: 27,
  romance: 10749,
  musical: 10402,
  short: 10770,
  action: 28,
  "sci-fi": 878,
};

const dialogContentTypeMap = {
  movie: "movie",
  series: "series",
  "kids content": "kids",
  documentary: "documentary",
  "vr/ar": null,
  "stage plays": null,
  music: null,
};

const dialogLanguageMap = {
  tamil: "ta",
  kannada: "kn",
  telugu: "te",
  english: "en",
  hindi: "hi",
};

const normalizeLabel = (label = "") =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, "")
    .replace(/\s+/g, " ");

function mapDialogContentType(label) {
  const key = normalizeLabel(label);
  return dialogContentTypeMap[key] || null;
}

function mapDialogGenre(label) {
  const key = normalizeLabel(label).replace(/\s+/g, "");
  return key === "scifi" ? "sci-fi" : key;
}

function mapDialogLanguage(label) {
  const key = normalizeLabel(label);
  return dialogLanguageMap[key] || null;
}

function updateSelectDisplay(filterKey, value) {
  const wrapper = document.querySelector(
    `.custom-select-wrapper[data-filter="${filterKey}"]`,
  );
  if (!wrapper) return;

  const inputField = wrapper.querySelector(".dropdown-input");
  const defaultValue =
    inputField?.dataset.defaultValue ||
    inputField?.getAttribute("placeholder") ||
    "";
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  const labels = selectedValues
    .map((selected) =>
      wrapper.querySelector(`li[data-value="${selected}"]`)?.textContent.trim(),
    )
    .filter(Boolean);

  if (inputField) {
    if (!labels.length) {
      inputField.value = defaultValue;
    } else if (labels.length === 1) {
      inputField.value = labels[0];
    } else {
      inputField.value = `${labels.length} selected`;
    }
  }
}

function syncTopGenre(genreValue) {
  const activeGenres = Array.isArray(genreValue)
    ? genreValue
    : genreValue
      ? [genreValue]
      : [];

  genreItems.forEach((item) => {
    const itemLabel = normalizeLabel(item.textContent);
    item.classList.toggle("active", activeGenres.includes(itemLabel));
  });
}

function syncDialogWithFilterState() {
  const activeMediaType = filterState.mediaType;
  const activeGenre = filterState.genre;
  const activeLanguage = filterState.language;

  dialog.querySelectorAll(".filter-items .item").forEach((item) => {
    item.classList.remove("active");
  });

  if (activeMediaType?.length) {
    const selectedLabels = Object.entries(dialogContentTypeMap)
      .filter(([, value]) => activeMediaType.includes(value))
      .map(([label]) => label);

    dialog.querySelectorAll(".filter-group").forEach((group) => {
      const title = group.querySelector(".filter-title")?.textContent.trim();
      if (title !== "ContentTypes") return;

      group.querySelectorAll(".item").forEach((item) => {
        const itemLabel = normalizeLabel(item.textContent);
        if (
          selectedLabels.some((label) => normalizeLabel(label) === itemLabel)
        ) {
          item.classList.add("active");
        }
      });
    });
  }

  if (activeGenre?.length) {
    dialog.querySelectorAll(".filter-group").forEach((group) => {
      const title = group.querySelector(".filter-title")?.textContent.trim();
      if (title !== "Genres") return;

      group.querySelectorAll(".item").forEach((item) => {
        const itemGenre = mapDialogGenre(item.textContent);
        if (activeGenre.includes(itemGenre)) {
          item.classList.add("active");
        }
      });
    });
  }

  if (activeLanguage?.length) {
    dialog.querySelectorAll(".filter-group").forEach((group) => {
      const title = group.querySelector(".filter-title")?.textContent.trim();
      if (title !== "Languages") return;

      group.querySelectorAll(".item").forEach((item) => {
        if (activeLanguage.includes(mapDialogLanguage(item.textContent))) {
          item.classList.add("active");
        }
      });
    });
  }
}

function clearDialogAndTopFilters() {
  dialog
    .querySelectorAll(".filter-items .item")
    .forEach((item) => item.classList.remove("active"));
  filterItems.forEach((item) => item.classList.remove("active"));
  customSelects.forEach((wrapper) =>
    wrapper
      .querySelectorAll("li")
      .forEach((opt) => opt.classList.remove("active")),
  );
  filterState.mediaType = [];
  filterState.genre = [];
  filterState.genreId = [];
  filterState.language = [];
  filterState.releaseYear = [];
  updateSelectDisplay("mediaType", []);
  updateSelectDisplay("releaseYear", []);
  syncTopGenre([]);
  applyFilters();
}

function applyDialogSelections() {
  const selectedContentTypes = [];
  const selectedGenres = [];
  const selectedLanguages = [];

  dialog.querySelectorAll(".filter-group").forEach((group) => {
    const titleEl = group.querySelector(".filter-title");
    if (!titleEl) return;

    const title = titleEl.textContent.trim();
    const items = [...group.querySelectorAll(".item.active")].map((item) =>
      item.textContent.trim(),
    );

    if (title === "ContentTypes") selectedContentTypes.push(...items);
    if (title === "Genres") selectedGenres.push(...items);
    if (title === "Languages") selectedLanguages.push(...items);
  });

  const selectedMediaTypes = selectedContentTypes
    .map(mapDialogContentType)
    .filter(Boolean);
  filterState.mediaType = [...new Set(selectedMediaTypes)];
  const mediaDropdown = document.querySelector('[data-filter="mediaType"]');

  mediaDropdown.querySelectorAll("li").forEach((li) => {
    li.classList.toggle(
      "active",
      filterState.mediaType.includes(li.dataset.value),
    );
  });
  updateSelectDisplay("mediaType", filterState.mediaType);

  const selectedGenreKeys = selectedGenres
    .map(mapDialogGenre)
    .filter((genre) => genre && genreToTmdbId[genre]);
  filterState.genre = [...new Set(selectedGenreKeys)];
  filterState.genreId = [
    ...new Set(selectedGenreKeys.map((genre) => genreToTmdbId[genre])),
  ];
  syncTopGenre(filterState.genre);

  filterState.language = [
    ...new Set(selectedLanguages.map(mapDialogLanguage).filter(Boolean)),
  ];

  applyFilters();
}

function hasFilters() {
  return Boolean(
    (Array.isArray(filterState.genre) && filterState.genre.length) ||
    (Array.isArray(filterState.mediaType) && filterState.mediaType.length) ||
    (Array.isArray(filterState.releaseYear) &&
      filterState.releaseYear.length) ||
    (Array.isArray(filterState.language) && filterState.language.length) ||
    filterState.query,
  );
}

function updateFilteredSection() {
  if (hasFilters()) {
    recentSection.style.display = "none";
    if (topSearchHeading) topSearchHeading.textContent = "Filtered Results";
  } else {
    recentSection.style.display = "block";
    if (topSearchHeading) topSearchHeading.textContent = "Top Search";
  }
}

function applyFilters(page = 1, resetPage = false) {
  // Always check if search field is empty and clear query if it is
  console.log(JSON.stringify(filterState, null, 2));
  if (resetPage) page = 1;
  if (!searchInputField?.value.trim()) {
    filterState.query = "";
  }

  updateFilteredSection();

  if (!hasFilters()) {
    if (typeof loadMovies === "function") {
      loadMovies(1);
    }
    return;
  }

  if (typeof loadFilteredMovies === "function") {
    loadFilteredMovies(filterState, page);
  }
}

customSelects.forEach((wrapper) => {
  const selectBox = wrapper.querySelector(".select-box");
  const inputField = wrapper.querySelector(".dropdown-input");
  const dropdownMenu = wrapper.querySelector(".dropdown-menu");
  const options = dropdownMenu.querySelectorAll("li");
  const defaultValue = inputField.value;
  inputField.dataset.defaultValue = defaultValue;
  const filterKey = wrapper.dataset.filter;

  selectBox.addEventListener("click", (e) => {
    e.stopPropagation();

    document.querySelectorAll(".dropdown-menu").forEach((menu) => {
      if (menu !== dropdownMenu) menu.classList.remove("show");
    });

    dropdownMenu.classList.toggle("show");
  });

  options.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      const value = option.getAttribute("data-value") || "";
      const selected = Array.isArray(filterState[filterKey])
        ? [...filterState[filterKey]]
        : [];

      if (value === "") {
        selected.length = 0;
        dropdownMenu
          .querySelectorAll("li")
          .forEach((item) => item.classList.remove("active"));
      } else {
        const index = selected.indexOf(value);
        if (index > -1) {
          selected.splice(index, 1);
          option.classList.remove("active");
        } else {
          selected.push(value);
          option.classList.add("active");
        }
      }

      filterState[filterKey] = selected;
      updateSelectDisplay(filterKey, selected);

      applyFilters(1, true);
    });
  });
});

document.addEventListener("click", () => {
  document.querySelectorAll(".dropdown-menu").forEach((menu) => {
    menu.classList.remove("show");
  });
});

genreItems.forEach((item) => {
  item.addEventListener("click", () => {
    const label = item
      .querySelector("span:last-child")
      ?.textContent.trim()
      .toLowerCase();
    if (!label) return;

    if (!Array.isArray(filterState.genre)) {
      filterState.genre = [];
    }

    const selectedIndex = filterState.genre.indexOf(label);
    if (selectedIndex > -1) {
      filterState.genre.splice(selectedIndex, 1);
    } else {
      filterState.genre.push(label);
    }

    filterState.genreId = filterState.genre
      .map((genre) => genreToTmdbId[genre])
      .filter(Boolean);

    genreItems.forEach((genreEl) => {
      const genreLabel = genreEl
        .querySelector("span:last-child")
        ?.textContent.trim()
        .toLowerCase();
      genreEl.classList.toggle(
        "active",
        filterState.genre.includes(genreLabel),
      );
    });

    applyFilters(1, true);
  });
});

function debounce(fn, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

function applySearch() {
  filterState.query = searchInputField?.value.trim() || "";
  applyFilters(1, true);
}

const debouncedSearch = debounce(() => {
  applySearch();
}, 300);

searchIconBtn?.addEventListener("click", applySearch);
searchInputField?.addEventListener("input", debouncedSearch);
searchInputField?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    applySearch();
  }
});

function renderStars(count) {
  let stars = "";

  for (let i = 1; i <= 5; i++) {
    stars += `
      <img src="./assets/images/Home/LatestContent/${
        i <= count ? "StarFilled_Icon.png" : "StarOutline_Icon.png"
      }" />
    `;
  }

  return stars;
}

function renderGenres(genres) {
  return genres.map((g) => `<div class="genre-item">${g}</div>`).join("");
}

function renderMovies(movies, wrapperSelector, imdbIds = []) {
  const wrapper = document.querySelector(wrapperSelector);

  // Ensure only ITEMS_PER_PAGE (20) movies are displayed per page
  const moviesToDisplay = movies.slice(0, ITEMS_PER_PAGE);

  wrapper.innerHTML = moviesToDisplay
    .map((movie, index) => {
      const imdbId = imdbIds[index] || "";
      const imdbAttr = imdbId ? ` data-imdb="${imdbId}"` : "";

      console.log(imdbId);

      return `
      <div class="swiper-slide"${imdbAttr}>
        <div class="slide-item">

          <div class="movie-img">
            <img src="${movie.image}" alt="${movie.title}" />
            <div class='like-btn'>
              <img src='./assets/images/Home/LatestContent/Like_Icon.png' class='liked' />
              <img src='./assets/images/Home/LatestContent/UnFilledLiike_Img.png' class='like' />
            </div>
            <div class='make-offer'>Make an Offer </div>
          </div>

          <h3 class="movie-title">${movie.title}</h3>

          <p class="movie-desc text-gray-400">
            ${movie.desc}
          </p>

          <div class="movie-info">

            <div class="row flex items-center">
              <div class="movie-duration flex items-center">
                <img src="./assets/images/Home/LatestContent/Time_Icon.png" />
                <span>${movie.duration}</span>
              </div>

              <div class="movie-genres flex items-center" data-genres='${JSON.stringify(movie.genres)}'>
                ${renderGenres(movie.genres)}
              </div>
            </div>

            <div class="row flex items-center gap-2">
              <div class="reviews flex items-center">
                ${renderStars(movie.stars)}
              </div>

              <span>(${movie.rating})</span>

              <div class="review-count">
                ${movie.reviews} Reviews
              </div>
            </div>

          </div>

        </div>
      </div>
    `;
    })
    .join("");

  fixGenreOverflow();

  wrapper.querySelectorAll(".swiper-slide").forEach((slide, index) => {
    const imdbId = imdbIds[index] || "";
    const slideItem = slide.querySelector(".slide-item");
    const movieTitle = moviesToDisplay[index]?.title || "";
    const likeBtn = slide.querySelector(".like-btn");
    const likedIcon = slide.querySelector(".liked");
    const unlikedIcon = slide.querySelector(".like");
    if (!imdbId || !slideItem) return;
    slideItem.style.cursor = "pointer";
    slideItem.addEventListener("click", (e) => {
      if (!e.target.closest(".make-offer")) {
        window.location.href = `./movie-details.html?id=${imdbId}`;
      }
    });

    if (likeBtn && imdbId) {
      const updateLikeUI = () => {
        const likedMovies =
          JSON.parse(localStorage.getItem("likedMovies")) || [];

        const isLiked = likedMovies.includes(imdbId);

        likedIcon.style.display = isLiked ? "block" : "none";
        unlikedIcon.style.display = isLiked ? "none" : "block";
      };

      updateLikeUI();

      likeBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        if (!isLoggedIn()) {
          redirectToLogin();
          return;
        }

        let likedMovies = JSON.parse(localStorage.getItem("likedMovies")) || [];

        const movieIndex = likedMovies.indexOf(imdbId);

        if (movieIndex > -1) {
          likedMovies.splice(movieIndex, 1);
        } else {
          likedMovies.push(imdbId);
        }

        localStorage.setItem("likedMovies", JSON.stringify(likedMovies));

        updateLikeUI();
      });
    }

    // Add event listener for "Make an Offer" button
    const makeOfferBtn = slide.querySelector(".make-offer");
    if (makeOfferBtn) {
      makeOfferBtn.style.cursor = "pointer";
      makeOfferBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        window.location.href = `./make-offer.html?movie=${encodeURIComponent(movieTitle)}`;
      });
    }
  });
}

window.addEventListener("resize", fixGenreOverflow);

function isLoggedIn() {
  const currentUser = localStorage.getItem("currentUser");

  return currentUser !== null;
}

function redirectToLogin() {
  localStorage.setItem("redirectAfterLogin", window.location.href);
  window.location.href = "./login-email.html";
}

function fixGenreOverflow() {
  document.querySelectorAll(".movie-genres").forEach((container) => {
    const genres = JSON.parse(container.dataset.genres);

    // Rebuild original genres every time
    container.innerHTML = genres
      .map((genre) => `<div class="genre-item">${genre}</div>`)
      .join("");

    let tags = [...container.children];
    let hiddenCount = 0;
    let counter = null;
    console.log(container.scrollWidth, container.clientWidth, genres);

    while (container.scrollWidth > container.clientWidth + 5 && tags.length > 1) {
      tags.pop().remove();
      hiddenCount++;

      counter?.remove();

      counter = document.createElement("div");
      counter.className = "genre-item genre-counter";
      counter.textContent = `+${hiddenCount}`;

      container.appendChild(counter);

      tags = [...container.querySelectorAll(".genre-item:not(.genre-counter)")];
    }
  });
}

function initSwiper(selector) {
  const root = document.querySelector(selector);

  return new Swiper(root, {
    slidesPerView: 4,
    spaceBetween: 24,

    navigation: {
      prevEl: root.parentElement.querySelector(".nav-left"),
      nextEl: root.parentElement.querySelector(".nav-right"),
    },

    breakpoints: {
      320: { slidesPerView: 1 },
      481: { slidesPerView: 2 },
      769: { slidesPerView: 3 },
      1025: { slidesPerView: 4 },
      1601: { slidesPerView: 5 },
    },
  });
}

const tamilContent = [
  "tt22488728",
  "tt26439764",
  "tt9179430",
  "tt22444570",
  "tt15427980",
  "tt11663228",
  "tt10579952",
  "tt15163652",
  "tt11301946",
  "tt15654328",
];

renderMovies(
  tamilMovies,
  ".tamil-content-slider .swiper-wrapper",
  tamilContent,
);
initSwiper(".tamil-content-slider");

const dialog = document.querySelector(".filter-dialog");

const filterBtn = document.querySelector(".filter-btn");
const closeBtn = document.querySelector(".dialog-close");

const clearBtn = document.querySelector(".clear-filter");
const applyBtn = document.querySelector(".apply-filter");

const filterItems = document.querySelectorAll(".filter-items .item");

// Open Modal
filterBtn.addEventListener("click", () => {
  if (!dialog) return;
  syncDialogWithFilterState();
  dialog.showModal();
});

// Close Modal
closeBtn.addEventListener("click", () => {
  dialog?.close();
});

// Close when clicking backdrop
dialog.addEventListener("click", (e) => {
  const dialogBox = dialog.getBoundingClientRect();

  const clickedOutside =
    e.clientX < dialogBox.left ||
    e.clientX > dialogBox.right ||
    e.clientY < dialogBox.top ||
    e.clientY > dialogBox.bottom;

  if (clickedOutside) {
    dialog.close();
  }
});

// Toggle filter items
filterItems.forEach((item) => {
  item.addEventListener("click", () => {
    item.classList.toggle("active");
  });
});

// Clear All Filters
clearBtn.addEventListener("click", () => {
  clearDialogAndTopFilters();
});

// Apply Filters
applyBtn.addEventListener("click", () => {
  applyDialogSelections();
  dialog?.close();
});

const scrollBtn = document.querySelector(".scroll-top-btn");

window.addEventListener("scroll", () => {
  const scrollHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  const scrollPosition = window.scrollY;

  const scrollPercent = (scrollPosition / scrollHeight) * 100;

  scrollBtn.style.background = `
    conic-gradient(
      #ffcc00 ${scrollPercent}%,
      #1a1a1a ${scrollPercent}%
    )
  `;

  if (scrollPosition > 200) {
    scrollBtn.classList.add("active");
  } else {
    scrollBtn.classList.remove("active");
  }
});

scrollBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

const themeSwitch = document.querySelector(".theme-switch");

const lightIcon = document.querySelector(".light-icon");
const darkIcon = document.querySelector(".dark-icon");

if (localStorage.getItem("zettaRightsTheme") === "light") {
  document.documentElement.classList.add("light");

  lightIcon.classList.add("active");
  darkIcon.classList.remove("active");
} else {
  darkIcon.classList.add("active");
}

themeSwitch.addEventListener("click", () => {
  document.documentElement.classList.toggle("light");

  const isLight = document.documentElement.classList.contains("light");

  lightIcon.classList.toggle("active", isLight);

  darkIcon.classList.toggle("active", !isLight);

  localStorage.setItem("zettaRightsTheme", isLight ? "light" : "dark");
});
