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

// Update breadcrumbs based on movie title from URL
function updateBreadcrumbs() {
  const urlParams = new URLSearchParams(window.location.search);
  const movieTitle = urlParams.get("movie");

  if (movieTitle) {
    const prevPageElement = document.querySelector(".breadcrumbs .prev-page");
    if (prevPageElement) {
      prevPageElement.textContent = decodeURIComponent(movieTitle);
    }
  }
}

// Call the function when page loads
updateBreadcrumbs();

function initializeCountrySelector(wrapper) {
  const selectBox = wrapper.querySelector(".select-box");
  const countryInput = selectBox.querySelector("input");
  const clearAllBtn = selectBox.querySelector("button");
  const dropdownMenu = wrapper.querySelector(".dropdown-menu");
  const tagsContainer =
    wrapper.querySelector(".tags-container") ||
    wrapper.querySelector(".selected-tags");

  const selectedCountries = new Set();

  const options = dropdownMenu ? dropdownMenu.querySelectorAll("li") : [];

  // Open dropdown
  if (dropdownMenu) {
    selectBox.addEventListener("click", (e) => {
      if (e.target === clearAllBtn) return;
      dropdownMenu.classList.add("show");
    });

    countryInput.addEventListener("focus", () => {
      dropdownMenu.classList.add("show");
    });

    // Search filter
    const noDataItem = dropdownMenu.querySelector(".no-data");

    countryInput.addEventListener("input", (e) => {
      dropdownMenu.classList.add("show");

      const filterValue = e.target.value.toLowerCase().trim();

      let hasMatch = false;

      options.forEach((option) => {
        const matches = option.innerText.toLowerCase().includes(filterValue);

        option.style.display = matches ? "block" : "none";

        if (matches) hasMatch = true;
      });

      noDataItem.style.display = hasMatch ? "none" : "block";
    });

    // Select country
    options.forEach((option) => {
      option.addEventListener("click", () => {
        const value = option.dataset.value;

        createTag(value);

        countryInput.value = "";
        resetFilters();
        dropdownMenu.classList.remove("show");
      });
    });
  }

  function createTag(countryName) {
    if (selectedCountries.has(countryName)) return;

    const tag = document.createElement("div");
    tag.classList.add("tag");

    tag.innerHTML = `
      <span class="tag-text">${countryName}</span>
      <span class="tag-close">&times;</span>
    `;

    tag.querySelector(".tag-close").addEventListener("click", () => {
      tag.remove();
      selectedCountries.delete(countryName);
    });

    tagsContainer.appendChild(tag);
    const error = tagsContainer.parentElement.querySelector(".error-message");
    if (error) {
      tagsContainer.nextElementSibling.remove();
    }
    selectedCountries.add(countryName);
  }

  function resetFilters() {
    options.forEach((option) => {
      option.style.display = "block";
    });
  }

  // Clear all
  clearAllBtn.addEventListener("click", () => {
    tagsContainer.innerHTML = "";
    selectedCountries.clear();
    countryInput.value = "";

    if (dropdownMenu) {
      resetFilters();
      dropdownMenu.classList.remove("show");
    }
  });

  // Close dropdown outside click
  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target) && dropdownMenu) {
      dropdownMenu.classList.remove("show");
    }
  });
}

document
  .querySelectorAll(".select-countries, .exclude-countries")
  .forEach((wrapper) => {
    initializeCountrySelector(wrapper);
  });

const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");

const yearsInput = document.getElementById("years");
const monthsInput = document.getElementById("months");

function calculatePeriod() {
  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);

  if (!startDateInput.value || !endDateInput.value) {
    yearsInput.value = "";
    monthsInput.value = "";
    return;
  }

  if (endDate < startDate) {
    yearsInput.value = "";
    monthsInput.value = "";
    return;
  }

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  yearsInput.value = years;
  monthsInput.value = months;
}

startDateInput.addEventListener("change", calculatePeriod);
endDateInput.addEventListener("change", calculatePeriod);

const nextBtn = document.querySelector(".next-btn");

// nextBtn.addEventListener("click", (e) => {
//   e.preventDefault();

//   const selectedCountries = document.querySelector(
//     ".select-countries .tags-container",
//   );

//   const excludedCountries = document.querySelector(
//     ".exclude-countries .tags-container",
//   );

//   const startDate = document.getElementById("start-date").value;
//   const endDate = document.getElementById("end-date").value;

//   // Remove previous errors
//   document.querySelectorAll(".error-message").forEach((el) => el.remove());

//   let isValid = true;

//   // -----------------------
//   // License Region
//   // -----------------------

//   if (isValid) {
//     console.log("Form Valid");
//   }
// });

