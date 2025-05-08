console.log("Script loaded");

document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".card-container");
    if (!container) {
        console.error("Card container not found!");
        return;
    }

    function getScrollAmount() {
        const cardWidth = window.innerWidth <= 576 ? 10 * 16 + 10 :
                          window.innerWidth <= 768 ? 14 * 16 + 15 :
                          18 * 16 + 20;
        return cardWidth;
    }

    // Use unique function names to avoid conflicts with window.scrollLeft
    window.scrollSliderLeft = function() {
        const scrollAmount = getScrollAmount();
        console.log("Scrolling left by:", scrollAmount);
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    };

    window.scrollSliderRight = function() {
        const scrollAmount = getScrollAmount();
        console.log("Scrolling right by:", scrollAmount);
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };
});