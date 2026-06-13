/**
 * components.js
 * Injects shared nav and contact section into every page.
 *
 * USAGE — each page needs two placeholder elements:
 *   <nav class="top-nav" data-back-href="" data-back-label=""></nav>
 *   <div id="contact-placeholder"></div>
 *
 * data-back-href  : link for the "← Back" pill (omit attribute to hide the pill)
 * data-back-label : text shown next to the arrow (e.g. "Projects", "Balancing Car")
 */

(function () {
  // ── NAV ────────────────────────────────────────────────────────────────────
  const navEl = document.querySelector("nav.top-nav");

  if (navEl) {
    const backHref  = navEl.dataset.backHref;
    const backLabel = navEl.dataset.backLabel || "Back";

    const backPill = backHref
      ? `<a href="${backHref}" class="nav-back">
           <span class="arrow">←</span>
           <span>${backLabel}</span>
         </a>`
      : "";

    navEl.innerHTML = `
      <div class="nav-container">
        <div class="nav-left">
          <img src="Logo1.svg" alt="Logo" class="nav-logo">
          <span class="nav-name">Elliot Dy</span>
          ${backPill}
        </div>

        <div class="nav-links">
          <a href="index.html">Home</a>

          <div class="nav-dropdown">
            <a href="projects.html" class="nav-dropdown-toggle">Projects</a>
            <div class="dropdown-menu">
              <a href="projects.html">All Projects</a>
              <a href="sCO2Turbine.html">sCO2 Turbine</a>
              <a href="WalkingTable.html">Walking Table</a>
              <a href="drinkMixer.html">Drink Mixer</a>
              <a href="balancingCar.html">Balancing Car</a>
            </div>
          </div>

          <a href="ufmal.html">Research</a>
          <a href="aboutme.html">About Me</a>
          <a href="resume.html">Resume</a>
        </div>
      </div>`;
  }

  // ── CONTACT ────────────────────────────────────────────────────────────────
  const contactEl = document.getElementById("contact-placeholder");

  if (contactEl) {
    contactEl.outerHTML = `
      <section class="contact-section">
        <div class="contact-container">
          <div class="contact-left">
            <h2>Contact Me</h2>
            <p>Feel free to reach out for projects, collaboration, or opportunities.</p>
            <div class="contact-info">
              <p><strong>Email:</strong> <a href="mailto:elliotady@gmail.com">elliotady@gmail.com</a></p>
              <p><strong>Phone:</strong> <a href="tel:18025574337">(802) 557-4337</a></p>
              <p><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/elliotdy" target="_blank" rel="noopener noreferrer">linkedin.com/in/elliotdy</a></p>
            </div>
          </div>

          <form class="contact-form" action="https://formspree.io/f/xkopbwqj" method="POST">
            <input type="text"  name="name"    placeholder="Your Name"    required>
            <input type="email" name="email"   placeholder="Your Email"   required>
            <textarea           name="message" placeholder="Your Message" rows="5" required></textarea>
            <input type="hidden" name="_subject" value="Portfolio Contact Message">
            <button type="submit">Send Message</button>
          </form>
        </div>
      </section>`;
  }
})();