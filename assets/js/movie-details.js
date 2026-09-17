const TMDB_API_KEY = "7536f0ac42b6f3323fbd71c88988a9c9";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

document.addEventListener("DOMContentLoaded", function () {
  const tabsContainer = document.querySelector(".tabs-container");
  if (!tabsContainer) return;

  const tabs = Array.from(tabsContainer.querySelectorAll(".tab-item"));
  const panels = [
    document.querySelector(".casts"),
    document.querySelector(".crew"),
    document.querySelector(".rights"),
  ].filter(Boolean);

  const originalDisplay = panels.map((el) => {
    const cs = window.getComputedStyle(el);
    return cs && cs.display ? cs.display : "block";
  });

  function showPanel(index) {
    tabs.forEach((t, i) => {
      t.classList.toggle("active", i === index);
    });
    panels.forEach((p, i) => {
      p.style.display = i === index ? originalDisplay[i] : "none";
    });
  }

  const initialIndex = tabs.findIndex((t) => t.classList.contains("active"));
  showPanel(initialIndex >= 0 ? initialIndex : 0);

  tabsContainer.addEventListener("click", function (e) {
    const tab = e.target.closest(".tab-item");
    if (!tab) return;
    const idx = tabs.indexOf(tab);
    if (idx === -1) return;
    showPanel(idx);
  });

  loadSelectedMovieDetails();
});

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function isImdbId(id) {
  return typeof id === "string" && /^tt\d+$/.test(id);
}

async function fetchTmdbMovieByImdb(imdbId) {
  console.log("Fetching TMDB movie for IMDb ID:", imdbId);
  const response = await fetch(
    `${TMDB_BASE_URL}/find/${imdbId}?api_key=${TMDB_API_KEY}&language=en-US&external_source=imdb_id`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch TMDB movie by IMDb ID");
  }
  const data = await response.json();
  if (data.movie_results?.length) {
    return { ...data.movie_results[0], media_type: "movie" };
  }
  if (data.tv_results?.length) {
    return { ...data.tv_results[0], media_type: "tv" };
  }
  return null;
}

async function fetchTmdbMovieDetails(movieId, mediaType = "movie") {
  const response = await fetch(
    `${TMDB_BASE_URL}/${mediaType}/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,images,videos`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch TMDB movie details");
  }
  const details = await response.json();
  details.media_type = mediaType;
  return details;
}

function formatCount(value) {
  if (value == null || Number.isNaN(Number(value))) return "0";
  const num = Number(value);
  if (num >= 1000) {
    return `${Math.round((num / 100) * 10) / 10}K`;
  }
  return `${num}`;
}

function formatRuntime(minutes) {
  if (!minutes) return "N/A";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}

function setupReadMore(aboutEl) {
  if (!aboutEl) return;

  const text = aboutEl.querySelector(".about-text");
  const readMore = aboutEl.querySelector(".read-more");
  if (!text || !readMore) return;

  text.style.display = "block";
  text.style.overflow = "hidden";
  text.style.transition = "max-height 0.25s ease";

  const lineHeight = parseFloat(getComputedStyle(text).lineHeight) || 20;
  const collapsedHeight = lineHeight * 2;

  const needsToggle = text.scrollHeight > collapsedHeight + 1;
  if (!needsToggle) {
    readMore.style.display = "none";
    text.style.maxHeight = "none";
    return;
  }

  text.style.maxHeight = `${collapsedHeight}px`;
  readMore.style.display = "inline-block";
  readMore.textContent = "Read More";

  aboutEl.classList.remove("expanded");
  readMore.addEventListener("click", () => {
    const expanded = aboutEl.classList.toggle("expanded");
    if (expanded) {
      text.style.maxHeight = "none";
      readMore.textContent = "Read Less";
    } else {
      text.style.maxHeight = `${collapsedHeight}px`;
      readMore.textContent = "Read More";
    }
  });
}

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
  return genres
    .map(
      (g) =>
        `<div class="genre-item">${typeof g === "string" ? g : g.name}</div>`,
    )
    .join("");
}

function renderPersonCards(items) {
  return items
    .slice(0, 5)
    .map(
      (person) => `
  <div class="cast-item">
    <div class="cast-img">
      <img src="${person.image}" alt="${person.name}" />
    </div>
    <span class="char-name">${person.name}</span>
    <span class="cast-name">${person.role}</span>
  </div>
  `,
    )
    .join("");
}

