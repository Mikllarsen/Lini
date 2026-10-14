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
    const hold = document.getElementById('hold');
    const hint = document.getElementById('hold-hint');
    const lockScreen = document.getElementById('lock-screen');
    const content = document.getElementById('main-content');

    if (!button || !ring || !hold || !hint || !lockScreen || !content) return;

    // Hint text shown as the ring fills (threshold = progress from 0 to 1)
    const HINTS = [
        [0, 'Bliv ved…'],
        [0.3, 'Lidt endnu…'],
        [0.6, 'Næsten…'],
        [0.9, 'Nu ♥'],
    ];
    const IDLE_HINT = 'Hold nede';
    const EARLY_HINT = 'Ikke slippe endnu 😉';

    const circumference = 2 * Math.PI * ring.r.baseVal.value;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference;

    let holdStart = null;
    let frame = null;
    let unlocked = false;
    let hintReset = null;

    function tick(now) {
        const progress = Math.min((now - holdStart) / HOLD_TIME, 1);
        ring.style.strokeDashoffset = circumference * (1 - progress);
        hold.style.setProperty('--progress', progress);

        const text = HINTS.filter(([at]) => progress >= at).pop()[1];
        if (hint.textContent !== text) hint.textContent = text;

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
        lockScreen.classList.add('is-charging');
        hint.style.color = 'var(--rose)';
        ring.style.transition = 'none';
        holdStart = performance.now();
        frame = requestAnimationFrame(tick);
    }

    function cancelHold() {
        if (unlocked || holdStart === null) return;
        cancelAnimationFrame(frame);
        const heldFor = performance.now() - holdStart;
        holdStart = null;
        button.classList.remove('is-holding');
        lockScreen.classList.remove('is-charging');
        hold.style.setProperty('--progress', 0);

        // Let the ring ease back to empty instead of snapping
        ring.style.transition = 'stroke-dashoffset 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
        ring.style.strokeDashoffset = circumference;

        // A playful nudge if she let go partway, then back to the normal hint
        hint.style.color = '';
        clearTimeout(hintReset);
        if (heldFor > 400) {
            hint.textContent = EARLY_HINT;
            hintReset = setTimeout(() => { hint.textContent = IDLE_HINT; }, 1800);
        } else {
            hint.textContent = IDLE_HINT;
        }
    }

    function burstHearts() {
        for (let i = 0; i < 16; i++) {
            const heart = document.createElement('span');
            const angle = (i / 16) * Math.PI * 2 + Math.random() * 0.4;
            const distance = 90 + Math.random() * 80;
            heart.className = 'burst';
            heart.textContent = '♥';
            heart.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
            heart.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
            heart.style.setProperty('--r', `${Math.random() * 60 - 30}deg`);
            heart.style.setProperty('--size', `${0.8 + Math.random() * 0.9}rem`);
            hold.appendChild(heart);
        }
    }

    function unlock() {
        unlocked = true;
        cancelAnimationFrame(frame);
        button.classList.remove('is-holding');
        hint.textContent = 'Til dig ♥';
        burstHearts();
        if (navigator.vibrate) navigator.vibrate([30, 60, 30]);

        setTimeout(() => lockScreen.classList.add('is-leaving'), 700);
        setTimeout(() => {
            lockScreen.hidden = true;
            content.classList.add('is-entering');
            content.hidden = false;
            window.scrollTo(0, 0);
            // Force a reflow so the entering transition runs
            void content.offsetWidth;
            content.classList.remove('is-entering');
        }, 1300);
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
