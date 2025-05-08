const container = document.querySelector('.card-container');

// Function to calculate scroll amount based on screen size
function getScrollAmount() {
    const cardWidth = window.innerWidth <= 576 ? 10 * 16 + 10 : // 10rem + 10px margin (mobile)
                      window.innerWidth <= 768 ? 14 * 16 + 15 : // 14rem + 15px margin (tablet)
                      18 * 16 + 20; // 18rem + 20px margin (desktop)
    return cardWidth;
}

function scrollLeft() {
    const scrollAmount = getScrollAmount();
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
}

function scrollRight() {
    const scrollAmount = getScrollAmount();
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}