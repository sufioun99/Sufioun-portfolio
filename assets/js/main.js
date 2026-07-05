/* ==========================================================================
   AsNasim V2 Portfolio — Main JavaScript (WebGL & Interactive Upgrades)
   ========================================================================== */

(function () {
  "use strict";

  // Shared state for WebGL dynamic configuration
  const webglConfig = {
    speedMultiplier: 1.0,
    connectionRange: 110,
    activeColor: 0x00f3ff,
    activeLineColor: 0x9d00ff,
    materialRef: null,
    lineMaterialRef: null,
  };

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
    
    /* ---- Custom Cursor Follower ---- */
    const cursor = document.getElementById("custom-cursor");
    const cursorDot = document.getElementById("custom-cursor-dot");

    if (cursor && cursorDot) {
      let cursorX = 0, cursorY = 0;
      let targetX = 0, targetY = 0;

      window.addEventListener("mousemove", (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
      });

      const updateCursor = () => {
        // Lerp interpolation for smooth trailing follower
        cursorX += (targetX - cursorX) * 0.16;
        cursorY += (targetY - cursorY) * 0.16;

        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        
        cursorDot.style.left = `${targetX}px`;
        cursorDot.style.top = `${targetY}px`;

        requestAnimationFrame(updateCursor);
      };
      updateCursor();

      // Check hover states
      const hoverElements = document.querySelectorAll(
        "a, button, input, textarea, select, .project-card, .timeline-item, .contacts-list li"
      );

      hoverElements.forEach((el) => {
        el.addEventListener("mouseenter", () => cursor.classList.add("hovered"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("hovered"));
      });
    }

    /* ---- Mobile Nav Toggle ---- */
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

    /* ---- Scroll Link Highlights & Header Shrink ---- */
    const header = document.querySelector(".header");
    const sections = document.querySelectorAll("section");

    window.addEventListener("scroll", function () {
      let scrollPos = window.scrollY + 100;

      if (window.scrollY > 50) {
        header?.classList.add("scrolled");
      } else {
        header?.classList.remove("scrolled");
      }

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
       Typed Text Effect (Hero)
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
        const duration = 2000;
        const step = target / (duration / 16);

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
       Projects Search & Tag Filter Logic
    ------------------------------------------------------------------------ */
    const projectSearch = document.getElementById("project-search");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".projects-grid .project-card");

    if (projectCards.length > 0) {
      let activeFilter = "all";
      let searchKeyword = "";

      const performFilter = () => {
        projectCards.forEach((card) => {
          const title = card.querySelector("h3")?.textContent.toLowerCase() || "";
          const tags = Array.from(card.querySelectorAll(".tags span")).map((span) =>
            span.textContent.toLowerCase()
          );
          const description = card.querySelector("p")?.textContent.toLowerCase() || "";

          // Check keyword
          const matchesKeyword =
            title.includes(searchKeyword) ||
            description.includes(searchKeyword) ||
            tags.some((tag) => tag.includes(searchKeyword));

          // Check category filter
          let matchesFilter = false;
          if (activeFilter === "all") {
            matchesFilter = true;
          } else if (activeFilter === "oracle") {
            matchesFilter = tags.some((t) => t.includes("oracle") || t.includes("forms") || t.includes("apex") || t.includes("sql"));
          } else if (activeFilter === "web") {
            matchesFilter = tags.some((t) => t.includes("html") || t.includes("css") || t.includes("typescript") || t.includes("react") || t.includes("vanilla"));
          } else if (activeFilter === "python") {
            matchesFilter = tags.some((t) => t.includes("python"));
          }

          if (matchesKeyword && matchesFilter) {
            card.classList.remove("filtered-out");
          } else {
            card.classList.add("filtered-out");
          }
        });
      };

      // Search event listener
      projectSearch?.addEventListener("input", function (e) {
        searchKeyword = e.target.value.toLowerCase().trim();
        performFilter();
      });

      // Filter pills listeners
      filterBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          filterBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          activeFilter = btn.getAttribute("data-filter");
          performFilter();
        });
      });
    }

    /* ------------------------------------------------------------------------
       Formspree Contact Form Submission (AJAX)
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

    /* ------------------------------------------------------------------------
       WebGL Control Panel GUI Actions
    ------------------------------------------------------------------------ */
    const panelToggle = document.getElementById("webgl-toggle");
    const controlPanel = document.getElementById("webgl-control-panel");
    const speedInput = document.getElementById("particle-speed");
    const distInput = document.getElementById("connection-dist");
    const speedVal = document.getElementById("speed-val");
    const distVal = document.getElementById("dist-val");
    const colorBtns = document.querySelectorAll(".color-presets .color-btn");

    if (panelToggle && controlPanel) {
      // Toggle panel open/close
      panelToggle.addEventListener("click", () => {
        controlPanel.classList.toggle("active");
      });

      // Close panel if clicked outside
      document.addEventListener("click", (e) => {
        if (!controlPanel.contains(e.target) && !panelToggle.contains(e.target)) {
          controlPanel.classList.remove("active");
        }
      });

      // Speed Slider
      speedInput?.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        speedVal.textContent = `${val.toFixed(1)}x`;
        webglConfig.speedMultiplier = val;
      });

      // Connection Distance Slider
      distInput?.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        distVal.textContent = `${val}px`;
        webglConfig.connectionRange = val;
      });

      // Color preset buttons click handler
      colorBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          colorBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          const selectedColor = btn.getAttribute("data-color");

          let nodeColor = 0x00f3ff;
          let lineColor = 0x9d00ff;

          switch (selectedColor) {
            case "purple":
              nodeColor = 0x9d00ff;
              lineColor = 0x00f3ff;
              break;
            case "emerald":
              nodeColor = 0x10b981;
              lineColor = 0x3b82f6;
              break;
            case "amber":
              nodeColor = 0xf59e0b;
              lineColor = 0xef4444;
              break;
            default: // cyan
              nodeColor = 0x00f3ff;
              lineColor = 0x9d00ff;
          }

          webglConfig.activeColor = nodeColor;
          webglConfig.activeLineColor = lineColor;

          // Live-update Three.js materials
          if (webglConfig.materialRef) {
            webglConfig.materialRef.color.setHex(nodeColor);
          }
          if (webglConfig.lineMaterialRef) {
            webglConfig.lineMaterialRef.color.setHex(lineColor);
          }

          // Live CSS color token update
          document.documentElement.style.setProperty("--primary", `#${nodeColor.toString(16).padStart(6, '0')}`);
          document.documentElement.style.setProperty("--secondary", `#${lineColor.toString(16).padStart(6, '0')}`);
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

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Setup
    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

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

    // Circle texture builder
    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = 16;
    textureCanvas.height = 16;
    const ctx = textureCanvas.getContext("2d");
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);

    const texture = new THREE.CanvasTexture(textureCanvas);

    const material = new THREE.PointsMaterial({
      color: webglConfig.activeColor,
      size: 4,
      transparent: true,
      blending: THREE.AdditiveBlending,
      map: texture,
      depthWrite: false,
    });

    // Keep reference for control updates
    webglConfig.materialRef = material;

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // Line segments
    const lineMaterial = new THREE.LineBasicMaterial({
      color: webglConfig.activeLineColor,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
    });

    // Keep reference for control updates
    webglConfig.lineMaterialRef = lineMaterial;

    let linePositions = new Float32Array(particleCount * particleCount * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);

    // Mouse movement listeners
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    window.addEventListener("mousemove", (e) => {
      mouse.targetX = (e.clientX - width / 2) * 0.5;
      mouse.targetY = -(e.clientY - height / 2) * 0.5;
    });

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);

      // Smooth camera interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
      camera.position.x = mouse.x;
      camera.position.y = mouse.y;
      camera.lookAt(scene.position);

      const positionsArr = geometry.attributes.position.array;

      let lineIdx = 0;

      for (let i = 0; i < particleCount; i++) {
        // Apply speedMultiplier from configuration
        positionsArr[i * 3] += velocities[i].x * webglConfig.speedMultiplier;
        positionsArr[i * 3 + 1] += velocities[i].y * webglConfig.speedMultiplier;
        positionsArr[i * 3 + 2] += velocities[i].z * webglConfig.speedMultiplier;

        // Bounce back checks
        const bound = range / 2;
        if (positionsArr[i * 3] > bound || positionsArr[i * 3] < -bound) velocities[i].x *= -1;
        if (positionsArr[i * 3 + 1] > bound || positionsArr[i * 3 + 1] < -bound) velocities[i].y *= -1;
        if (positionsArr[i * 3 + 2] > bound || positionsArr[i * 3 + 2] < -bound) velocities[i].z *= -1;

        // Connections mapping
        for (let j = i + 1; j < particleCount; j++) {
          const dx = positionsArr[i * 3] - positionsArr[j * 3];
          const dy = positionsArr[i * 3 + 1] - positionsArr[j * 3 + 1];
          const dz = positionsArr[i * 3 + 2] - positionsArr[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // Apply connectionRange limit from configuration
          if (dist < webglConfig.connectionRange) {
            linePositions[lineIdx++] = positionsArr[i * 3];
            linePositions[lineIdx++] = positionsArr[i * 3 + 1];
            linePositions[lineIdx++] = positionsArr[i * 3 + 2];

            linePositions[lineIdx++] = positionsArr[j * 3];
            linePositions[lineIdx++] = positionsArr[j * 3 + 1];
            linePositions[lineIdx++] = positionsArr[j * 3 + 2];
          }
        }
      }

      geometry.attributes.position.needsUpdate = true;
      lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions.subarray(0, lineIdx), 3));
      lineGeometry.attributes.position.needsUpdate = true;

      // Slow scene rotation
      pointCloud.rotation.y += 0.0006;
      lineMesh.rotation.y += 0.0006;

      renderer.render(scene, camera);
    }

    animate();

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
