if (typeof navLinks === 'undefined') {
    const navLinks = document.querySelectorAll(".nav-link");
    const path = window.location.pathname;
  
    navLinks.forEach(navLink => {
      const linkPath = new URL(navLink.href).pathname;
      if (path === linkPath) {
        navLink.classList.add('active');
      }
    });
  }
  