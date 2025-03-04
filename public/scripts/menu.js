function toggleMenu() {
    const menu = document.querySelector('.dropdown-menu');
    menu.classList.toggle('visible');
    menu.classList.toggle('hidden');
  }
  
  // Add event listener to the burger menu
  document.querySelector('.burger-menu').addEventListener('click', toggleMenu);