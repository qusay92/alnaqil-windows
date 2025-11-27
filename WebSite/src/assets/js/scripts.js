document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  
  const scrollTop = document.querySelector(".scroll-top");
  if (scrollTop) {
    const togglescrollTop = function () {
      window.scrollY > 100
        ? scrollTop.classList.add("active")
        : scrollTop.classList.remove("active");
    };
    window.addEventListener("load", togglescrollTop);
    document.addEventListener("scroll", togglescrollTop);
    scrollTop.addEventListener(
      "click",
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    );
  }

  function glightbox_init() {
    const glightbox = GLightbox({
      selector: ".glightbox",
    });
  }


  function aos_init() {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', () => {
    aos_init();
    glightbox_init();
  });

  document.querySelectorAll('#nav-menu a').forEach(navbarlink => {    
    if (!navbarlink.hash) return;
    
    let section = document.querySelector(navbarlink.hash);
    if (!section) return;
    
    navbarlink.addEventListener('click', () => {
      document.querySelector('#nav-menu').classList.remove('show');
    });
  });
});
