// Global configuration object
let CONFIG = {};

// Load configuration from config.json
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        CONFIG = await response.json();
        console.log('Configuration loaded:', CONFIG);
        return true;
    }
    catch (error) {
        console.error('Failed to load config.json:', error);
        return false;
    }
}

// Initialize intro screen
function initIntroScreen() {
    const introScreen = document.getElementById('intro-screen');
    const introText = document.getElementById('intro-text');
    const mainContent = document.getElementById('main-content');

    // Set intro text from config
    introText.textContent = CONFIG.personal.introText;

    introScreen.addEventListener('click', function () {
        introScreen.style.opacity = '0';
        setTimeout(() => {
            introScreen.style.display = 'none';
            mainContent.classList.add('active');
            initializeMainContent();
            if (CONFIG.effects.musicVisualizer) {
                setTimeout(() => {
                    if (audioPlayer) {
                        playAudio();
                    }
                }, 1000);
            }
        }, 500);
    });
}

// Initialize main content based on config
function initializeMainContent() {
    setupUI();
    initializeMedia();
    initAudioSystem();

    // Initialize effects based on config
    if (CONFIG.effects.cursorFollower) {
        initCursorFollower();
    }

    if (CONFIG.effects.snowEffect) {
        createSnowEffect();
    }

    if (CONFIG.effects.starsAnimation) {
        createStarsAnimation();
    }

    if (CONFIG.effects.card3D) {
        init3DCardEffect();
    }

    initTypewriterEffect();
}

// Setup UI elements with config values
function setupUI() {
    // Banner ayarla
    const bannerImage = document.getElementById('banner-image');
    if (CONFIG.media.bannerImage) {
        bannerImage.src = CONFIG.media.bannerImage;
        bannerImage.style.display = 'block';
    } else {
        bannerImage.style.display = 'none';
    }

    // Sadece vertical layout kullan
    const verticalCard = document.getElementById('profile-card-vertical');
    verticalCard.classList.remove('hidden');

    // Profile Card Style (background, opacity, blur)
    if (CONFIG.profileCardStyle) {
        const { color, opacity, blur } = CONFIG.profileCardStyle;
        verticalCard.style.background = color ? color.replace('rgb', 'rgba').replace(')', `,${opacity ?? 1})`) : '';
        verticalCard.style.backdropFilter = blur ? `blur(${blur}px)` : '';
    }

    // Music Player Style (background, opacity, blur)
    const musicPlayer = document.querySelector('.profile-card.mt-6');
    if (musicPlayer && CONFIG.musicPlayerStyle) {
        const { color, opacity, blur } = CONFIG.musicPlayerStyle;
        musicPlayer.style.background = color ? color.replace('rgb', 'rgba').replace(')', `,${opacity ?? 1})`) : '';
        musicPlayer.style.backdropFilter = blur ? `blur(${blur}px)` : '';
    }

    // Vertical Card
    document.getElementById('profile-name-vertical').textContent = CONFIG.personal.name;
    document.getElementById('view-count-vertical').textContent = CONFIG.ui.viewCount;
    const onlineStatusVertical = document.getElementById('online-status-vertical');
    if (CONFIG.ui.onlineStatus) {
        onlineStatusVertical.style.backgroundColor = 'rgb(34 197 94)'; // yeşil
        onlineStatusVertical.classList.add('glow-green');
        onlineStatusVertical.classList.remove('glow-red');
    } else {
        onlineStatusVertical.style.backgroundColor = 'rgb(239 68 68)'; // kırmızı
        onlineStatusVertical.classList.remove('glow-green');
    }
    document.getElementById('profile-image-vertical').src = CONFIG.media.profileImage;
    // Profile Decoration (vertical)
    const profileDecoration = CONFIG.media.profileDecoration;
    const decorationImg = document.getElementById('profile-decoration-vertical');
    if (profileDecoration) {
        decorationImg.src = profileDecoration;
        decorationImg.style.display = 'block';
    } else {
        decorationImg.style.display = 'none';
    }

    // Location (vertical)
    const location = CONFIG.personal.location || {};
    document.getElementById('location-text-vertical').textContent = location.name || '';
    document.getElementById('location-icon-vertical').className = location.icon || 'ri-map-pin-line';

    document.getElementById('album-cover').src = CONFIG.media.albumCover;
    document.getElementById('song-title').textContent = CONFIG.music.songTitle;
    document.getElementById('total-time').textContent = formatTime(CONFIG.music.duration);

    // Render social links only for vertical card
    function renderSocialLinks(containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        CONFIG.socialLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.target = '_blank';
            a.className = 'social-icon w-10 h-10 flex items-center justify-center rounded-full overflow-hidden';
            // Icon as image
            const img = document.createElement('img');
            img.src = link.photo;
            img.alt = link.name;
            img.className = 'w-full h-full object-cover';
            a.appendChild(img);
            container.appendChild(a);
        });
    }
    renderSocialLinks('social-links-vertical');

    // Badge'leri render et
    function renderBadges(containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        if (CONFIG.badges && CONFIG.badges.length > 0) {
            CONFIG.badges.forEach(badge => {
                const img = document.createElement('img');
                img.src = badge.photo;
                img.alt = badge.name;
                img.className = 'w-full h-full object-cover';
                container.appendChild(img);
            });
        }
    }
    renderBadges('badge-list');
}