function updateMovieDetails(details) {
  const titleElements = document.querySelectorAll(".movie-name");
  titleElements.forEach((el) => {
    el.textContent = details.title || details.name || "Movie";
  });

  const currentPage = document.querySelector(".current-page");
  if (currentPage)
    currentPage.textContent = details.title || details.name || "Movie";

  const aboutEl = document.querySelector(".about-movie");
  if (aboutEl) {
    aboutEl.innerHTML = `
      <span class="about-text">${details.overview || "No overview available."}</span>
      <span class="text-[#ffd45e] text-[15px] read-more">Read More</span>
    `;
    setupReadMore(aboutEl);
  }

  const firstInfoItem = document.querySelector(".more-info .info-item");
  if (firstInfoItem) {
    firstInfoItem.innerHTML = `
      <div class="duration flex items-center gap-2 mr-[.5vw]">
        <img src="./assets/images/Home/LatestContent/Time_Icon.png" alt="" class="w-[1vw]" />
        <span class="text-[14px]">${formatRuntime(details.runtime)}</span>
      </div>
      ${renderGenres(details.genres || [])}
    `;
  }

  const reviewStars = document.querySelector(".review-stars");
  if (reviewStars) {
    const starCount = Math.round((details.vote_average || 0) / 2);
    reviewStars.innerHTML = renderStars(starCount);
  }

  const starsCount = document.querySelector(".stars-count");
  if (starsCount)
    starsCount.textContent = `(${(details.vote_average || 0).toFixed(1)})`;

  const reviewsCount = document.querySelector(".reviews-count");
  if (reviewsCount)
    reviewsCount.textContent = `${formatCount(details.vote_count)} Reviews`;

  const likesCount = document.querySelector(".likes-count");
  if (likesCount)
    likesCount.textContent = `${formatCount(Math.round(details.popularity || 0))}`;

  const commentsCount = document.querySelector(".comments-count");
  if (commentsCount)
    commentsCount.textContent = `(${formatCount(details.vote_count)})`;

  const smallImagesContainer = document.querySelector(".movie-images-small");
  const videoResults = details.videos?.results
    ? details.videos.results.filter(
        (video) => video.site === "YouTube" && video.key,
      )
    : [];

  const youtubeVideos = videoResults.slice(0, 5);

  const hasTrailer = youtubeVideos.length > 0;

  window.currentTrailerKey = youtubeVideos[0]?.key || null;
  const previewImage = document.querySelector(".movie-image-preview img");
  const imagePaths = [];
  if (details.images && Array.isArray(details.images.backdrops)) {
    details.images.backdrops.slice(0, 3).forEach((img) => {
      if (img.file_path)
        imagePaths.push(`${TMDB_IMAGE_BASE_URL}${img.file_path}`);
    });
  }
  if (
    imagePaths.length < 3 &&
    details.images &&
    Array.isArray(details.images.posters)
  ) {
    details.images.posters.slice(0, 3 - imagePaths.length).forEach((img) => {
      if (img.file_path)
        imagePaths.push(`${TMDB_IMAGE_BASE_URL}${img.file_path}`);
    });
  }

  const fallbackImage = details.poster_path
    ? `${TMDB_IMAGE_BASE_URL}${details.poster_path}`
    : "./assets/images/movies/no-image.jpg";
  while (imagePaths.length < 3) {
    imagePaths.push(fallbackImage);
  }
  const imagesToShow = imagePaths.slice(0, 3);

  console.log(imagesToShow);

  if (smallImagesContainer) {
    smallImagesContainer.innerHTML = imagesToShow
      .map(
        (image, index) => `
      <div class="movie-img w-[9vw]">
        <img src="${image}" alt="${details.title || "Movie image"}" />

        ${
          index >= 1 && hasTrailer
            ? `
              <div class="play-btn">
                <img src="./assets/images/DetailPage/Plybutton_Icon.png" alt="">
              </div>
            `
            : ""
        }
      </div>
    `,
      )
      .join("");

    const movieImagesSmall = document.querySelectorAll(
      ".movie-images-small .movie-img",
    );

    movieImagesSmall[0].classList.add("active");

    movieImagesSmall.forEach((item) => {
      item.addEventListener("click", () => {
        movieImagesSmall.forEach((img) => {
          img.classList.remove("active");
        });
        item.classList.add("active");
      });
    });

    const previewPlayBtn = document.querySelector(
      ".movie-image-preview .preview-play-btn",
    );

    smallImagesContainer.querySelectorAll(".movie-img").forEach((img) => {
      img.addEventListener("click", () => {
        if (previewImage) {
          previewImage.src = img.querySelector("img").src;
        }

        const hasPlayButton = img.querySelector(".play-btn");

        if (previewPlayBtn) {
          previewPlayBtn.style.display = hasPlayButton ? "block" : "none";
        }
      });
    });
  }

  if (previewImage) {
    previewImage.src = imagesToShow[0] || fallbackImage;
  }

  const castsContainer = document.querySelector(".casts");
  if (castsContainer) {
    const casts = details.credits?.cast
      ? details.credits.cast.slice(0, 5).map((item) => ({
          name: item.name,
          role: item.character || item.name,
          image: item.profile_path
            ? `${TMDB_IMAGE_BASE_URL}${item.profile_path}`
            : "./assets/images/DetailPage/profileDefault.png",
        }))
      : [];
    castsContainer.innerHTML = renderPersonCards(casts);
  }

  const crewContainer = document.querySelector(".crew");
  if (crewContainer) {
    const crew = details.credits?.crew
      ? details.credits.crew
          .filter((item) =>
            ["Director", "Producer", "Writer", "Screenplay", "Editor"].includes(
              item.job,
            ),
          )
          .slice(0, 5)
          .map((item) => ({
            name: item.name,
            role: item.job,
            image: item.profile_path
              ? `${TMDB_IMAGE_BASE_URL}${item.profile_path}`
              : "./assets/images/DetailPage/profileDefault.png",
          }))
      : [];
    crewContainer.innerHTML = renderPersonCards(crew);
  }

  window.currentTrailerKey = youtubeVideos[0]?.key || null;
  const previewPlayBtn = document.querySelector(".preview-play-btn");

  if (previewPlayBtn) {
    previewPlayBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!window.currentTrailerKey) return;

      const modal = document.querySelector(".video-modal");
      const iframe = document.querySelector("#modalTrailer");

      iframe.src = `https://www.youtube.com/embed/${window.currentTrailerKey}?autoplay=1`;

      console.log(iframe.src)

      modal.classList.add("active");
    });
  }
}

