const navigation = document.querySelector(".site-header nav");

if (navigation) {
    const menuButton = document.createElement("button");
    const mobileQuery = window.matchMedia("(max-width: 820px)");

    menuButton.className = "nav-toggle";
    menuButton.type = "button";
    menuButton.textContent = "Menu";
    menuButton.setAttribute("aria-controls", "main-navigation");
    menuButton.setAttribute("aria-expanded", "true");
    navigation.id = "main-navigation";
    navigation.before(menuButton);

    function setMenuState(isOpen) {
        const shouldCollapse = mobileQuery.matches && !isOpen;
        navigation.classList.toggle("is-collapsed", shouldCollapse);
        menuButton.setAttribute("aria-expanded", String(!shouldCollapse));
        menuButton.textContent = shouldCollapse ? "Menu" : "Close menu";
    }

    menuButton.addEventListener("click", () => {
        setMenuState(navigation.classList.contains("is-collapsed"));
    });

    navigation.addEventListener("click", (event) => {
        if (event.target.closest("a") && mobileQuery.matches) {
            setMenuState(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && mobileQuery.matches) {
            setMenuState(false);
            menuButton.focus();
        }
    });

    mobileQuery.addEventListener("change", (event) => {
        setMenuState(!event.matches);
    });

    setMenuState(!mobileQuery.matches);
}

const galleryImages = document.querySelectorAll(".hero-gallery img, .product-grid img");

if (galleryImages.length > 0 && typeof HTMLDialogElement !== "undefined") {
    const lightbox = document.createElement("dialog");
    const lightboxContent = document.createElement("div");
    const lightboxImage = document.createElement("img");
    const lightboxCaption = document.createElement("p");
    const closeButton = document.createElement("button");

    lightbox.className = "image-lightbox";
    lightbox.setAttribute("aria-label", "Food image viewer");
    lightboxContent.className = "image-lightbox-content";
    lightboxImage.alt = "";
    closeButton.className = "image-lightbox-close";
    closeButton.type = "button";
    closeButton.textContent = "Close";
    lightboxContent.append(lightboxImage, lightboxCaption, closeButton);
    lightbox.append(lightboxContent);
    document.body.append(lightbox);

    function openLightbox(image) {
        lightboxImage.src = image.currentSrc || image.src;
        lightboxImage.alt = image.alt;
        lightboxCaption.textContent = image.alt;
        lightbox.showModal();
        closeButton.focus();
    }

    galleryImages.forEach((image) => {
        image.tabIndex = 0;
        image.setAttribute("role", "button");
        image.setAttribute("aria-label", `View larger image: ${image.alt}`);
        image.addEventListener("click", () => openLightbox(image));
        image.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openLightbox(image);
            }
        });
    });

    closeButton.addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) {
            lightbox.close();
        }
    });
}

const enquiryForm = document.querySelector(".enquiry-form");