// Initialize media based on config
function initializeMedia() {
    const backgroundVideo = document.getElementById('background-video');
    const backgroundImage = document.getElementById('background-image');

    if (CONFIG.media.backgroundType === 'video') {
        backgroundVideo.querySelector('source').src = CONFIG.media.backgroundVideo;
        backgroundVideo.load();

        backgroundVideo.addEventListener('loadeddata', () => {
            backgroundVideo.style.display = 'block';
            backgroundImage.style.display = 'none';
        });

        backgroundVideo.addEventListener('error', () => {
            backgroundVideo.style.display = 'none';
            backgroundImage.style.backgroundImage = `url('${CONFIG.media.backgroundImage}')`;
            backgroundImage.style.display = 'block';
        });

        backgroundVideo.addEventListener('canplay', () => {
            backgroundVideo.play().catch(e => console.log('Video autoplay failed:', e));
        });
    } else {
        backgroundVideo.style.display = 'none';
        backgroundImage.style.backgroundImage = `url('${CONFIG.media.backgroundImage}')`;
        backgroundImage.style.display = 'block';
    }

    document.getElementById('profile-image-vertical').src = CONFIG.media.profileImage;
    document.getElementById('album-cover').src = CONFIG.media.albumCover;
}

// Typewriter effect
function initTypewriterEffect() {
    const text = CONFIG.personal.description;
    const elVertical = document.getElementById("typewriter-vertical");
    let i = 0;
    let forward = true;

    function animate() {
        elVertical.textContent = text.slice(0, i) + "|";
        if (forward) {
            if (i < text.length) {
                i++;
            } else {
                forward = false;
                setTimeout(animate, 800);
                return;
            }
        } else {
            if (i > 0) {
                i--;
            } else {
                forward = true;
                setTimeout(animate, 500);
                return;
            }
        }
        setTimeout(animate, 150);
    }
    elVertical.textContent = "|";
    setTimeout(animate, 800);
}

// Snow effect
function createSnowEffect() {
    const snowContainer = document.getElementById('snow-container');
    const snowflakes = ['❄', '❅', '❆'];

    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snow');
        snowflake.innerHTML = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.animationDuration = Math.random() * 3 + 2 + 's';
        snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';
        snowflake.style.opacity = Math.random() * 0.8 + 0.2;

        snowContainer.appendChild(snowflake);

        setTimeout(() => {
            snowflake.remove();
        }, 5000);
    }

    setInterval(createSnowflake, 300);
}

