function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('#testimonial-cards-section .testimonial-card'));

  function applyResponsiveTestimonials() {
    if (window.innerWidth <= 600) {
      // Shuffle the array
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
      }

      // Hide the first 3 cards from shuffled array
      cards.forEach((card, index) => {
        card.style.display = index < 3 ? 'none' : '';
      });

    } else {
      // Reset: show all cards again
      cards.forEach(card => {
        card.style.display = '';
      });
    }
  }

  applyResponsiveTestimonials();
  window.addEventListener('resize', applyResponsiveTestimonials);

  const skipButton = document.getElementById("skip-to-top-button");
  const homeSection = document.getElementById("home");

  function toggleSkipButton() {
    const homeBottom = homeSection.offsetTop + homeSection.offsetHeight;

    if (window.scrollY > homeBottom) {
      skipButton.classList.add("show");
    } else {
      skipButton.classList.remove("show");
    }
  }

  document.addEventListener("scroll", toggleSkipButton);
  toggleSkipButton(); // Run initially
});
