
/* =========================================================
   CHANDRA FILM STUDIO — Main JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  console.log("SCRIPT LOADED SUCCESSFULLY!");

  /* ---------- 1. MOBILE MENU TOGGLE ---------- */
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");
  const body = document.body;

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      navToggle.classList.toggle("open");
      nav.classList.toggle("open");
      body.classList.toggle("menu-open");

      const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", !isExpanded);
    });

    const navLinks = nav.querySelectorAll(".nav-link");

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.classList.remove("open");
        nav.classList.remove("open");
        body.classList.remove("menu-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- 2. HEADER SCROLL EFFECT ---------- */
  const header = document.getElementById("header");

  function handleHeaderScroll() {
    if (!header) return;

    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  if (header) {
    handleHeaderScroll();
    window.addEventListener("scroll", handleHeaderScroll);
  }

  /* ---------- 3. BACK TO TOP BUTTON ---------- */
  const toTopBtn = document.getElementById("toTop");

  if (toTopBtn) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 500) {
        toTopBtn.classList.add("show");
      } else {
        toTopBtn.classList.remove("show");
      }
    });

    toTopBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  /* ---------- 4. SCROLL REVEAL ANIMATIONS ---------- */
  const revealElements = document.querySelectorAll(".reveal");

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: "0px",
      threshold: 0.15
    });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---------- 5. AUTO UPDATE FOOTER YEAR ---------- */
  const yearSpan = document.getElementById("year");

  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  /* ---------- 6. GALLERY FILTERING ---------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const galleryGrid = document.getElementById("galleryGrid");

  if (filterBtns.length > 0 && galleryGrid) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) {
          b.classList.remove("active");
        });

        btn.classList.add("active");

        const filterValue = btn.getAttribute("data-filter");
        const galleryItems = galleryGrid.querySelectorAll(".gallery-item");

        galleryItems.forEach(function (item) {
          const category = item.getAttribute("data-category");

          if (filterValue === "all" || category === filterValue) {
            item.classList.remove("hide");
          } else {
            item.classList.add("hide");
          }
        });
      });
    });
  }

  /* ---------- 7. LIGHTBOX FUNCTIONALITY ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");

  if (galleryGrid && lightbox && lightboxImg) {
    galleryGrid.addEventListener("click", function (e) {
      const galleryItem = e.target.closest(".gallery-item");

      if (!galleryItem || !galleryGrid.contains(galleryItem)) {
        return;
      }

      e.preventDefault();

      const img = galleryItem.querySelector("img");

      if (!img) return;

      lightboxImg.src = img.src;
      lightbox.classList.add("show");
      document.body.style.overflow = "hidden";
    });

    function closeLightbox() {
      lightbox.classList.remove("show");
      document.body.style.overflow = "";
    }

    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("show")) {
        closeLightbox();
      }
    });
  }

  /* ---------- 8. LOAD DYNAMIC GALLERY ---------- */
  if (galleryGrid) {
    fetch("/api/gallery")
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Gallery API request failed");
        }

        return response.json();
      })
      .then(function (images) {
        if (!Array.isArray(images)) {
          throw new Error("Invalid gallery response");
        }

        images.forEach(function (image) {
         let imageUrl;

try {
  imageUrl = new URL(image.secure_url);

  if (
    imageUrl.protocol !== "https:" ||
    imageUrl.hostname !== "res.cloudinary.com" ||
    !imageUrl.pathname.startsWith("/eri30c2g/image/upload/")
  ) {
    return;
  }
} catch {
  return;
}

          const category = String(image.category || "")
            .trim()
            .toLowerCase();

          const galleryItem = document.createElement("a");
         galleryItem.href = imageUrl.href;
          galleryItem.className = "g-item gallery-item reveal in-view";
          galleryItem.setAttribute("data-category", category);

          const img = document.createElement("img");
         img.src = imageUrl.href;
          img.alt = category + " photography by Chandra Film Studio";
          img.loading = "lazy";

          galleryItem.appendChild(img);
          galleryGrid.appendChild(galleryItem);
        });

        console.log("Dynamic gallery loaded:", images.length);
      })
      .catch(function (error) {
        console.error("Dynamic gallery loading failed:", error);
      });
  }

  /* ---------- 9. ENQUIRY FORM SUBMISSION ---------- */
  const enquiryForm = document.getElementById("enquiryForm");

  if (enquiryForm) {
    const phoneInput = document.getElementById("phone");
    const messageInput = document.getElementById("message");
    const submitBtn = document.getElementById("submitBtn");
    const formMessage = document.getElementById("formMessage");

    if (phoneInput) {
      phoneInput.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "").slice(0, 10);
      });
    }

    enquiryForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const phone = phoneInput.value.trim();
      const message = messageInput.value.trim();

      if (!/^[0-9]{10}$/.test(phone)) {
        formMessage.textContent =
          "Please enter exactly 10 digits in your phone number.";
        formMessage.style.color = "#ff4444";
        phoneInput.focus();
        return;
      }

      const wordCount = message.split(/\s+/).filter(Boolean).length;

      if (wordCount < 10) {
        formMessage.textContent =
          `Your message must contain at least 10 words. Current count: ${wordCount}.`;
        formMessage.style.color = "#ff4444";
        messageInput.focus();
        return;
      }

      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;
      formMessage.textContent = "";

      const formData = {
        name: document.getElementById("name").value.trim(),
        phone: phone,
        eventType: document.getElementById("eventType").value,
        message: message
      };

      try {
        const response = await fetch("/api/enquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          enquiryForm.reset();
          window.location.href = "/thankyou.html";
          return;
        } else {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || "Failed to send");
        }
      } catch (error) {
        console.error("Enquiry error:", error);

        formMessage.textContent =
          error.message || "Oops! Something went wrong. Please call us directly.";

        formMessage.style.color = "#ff4444";
      } finally {
        submitBtn.textContent = "Send Enquiry";
        submitBtn.disabled = false;
      }
    });
  }

  /* ---------- 10. FETCH DYNAMIC TESTIMONIALS ---------- */
  const testimonialContainer = document.getElementById("testimonialContainer");

  if (testimonialContainer) {
    fetch("/api/testimonials", { cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load reviews");
        return res.json();
      })
      .then(reviews => {
        testimonialContainer.replaceChildren();

        if (!Array.isArray(reviews) || reviews.length === 0) {
          const emptyMessage = document.createElement("p");
          emptyMessage.style.textAlign = "center";
          emptyMessage.style.color = "var(--grey)";
          emptyMessage.textContent = "No reviews yet.";
          testimonialContainer.appendChild(emptyMessage);
          return;
        }

        reviews.forEach(review => {
          const blockquote = document.createElement("blockquote");
          blockquote.className = "testi";

          const paragraph = document.createElement("p");
          paragraph.textContent =
            `"${typeof review.text === "string" ? review.text : ""}"`;

          const cite = document.createElement("cite");
          const name = typeof review.name === "string" ? review.name : "Unknown";
          const event = typeof review.event === "string" ? review.event : "";

          cite.textContent = `— ${name}${event ? ", " + event : ""}`;

          blockquote.append(paragraph, cite);
          testimonialContainer.appendChild(blockquote);
        });
      })
      .catch(error => {
        console.error("Failed to load testimonials:", error);
        testimonialContainer.textContent = "Failed to load reviews.";
      });
  }

  /* ---------- 11. FLOATING WHATSAPP BUTTON ---------- */

  // Prevent duplicate button if script is loaded more than once
  if (!document.getElementById("floatingWhatsApp")) {

    // WhatsApp button styling
    const whatsappStyle = document.createElement("style");

    whatsappStyle.textContent = `
      #floatingWhatsApp {
        position: fixed;
        right: 22px;
        bottom: 24px;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #25D366;
        color: #ffffff;
        border-radius: 50%;
        z-index: 9999;
        text-decoration: none;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        transition: transform 0.25s ease, box-shadow 0.25s ease;
      }

      #floatingWhatsApp:hover {
        transform: scale(1.1);
        box-shadow: 0 7px 25px rgba(37, 211, 102, 0.4);
      }

      #floatingWhatsApp:focus-visible {
        outline: 3px solid #ffffff;
        outline-offset: 4px;
      }

      #floatingWhatsApp svg {
        width: 34px;
        height: 34px;
        fill: currentColor;
      }

      #floatingWhatsApp .whatsapp-tooltip {
        position: absolute;
        right: 72px;
        background: #111111;
        color: #ffffff;
        padding: 9px 13px;
        border-radius: 6px;
        font-size: 13px;
        font-family: Arial, sans-serif;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transform: translateX(5px);
        transition: all 0.25s ease;
        pointer-events: none;
      }

      #floatingWhatsApp:hover .whatsapp-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translateX(0);
      }

      @media (max-width: 600px) {
        #floatingWhatsApp {
          width: 54px;
          height: 54px;
          right: 16px;
          bottom: calc(18px + env(safe-area-inset-bottom));
        }

        #floatingWhatsApp svg {
          width: 30px;
          height: 30px;
        }

        #floatingWhatsApp .whatsapp-tooltip {
          display: none;
        }
      }
    `;

    document.head.appendChild(whatsappStyle);

    // Create WhatsApp button
    const whatsappButton = document.createElement("a");

    whatsappButton.id = "floatingWhatsApp";
    whatsappButton.href =
      "https://wa.me/919798112812?text=" +
      encodeURIComponent(
        "Hello Chandra Film Studio! I would like to enquire about your photography and videography services."
      );

    whatsappButton.target = "_blank";
    whatsappButton.rel = "noopener noreferrer";
    whatsappButton.setAttribute("aria-label", "Chat with Chandra Film Studio on WhatsApp");
    whatsappButton.setAttribute("title", "Chat on WhatsApp");

    whatsappButton.innerHTML = `
      <span class="whatsapp-tooltip">Chat on WhatsApp</span>

      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16.01 3.2C8.95 3.2 3.21 8.94 3.21 16c0 2.25.59 4.45 1.71 6.39L3.1 28.8l6.56-1.72A12.73 12.73 0 0 0 16 28.8h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05A12.72 12.72 0 0 0 16.01 3.2zm0 23.43h-.01c-1.94 0-3.84-.52-5.5-1.51l-.39-.23-3.89 1.02 1.04-3.79-.25-.39a10.6 10.6 0 0 1-1.63-5.73c0-5.86 4.77-10.63 10.64-10.63 2.84 0 5.51 1.11 7.52 3.12a10.57 10.57 0 0 1 3.11 7.52c0 5.86-4.77 10.62-10.64 10.62zm5.84-7.96c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1.01 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.77-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.98-2.34-.26-.61-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.07 1.3 3.28c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.53 1.81.68.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.16-1.51.26-.74.26-1.38.18-1.51-.08-.13-.29-.21-.61-.37z"/>
      </svg>
    `;

    document.body.appendChild(whatsappButton);

    console.log("Floating WhatsApp button added successfully!");
  }