if (enquiryForm) {
    const responseMessage = enquiryForm.querySelector(".form-response");
    const emailLink = enquiryForm.querySelector(".form-email-link");
    const validationSummary = enquiryForm.querySelector(".form-validation-summary");
    const nameField = enquiryForm.elements.namedItem("name");
    const emailField = enquiryForm.elements.namedItem("email");
    const phoneField = enquiryForm.elements.namedItem("phone");
    const messageField = enquiryForm.elements.namedItem("message");
    const dateField = enquiryForm.elements.namedItem("date");
    const typeField = enquiryForm.elements.namedItem("type");
    const guestsField = enquiryForm.elements.namedItem("guests");
    const requestedType = new URLSearchParams(window.location.search).get("type");

    if (requestedType && Array.from(typeField.options).some((option) => option.value === requestedType)) {
        typeField.value = requestedType;
    }

    const today = new Date();
    const localToday = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");
    const validationFields = [nameField, emailField, phoneField, dateField, messageField];
    const phonePattern = /^\+?[0-9().\s-]{7,20}$/;

    dateField.min = localToday;
    phoneField.title = "Enter a phone number with 7 to 20 digits or common phone symbols.";

    validationFields.forEach((field) => {
        const errorMessage = document.createElement("span");
        errorMessage.className = "field-error";
        errorMessage.id = `${field.name}-error`;
        errorMessage.hidden = true;
        errorMessage.setAttribute("aria-live", "polite");
        field.after(errorMessage);
        field.setAttribute("aria-describedby", errorMessage.id);
    });

    function getFieldError(field) {
        const value = field.value.trim();

        if (field === nameField) {
            if (!value) return "Please enter your full name.";
            if (value.length > 100) return "Your name must be 100 characters or fewer.";
        }

        if (field === emailField) {
            if (!value) return "Please enter your email address.";
            if (field.validity.typeMismatch) return "Enter a valid email address, for example name@example.com.";
            if (value.length > 254) return "Your email address must be 254 characters or fewer.";
        }

        if (field === phoneField && value && !phonePattern.test(value)) {
            return "Enter a valid phone number using 7 to 20 digits and common phone symbols.";
        }

        if (field === dateField) {
            if (field.required && !value) return "Choose a date for your table reservation.";
            if (value && value < localToday) return "Choose today or a future date.";
        }

        if (field === messageField && value.length > 2000) {
            return "Your message must be 2,000 characters or fewer.";
        }

        return "";
    }

    function validateField(field, showError = true) {
        const message = getFieldError(field);
        const errorElement = document.getElementById(`${field.name}-error`);
        field.setCustomValidity(message);

        if (showError && message) {
            field.setAttribute("aria-invalid", "true");
            errorElement.textContent = message;
            errorElement.hidden = false;
        } else {
            field.removeAttribute("aria-invalid");
            errorElement.textContent = "";
            errorElement.hidden = true;
        }

        return !message;
    }

    validationFields.forEach((field) => {
        field.addEventListener("blur", () => {
            field.dataset.touched = "true";
            validateField(field);
        });

        field.addEventListener("input", () => {
            if (field.dataset.touched === "true") {
                validateField(field);
            } else {
                field.setCustomValidity("");
            }
        });

        field.addEventListener("change", () => {
            if (field.dataset.touched === "true") {
                validateField(field);
            }
        });
    });

    enquiryForm.addEventListener("invalid", (event) => {
        const field = event.target;
        field.dataset.touched = "true";
        validateField(field);
        validationSummary.textContent = "Please correct the highlighted fields before preparing your enquiry.";
        validationSummary.hidden = false;
    }, true);

    enquiryForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const invalidFields = validationFields.filter((field) => !validateField(field));
        if (invalidFields.length > 0) {
            validationSummary.textContent = "Please correct the highlighted fields before preparing your enquiry.";
            validationSummary.hidden = false;
            invalidFields[0].focus();
            return;
        }

        validationSummary.hidden = true;
        const values = new FormData(enquiryForm);
        const name = values.get("name").trim();
        const enquiryType = typeField.selectedOptions[0].textContent.trim();
        const preferredDate = values.get("date") || "Not specified";
        const message = [
            `Name: ${name}`,
            `Email: ${values.get("email")}`,
            `Phone: ${values.get("phone") || "Not provided"}`,
            `Preferred date: ${preferredDate}`,
            `Enquiry type: ${enquiryType}`,
            `Number of guests: ${guestsField.value}`,
            "",
            "Message:",
            values.get("message") || "No additional message",
        ].join("\r\n");
        const mailParameters = new URLSearchParams({
            subject: `Grill House enquiry - ${enquiryType}`,
            body: message,
        });

        emailLink.href = `mailto:info@grillhouse.com?${mailParameters.toString().replace(/\+/g, "%20")}`;
        responseMessage.textContent = `Thanks, ${name}! Your enquiry is ready. Select the button below to open it in your email app and send it to Grill House.`;
        responseMessage.hidden = false;
        emailLink.hidden = false;
    });

    enquiryForm.addEventListener("input", () => {
        responseMessage.hidden = true;
        emailLink.hidden = true;
        validationSummary.hidden = true;
    });

    enquiryForm.addEventListener("change", () => {
        responseMessage.hidden = true;
        emailLink.hidden = true;
        validationSummary.hidden = true;
    });

    if (dateField && typeField && guestsField) {
        const preview = document.createElement("aside");
        const previewHeading = document.createElement("h3");
        const previewDetails = document.createElement("p");
        const submitButton = enquiryForm.querySelector('button[type="submit"]');

        dateField.min = localToday;
        preview.className = "reservation-preview";
        preview.setAttribute("aria-live", "polite");
        preview.setAttribute("aria-atomic", "true");
        previewHeading.textContent = "Your visit";
        preview.append(previewHeading, previewDetails);
        if (submitButton) {
            enquiryForm.insertBefore(preview, submitButton);
        } else {
            enquiryForm.append(preview);
        }

        function updateEnquiryPreview() {
            const enquiryType = typeField.selectedOptions[0].textContent;
            const guestCount = guestsField.value;
            let dateSummary = "No date selected";

            dateField.required = typeField.value === "reservation";
            if (dateField.dataset.touched === "true") {
                validateField(dateField);
            }

            if (dateField.value) {
                const [year, month, day] = dateField.value.split("-").map(Number);
                dateSummary = new Intl.DateTimeFormat(undefined, {
                    dateStyle: "long",
                }).format(new Date(year, month - 1, day));
            } else if (dateField.required) {
                dateSummary = "Select a date";
            }

            previewDetails.textContent = `${enquiryType} · ${dateSummary} · ${guestCount} guests`;
        }

        typeField.addEventListener("change", updateEnquiryPreview);
        dateField.addEventListener("input", updateEnquiryPreview);
        guestsField.addEventListener("change", updateEnquiryPreview);
        updateEnquiryPreview();
    }
}
