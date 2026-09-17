const header = document.querySelector(".header-primary");

window.addEventListener("scroll", () => {
  if (window.scrollY > 0) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY) {
    header.classList.add("hide");
  } else {
    header.classList.remove("hide");
  }

  lastScrollY = currentScrollY;
});

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

const loginLink = document.querySelector(".login-link");
const logoutLink = document.querySelector(".logout-link");
const profileAvatar = document.querySelector(".profile-avatar");

if (currentUser) {
  loginLink.textContent = currentUser.fullName || currentUser.email;

  logoutLink.classList.remove("hidden");

  if (currentUser.profileImage && profileAvatar) {
    profileAvatar.src = currentUser.profileImage;
  }
} else {
  loginLink.textContent = "Login";

  logoutLink.classList.add("hidden");
}

loginLink?.addEventListener("click", () => {
  if (!currentUser) {
    window.location.href = "./login-email.html";
  }
});

logoutLink?.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("likedMovies");
  const currentPage = window.location.pathname;

  if (currentPage.includes("make-offer.html")) {
    window.location.href = "./index.html";
  } else {
    window.location.reload();
  }
});

const burgerMenu = document.querySelector(".burger-menu");
const mobileNav = document.querySelector(".mobile-nav");

burgerMenu?.addEventListener("click", (e) => {
  e.stopPropagation();
  mobileNav.classList.toggle("active");
});

document.addEventListener("click", (e) => {
  if (!mobileNav.contains(e.target) && !burgerMenu.contains(e.target)) {
    mobileNav.classList.remove("active");
  }
});