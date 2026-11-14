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

        // Includes both existing and newly uploaded images
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

  // Event delegation: works for existing and future gallery images
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
          // Validate image URL
          if (
            !image.secure_url ||
            !image.secure_url.startsWith("https://")
          ) {
            return;
          }

          // Convert API category into existing filter category
          const category = String(image.category || "")
            .trim()
            .toLowerCase();

          const galleryItem = document.createElement("a");
          galleryItem.href = image.secure_url;
          galleryItem.className = "g-item gallery-item reveal in-view";
          galleryItem.setAttribute("data-category", category);

          const img = document.createElement("img");
          img.src = image.secure_url;
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

  
/* ---------- 8. ENQUIRY FORM SUBMISSION ---------- */
const enquiryForm = document.getElementById("enquiryForm");

if (enquiryForm) {
  const phoneInput = document.getElementById("phone");
  const messageInput = document.getElementById("message");
  const submitBtn = document.getElementById("submitBtn");
  const formMessage = document.getElementById("formMessage");

  // Allow only numeric digits and maximum 10 characters
  phoneInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "").slice(0, 10);
  });

  enquiryForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const phone = phoneInput.value.trim();
    const message = messageInput.value.trim();

    // Validate exactly 10 digits
    if (!/^[0-9]{10}$/.test(phone)) {
      formMessage.textContent = "Please enter exactly 10 digits in your phone number.";
      formMessage.style.color = "#ff4444";
      phoneInput.focus();
      return;
    }

    // Count words in the message
    const wordCount = message.split(/\s+/).filter(Boolean).length;

    if (wordCount < 10) {
      formMessage.textContent = `Your message must contain at least 10 words. Current count: ${wordCount}.`;
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
        // Redirect only after the server confirms successful enquiry submission.
        // Google Ads can use /thankyou.html as the post-conversion page URL.
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


  /* ---------- 9. FETCH DYNAMIC TESTIMONIALS ---------- */
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

}); // <-- Ye aakhri bracket DOMContentLoaded ko band karta hai