const TMDB_API_KEY = "7536f0ac42b6f3323fbd71c88988a9c9";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w500";

let currentPage = 1;
let totalPages = 1;
let genresMap = {};
let currentFilterState = null;

// ------------------
// Fetch Genres
// ------------------

async function fetchGenres() {
  const response = await fetch(
    `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`,
  );

  const data = await response.json();

  genresMap = data.genres.reduce((acc, genre) => {
    acc[genre.id] = genre.name;
    return acc;
  }, {});
}

async function fetchMovies(page = 1) {
  const response = await fetch(
    `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}
    &sort_by=popularity.desc
    &include_adult=false
    &include_video=false
    &vote_count.gte=500
    &certification.lte=PG-13
    &page=${page}`.replace(/\s/g, ""),
  );

  return await response.json();
}

// ------------------
// Convert TMDB Format
// ------------------

function transformMovies(tmdbMovies) {
  // Ensure only ITEMS_PER_PAGE movies are transformed
  return tmdbMovies.map((movie) => ({
    title:
      movie.title ||
      movie.name ||
      movie.original_title ||
      movie.original_name ||
      "Untitled",

    image: movie.poster_path
      ? `${TMDB_IMAGE_URL}${movie.poster_path}`
      : "./assets/images/movies/placeholder.jpg",

    desc: movie.overview
      ? movie.overview.substring(0, 120) + "..."
      : "No description available",

    duration: movie.release_date
      ? movie.release_date.split("-")[0]
      : movie.first_air_date
        ? movie.first_air_date.split("-")[0]
        : "N/A",

    genres:
      movie.genre_ids
        ?.slice(0, 3)
        .map((id) => genresMap[id])
        .filter(Boolean) || [],

    stars: Math.max(1, Math.round((movie.vote_average || 0) / 2)),

    rating: (movie.vote_average || 0).toFixed(1),

    reviews: movie.vote_count || 0,
  }));
}

