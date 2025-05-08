console.log("Script loaded");

document.addEventListener("DOMContentLoaded", () => {
    function getScrollAmount() {
        const cardWidth = window.innerWidth <= 576 ? 10 * 16 + 10 :
                          window.innerWidth <= 768 ? 14 * 16 + 15 :
                          18 * 16 + 20;
        return cardWidth;
    }

    // Scroll left for a specific container
    window.scrollSliderLeft = function(button) {
        const container = button.closest(".card-slider").querySelector(".card-container");
        if (!container) {
            console.error("Card container not found for this slider!");
            return;
        }
        const scrollAmount = getScrollAmount();
        console.log("Scrolling left by:", scrollAmount);
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    };

    // Scroll right for a specific container
    window.scrollSliderRight = function(button) {
        const container = button.closest(".card-slider").querySelector(".card-container");
        if (!container) {
            console.error("Card container not found for this slider!");
            return;
        }
        const scrollAmount = getScrollAmount();
        console.log("Scrolling right by:", scrollAmount);
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };
});