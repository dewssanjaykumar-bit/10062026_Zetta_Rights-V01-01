const ITEMS_PER_PAGE = 20;

const swiper = new Swiper(".hero-slider .swiper", {
  effect: "cards",

  slidesPerView: 1,
  spaceBetween: 20,

  autoplay: {
    delay: 3000,
  },
  cardsEffect: {
    perSlideOffset: 10,
    perSlideRotate: 2,
    rotate: true,
    slideShadows: false,
  },
});

const slider = document.querySelector(".latest-content-slider .swiper-wrapper");

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

    while (container.scrollWidth > container.clientWidth && tags.length > 1) {
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

function renderMovies(movies, wrapperSelector, imdbIds = []) {
  const wrapper = document.querySelector(wrapperSelector);

  // Ensure only ITEMS_PER_PAGE (20) movies are displayed per page
  const moviesToDisplay = movies.slice(0, ITEMS_PER_PAGE);

  wrapper.innerHTML = moviesToDisplay
    .map((movie, index) => {
      const imdbId = imdbIds[index] || "";
      const imdbAttr = imdbId ? ` data-imdb="${imdbId}"` : "";

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
    if (!imdbId || !slideItem) return;
    slideItem.style.cursor = "pointer";
    slideItem.addEventListener("click", (e) => {
      if (!e.target.closest(".make-offer")) {
        window.location.href = `./movie-details.html?id=${imdbId}`;
      }
    });

    const likeBtn = slide.querySelector(".like-btn");
    const likedIcon = slide.querySelector(".liked");
    const unlikedIcon = slide.querySelector(".like");

    if (likeBtn) {
      // Load saved state
      const likedMovies = JSON.parse(localStorage.getItem("likedMovies")) || [];

      const isLiked = likedMovies.includes(imdbId);

      likedIcon.style.display = isLiked ? "block" : "none";
      unlikedIcon.style.display = isLiked ? "none" : "block";

      likeBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        if (!isLoggedIn()) {
          redirectToLogin();
          return;
        }

        let likedMovies = JSON.parse(localStorage.getItem("likedMovies")) || [];

        const movieIndex = likedMovies.indexOf(imdbId);

        if (movieIndex > -1) {
          // Unlike
          likedMovies.splice(movieIndex, 1);

          likedIcon.style.display = "none";
          unlikedIcon.style.display = "block";
        } else {
          // Like
          likedMovies.push(imdbId);

          likedIcon.style.display = "block";
          unlikedIcon.style.display = "none";
        }

        localStorage.setItem("likedMovies", JSON.stringify(likedMovies));
      });
    }

    // Add event listener for "Make an Offer" button
    const makeOfferBtn = slide.querySelector(".make-offer");

    if (makeOfferBtn) {
      makeOfferBtn.style.cursor = "pointer";

      makeOfferBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        if (!isLoggedIn()) {
          redirectToLogin();
          return;
        }

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

function initSwiper(selector) {
  const root = document.querySelector(selector);

  return new Swiper(root, {
    slidesPerView: 4,
    spaceBetween: 33,

    navigation: {
      prevEl: root.parentElement.querySelector(".nav-left"),
      nextEl: root.parentElement.querySelector(".nav-right"),
    },

    breakpoints: {
      320: { slidesPerView: 1 },
      480: { slidesPerView: 2 },
      769: { slidesPerView: 3 },
      1025: { slidesPerView: 4 },
      1601: { slidesPerView: 5 },
    },
  });
}

const latestContent = [
  "tt11998558",
  "tt1630029",
  "tt15163652",
  "tt0468569",
  "tt4983780",
  "tt15654328",
  "tt15354916",
  "tt10698680",
  "tt1375666",
  "tt0816692",
];

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

const shortContent = [
  "tt14418858",
  "tt15426956",
  "tt41334106",
  "tt16290704",
  "tt13536138",
  "tt2388725",
  "tt3605002",
  "tt7129636",
  "tt4817576",
  "tt8163822",
];

const lowBudgetContent = [
  "tt20850406",
  "tt10709484",
  "tt8178634",
  "tt14526318",
  "tt11772746",
  "tt26691319",
  "tt22488728",
  "tt28184712",
  "tt27007466",
  "tt25405130",
];

renderMovies(
  latestMovies,
  ".latest-content-slider .swiper-wrapper",
  latestContent,
);
initSwiper(".latest-content-slider");

renderMovies(
  tamilMovies,
  ".tamil-content-slider .swiper-wrapper",
  tamilContent,
);
initSwiper(".tamil-content-slider");

renderMovies(shortFilms, ".short-content-slider .swiper-wrapper", shortContent);
initSwiper(".short-content-slider");

renderMovies(
  lowBudgetMovies,
  ".low-budget-content-slider .swiper-wrapper",
  lowBudgetContent,
);
initSwiper(".low-budget-content-slider");

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

// Load saved theme
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

const exploreBtn = document.querySelector(".explore-btn");

exploreBtn.addEventListener("click", () => {
  window.location.href = "./filters.html";
});

const counters = document.querySelectorAll(".count");

counters.forEach((counter) => {
  const target = +counter.textContent;
  let current = 0;

  const increment = target / 50;

  const updateCounter = () => {
    current += increment;

    if (current < target) {
      counter.textContent = Math.ceil(current);
      requestAnimationFrame(updateCounter);
    } else {
      counter.textContent = target;
    }
  };

  updateCounter();
});
