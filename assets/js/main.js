/* ==========================================================================
   AsNasim V2 Portfolio — Main JavaScript (WebGL & Interactions)
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     Preloader Removal
  ------------------------------------------------------------------------ */
  window.addEventListener("load", function () {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      preloader.classList.add("fade-out");
      setTimeout(() => preloader.remove(), 600);
    }
  });

  /* ------------------------------------------------------------------------
     DOM Content Loaded
  ------------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    // Nav Toggle for Mobile
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".nav-menu");
    const links = document.querySelectorAll(".nav-link");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        toggle.classList.toggle("active");
        menu.classList.toggle("active");
      });

      links.forEach((link) => {
        link.addEventListener("click", () => {
          toggle.classList.remove("active");
          menu.classList.remove("active");
        });
      });
    }

    // Scroll active link highlight & header shrink
    const header = document.querySelector(".header");
    const sections = document.querySelectorAll("section");

    window.addEventListener("scroll", function () {
      let scrollPos = window.scrollY + 100;

      // Header background shrink
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }

      // Highlight links
      sections.forEach((section) => {
        const id = section.getAttribute("id");
        const top = section.offsetTop;
        const height = section.offsetHeight;

        if (scrollPos >= top && scrollPos < top + height) {
          links.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("active");
            }
          });
        }
      });
    });

    /* ------------------------------------------------------------------------
       Typed Text Effect
    ------------------------------------------------------------------------ */
    const typedRole = document.getElementById("typed-role");
    if (typedRole) {
      const roles = [
        "Data Analyst",
        "Database Developer",
        "Oracle APEX Developer",
        "Mathematician",
      ];
      let roleIdx = 0;
      let charIdx = 0;
      let isDeleting = false;

      function type() {
        const text = roles[roleIdx];
        if (!isDeleting) {
          typedRole.textContent = text.substring(0, charIdx + 1);
          charIdx++;
          if (charIdx === text.length) {
            isDeleting = true;
            setTimeout(type, 2000);
          } else {
            setTimeout(type, 100);
          }
        } else {
          typedRole.textContent = text.substring(0, charIdx - 1);
          charIdx--;
          if (charIdx === 0) {
            isDeleting = false;
            roleIdx = (roleIdx + 1) % roles.length;
            setTimeout(type, 500);
          } else {
            setTimeout(type, 50);
          }
        }
      }
      setTimeout(type, 1000);
    }

    /* ------------------------------------------------------------------------
       Auto-Counting Stats (IntersectionObserver)
    ------------------------------------------------------------------------ */
    const statNums = document.querySelectorAll(".stat-num");
    if (statNums.length > 0) {
      const countUp = (el) => {
        const target = parseInt(el.getAttribute("data-val"), 10);
        let count = 0;
        const duration = 2000; // ms
        const step = target / (duration / 16); // ~60fps

        const update = () => {
          count += step;
          if (count >= target) {
            el.textContent = target + "+";
          } else {
            el.textContent = Math.floor(count) + "+";
            requestAnimationFrame(update);
          }
        };
        update();
      };

      const statObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              countUp(entry.target);
              statObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      statNums.forEach((num) => statObserver.observe(num));
    }

    /* ------------------------------------------------------------------------
       Formspree Contact Form Handler
    ------------------------------------------------------------------------ */
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
      const statusDiv = document.getElementById("form-status");
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      contactForm.addEventListener("submit", function (e) {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";

        fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: {
            Accept: "application/json",
          },
        })
          .then((response) => {
            if (response.ok) {
              statusDiv.textContent = "Message sent successfully! I'll get back to you soon.";
              statusDiv.className = "form-status success";
              statusDiv.style.display = "block";
              contactForm.reset();
            } else {
              throw new Error("Server error");
            }
          })
          .catch(() => {
            statusDiv.textContent = "Oops! An error occurred. Please try again.";
            statusDiv.className = "form-status error";
            statusDiv.style.display = "block";
          })
          .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Message";
            setTimeout(() => {
              statusDiv.style.display = "none";
            }, 6000);
          });
      });
    }
  });

  /* ------------------------------------------------------------------------
     Three.js WebGL Interactive Particle Background
  ------------------------------------------------------------------------ */
  function initWebGL() {
    const canvas = document.getElementById("webgl-canvas");
    if (!canvas || typeof THREE === "undefined") return;

    // Dimensions
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true, // Transparent bg to let CSS gradients interact
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Configuration
    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    // Range area box
    const range = 600;

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * range;
      positions[i * 3 + 1] = (Math.random() - 0.5) * range;
      positions[i * 3 + 2] = (Math.random() - 0.5) * range;

      velocities.push({
        x: (Math.random() - 0.5) * 0.8,
        y: (Math.random() - 0.5) * 0.8,
        z: (Math.random() - 0.5) * 0.8,
      });
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Particle material (floating circles)
    // Generating simple round canvas texture programmatically
    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = 16;
    textureCanvas.height = 16;
    const ctx = textureCanvas.getContext("2d");
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, "rgba(0, 243, 255, 1)");
    grad.addColorStop(1, "rgba(0, 243, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);

    const texture = new THREE.CanvasTexture(textureCanvas);

    const material = new THREE.PointsMaterial({
      color: 0x00f3ff,
      size: 4,
      transparent: true,
      blending: THREE.AdditiveBlending,
      map: texture,
      depthWrite: false,
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // Grid connections (Lines)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x9d00ff,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });

    let linePositions = new Float32Array(particleCount * particleCount * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    
    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);

    // Mouse tracker
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    window.addEventListener("mousemove", (e) => {
      mouse.targetX = (e.clientX - width / 2) * 0.5;
      mouse.targetY = -(e.clientY - height / 2) * 0.5;
    });

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);

      // Smooth camera tilt tracking mouse
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
      camera.position.x = mouse.x;
      camera.position.y = mouse.y;
      camera.lookAt(scene.position);

      const positionsArr = geometry.attributes.position.array;

      let lineIdx = 0;
      let connectedCount = 0;

      for (let i = 0; i < particleCount; i++) {
        // Move particles
        positionsArr[i * 3] += velocities[i].x;
        positionsArr[i * 3 + 1] += velocities[i].y;
        positionsArr[i * 3 + 2] += velocities[i].z;

        // Bounce check bounds
        const bound = range / 2;
        if (positionsArr[i * 3] > bound || positionsArr[i * 3] < -bound) velocities[i].x *= -1;
        if (positionsArr[i * 3 + 1] > bound || positionsArr[i * 3 + 1] < -bound) velocities[i].y *= -1;
        if (positionsArr[i * 3 + 2] > bound || positionsArr[i * 3 + 2] < -bound) velocities[i].z *= -1;

        // Draw line connections (O(N^2) but optimized with distance checks)
        for (let j = i + 1; j < particleCount; j++) {
          const dx = positionsArr[i * 3] - positionsArr[j * 3];
          const dy = positionsArr[i * 3 + 1] - positionsArr[j * 3 + 1];
          const dz = positionsArr[i * 3 + 2] - positionsArr[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // Connection threshold (120px)
          if (dist < 110) {
            linePositions[lineIdx++] = positionsArr[i * 3];
            linePositions[lineIdx++] = positionsArr[i * 3 + 1];
            linePositions[lineIdx++] = positionsArr[i * 3 + 2];

            linePositions[lineIdx++] = positionsArr[j * 3];
            linePositions[lineIdx++] = positionsArr[j * 3 + 1];
            linePositions[lineIdx++] = positionsArr[j * 3 + 2];
            connectedCount++;
          }
        }
      }

      geometry.attributes.position.needsUpdate = true;
      lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions.subarray(0, lineIdx), 3));
      lineGeometry.attributes.position.needsUpdate = true;

      // Gentle rotation of the scene
      pointCloud.rotation.y += 0.0008;
      lineMesh.rotation.y += 0.0008;

      renderer.render(scene, camera);
    }

    animate();

    // Window Resize logic
    window.addEventListener("resize", onWindowResize);

    function onWindowResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  }

  // Init WebGL on page load
  window.addEventListener("DOMContentLoaded", initWebGL);
})();
