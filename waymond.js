const galleryContainers = document.querySelectorAll(".gallery");
const indicator = document.querySelector(".indicator");
const container = document.querySelector(".container");

const defaultItemFlex = "0 1 70px";
const hoverItemFlex = "1 1 400px";

const updateGalleryItems = () => {
    galleryContainers.forEach((container) => {
        const galleryItems = container.querySelectorAll(".gallery-item");
        galleryItems.forEach((item) => {
            let flex = defaultItemFlex;

            if (item.isHovered) {
                flex = hoverItemFlex;
            }

            item.style.flex = flex;
        });
    });
};

const updateIndicatorPosition = (e) => {
    const rect = container.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = indicator.offsetTop; // Vertikale Position

    // Begrenzung der horizontalen Position
    const maxX = container.clientWidth - indicator.offsetWidth;
    const newX = Math.min(Math.max(0, offsetX), maxX);

    indicator.style.left = `${newX}px`;
    indicator.style.top = `${offsetY}px`;
};

container.addEventListener("mousemove", updateIndicatorPosition);

galleryContainers.forEach((container) => {
    const galleryItems = container.querySelectorAll(".gallery-item");
    galleryItems[0].isHovered = true;
    galleryItems.forEach((item) => {
        item.addEventListener("mouseenter", () => {
            galleryItems.forEach((otherItem) => {
                otherItem.isHovered = otherItem === item;
            });

            updateGalleryItems();
        });
    });
});