function showError(element, message) {
  const error = document.createElement("div");

  error.classList.add("error-message");
  error.textContent = message;

  error.style.color = "#ff4d4f";
  error.style.fontSize = "12px";
  error.style.marginTop = "6px";

  element.parentElement.appendChild(error);
}

function validateStep1() {
  const selectedCountries = document.querySelector(
    ".select-countries .tags-container",
  );

  const excludedCountries = document.querySelector(
    ".exclude-countries .tags-container",
  );

  const startDate = document.getElementById("start-date").value;
  const endDate = document.getElementById("end-date").value;

  document.querySelectorAll(".error-message").forEach((el) => el.remove());

  let isValid = true;
  const selectedTags = selectedCountries.querySelectorAll(".tag");

  if (selectedTags.length === 0) {
    showError(selectedCountries, "Please select at least one country.");
    isValid = false;
  }

  // -----------------------
  // License Period
  // -----------------------

  if (!startDate) {
    showError(document.getElementById("start-date"), "Start date is required.");
    isValid = false;
  }

  if (!endDate) {
    showError(document.getElementById("end-date"), "End date is required.");
    isValid = false;
  }

  if (startDate && endDate) {
    if (new Date(endDate) < new Date(startDate)) {
      showError(
        document.getElementById("end-date"),
        "End date cannot be before start date.",
      );
      isValid = false;
    }
  }

  // -----------------------
  // Global Validation
  // -----------------------

  const selectedNames = [...selectedTags].map((tag) =>
    tag.querySelector(".tag-text").textContent.trim(),
  );

  if (selectedNames.includes("Global") && selectedNames.length > 1) {
    showError(
      selectedCountries,
      'When "Global" is selected, no other countries can be selected.',
    );
    isValid = false;
  }

  // -----------------------
  // Excluded Countries Validation
  // -----------------------

  const excludedTags = excludedCountries.querySelectorAll(".tag");

  const excludedNames = [...excludedTags].map((tag) =>
    tag.querySelector(".tag-text").textContent.trim(),
  );

  const duplicates = excludedNames.filter((country) =>
    selectedNames.includes(country),
  );

  if (duplicates.length > 0) {
    showError(
      excludedCountries,
      `Cannot exclude selected country: ${duplicates.join(", ")}`,
    );
    isValid = false;
  }

  return isValid;
}

function removeError(element) {
  const parent = element.parentElement;

  const error = parent.querySelector(".error-message");

  if (error) {
    error.remove();
  }
}

startDateInput.addEventListener("input", () => {
  removeError(startDateInput);
});

endDateInput.addEventListener("input", () => {
  removeError(endDateInput);
});

const customSelects = document.querySelectorAll(".custom-select-wrapper");

customSelects.forEach((wrapper) => {
  const selectBox = wrapper.querySelector(".select-box");
  const inputField = wrapper.querySelector(".dropdown-input");
  const dropdownMenu = wrapper.querySelector(".dropdown-menu");
  const options = dropdownMenu.querySelectorAll("li[data-value]");

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
      inputField.value = option.getAttribute("data-value");
      dropdownMenu.classList.remove("show");
    });
  });
});

document.addEventListener("click", (e) => {
  document.querySelectorAll(".custom-select-wrapper").forEach((wrapper) => {
    if (!wrapper.contains(e.target)) {
      wrapper.querySelector(".dropdown-menu")?.classList.remove("show");
    }
  });
});

const steps = document.querySelectorAll(".step-section");
const prevBtn = document.querySelector(".prev-btn");

let currentStep = 0;

function updateStep() {
  // Hide all steps
  steps.forEach((step) => step.classList.remove("active"));

  // Show current step
  steps[currentStep].classList.add("active");

  // Hide prev button on first step
  prevBtn.style.visibility = currentStep === 0 ? "hidden" : "visible";

  // Change next button text on last step
  nextBtn.textContent =
    currentStep === steps.length - 1 ? "Send an Offer" : "Next";

  updateStepper();
}

nextBtn.addEventListener("click", (e) => {
  e.preventDefault();

  // Validate only Step 1
  if (currentStep === 0 && !validateStep1()) {
    return;
  }

  if (currentStep < steps.length - 1) {
    currentStep++;
    updateStep();
  } else {
    currentStep++;
    updateStepper();
    const toast = document.querySelector(".toast");
    toast.classList.add("active");
    setTimeout(() => {
      toast.classList.remove("active");
      window.history.back();
    }, 3000);
  }
});
prevBtn.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep--;
    updateStep();
    document.querySelector(".license-content").scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
});

updateStep();

const startDate = document.getElementById("start-date");
const endDate = document.getElementById("end-date");

startDate.addEventListener("change", () => {
  endDate.min = startDate.value;

  if (endDate.value && endDate.value < startDate.value) {
    endDate.value = "";
  }
});

