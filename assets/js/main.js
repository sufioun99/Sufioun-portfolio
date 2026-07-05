/* ============================================
   AsNasim Portfolio — Main Script (Vanilla JS)
   No jQuery dependency
   ============================================ */

(function () {
  "use strict";

  /* ------------------------------------------
     Preloader
  ------------------------------------------ */
  const preloaderDiv = document.createElement("div");
  preloaderDiv.id = "preloader";
  preloaderDiv.className = "preloader";
  preloaderDiv.innerHTML =
    '<div class="black_wall"></div><div class="loader"></div>';
  document.body.insertBefore(preloaderDiv, document.body.firstChild);

  window.addEventListener("load", function () {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      preloader.classList.add("off");
      preloader.addEventListener("animationend", function () {
        preloader.remove();
      });
      // Fallback: remove after 1.5s if animationend never fires
      setTimeout(function () {
        if (preloader.parentNode) preloader.remove();
      }, 1500);
    }
  });

  /* ------------------------------------------
     DOM Ready
  ------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    /* ---- Mobile hamburger menu (replaces jQuery) ---- */
    const showMenu = document.querySelector(".header-area .show-menu");
    const navbar = document.querySelector(".header-area .navbar");

    if (showMenu && navbar) {
      showMenu.addEventListener("click", function () {
        showMenu.classList.toggle("active");
        navbar.classList.toggle("active");
      });

      // Close menu when a link is clicked
      navbar.querySelectorAll(".menu a").forEach(function (link) {
        link.addEventListener("click", function () {
          showMenu.classList.remove("active");
          navbar.classList.remove("active");
        });
      });
    }

    /* ---- AOS init ---- */
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 1200,
        once: true,
        easing: "ease-out-cubic",
      });
    }

    /* ---- Active nav highlight ---- */
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".header-area .menu li").forEach(function (li) {
      li.classList.remove("active");
      const href = li.querySelector("a")?.getAttribute("href");
      if (href && (href === currentPage || href === "./" + currentPage)) {
        li.classList.add("active");
      }
    });

    /* ------------------------------------------
       Animated Counting Numbers
    ------------------------------------------ */
    const counters = document.querySelectorAll(".client-item h1");
    if (counters.length > 0) {
      const animateCounter = function (el) {
        const text = el.textContent.trim();
        const hasPlus = text.includes("+");
        const num = parseInt(text.replace(/[^0-9]/g, ""), 10);
        if (isNaN(num)) return;

        const duration = 2000;
        const steps = 60;
        const increment = num / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(function () {
          step++;
          current = Math.min(Math.round(increment * step), num);

          if (hasPlus && text.startsWith("+")) {
            el.textContent = "+" + current;
          } else if (hasPlus) {
            el.textContent = current + "+";
          } else {
            el.textContent = current;
          }

          if (step >= steps) {
            // Restore original text exactly
            el.textContent = text;
            clearInterval(timer);
          }
        }, duration / steps);
      };

      const counterObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      counters.forEach(function (counter) {
        counterObserver.observe(counter);
      });
    }

    /* ------------------------------------------
       Typed Text Effect (Homepage only)
    ------------------------------------------ */
    const typedEl = document.getElementById("typed-text");
    if (typedEl) {
      const roles = [
        "Data Analyst",
        "Database Developer",
        "Oracle APEX Developer",
        "Mathematician",
      ];
      let roleIndex = 0;
      let charIndex = 0;
      let isDeleting = false;
      const typeSpeed = 80;
      const deleteSpeed = 40;
      const pauseEnd = 2000;
      const pauseStart = 500;

      function typeWriter() {
        const currentRole = roles[roleIndex];

        if (!isDeleting) {
          typedEl.textContent = currentRole.substring(0, charIndex + 1);
          charIndex++;

          if (charIndex === currentRole.length) {
            isDeleting = true;
            setTimeout(typeWriter, pauseEnd);
            return;
          }
          setTimeout(typeWriter, typeSpeed);
        } else {
          typedEl.textContent = currentRole.substring(0, charIndex - 1);
          charIndex--;

          if (charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            setTimeout(typeWriter, pauseStart);
            return;
          }
          setTimeout(typeWriter, deleteSpeed);
        }
      }

      setTimeout(typeWriter, 1000);
    }

    /* ------------------------------------------
       Contact Form — AJAX Submission
    ------------------------------------------ */
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
      const statusDiv = document.getElementById("form-status");
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : "Send Message";

      contactForm.addEventListener("submit", function (e) {
        e.preventDefault();

        // Basic validation
        const name = contactForm.querySelector('[name="full-name"]');
        const email = contactForm.querySelector('[name="email"]');
        const subject = contactForm.querySelector('[name="subject"]');
        const message = contactForm.querySelector('[name="message"]');

        if (!name.value.trim() || !email.value.trim() || !subject.value.trim() || !message.value.trim()) {
          showStatus("Please fill in all fields.", "error");
          return;
        }

        // Loading state
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML =
            '<span class="btn-loading"></span> Sending...';
        }

        const formData = new FormData(contactForm);

        fetch(contactForm.action, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        })
          .then(function (response) {
            if (response.ok) {
              showStatus(
                "Message sent successfully! I'll get back to you soon.",
                "success"
              );
              contactForm.reset();
            } else {
              throw new Error("Server error");
            }
          })
          .catch(function () {
            showStatus(
              "Oops! Something went wrong. Please try again.",
              "error"
            );
          })
          .finally(function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = originalBtnText;
            }
          });
      });

      function showStatus(message, type) {
        if (!statusDiv) return;
        statusDiv.textContent = message;
        statusDiv.className = "form-status form-status--" + type;
        statusDiv.style.display = "block";

        setTimeout(function () {
          statusDiv.style.opacity = "0";
          setTimeout(function () {
            statusDiv.style.display = "none";
            statusDiv.style.opacity = "1";
            statusDiv.className = "form-status";
          }, 400);
        }, 5000);
      }
    }

    /* ------------------------------------------
       Card Glow on Hover (mouse tracking)
    ------------------------------------------ */
    document.querySelectorAll(".shadow-box").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", x + "px");
        card.style.setProperty("--mouse-y", y + "px");
      });
    });
  });
})();
