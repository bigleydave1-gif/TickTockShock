let startY = 0;
let currentIndex = 0;

export function initSwipe(container) {
  container.addEventListener("touchstart", e => {
    startY = e.touches[0].clientY;
  });

  container.addEventListener("touchend", e => {
    const endY = e.changedTouches[0].clientY;
    handleSwipe(startY, endY, container);
  });

  container.addEventListener("wheel", e => {
    if (e.deltaY > 0) next(container);
    else prev(container);
  });
}

function handleSwipe(start, end, container) {
  if (start - end > 50) next(container);
  if (end - start > 50) prev(container);
}

function next(container) {
  const items = container.children;
  if (currentIndex < items.length - 1) {
    currentIndex++;
    scrollToItem(items[currentIndex]);
  }
}

function prev(container) {
  const items = container.children;
  if (currentIndex > 0) {
    currentIndex--;
    scrollToItem(items[currentIndex]);
  }
}

function scrollToItem(item) {
  item.scrollIntoView({ behavior: "smooth" });
}