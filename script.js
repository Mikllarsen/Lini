document.addEventListener('DOMContentLoaded', () => {
    // Ensure loading screen stays for at least 1.5 seconds for effect
    const minLoadTime = 1500;
    const startTime = Date.now();

    window.addEventListener('load', () => {
        const loader = document.getElementById('loader-overlay');
        if (!loader) return;

        const timeElapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadTime - timeElapsed);

        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => {
                if (loader.parentNode) loader.parentNode.removeChild(loader);
            }, 500);
        }, remainingTime);
    });

    // Lock screen logic
    const unlockBtn = document.getElementById('unlock-btn');
    const progressCircle = document.getElementById('progress-circle');
    const lockScreen = document.getElementById('lock-screen');
    const mainContent = document.getElementById('main-content');

    if (!unlockBtn || !progressCircle || !lockScreen || !mainContent) return;

    let pressTimer;
    let progressInterval;
    const requiredHoldTime = 2000; // 2 seconds
    const circumference = 283; // 2 * pi * 45

    function startPress(e) {
        if (e.type === 'touchstart') {
            e.preventDefault(); // Prevent default touch behavior (like zooming/scrolling)
        }

        let startTime = Date.now();

        // Visual progress update
        progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / requiredHoldTime, 1);
            const offset = circumference - (progress * circumference);
            progressCircle.style.strokeDashoffset = offset;
        }, 50); // Update every 50ms

        pressTimer = setTimeout(() => {
            unlock();
        }, requiredHoldTime);
    }

    function cancelPress() {
        clearTimeout(pressTimer);
        clearInterval(progressInterval);
        // Reset progress visually
        progressCircle.style.strokeDashoffset = circumference;
    }

    function unlock() {
        clearTimeout(pressTimer);
        clearInterval(progressInterval);

        // Hide lock screen and show main content
        lockScreen.style.display = 'none';
        mainContent.classList.remove('hidden-content');
    }

    // Mouse events
    unlockBtn.addEventListener('mousedown', startPress);
    unlockBtn.addEventListener('mouseup', cancelPress);
    unlockBtn.addEventListener('mouseleave', cancelPress);

    // Touch events
    unlockBtn.addEventListener('touchstart', startPress);
    unlockBtn.addEventListener('touchend', cancelPress);
    unlockBtn.addEventListener('touchcancel', cancelPress);
});