// 3D card effect
function init3DCardEffect() {
    const cardGroup = document.getElementById('card-group');

    cardGroup.addEventListener('mousemove', (e) => {
        const rect = cardGroup.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const percentX = (x - centerX) / centerX;
        const percentY = (y - centerY) / centerY;

        const rotateY = percentX * 12;
        const rotateX = -percentY * 12;

        cardGroup.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    cardGroup.addEventListener('mouseleave', () => {
        cardGroup.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
    });
}

// Cursor follower
function initCursorFollower() {
    const cursorFollower = document.getElementById('cursorFollower');
    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;

    cursorFollower.style.display = 'block';

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        const speed = 0.08;
        followerX += (mouseX - followerX) * speed;
        followerY += (mouseY - followerY) * speed;

        cursorFollower.style.left = followerX - 20 + 'px';
        cursorFollower.style.top = followerY - 20 + 'px';

        requestAnimationFrame(animate);
    }
    animate();
}

// Stars animation
function createStarsAnimation() {
    const starsContainer = document.getElementById('stars-container');
    const starsCount = 20;

    for (let i = 0; i < starsCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const size = Math.random() * 3 + 1;
        const delay = Math.random() * 4;

        star.style.left = `${posX}%`;
        star.style.top = `${posY}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDelay = `${delay}s`;

        starsContainer.appendChild(star);
    }
}

// Audio system
let audioPlayer;
let isPlaying = false;

function initAudioSystem() {
    audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const progressBar = document.getElementById('progress-bar');
    const volumeControl = document.getElementById('volume-control');
    const visualizer = document.getElementById('visualizer');
    const currentTimeText = document.getElementById('current-time');

    audioPlayer.src = CONFIG.music.songUrl;
    audioPlayer.volume = 0.5;

    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    });

    volumeControl.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value / 100;
    });

    audioPlayer.addEventListener('timeupdate', () => {
        if (audioPlayer.duration) {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.value = progress;
            currentTimeText.textContent = formatTime(audioPlayer.currentTime);
        }
    });

    progressBar.addEventListener('input', () => {
        if (audioPlayer.duration) {
            const seekTime = (progressBar.value / 100) * audioPlayer.duration;
            audioPlayer.currentTime = seekTime;
        }
    });

    if (!CONFIG.effects.musicVisualizer) {
        visualizer.style.display = 'none';
    }
}

function playAudio() {
    if (audioPlayer) {
        audioPlayer.play().then(() => {
            isPlaying = true;
            const playPauseBtn = document.getElementById('play-pause-btn');
            const visualizer = document.getElementById('visualizer');
            playPauseBtn.innerHTML = '<i class="ri-pause-line ri-lg"></i>';
            if (CONFIG.effects.musicVisualizer) {
                visualizer.style.display = 'flex';
            }
        }).catch(e => {
            console.log('Audio play failed:', e);
        });
    }
}

function pauseAudio() {
    if (audioPlayer) {
        audioPlayer.pause();
        isPlaying = false;
        const playPauseBtn = document.getElementById('play-pause-btn');
        const visualizer = document.getElementById('visualizer');
        playPauseBtn.innerHTML = '<i class="ri-play-line ri-lg"></i>';
        visualizer.style.display = 'none';
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', async function () {
    await loadConfig();
    initializeSiteTitle();
    if (CONFIG.favicon) {
        let favicon = document.getElementById('dynamic-favicon');
        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            favicon.id = 'dynamic-favicon';
            document.head.appendChild(favicon);
        }
        favicon.href = CONFIG.favicon;
    }
    initIntroScreen();
});

// Initialize site title (animated or static)
function initializeSiteTitle() {
    if (CONFIG.effects && CONFIG.effects.animateSiteTitle && CONFIG.siteTitle) {
        animatePageTitle(CONFIG.siteTitle);
    } else if (CONFIG.siteTitle) {
        document.title = CONFIG.siteTitle;
    } else {
        document.title = "Page Title"; // Varsayılan başlık
    }
}

function animatePageTitle(title) {
    let currentTitle = '';
    let i = 0;
    let forward = true;
    const typingSpeed = 150; // Milisaniye cinsinden yazma hızı
    const deletingSpeed = 100; // Milisaniye cinsinden silme hızı
    const pauseDuration = 1000; // İleri ve geri gitme arasındaki bekleme süresi

    function typeCharacter() {
        if (forward) {
            if (i < title.length) {
                currentTitle = title.slice(0, i + 1);
                document.title = currentTitle + '|';
                i++;
                setTimeout(typeCharacter, typingSpeed);
            } else {
                forward = false;
                document.title = title; // Tam başlık göster, imleci kaldır
                setTimeout(typeCharacter, pauseDuration);
            }
        } else {
            if (i > 0) {
                currentTitle = title.slice(0, i - 1);
                document.title = currentTitle + '|';
                i--;
                setTimeout(typeCharacter, deletingSpeed);
            } else {
                forward = true;
                document.title = '|'; // Boşken imleç göster
                setTimeout(typeCharacter, pauseDuration / 2);
            }
        }
    }
    typeCharacter();
}