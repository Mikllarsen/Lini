document.addEventListener('DOMContentLoaded', () => {
    const INTRO_TIME = 2000; // how long the heartbeat intro shows (ms)
    const HOLD_TIME = 6000;  // how long the button must be held (ms)

    // ---------- Intro ----------
    const loader = document.getElementById('loader');
    const pageStart = performance.now();

    window.addEventListener('load', () => {
        if (!loader) return;
        const remaining = Math.max(0, INTRO_TIME - (performance.now() - pageStart));
        setTimeout(() => {
            loader.classList.add('is-done');
            loader.addEventListener('transitionend', () => loader.remove(), { once: true });
        }, remaining);
    });

    // ---------- Hold to unlock ----------
    const button = document.getElementById('unlock-btn');
    const ring = document.getElementById('hold-ring-fill');
    const lockScreen = document.getElementById('lock-screen');
    const content = document.getElementById('main-content');

    if (!button || !ring || !lockScreen || !content) return;

    const circumference = 2 * Math.PI * ring.r.baseVal.value;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference;

    let holdStart = null;
    let frame = null;
    let unlocked = false;

    function tick(now) {
        const progress = Math.min((now - holdStart) / HOLD_TIME, 1);
        ring.style.strokeDashoffset = circumference * (1 - progress);

        if (progress >= 1) {
            unlock();
        } else {
            frame = requestAnimationFrame(tick);
        }
    }

    function startHold(event) {
        if (unlocked || holdStart !== null) return;
        if (event.type === 'pointerdown') {
            event.preventDefault();
            button.setPointerCapture?.(event.pointerId);
        }
        if (navigator.vibrate) navigator.vibrate(10);

        button.classList.add('is-holding');
        ring.style.transition = 'none';
        holdStart = performance.now();
        frame = requestAnimationFrame(tick);
    }

    function cancelHold() {
        if (unlocked || holdStart === null) return;
        cancelAnimationFrame(frame);
        holdStart = null;
        button.classList.remove('is-holding');

        // Let the ring ease back to empty instead of snapping
        ring.style.transition = 'stroke-dashoffset 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
        ring.style.strokeDashoffset = circumference;
    }

    function unlock() {
        unlocked = true;
        cancelAnimationFrame(frame);
        button.classList.remove('is-holding');
        if (navigator.vibrate) navigator.vibrate([30, 60, 30]);

        lockScreen.classList.add('is-leaving');
        setTimeout(() => {
            lockScreen.hidden = true;
            content.classList.add('is-entering');
            content.hidden = false;
            window.scrollTo(0, 0);
            // Force a reflow so the entering transition runs
            void content.offsetWidth;
            content.classList.remove('is-entering');
        }, 600);
    }

    // Pointer (mouse + touch + pen)
    button.addEventListener('pointerdown', startHold);
    button.addEventListener('pointerup', cancelHold);
    button.addEventListener('pointercancel', cancelHold);
    button.addEventListener('lostpointercapture', cancelHold);
    button.addEventListener('contextmenu', (e) => e.preventDefault());

    // Keyboard: hold Space or Enter
    button.addEventListener('keydown', (e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            startHold(e);
        }
    });
    button.addEventListener('keyup', (e) => {
        if (e.key === ' ' || e.key === 'Enter') cancelHold();
    });
    button.addEventListener('blur', cancelHold);
});
