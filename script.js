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

    // ---------- Photos and videos (listed in media.js) ----------
    const memories = document.getElementById('memories');
    const grid = document.getElementById('memories-grid');
    const minder = typeof MINDER !== 'undefined' ? MINDER : [];

    if (memories && grid && minder.length) {
        memories.hidden = false;

        minder.forEach((minde, i) => {
            const figure = document.createElement('figure');
            figure.className = 'polaroid reveal';
            figure.style.setProperty('--tilt', `${i % 2 ? 1.8 : -1.8}deg`);

            const frame = document.createElement('div');
            frame.className = 'polaroid-frame';
            const isVideo = minde.type === 'video';

            const showPlaceholder = () => {
                frame.innerHTML = '';
                frame.classList.add('is-missing');
                frame.textContent = isVideo ? 'husk at tilføje video' : 'husk at tilføje billede';
            };

            if (isVideo) {
                const video = document.createElement('video');
                // #t=0.1 makes iPhones show the first frame instead of a black box
                video.src = `${minde.fil}#t=0.1`;
                video.controls = true;
                video.playsInline = true;
                video.preload = 'metadata';
                video.addEventListener('error', showPlaceholder);
                frame.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = minde.fil;
                img.alt = minde.tekst || '';
                img.loading = 'lazy';
                img.addEventListener('error', showPlaceholder);
                img.addEventListener('click', () => openLightbox(img.src, minde.tekst));
                frame.appendChild(img);
            }

            figure.appendChild(frame);
            if (minde.tekst) {
                const caption = document.createElement('figcaption');
                caption.textContent = minde.tekst;
                figure.appendChild(caption);
            }
            grid.appendChild(figure);
        });
    }

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');

    function openLightbox(src, text) {
        if (!lightbox) return;
        lightboxImg.src = src;
        lightboxCaption.textContent = text || '';
        lightbox.hidden = false;
        void lightbox.offsetWidth;
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('is-open');
        document.body.style.overflow = '';
        setTimeout(() => { lightbox.hidden = true; }, 300);
    }

    if (lightbox) {
        lightbox.addEventListener('click', closeLightbox);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
        });
    }

    // ---------- Question before the heart (set in kode.js) ----------
    const gate = document.getElementById('gate');
    const gateInput = document.getElementById('gate-input');
    const gateRow = document.getElementById('gate-row');
    const gateMessage = document.getElementById('gate-message');
    const holdArea = document.getElementById('hold-area');
    const lockSub = document.getElementById('lock-sub');
    const kode = typeof KODE !== 'undefined' ? KODE : null;

    // Ignore case, extra spaces and a full stop at the end
    const normalize = (text) => String(text)
        .toLowerCase()
        .normalize('NFC')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/[.!?,]+$/, '')
        .trim();

    const answers = (kode && Array.isArray(kode.svar) ? kode.svar : [])
        .map(normalize)
        .filter(Boolean);

    const WRONG = [
        'Næ, prøv igen 😉',
        'Tæt på… eller også ikke',
        'Hmm, tænk lidt over den',
        'Du ved det godt \u2665\uFE0E',
    ];
    let attempts = 0;

    function showHold() {
        if (lockSub) {
            lockSub.innerHTML = 'Jeg har skrevet noget til dig.<br>Hold hjertet nede, så åbner det sig.';
        }
        if (gate) gate.hidden = true;
        if (holdArea) holdArea.hidden = false;
    }

    if (!gate || !answers.length) {
        showHold();
    } else {
        document.getElementById('gate-question').textContent = kode.spoergsmaal || '';

        gate.addEventListener('submit', (e) => {
            e.preventDefault();
            const value = normalize(gateInput.value);

            if (answers.includes(value)) {
                gateMessage.textContent = 'Rigtigt \u2665\uFE0E';
                gateRow.classList.add('is-right');
                gateInput.blur();
                gate.classList.add('is-leaving');
                setTimeout(showHold, 700);
                return;
            }

            if (value) attempts++;
            let message = value ? WRONG[(attempts - 1) % WRONG.length] : 'Du skal skrive noget 😉';
            if (attempts >= 3 && kode.hint) message = `Hint: ${kode.hint}`;
            gateMessage.textContent = message;

            gateRow.classList.remove('is-wrong');
            void gateRow.offsetWidth;
            gateRow.classList.add('is-wrong');
            if (navigator.vibrate) navigator.vibrate(60);
        });
    }

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
        [0.9, 'Nu \u2665\uFE0E'],
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
        const progress = Math.max(0, Math.min((now - holdStart) / HOLD_TIME, 1));
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
            heart.className = 'heart burst';
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
        hint.textContent = 'Til dig \u2665\uFE0E';
        burstHearts();
        if (navigator.vibrate) navigator.vibrate([30, 60, 30]);

        setTimeout(() => lockScreen.classList.add('is-leaving'), 700);
        setTimeout(() => {
            lockScreen.hidden = true;
            playEnvelope();
        }, 1300);
    }

    // ---------- Envelope → letter ----------
    const scene = document.getElementById('envelope-scene');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    async function playEnvelope() {
        if (!scene || reduceMotion) {
            showLetter();
            return;
        }

        scene.hidden = false;
        void scene.offsetWidth;

        // Each step adds a class; styles.css animates the change
        const steps = [
            ['is-in', 1400],       // envelope floats up
            ['is-unsealed', 500],  // wax seal pops
            ['is-open', 900],      // flap opens
            ['is-rising', 1100],   // letter slides out
            ['is-out', 350],       // envelope falls away, letter grows
        ];
        for (const [step, duration] of steps) {
            scene.classList.add(step);
            await wait(duration);
        }

        showLetter();
        await wait(900);
        scene.remove();
    }

    function showLetter() {
        const date = document.getElementById('letter-date');
        if (date) {
            date.textContent = new Date().toLocaleDateString('da-DK', {
                day: 'numeric', month: 'long', year: 'numeric',
            });
        }

        content.classList.add('is-entering');
        content.hidden = false;
        window.scrollTo(0, 0);
        void content.offsetWidth;
        content.classList.remove('is-entering');

        revealOnScroll();
    }

    function revealOnScroll() {
        const items = [...content.querySelectorAll('.reveal')];

        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach((item) => item.classList.add('is-visible'));
            return;
        }

        // What's on screen right away fades in one after another,
        // the rest fades in as she scrolls down to it
        let queue = 0;
        let baseDelay = 0.6; // wait for the paper to settle the first time
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                observer.unobserve(entry.target);
                entry.target.style.transitionDelay = `${baseDelay + queue * 0.18}s`;
                queue++;
                entry.target.classList.add('is-visible');
            });
            baseDelay = 0.05;
            setTimeout(() => { queue = 0; }, 400);
        }, { rootMargin: '0px 0px -8% 0px' });

        items.forEach((item) => observer.observe(item));
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
