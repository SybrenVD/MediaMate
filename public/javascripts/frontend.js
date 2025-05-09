console.log("Script loaded");

document.addEventListener("DOMContentLoaded", () => {
    // Function to determine the scroll amount based on the window width
    function getScrollAmount() {
        const cardWidth = window.innerWidth <= 576 ? 10 * 16 + 10 :
                          window.innerWidth <= 768 ? 14 * 16 + 15 :
                          18 * 16 + 20;
        return cardWidth;
    }

    // Function to update the visibility of the left and right arrows
    function updateArrowsVisibility(container, leftButton, rightButton) {
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        const currentScrollLeft = container.scrollLeft;

        // Hide left arrow if at the leftmost position
        if (currentScrollLeft <= 0) {
            leftButton.style.visibility = 'hidden';
        } else {
            leftButton.style.visibility = 'visible';
        }

        // Hide right arrow if at the rightmost position
        if (currentScrollLeft >= maxScrollLeft) {
            rightButton.style.visibility = 'hidden';
        } else {
            rightButton.style.visibility = 'visible';
        }
    }

    // Scroll left for a specific container
    window.scrollSliderLeft = function(button) {
        const container = button.closest(".card-slider").querySelector(".card-container");
        const leftButton = button;
        const rightButton = button.closest(".card-slider").querySelector(".arrow-right");

        if (!container) {
            console.error("Card container not found for this slider!");
            return;
        }

        const scrollAmount = getScrollAmount();
        console.log("Scrolling left by:", scrollAmount);
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });

        // Immediately update arrow visibility after scrolling
        updateArrowsVisibility(container, leftButton, rightButton);
    };

    // Scroll right for a specific container
    window.scrollSliderRight = function(button) {
        const container = button.closest(".card-slider").querySelector(".card-container");
        const leftButton = button.closest(".card-slider").querySelector(".arrow-left");
        const rightButton = button;

        if (!container) {
            console.error("Card container not found for this slider!");
            return;
        }

        const scrollAmount = getScrollAmount();
        console.log("Scrolling right by:", scrollAmount);
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });

        // Immediately update arrow visibility after scrolling
        updateArrowsVisibility(container, leftButton, rightButton);
    };

    // Initial arrow visibility update on page load (check scroll position)
    const cardSliders = document.querySelectorAll(".card-slider");
    cardSliders.forEach(slider => {
        const container = slider.querySelector(".card-container");
        const leftButton = slider.querySelector(".arrow-left");
        const rightButton = slider.querySelector(".arrow-right");

        if (container && leftButton && rightButton) {
            updateArrowsVisibility(container, leftButton, rightButton);
        }
    });

    // Listen to scroll events to update arrows visibility when user manually scrolls
    document.querySelectorAll(".card-container").forEach(container => {
        container.addEventListener("scroll", () => {
            const leftButton = container.closest(".card-slider").querySelector(".arrow-left");
            const rightButton = container.closest(".card-slider").querySelector(".arrow-right");

            updateArrowsVisibility(container, leftButton, rightButton);
        });
    });
});