async function fetchFilteredMovies(filter, page = 1) {
  const mediaTypes = Array.isArray(filter.mediaType)
    ? filter.mediaType
    : filter.mediaType
      ? [filter.mediaType]
      : [];
  const releaseYears = Array.isArray(filter.releaseYear)
    ? filter.releaseYear
    : filter.releaseYear
      ? [filter.releaseYear]
      : [];
  const languages = Array.isArray(filter.language)
    ? filter.language
    : filter.language
      ? [filter.language]
      : [];
  const genreIds = Array.isArray(filter.genreId)
    ? filter.genreId.map(Number)
    : filter.genreId
      ? [Number(filter.genreId)]
      : [];

  const endpoints = [];

  if (mediaTypes.includes("series") || mediaTypes.includes("kids")) {
    endpoints.push("tv");
  }

  if (
    mediaTypes.length === 0 ||
    mediaTypes.includes("movie") ||
    mediaTypes.includes("documentary") ||
    mediaTypes.includes("kids")
  ) {
    endpoints.push("movie");
  }

  const buildUrl = (endpoint, requestedPage = page) => {
    const params = [
      `api_key=${TMDB_API_KEY}`,
      "language=en-US",
      `page=${requestedPage}`,
      "include_adult=false",
    ];

    if (filter.query) {
      let url = `${TMDB_BASE_URL}/search/${endpoint}?${params.join("&")}&query=${encodeURIComponent(
        filter.query,
      )}`;

      if (releaseYears.length === 1) {
        url +=
          endpoint === "tv"
            ? `&first_air_date_year=${releaseYears[0]}`
            : `&year=${releaseYears[0]}`;
      }

      if (languages.length > 0) {
        url += `&with_original_language=${languages[0]}`;
      }

      return url;
    }

    params.push("sort_by=popularity.desc", "include_video=false");

    if (endpoint === "movie") {
      params.push("certification_country=US", "certification.lte=PG-13");
      const discoverGenres = [...genreIds];

      if (mediaTypes.length > 0) {
        if (mediaTypes.includes("documentary")) {
          discoverGenres.push(99);
        }

        if (mediaTypes.includes("kids")) {
          discoverGenres.push(16, 10751);
        }
      }

      if (discoverGenres.length > 0) {
        params.push(`with_genres=${[...new Set(discoverGenres)].join(",")}`);
      }

      if (languages.length > 0) {
        params.push(`with_original_language=${languages[0]}`);
      }

      if (releaseYears.length > 0) {
        params.push(`primary_release_year=${releaseYears[0]}`);
      }
    }

    if (endpoint === "tv") {
      const discoverGenres = [...genreIds];

      if (mediaTypes.includes("kids")) {
        discoverGenres.push(16, 10751, 10762);
      }

      if (discoverGenres.length) {
        params.push(`with_genres=${[...new Set(discoverGenres)].join("|")}`);
      }

      if (languages.length > 0) {
        params.push(`with_original_language=${languages[0]}`);
      }

      if (releaseYears.length === 1) {
        params.push(`first_air_date_year=${releaseYears[0]}`);
      }
    }
    console.log(`${TMDB_BASE_URL}/discover/${endpoint}?${params.join("&")}`);
    return `${TMDB_BASE_URL}/discover/${endpoint}?${params.join("&")}`;
  };

  const itemMatchesLocalFilters = (item) => {
    const movieGenres = item.genre_ids || [];

    if (genreIds.length) {
      if (!genreIds.some((genreId) => movieGenres.includes(genreId))) {
        return false;
      }
    }

    if (releaseYears.length > 0) {
      const itemYear = item.release_date
        ? item.release_date.split("-")[0]
        : item.first_air_date
          ? item.first_air_date.split("-")[0]
          : null;
      if (!releaseYears.includes(itemYear)) {
        return false;
      }
    }

    if (languages.length > 0) {
      if (!languages.includes(item.original_language)) {
        return false;
      }
    }

    const isTV = !!item.first_air_date;
    const isMovie = !isTV;

    if (mediaTypes.includes("documentary") && !mediaTypes.includes("series")) {
      if (isMovie && !item.genre_ids?.includes(99)) {
        return false;
      }
    }

    if (mediaTypes.includes("kids")) {
      const isKids =
        item.genre_ids?.includes(10762) ||
        item.genre_ids?.includes(10751) ||
        item.genre_ids?.includes(16);

      if (item.adult || !isKids) {
        return false;
      }
    }
    return true;
  };

  const requiresLocalPagination =
    filter.query &&
    (genreIds.length > 0 ||
      releaseYears.length > 0 ||
      languages.length > 0 ||
      mediaTypes.includes("documentary") ||
      mediaTypes.includes("kids"));

  if (requiresLocalPagination) {
    const seen = new Set();
    const filteredResults = [];
    let currentApiPage = 1;
    let maxApiPages = 1;
    const requiredCount = page * ITEMS_PER_PAGE;
    const maxFetchPages = Math.max(page + 1, 5);

    while (
      currentApiPage <= maxApiPages &&
      filteredResults.length < requiredCount &&
      currentApiPage <= maxFetchPages
    ) {
      const pageResults = [
        ...(await Promise.all(
          endpoints.map(async (endpoint) => {
            const response = await fetch(buildUrl(endpoint, currentApiPage));
            const data = await response.json();

            if (data.total_pages) {
              maxApiPages = Math.min(
                Math.max(maxApiPages, data.total_pages),
                500,
              );
            }

            return data.results || [];
          }),
        )),
      ].flat();

      pageResults.forEach((item) => {
        const itemType =
          item.media_type || (item.first_air_date ? "tv" : "movie");
        const key = `${item.id}-${itemType}`;

        if (seen.has(key)) return;
        if (!itemMatchesLocalFilters(item)) return;

        seen.add(key);
        filteredResults.push(item);
      });

      currentApiPage += 1;
    }

    const effectiveTotalPages = Math.max(
      1,
      Math.ceil(filteredResults.length / ITEMS_PER_PAGE),
    );
    const pageToReturn = Math.min(page, effectiveTotalPages);
    const pageResults = filteredResults.slice(
      (pageToReturn - 1) * ITEMS_PER_PAGE,
      pageToReturn * ITEMS_PER_PAGE,
    );

    return {
      results: pageResults,
      total_pages: effectiveTotalPages,
    };
  }

  let totalPages = 1;
  const allResults = [
    ...(await Promise.all(
      endpoints.map(async (endpoint) => {
        const response = await fetch(buildUrl(endpoint));
        const data = await response.json();

        if (totalPages === 1 && data.total_pages) {
          totalPages = Math.min(data.total_pages, 500);
        }

        return data.results || [];
      }),
    )),
  ].flat();

  // Remove duplicates
  const seen = new Set();

  let results = allResults.filter((item) => {
    const itemType = item.media_type || (item.first_air_date ? "tv" : "movie");

    const key = `${item.id}-${itemType}`;

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });

  if (mediaTypes.includes("kids")) {
    results = results.filter((item) => {
      return (
        item.genre_ids?.includes(10762) || // Kids
        item.genre_ids?.includes(10751) || // Family
        item.genre_ids?.includes(16) // Animation
      );
    });
  }

  // Apply client-side genre filtering when searching (TMDB search endpoint doesn't support genre filtering)
  if (filter.query && genreIds.length > 0) {
    results = results.filter((item) => {
      const movieGenres = item.genre_ids || [];
      return genreIds.some((genreId) => movieGenres.includes(genreId));
    });
  }

  // Apply client-side release year filtering when searching (TMDB search endpoint has limited date filtering)
  if (filter.query && releaseYears.length > 0) {
    results = results.filter((item) => {
      const itemYear = item.release_date
        ? item.release_date.split("-")[0]
        : item.first_air_date
          ? item.first_air_date.split("-")[0]
          : null;
      return releaseYears.includes(itemYear);
    });
  }

  // Only keep filters TMDB cannot handle
  if (filter.query && mediaTypes.includes("documentary")) {
    results = results.filter((item) => item.genre_ids?.includes(99));
  }

  if (filter.query && mediaTypes.includes("kids")) {
    results = results.filter(
      (item) =>
        item.adult === false &&
        (item.genre_ids?.includes(16) || item.genre_ids?.includes(10751)),
    );
  }
  console.log(results);
  return {
    results,
    total_pages: totalPages,
  };
}

