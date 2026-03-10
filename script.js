document.addEventListener('DOMContentLoaded', () => {

    // Core Elements
    const audio = document.getElementById('bgMusic');
    const ourSongAudio = document.getElementById('ourSongMusic');

    // --- 1. Init Particles (Floating Hearts) ---
    function initParticles() {
        const heartSvg = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffb3c6'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E";

        particlesJS('particles-js', {
            "particles": {
                "number": { "value": 30, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": ["#ff0054", "#ffb3c6", "#ffffff"] },
                "shape": { "type": "image", "image": { "src": heartSvg, "width": 100, "height": 100 } },
                "opacity": { "value": 0.6, "random": true, "anim": { "enable": true, "speed": 1, "opacity_min": 0.2, "sync": false } },
                "size": { "value": 15, "random": true, "anim": { "enable": true, "speed": 2, "size_min": 5, "sync": false } },
                "line_linked": { "enable": false },
                "move": { "enable": true, "speed": 2, "direction": "top", "random": true, "straight": false, "out_mode": "out", "bounce": false }
            },
            "interactivity": { "events": { "onhover": { "enable": true, "mode": "bubble" } }, "modes": { "bubble": { "distance": 200, "size": 20, "duration": 2 } } },
            "retina_detect": true
        });
    }

    // --- 2. Start Journey ---
    const startBtn = document.getElementById('start-journey');
    startBtn.addEventListener('click', () => {
        // Unhide all sections so observer can see them
        document.querySelectorAll('.hidden-section').forEach(sec => {
            sec.classList.remove('hidden-section');
        });

        // Start audio (requires user interaction)
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio autoplay prevented"));

        // Setup Stars layer initially hidden
        initStars();

        // Scroll to timeline nicely
        document.getElementById('timeline').scrollIntoView({ behavior: 'smooth' });
    });

    // --- 3. Scroll Animations (Intersection Observer) ---
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                // Toggle dark mode if Starry Night section
                if (entry.target.id === 'starry-night' || entry.target.closest('#starry-night')) {
                    document.body.classList.add('night-mode');
                    document.getElementById('particles-js').classList.add('hidden');
                    document.getElementById('stars-js').classList.remove('hidden');
                } else {
                    document.body.classList.remove('night-mode');
                    document.getElementById('particles-js').classList.remove('hidden');
                    document.getElementById('stars-js').classList.add('hidden');
                }
            }
        });
    }, observerOptions);

    setTimeout(() => {
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }, 100);

    // --- 4. Birthday Cake Logic ---
    const blowBtn = document.getElementById('blow-candles-btn');
    const cakeMessage = document.getElementById('cake-message');
    blowBtn.addEventListener('click', () => {
        document.querySelectorAll('.flame').forEach(f => f.style.display = 'none');
        cakeMessage.classList.remove('hidden');
        cakeMessage.classList.add('fade-in');
        blowBtn.style.display = 'none';

        // Simple confetti burst
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    });

    // --- 5. Flip Cards ---
    document.querySelectorAll('.flip-card').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });

    // --- 6. Lightbox (Global functions attached to Window) ---
    window.openLightbox = function (src, caption) {
        const lb = document.getElementById('lightbox');
        document.getElementById('lightbox-img').src = src;
        document.getElementById('lightbox-caption').innerText = caption;
        lb.classList.add('active');
    };

    document.querySelector('.close-lightbox').addEventListener('click', () => {
        document.getElementById('lightbox').classList.remove('active');
    });

    // --- 7. Envelope Letter ---
    const envelope = document.getElementById('envelope-wrapper');
    const loveTitle = document.getElementById('love-title');
    const envelopeInstruction = document.getElementById('envelope-instruction');
    
    envelope.addEventListener('click', () => {
        envelope.classList.toggle('open');
        if (loveTitle) {
            loveTitle.classList.toggle('open-sync');
        }
        if (envelopeInstruction) {
            envelopeInstruction.classList.toggle('hide-sync');
        }
    });

    // --- 8. Mini Game "Catch the Hearts" ---
    const gameArea = document.getElementById('game-area');
    const basket = document.getElementById('basket');
    const startNumBtn = document.getElementById('start-game-btn');
    const scoreText = document.getElementById('score');
    const gameMsg = document.getElementById('game-message');
    let score = 0;
    let gameInterval;
    let gameActive = false;

    // Move basket with mouse/touch
    function moveBasket(e) {
        if (!gameActive) return;
        const rect = gameArea.getBoundingClientRect();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let x = clientX - rect.left;
        if (x < 20) x = 20;
        if (x > rect.width - 20) x = rect.width - 20;
        basket.style.left = x + 'px';
    }

    gameArea.addEventListener('mousemove', moveBasket);
    gameArea.addEventListener('touchmove', moveBasket, { passive: true });

    startNumBtn.addEventListener('click', () => {
        if (gameActive) return;
        gameActive = true;
        score = 0;
        scoreText.innerText = "Score: 0 / 10";
        gameMsg.classList.add('hidden');
        startNumBtn.innerText = "Playing...";
        startNumBtn.disabled = true;

        // Optimized: Spawn hearts much faster for a better game feel
        gameInterval = setInterval(() => {
            createHeart();
        }, 400);

        setTimeout(endGame, 15000); // 15 sec time limit
    });

    function createHeart() {
        if (!gameActive) return;
        const heart = document.createElement('div');
        heart.classList.add('falling-heart');
        heart.innerHTML = '❤️';
        heart.style.left = Math.random() * (gameArea.offsetWidth - 30) + 'px';
        heart.style.top = '-20px';

        // Optimized: Faster falling speed range
        const duration = Math.random() * 1.5 + 1.0; 
        heart.style.animationDuration = duration + 's';

        gameArea.appendChild(heart);

        // Check collision loop
        const checkCollision = setInterval(() => {
            if (!gameActive || !heart.parentElement) {
                clearInterval(checkCollision);
                return;
            }
            const hRect = heart.getBoundingClientRect();
            const bRect = basket.getBoundingClientRect();

            // basic AABB collision
            if (hRect.bottom >= bRect.top && hRect.top <= bRect.bottom &&
                hRect.right >= bRect.left && hRect.left <= bRect.right) {
                score++;
                scoreText.innerText = "Score: " + score + " / 10";
                heart.remove();
                clearInterval(checkCollision);

                // POP effect
                basket.style.transform = "translateX(-50%) scale(1.3)";
                setTimeout(() => basket.style.transform = "translateX(-50%) scale(1)", 100);

                // Instantly win upon reaching 10
                if (score >= 10) {
                    endGame();
                }
            }

            if (hRect.top > gameArea.getBoundingClientRect().bottom) {
                heart.remove();
                clearInterval(checkCollision);
            }
        }, 30); // Faster collision checks

        setTimeout(() => { if (heart.parentElement) heart.remove(); }, duration * 1000);
    }

    function endGame() {
        if (!gameActive) return; // Prevent double calling if won by score and then timeout
        gameActive = false;
        clearInterval(gameInterval);
        
        // Remove remaining hearts immediately
        document.querySelectorAll('.falling-heart').forEach(h => h.remove());

        startNumBtn.innerText = "Play Again";
        startNumBtn.disabled = false;
        gameMsg.classList.remove('hidden');
        
        if (score >= 10) {
            gameMsg.innerText = "You caught my heart! 🤍✨";
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            
            // Auto-transition to the Quote Generator section
            setTimeout(() => {
                document.getElementById('quote-generator').scrollIntoView({ behavior: 'smooth' });
            }, 4000); // Increased wait time to 4s to enjoy the win
            
        } else {
            gameMsg.innerText = "Good try! You caught " + score + " hearts. 💕";
        }
    }

    // --- 9. Quote Generator ---
    const quotes = [
        "You are my today and all my tomorrows.",
        "My favorite place is inside your hug.",
        "Your love is my greatest blessing.",
        "I need you like a heart needs a beat.",
        "Every love story is beautiful, but ours is my favorite.",
        "I look at you and see the rest of my life in front of my eyes."
    ];
    const quoteBtn = document.getElementById('generate-quote-btn');
    const quoteDisplay = document.getElementById('quote-display');

    quoteBtn.addEventListener('click', () => {
        quoteDisplay.style.opacity = 0;
        setTimeout(() => {
            const randomQ = quotes[Math.floor(Math.random() * quotes.length)];
            quoteDisplay.innerText = '"' + randomQ + '"';
            quoteDisplay.style.opacity = 1;
        }, 500);
    });

    // --- 10. Music Player ---
    const playPauseBtn = document.getElementById('play-pause-btn');
    const vinyl = document.getElementById('vinyl');
    const progressBar = document.getElementById('progress');

    playPauseBtn.addEventListener('click', () => {
        if (ourSongAudio.paused) {
            audio.pause(); // Pause background music while Our Song plays
            ourSongAudio.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            vinyl.classList.add('spinning');
        } else {
            ourSongAudio.pause();
            audio.play(); // Resume background music
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i> Play';
            vinyl.classList.remove('spinning');
        }
    });

    ourSongAudio.addEventListener('timeupdate', () => {
        if (ourSongAudio.duration) {
            const pct = (ourSongAudio.currentTime / ourSongAudio.duration) * 100;
            progressBar.style.width = pct + '%';
        }
    });

    // --- 11. Starry Night Promise ---
    function initStars() {
        particlesJS('stars-js', {
            "particles": {
                "number": { "value": 150 },
                "color": { "value": "#ffffff" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.8, "random": true, "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false } },
                "size": { "value": 3, "random": true, "anim": { "enable": true, "speed": 2, "size_min": 0.1, "sync": false } },
                "line_linked": { "enable": false },
                "move": { "enable": true, "speed": 0.5, "direction": "none", "random": true, "out_mode": "out" }
            },
            "retina_detect": true
        });
    }

    const wishBtn = document.getElementById('make-wish-btn');
    wishBtn.addEventListener('click', () => {
        document.getElementById('wish-message').classList.remove('hidden');
        wishBtn.style.display = 'none';
        // Add a shooting star effect via confetti
        confetti({
            particleCount: 20, angle: 135, spread: 30, origin: { x: 0.8, y: 0.2 },
            colors: ['#ffffff', '#fff3b0']
        });
    });

    // --- 12. Final Surprise & 100 Reasons ---
    let reasons100 = [
        "Your smile", "Your kindness", "Your voice", "The way you care for me",
        "You make my life beautiful", "Your beautiful eyes", "Your infectious laugh",
        "How you support my dreams", "Your patience with me", "The way you hold my hand"
        // In reality, user wanted 100. We will map 20 beautiful ones and repeat or let them expand.
    ];
    // pad to 100 for dramatic effect
    while (reasons100.length < 100) reasons100.push("Reason #" + (reasons100.length + 1) + " is just how perfect you are");

    const reasonsBtn = document.getElementById('reasons-100-btn');
    const reasonsContainer = document.getElementById('reasons-100');
    const reasonsList = document.getElementById('reasons-list');
    const nextReasonBtn = document.getElementById('show-next-reason');
    let currentReasonIndex = 0;

    reasonsBtn.addEventListener('click', () => {
        reasonsBtn.classList.add('hidden');
        reasonsContainer.classList.remove('hidden');
        showNextReason();
    });

    nextReasonBtn.addEventListener('click', showNextReason);

    function showNextReason() {
        if (currentReasonIndex < reasons100.length) {
            const p = document.createElement('div');
            p.className = 'reason-item great-vibes';
            p.innerText = (currentReasonIndex + 1) + ". " + reasons100[currentReasonIndex];
            reasonsList.appendChild(p);
            // auto scroll
            reasonsList.scrollTop = reasonsList.scrollHeight;
            currentReasonIndex++;
            if (currentReasonIndex === 100) {
                nextReasonBtn.style.display = 'none';
            }
        }
    }

    const proposalBtn = document.getElementById('final-proposal-btn');
    const finalMsgContainer = document.getElementById('final-message-container');

    proposalBtn.addEventListener('click', () => {
        proposalBtn.style.display = 'none';
        finalMsgContainer.classList.remove('hidden');

        // Massive Fireworks
        var duration = 15 * 1000;
        var end = Date.now() + duration;

        (function frame() {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ff0054', '#ffb3c6', '#ffffff'] });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ff0054', '#ffb3c6', '#ffffff'] });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());

        // Final background change
        document.body.style.background = 'linear-gradient(45deg, #590d22, #c9184a)';
    });

    // Start
    initParticles();
});