document.addEventListener("click", (e) => {
  const modal = document.querySelector(".video-modal");
  const iframe = document.querySelector("#modalTrailer");

  if (!modal) return;

  if (
    e.target.closest(".close-video-modal") ||
    e.target.classList.contains("video-modal")
  ) {
    console.log("closing");
    modal.classList.remove("active");
    iframe.src = "";
  }
});

async function loadSelectedMovieDetails() {
  const rawId = getQueryParam("id");
  if (!rawId) return;

  try {
    let details = null;

    if (isImdbId(rawId)) {
      const tmdbMovie = await fetchTmdbMovieByImdb(rawId);
      console.log("TMDB Movie:", tmdbMovie);
      if (!tmdbMovie) return;
      details = await fetchTmdbMovieDetails(tmdbMovie.id, tmdbMovie.media_type);
    } else {
      const movieId = rawId;
      try {
        details = await fetchTmdbMovieDetails(movieId, "movie");
      } catch (movieError) {
        console.warn(
          "Movie detail fetch failed, trying TV endpoint",
          movieError,
        );
        details = await fetchTmdbMovieDetails(movieId, "tv");
      }
    }

    if (details) {
      updateMovieDetails(details);
    }
  } catch (error) {
    console.error("Failed to load selected movie details:", error);
  }
}

function renderMovies(movies, wrapperSelector, imdbIds = []) {
  const wrapper = document.querySelector(wrapperSelector);

  wrapper.innerHTML = movies
    .map((movie, index) => {
      const imdbId = imdbIds[index] || "";
      const imdbAttr = imdbId ? `data-imdb="${imdbId}"` : "";

      return `
        <div class="swiper-slide" ${imdbAttr}>
          <div class="slide-item">

            <div class="movie-img">
              <img src="${movie.image}" alt="${movie.title}" />

              <div class="like-btn">
                <img
                  src="./assets/images/Home/LatestContent/Like_Icon.png"
                  class="liked"
                />
                <img
                  src="./assets/images/Home/LatestContent/UnFilledLiike_Img.png"
                  class="like"
                />
              </div>

              <div class="make-offer">
                Make an Offer
              </div>
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
    const movieTitle = movies[index]?.title || "";

    const slideItem = slide.querySelector(".slide-item");
    const likeBtn = slide.querySelector(".like-btn");
    const likedIcon = slide.querySelector(".liked");
    const unlikedIcon = slide.querySelector(".like");
    const makeOfferBtn = slide.querySelector(".make-offer");

    // --------------------------
    // Movie Details Navigation
    // --------------------------
    if (slideItem && imdbId) {
      slideItem.style.cursor = "pointer";

      slideItem.addEventListener("click", (e) => {
        if (e.target.closest(".like-btn") || e.target.closest(".make-offer")) {
          return;
        }

        window.location.href = `./movie-details.html?id=${imdbId}`;
      });
    }

    // --------------------------
    // Like Button
    // --------------------------
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

    // --------------------------
    // Make Offer
    // --------------------------
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

const makeOfferButtons = document.querySelectorAll(".make-offer-btn");

makeOfferButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!isLoggedIn()) {
      redirectToLogin();
      return;
    }

    const movieTitle =
      document.querySelector(".movie-name")?.textContent || "Unknown Movie";

    window.location.href = `./make-offer.html?movie=${encodeURIComponent(movieTitle)}`;
  });
});

const likesBtn = document.querySelector(".likes-btn");

likesBtn.addEventListener("click", (e) => {
  if (!isLoggedIn()) {
    redirectToLogin();
    return;
  }
  e.currentTarget.classList.toggle("active");
});

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
      1024: { slidesPerView: 4 },
      1601: { slidesPerView: 5 },
    },
  });
}

const imdbIds = [
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

function isLoggedIn() {
  const currentUser = localStorage.getItem("currentUser");

  return currentUser !== null;
}

function redirectToLogin() {
  localStorage.setItem("redirectAfterLogin", window.location.href);
  window.location.href = "./login-email.html";
}

renderMovies(latestMovies, ".related-items-slider .swiper-wrapper", imdbIds);
initSwiper(".related-items-slider");

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
