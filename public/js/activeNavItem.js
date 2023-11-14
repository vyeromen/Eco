var currentPath = window.location.pathname;

var navLinks = document.querySelectorAll('.navbar-nav .nav-link');

navLinks.forEach(function (link) {
  if (currentPath.includes(link.getAttribute('href'))) {
    link.classList.add('active');
  }
});