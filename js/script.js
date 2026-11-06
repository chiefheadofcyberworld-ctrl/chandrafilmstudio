/* =========================================================
   CHANDRA FILM STUDIO — Main JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

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

if (lightbox && galleryLinks.length > 0) {
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
});