/* ---------- 12. DYNAMIC PRICING CALCULATOR ---------- */

const calcCheckboxes = document.querySelectorAll(".calc-checkbox");
const calcTotalPrice = document.getElementById("calc-total-price");
const calcWaBtn = document.getElementById("calc-wa-btn");

let globalRates = {};

if (document.querySelector(".calculator-box")) {

  // Fetch pricing rates from API
  async function loadPricingRates() {
    try {
      const res = await fetch("/api/pricing", {
        cache: "no-store"
      });

      if (!res.ok) {
        throw new Error("Unable to fetch pricing rates");
      }

      const rates = await res.json();

      const allowedKeys = [
        "Wedding",
        "PreWedding",
        "Events",
        "Portrait",
        "BrandShoot"
      ];

      allowedKeys.forEach(key => {
        const value = rates[key];

        globalRates[key] =
          typeof value === "number" &&
          Number.isFinite(value) &&
          value >= 0
            ? value
            : 0;
      });

      // Update individual service prices
      document.getElementById("calc-price-wedding").textContent =
        `₹${globalRates.Wedding.toLocaleString("en-IN")}`;

      document.getElementById("calc-price-prewedding").textContent =
        `₹${globalRates.PreWedding.toLocaleString("en-IN")}`;

      document.getElementById("calc-price-events").textContent =
        `₹${globalRates.Events.toLocaleString("en-IN")}`;

      document.getElementById("calc-price-portrait").textContent =
        `₹${globalRates.Portrait.toLocaleString("en-IN")}`;

      document.getElementById("calc-price-brandshoot").textContent =
        `₹${globalRates.BrandShoot.toLocaleString("en-IN")}`;

      // Recalculate after rates are loaded
      calculateTotal();

    } catch (error) {
      console.error("Pricing API error:", error);
    }
  }

  // Calculate selected services
  function calculateTotal() {
    let total = 0;
    let selectedServices = [];

    calcCheckboxes.forEach(cb => {
      if (cb.checked) {
        const rateKey = cb.value;
        const price = globalRates[rateKey] || 0;

        total += price;

        selectedServices.push(
          cb.parentElement.querySelector(".calc-name").textContent.trim()
        );
      }
    });

    // Update estimated total
    calcTotalPrice.textContent =
      `₹${total.toLocaleString("en-IN")}`;

    // Update WhatsApp booking link
    if (selectedServices.length > 0) {

      const formattedTotal = total.toLocaleString("en-IN");

      const waText =
        `Hello Chandra Film Studio, I built a custom package on your website.\n\n` +
        `Selected Services:\n- ${selectedServices.join("\n- ")}\n\n` +
        `Estimated Total: ₹${formattedTotal}\n\n` +
        `Please share exact details and availability.`;

      calcWaBtn.href =
        `https://wa.me/919798112812?text=${encodeURIComponent(waText)}`;

      calcWaBtn.style.opacity = "1";
      calcWaBtn.style.pointerEvents = "auto";

    } else {

      calcWaBtn.href = "#";
      calcWaBtn.style.opacity = "0.5";
      calcWaBtn.style.pointerEvents = "none";

    }
  }

  // Listen for checkbox changes
  calcCheckboxes.forEach(cb => {
    cb.addEventListener("change", calculateTotal);
  });

  // Initial calculation and API loading
  calculateTotal();
  loadPricingRates();
}

}); // DOMContentLoaded ends here
