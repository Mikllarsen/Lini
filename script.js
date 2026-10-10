document.addEventListener('DOMContentLoaded', () => {
    // Optionally wait a small amount of time to ensure it displays briefly for effect
    // but typically we'd just use load event. Using load to ensure all resources are loaded.
});

window.addEventListener('load', () => {
    const loader = document.getElementById('loader-overlay');
    if (loader) {
        // Add a small delay for visual effect if page loads too quickly
        setTimeout(() => {
            loader.classList.add('hidden');
            // Optionally remove from DOM after transition
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
            }, 500); // matches the transition duration in CSS
        }, 300);
    }
});