async function loadFilteredMovies(filter, page = 1) {
  try {
    currentFilterState = filter;

    const data = await fetchFilteredMovies(filter, page);

    totalPages = Math.max(1, Math.min(data.total_pages || 1, 500));

    currentPage = Math.min(Math.max(page, 1), totalPages);

    if (!data.results.length) {
      document.querySelector(".movies-container").innerHTML =
        "<p class='no-results'>No filtered results found.</p>";

      updatePagination();
      return;
    }

    const movies = transformMovies(data.results);

    const movieIds = data.results.map((movie) => movie.id);

    renderMovies(movies, ".movies-container", movieIds);

    updatePagination();
  } catch (error) {
    console.error("Failed to load filtered movies:", error);
  }
}
function loadPage(page) {
  const adaptedPage = Math.min(Math.max(page, 1), totalPages || 1);
  currentPage = adaptedPage;
  if (currentFilterState) {
    return loadFilteredMovies(currentFilterState, adaptedPage);
  }
  return loadMovies(adaptedPage);
}

// ------------------
// Render Page
// ------------------

async function loadMovies(page = 1) {
  try {
    currentFilterState = null;
    const data = await fetchMovies(page);

    totalPages = Math.min(data.total_pages, 500);

    const movies = transformMovies(data.results);

    const movieIds = data.results.map((movie) => movie.id);

    renderMovies(movies, ".movies-container", movieIds);

    currentPage = page;

    updatePagination();
  } catch (error) {
    console.error("Failed to load movies:", error);
  }
}

// ------------------
// Pagination
// ------------------

function updatePagination() {
  const pageNumbers = document.getElementById("page-numbers");

  pageNumbers.innerHTML = "";

  const visiblePages = 4;

  let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));

  let endPage = startPage + visiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - visiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("button");

    btn.className = `page-number ${i === currentPage ? "active" : ""}`;

    btn.textContent = i;

    btn.addEventListener("click", () => {
      loadPage(i);
    });

    pageNumbers.appendChild(btn);
  }

  document.getElementById("prev-page").disabled = currentPage === 1;

  document.getElementById("next-page").disabled = currentPage === totalPages;
}

document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) {
    loadPage(currentPage - 1);
  }
});

document.getElementById("next-page").addEventListener("click", () => {
  if (currentPage < totalPages) {
    loadPage(currentPage + 1);
  }
});

// ------------------
// Init
// ------------------

(async function init() {
  await fetchGenres();
  await loadMovies(1);
})();