endDate.addEventListener("change", () => {
  startDate.max = endDate.value;

  if (startDate.value && startDate.value > endDate.value) {
    startDate.value = "";
  }
});

const flatRateRadio = document.getElementById("flat-rate");
const shareRevenueRadio = document.getElementById("share-revenue");

const flatRateContainer = document.querySelector(".flat-rate-container");
const shareRevenueContainer = document.querySelector(
  ".share-revenue-container",
);

function togglePricingModel() {
  if (flatRateRadio.checked) {
    flatRateContainer.style.display = "block";
    shareRevenueContainer.style.display = "none";
  } else {
    flatRateContainer.style.display = "none";
    shareRevenueContainer.style.display = "block";
  }
}

// Initial state
togglePricingModel();

// Radio change events
flatRateRadio.addEventListener("change", togglePricingModel);
shareRevenueRadio.addEventListener("change", togglePricingModel);

const paymentOptions = document.querySelectorAll(".option input");

paymentOptions.forEach((option) => {
  option.addEventListener("change", () => {
    paymentOptions.forEach((opt) => {
      if (opt !== option) {
        opt.checked = false;
      }
    });
  });
});

function updateCurrencyLabels(currencyText) {
  let symbol = "₹";

  document.querySelectorAll(".currency-label").forEach((label) => {
    if (currencyText.includes("Indian")) {
      label.textContent = "₹ INR";
      symbol = "₹";
    } else if (currencyText.includes("Dollar")) {
      label.textContent = "$ USD";
      symbol = "$";
    } else if (currencyText.includes("Euro")) {
      label.textContent = "€ EUR";
      symbol = "€";
    } else if (currencyText.includes("Pound")) {
      label.textContent = "£ GBP";
      symbol = "£";
    }
  });

  document.querySelector(".total-currency").textContent = symbol;
}

const currencySelectors = document.querySelectorAll(".currency-selector li");

currencySelectors.forEach((item) => {
  item.addEventListener("click", () => {
    updateCurrencyLabels(item.dataset.value);
  });
});

function updateStepper() {
  const stepperSteps = document.querySelectorAll(".stepper .step");
  const lines = document.querySelectorAll(".stepper .line");
  stepperSteps.forEach((step, index) => {
    console.log(step);
    const circle = step.querySelector(".circle");
    const status = step.querySelector(".status");

    step.classList.remove("active", "completed");

    if (index < currentStep) {
      step.classList.add("completed");

      circle.innerHTML =
        "<img src='./assets/images/MakeAnOffer/progress_Icon.png' />";
      status.textContent = "Completed";
    } else if (index === currentStep) {
      step.classList.add("active");

      circle.textContent = index + 1;
      status.textContent = "";
    } else {
      circle.textContent = index + 1;
      status.textContent = "";
    }
  });

  lines.forEach((line, index) => {
    if (index < currentStep) {
      line.classList.add("completed");
    } else {
      line.classList.remove("completed");
    }
  });
}

document.querySelectorAll('input[type="number"]').forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  });
});

const amountInput = document.querySelector(
  ".flat-rate-container .amount-input input",
);

const totalAmount = document.querySelector(".amont-value");

function updateTotalAmount() {
  const value = Number(amountInput.value) || 0;

  totalAmount.textContent = value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

amountInput.addEventListener("input", updateTotalAmount);

updateTotalAmount();

const transactionInputs = document.querySelectorAll(
  ".share-revenue-container .form-group:first-of-type input",
);

const shareInput = document.querySelector(
  '.share-revenue-container input[type="number"][value="70"]',
);

const estimatedInputs = document.querySelectorAll(
  ".share-revenue-container .form-group:nth-of-type(3) input",
);

const minTransactionInput = transactionInputs[0];
const maxTransactionInput = transactionInputs[1];

const minEstimateInput = estimatedInputs[0];
const maxEstimateInput = estimatedInputs[1];

function updateMonthlyLicenseFee() {
  const minTransaction = Number(minTransactionInput.value) || 0;
  const maxTransaction = Number(maxTransactionInput.value) || 0;
  const sharePercent = Number(shareInput.value) || 0;

  minEstimateInput.value = ((minTransaction * sharePercent) / 100).toFixed(2);

  maxEstimateInput.value = ((maxTransaction * sharePercent) / 100).toFixed(2);
}

minTransactionInput.addEventListener("input", updateMonthlyLicenseFee);
maxTransactionInput.addEventListener("input", updateMonthlyLicenseFee);
shareInput.addEventListener("input", updateMonthlyLicenseFee);

updateMonthlyLicenseFee();

const prevPage = document.querySelector(".breadcrumbs .prev-page");

prevPage.addEventListener("click", () => {
  window.history.back();
});
