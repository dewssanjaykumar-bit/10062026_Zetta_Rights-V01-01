const dropdowns = document.querySelectorAll(".dropdown");

dropdowns.forEach((dropdown) => {
  const select = dropdown.querySelector(".dropdown-select");
  const items = dropdown.querySelectorAll(".dropdown-menu li");
  const selectedText = dropdown.querySelector(".dropdown-select span");

  // Open / Close
  select.addEventListener("click", () => {
    // Close other dropdowns
    dropdowns.forEach((item) => {
      if (item !== dropdown) {
        item.classList.remove("active");
      }
    });

    dropdown.classList.toggle("active");
  });

  // Select item
  items.forEach((item) => {
    item.addEventListener("click", () => {
      selectedText.textContent = item.textContent;

      dropdown.classList.remove("active");
    });
  });
});

// Click outside
window.addEventListener("click", (e) => {
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });
});

const saveBtn = document.querySelector(".save-btn");

saveBtn.addEventListener("click", (e) => {
  e.preventDefault();

  let isValid = true;

  // INPUT VALIDATION
  const inputs = document.querySelectorAll("input[data-required]");

  inputs.forEach((input) => {
    const formGroup = input.closest(".form-group");
    const errorMessage = formGroup.querySelector(".error-message");

    input.classList.remove("input-error");
    errorMessage.textContent = "";

    if (input.value.trim() === "") {
      input.classList.add("input-error");
      errorMessage.textContent = "This field is required";

      isValid = false;
    }

    // TAX ID VALIDATION
    if (input.id === "tax-number" && input.value.trim() !== "") {
      const taxRegex = /^[A-Za-z0-9]{6,20}$/;

      if (!taxRegex.test(input.value.trim())) {
        input.classList.add("input-error");
        errorMessage.textContent = "Tax ID must be 6-20 letters/numbers";

        isValid = false;
      }
    }
  });

  // DROPDOWN VALIDATION
  const dropdowns = document.querySelectorAll(".dropdown[data-required]");

  dropdowns.forEach((dropdown) => {
    const formGroup = dropdown.closest(".form-group");
    const errorMessage = formGroup.querySelector(".error-message");

    dropdown.classList.remove("dropdown-error");
    errorMessage.textContent = "";

    const selectedText = dropdown.querySelector(
      ".dropdown-select span",
    ).textContent;

    if (
      selectedText.includes("Select") ||
      selectedText.includes("Category Name")
    ) {
      dropdown.classList.add("dropdown-error");
      errorMessage.textContent = "Please select an option";

      isValid = false;
    }
  });

  if (isValid) {
    if (isValid) {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      const profileData = {
        ...currentUser,

        companyName: document.querySelector("#company-name").value.trim(),
        address: document.querySelector("#address").value.trim(),
        city: document.querySelector("#city").value.trim(),

        state: document
          .querySelectorAll(".dropdown")[0]
          .querySelector(".dropdown-select span").textContent,

        country: document
          .querySelectorAll(".dropdown")[1]
          .querySelector(".dropdown-select span").textContent,

        category: document
          .querySelectorAll(".dropdown")[2]
          .querySelector(".dropdown-select span").textContent,

        taxId: document.querySelector("#text-number").value.trim(),

        profileImage: previewImg.src,

        completedProfile: true,
      };

      localStorage.setItem("currentUser", JSON.stringify(profileData));

      window.location.href = "./index.html";
    }
  }
});

const profileUpload = document.querySelector(".profile-upload");

const fileInput = profileUpload.querySelector(".file-input");
const previewImg = profileUpload.querySelector(".preview-img");
const cameraIcon = profileUpload.querySelector(".camera-icon");
const removeBtn = profileUpload.querySelector(".remove-image");
const placeholderSrc = previewImg.src;

cameraIcon.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please upload an image file");
    return;
  }

  const reader = new FileReader();

  reader.onload = (event) => {
    previewImg.src = event.target.result;

    removeBtn.classList.remove("hidden");
  };

  reader.readAsDataURL(file);
});

profileUpload.querySelector(".profile-img").addEventListener("click", () => {
  fileInput.click();
});

removeBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  previewImg.src = placeholderSrc;

  fileInput.value = "";

  removeBtn.classList.add("hidden");
});

const userType = localStorage.getItem("userType");

if (userType) {
  const formattedUserType =
    userType.charAt(0).toUpperCase() + userType.slice(1);

  document.title = `${formattedUserType} | ZettaRights`;

  const dynamicTitles = document.querySelectorAll(".dynamic-user-title");

  dynamicTitles.forEach((title) => {
    title.textContent = formattedUserType;
  });
}

const focusableElements = [
  ...document.querySelectorAll(
    'input:not([type="hidden"]), .dropdown-select, .save-btn',
  ),
];

focusableElements.forEach((element, index) => {
  element.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    const nextElement = focusableElements[index + 1];

    if (nextElement) {
      nextElement.focus();
    } else {
      saveBtn.click();
    }
  });
});