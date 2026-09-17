const inputs = document.querySelectorAll(".otp-boxes input");
let authFlow = "";

inputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    if (input.value && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !input.value && index > 0) {
      inputs[index - 1].focus();
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // ELEMENTS
  // =========================

  const loginCard = document.querySelector(".login-card");
  const otpCard = document.querySelector(".otp-card");
  const createAccountCard = document.querySelector(".create-account-card");

  // Login Card
  const requestOtpBtn = document.querySelector(".request-otp-btn");
  const loginInput = loginCard?.querySelector(".email-input");
  const termsCheckbox = document.querySelector("#terms");

  termsCheckbox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      requestOtpBtn?.click();
    }
  });

  loginInput.focus();
  // OTP Card
  const verifyBtn = document.querySelector(".verify-btn");
  const otpInputs = document.querySelectorAll(".otp-input");

  otpInputs.forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        verifyBtn?.click();
      }
    });
  });

  // Create Account Card
  const nextBtn = document.querySelector(".next-btn");
  const fullNameInput = document.querySelector("#fullname");
  const emailInput = document.querySelector("#mobile");

  [fullNameInput, emailInput].forEach((input) => {
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        nextBtn?.click();
      }
    });
  });

  const userRadios = document.querySelectorAll('input[name="user-type"]');
  userRadios.forEach((item) => {
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        nextBtn?.click();
      }
    });
  });

  // =========================
  // ERROR TOAST
  // =========================

  const createNewBtn = document.querySelector(".create-new");

  // =========================
  // CARD SWITCH FUNCTION
  // =========================

  function showCard(cardToShow) {
    const cards = [loginCard, otpCard, createAccountCard];

    cards.forEach((card) => {
      card.classList.add("hidden");
    });

    cardToShow.classList.remove("hidden");
  }

  // =========================
  // DEFAULT CARD
  // =========================

  showCard(loginCard);

  // =========================
  // LOGIN -> OTP
  // =========================

  requestOtpBtn?.addEventListener("click", () => {
    let isValid = true;

    clearError(loginInput);

    const value = loginInput.value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value === "") {
      setError(loginInput);
      showError("Enter your email");
      return;
    }

    if (!emailRegex.test(value)) {
      setError(loginInput);
      showError("Enter a valid email address");
      return;
    }

    if (!termsCheckbox.checked) {
      showError("Accept Terms & Conditions");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const userExists = users.some(
      (user) => user.email.toLowerCase() === value.toLowerCase(),
    );

    if (!userExists) {
      setError(loginInput);
      showError("Account not found");
      return;
    }

    authFlow = "login";

    const otpEmailText = otpCard.querySelector(".subtitle span");
    otpEmailText.textContent = value;

    showCard(otpCard);
    otpInputs[0]?.focus();
  });

  // =========================
  // LOGIN -> CREATE ACCOUNT
  // =========================

  createNewBtn?.addEventListener("click", () => {
    showCard(createAccountCard);
    fullNameInput.focus();
  });

  loginInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      requestOtpBtn?.click();
    }
  });

  function showError(message) {
    const oldToast = document.querySelector(".error-toast");

    if (oldToast) {
      oldToast.remove();
    }

    const toast = document.createElement("div");

    toast.className =
      "error-toast fixed top-[25px] left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-[10px] shadow-lg z-[9999] opacity-0 transition-all duration-300";

    toast.innerText = message;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove("opacity-0");
      toast.classList.add("opacity-100");
    });

    setTimeout(() => {
      toast.classList.remove("opacity-100");
      toast.classList.add("opacity-0", "top-[10px]");

      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 2500);
  }

  // =========================
  // INPUT ERROR STYLES
  // =========================

  function setError(input) {
    input.classList.add("!border-red-500", "!ring-2", "!ring-red-500");
  }

  function clearError(input) {
    input.classList.remove("!border-red-500", "!ring-2", "!ring-red-500");
  }

  // Remove error while typing
  document.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
      clearError(input);
    });
  });

  // =========================
  // LOGIN VALIDATION
  // =========================

  // =========================
  // OTP VALIDATION
  // =========================

  verifyBtn?.addEventListener("click", () => {
    let otp = "";

    otpInputs.forEach((input) => {
      clearError(input);

      if (input.value.trim() === "") {
        setError(input);
      }

      otp += input.value.trim();
    });

    if (otp.length < 4) {
      showError("Enter complete OTP");
      return;
    }

    console.log("OTP Verified");
  });

  // Auto move OTP focus
  otpInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      if (input.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && input.value === "" && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });

  // =========================
  // CREATE ACCOUNT VALIDATION
  // =========================

  nextBtn?.addEventListener("click", () => {
    let isValid = true;

    clearError(fullNameInput);
    clearError(emailInput);

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (fullName.length < 3) {
      setError(fullNameInput);
      showError("Enter valid full name");
      isValid = false;
    }

    if (!emailRegex.test(email)) {
      setError(emailInput);
      showError("Enter valid email address");
      isValid = false;
    }

    if (!isValid) return;

    authFlow = "signup";

    const selectedUser = document.querySelector(
      'input[name="user-type"]:checked',
    ).id;

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const userExists = users.some(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );

    if (userExists) {
      setError(emailInput);
      showError("Email already registered");
      return;
    }

    users.push({
      fullName,
      email,
      userType: selectedUser,
    });

    localStorage.setItem("users", JSON.stringify(users));

    localStorage.setItem("userType", selectedUser);

    const otpEmailText = otpCard.querySelector(".subtitle span");
    otpEmailText.textContent = email;

    showCard(otpCard);
    otpInputs[0]?.focus();
  });

  verifyBtn?.addEventListener("click", () => {
    let otp = "";

    otpInputs.forEach((input) => {
      clearError(input);

      if (input.value.trim() === "") {
        setError(input);
      }

      otp += input.value.trim();
    });

    if (otp.length < 4) {
      showError("Enter complete OTP");
      return;
    }

    if (authFlow === "signup") {
      const users = JSON.parse(localStorage.getItem("users")) || [];

      const currentEmail = otpCard.querySelector(".subtitle span").textContent;

      const currentUser = users.find(
        (user) => user.email.toLowerCase() === currentEmail.toLowerCase(),
      );

      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      window.location.href = "./seller.html";
      return;
    }

    if (authFlow === "login") {
      const users = JSON.parse(localStorage.getItem("users")) || [];

      const currentEmail = otpCard.querySelector(".subtitle span").textContent;

      const currentUser = users.find(
        (user) => user.email.toLowerCase() === currentEmail.toLowerCase(),
      );

      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      const redirectUrl = localStorage.getItem("redirectAfterLogin");

      if (redirectUrl) {
        localStorage.removeItem("redirectAfterLogin");
        window.location.href = redirectUrl;
      } else {
        window.history.back();
      }
    }
  });
});
