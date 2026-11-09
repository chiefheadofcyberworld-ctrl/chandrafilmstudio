/* =========================================================
   CHANDRA FILM STUDIO — Main JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
;
  /* ---------- 1. MOBILE MENU TOGGLE ---------- */
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");
  const body = document.body;

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      navToggle.classList.toggle("open");
      nav.classList.toggle("open");
      body.classList.toggle("menu-open");
      
      // Accessibility: aria-expanded update
      const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", !isExpanded);
    });

    // Menu ke andar kisi link par click karne par menu band ho jaye
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
  
  // Check on load and on scroll
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
          // Ek baar animate hone ke baad observe karna band kar do
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: "0px",
      threshold: 0.15 // 15% dikhne par animate hoga
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
const galleryItems = document.querySelectorAll(".gallery-item");

if (filterBtns.length > 0 && galleryItems.length > 0) {
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      // Remove active from all buttons
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      // Add active to clicked
      btn.classList.add("active");

      const filterValue = btn.getAttribute("data-filter");

      galleryItems.forEach(function (item) {
        if (filterValue === "all" || item.getAttribute("data-category") === filterValue) {
          item.classList.remove("hide");
        } else {
          item.classList.add("hide");
        }
      });
    });
  });
}

/* ---------- 7. LIGHTBOX FUNCTIONALITY ---------- */
const galleryLinks = document.querySelectorAll(".gallery-item");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

if (lightbox && lightboxImg && lightboxClose && galleryLinks.length > 0) {
  galleryLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault(); // Prevent page jump
      const imgSrc = this.querySelector("img").getAttribute("src");
      lightboxImg.setAttribute("src", imgSrc);
      lightbox.classList.add("show");
      document.body.style.overflow = "hidden"; // Stop background scroll
    });
  });

  // Close lightbox
  function closeLightbox() {
    lightbox.classList.remove("show");
    document.body.style.overflow = "";
  }

  lightboxClose.addEventListener("click", closeLightbox);
  
  // Click outside image to close
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
  
}

  /* ---------- 8. ENQUIRY FORM SUBMISSION ---------- */
  const enquiryForm = document.getElementById("enquiryForm");
  
  if (enquiryForm &&
    document.getElementById("submitBtn") &&
    document.getElementById("formMessage")) {
    enquiryForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      
     

      const submitBtn = document.getElementById("submitBtn");
      const formMessage = document.getElementById("formMessage");
      
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;
      formMessage.textContent = "";

      const formData = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        eventType: document.getElementById("eventType").value,
        message: document.getElementById("message").value,
      };

      try {
        const response = await fetch("/api/enquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          formMessage.textContent = "Success! Your enquiry has been sent. We will contact you soon.";
          formMessage.style.color = "#25D366"; // Green
          enquiryForm.reset();
        } else {
          throw new Error("Failed to send");
        }
      } catch (error) {
        console.error("ERROR:", error); // Console me error dikhane ke liye
        formMessage.textContent = "Oops! Something went wrong. Please call us directly.";
        formMessage.style.color = "#ff4444"; // Red
      } finally {
        submitBtn.textContent = "Send Enquiry";
        submitBtn.disabled = false;
      }
    });
  }
  /* ---------- 9. FETCH TESTIMONIALS ---------- */
  const testimonialContainer = document.getElementById("testimonialContainer");

  if (testimonialContainer) {
    fetch("/api/testimonials")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch reviews");
        return res.json();
      })
      .then(reviews => {
        if (!Array.isArray(reviews) || reviews.length === 0) {
          testimonialContainer.innerHTML =
            `<p style="text-align: center; color: var(--grey);">No reviews yet.</p>`;
          return;
        }

        testimonialContainer.innerHTML = "";

        reviews.forEach(review => {
          const blockquote = document.createElement("blockquote");
          blockquote.className = "testi reveal";

          const reviewText = document.createElement("p");
          reviewText.textContent = `"${review.text || ""}"`;

          const cite = document.createElement("cite");
          cite.textContent = `— ${review.name || "Client"}, ${review.event || "Event"}`;

          blockquote.appendChild(reviewText);
          blockquote.appendChild(cite);

          testimonialContainer.appendChild(blockquote);
        });
      })
      .catch(err => {
        console.error("Testimonials error:", err);
        testimonialContainer.innerHTML =
          `<p style="text-align: center; color: var(--grey);">Failed to load reviews.</p>`;
      });
  }

}); // <-- Ye aakhri bracket DOMContentLoaded ko band karega