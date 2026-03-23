document.addEventListener('DOMContentLoaded', () => {
    // --- 1. КУРСОР ---
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.opacity = '1';
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
    }

    // --- 2. ЭФФЕКТЫ (СКОТЧ + НАКЛОН) ---
    function setupMerchEffects() {
        document.querySelectorAll('.item-tape').forEach(tape => {
            if (![...tape.classList].some(cls => cls.startsWith('tape-'))) {
                const randomNum = Math.floor(Math.random() * 16) + 1;
                tape.classList.add(`tape-${randomNum}`);
            }
        });

        document.querySelectorAll('.merch-item').forEach(item => {
            if (!item.style.getPropertyValue('--tilt')) {
                const randomRotate = (Math.random() * 6 - 3).toFixed(1);
                item.style.setProperty('--tilt', `${randomRotate}deg`);
                item.style.transform = `rotate(var(--tilt))`;
            }
        });
    }

    // --- 3. МАГАЗИН (ФИЛЬТР + СОРТИРОВКА) ---
    function updateStore() {
        const activeContainer = Array.from(document.querySelectorAll('.pegboard')).find(el => 
            window.getComputedStyle(el).display !== 'none'
        );
        if (!activeContainer) return;

        const items = Array.from(activeContainer.querySelectorAll('.merch-item'));
        const activeIcon = document.querySelector('.win-item.active:not(.sort-file)');
        const activeFandom = activeIcon ? activeIcon.dataset.fandom : 'all';
        
        const priceFile = document.querySelector('.sort-file[data-sort-type="price"]');
        const dateFile = document.querySelector('.sort-file[data-sort-type="date"]');

        // Обновление стрелочек индикации
        const arrows = { "0": "↕", "1": "↓", "2": "↑" }; 
        [priceFile, dateFile].forEach(file => {
            if (file) {
                const span = file.querySelector('.dir-arrow') || file.querySelector('span');
                if (span) {
                    const baseText = span.innerText.split(' ')[0];
                    span.innerText = `${baseText} ${arrows[file.dataset.dir || "0"]}`;
                }
            }
        });

        // ФИЛЬТРАЦИЯ
        items.forEach(item => {
            const f = item.dataset.fandom;
            item.style.display = (activeFandom === 'all' || f === activeFandom) ? '' : 'none';
        });

        let visibleItems = items.filter(i => i.style.display !== 'none');

        // СОРТИРОВКА
        if (priceFile && priceFile.dataset.dir !== "0") {
            const dir = priceFile.dataset.dir;
            visibleItems.sort((a, b) => {
                const p1 = parseFloat(a.dataset.price) || 0;
                const p2 = parseFloat(b.dataset.price) || 0;
                return dir === "1" ? p1 - p2 : p2 - p1;
            });
        } 
        else {
            const dir = (dateFile && dateFile.dataset.dir !== "0") ? dateFile.dataset.dir : "1";
            visibleItems.sort((a, b) => {
                const d1 = new Date(a.dataset.date || 0);
                const d2 = new Date(b.dataset.date || 0);
                return dir === "1" ? d2 - d1 : d1 - d2;
            });
        }

        visibleItems.forEach(item => activeContainer.appendChild(item));
    }

    // --- 4. КЛИКИ ПО ФИЛЬТРАМ И СОРТИРОВКЕ ---
    document.querySelectorAll('.win-item:not(.sort-file)').forEach(icon => {
        icon.addEventListener('click', function() {
            document.querySelectorAll('.win-item:not(.sort-file)').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            updateStore();
        });
    });

    document.querySelectorAll('.sort-file').forEach(btn => {
        btn.addEventListener('click', function() {
            let currentDir = parseInt(this.dataset.dir || "0");
            document.querySelectorAll('.sort-file').forEach(other => {
                if (other !== this) other.dataset.dir = "0";
            });
            this.dataset.dir = (currentDir + 1) % 3;
            updateStore();
        });
    });

    // --- 5. ВКЛАДКИ (МЕРЧ / АВИТО) ---
    const tabs = document.querySelectorAll('.nav-side-item');
    const merchContainer = document.getElementById('shop-merch');
    const avitoContainer = document.getElementById('shop-avito');
    const sectionTitle = document.getElementById('current-section-title');

    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active-tab'));
            this.classList.add('active-tab');

            if (href === '#merch') {
                if(merchContainer) merchContainer.style.display = 'grid';
                if(avitoContainer) avitoContainer.style.display = 'none';
                if(sectionTitle) sectionTitle.innerText = "New Merch Drops ✨";
            } else if (href === '#avito') {
                if(merchContainer) merchContainer.style.display = 'none';
                if(avitoContainer) avitoContainer.style.display = 'grid';
                if(sectionTitle) sectionTitle.innerText = "Garage Sale (Avito) 🧺";
            }
            setupMerchEffects();
            updateStore();
        });
    });

    // --- 6. МОДАЛКА И ГАЛЕРЕЯ (УМНАЯ ПРИВЯЗКА) ---
    const modal = document.getElementById('product-modal');
    const modalImg = document.getElementById('modal-img');
    let currentImages = [];
    let currentIdx = 0;

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.merch-item');
        if (card && !e.target.closest('.buy-btn')) {
            const name = card.querySelector('.item-name').innerText;
            const price = card.querySelector('.price-tag').innerText;
            const desc = card.getAttribute('data-desc') || "Описание скоро будет ✨";
            const imgAttr = card.getAttribute('data-images');
            const mainImgSrc = card.querySelector('.item-img img').src;
            
            currentImages = imgAttr ? imgAttr.split(',') : [mainImgSrc];
            currentIdx = 0;

            document.getElementById('modal-title').innerText = name;
            document.getElementById('modal-desc').innerText = desc;
            
            const modalPriceTag = document.querySelector('.modal-price');
            if (modalPriceTag) modalPriceTag.innerText = price;
            
            modalImg.src = currentImages[currentIdx];
            document.getElementById('current-idx').innerText = "1";
            document.getElementById('total-idx').innerText = currentImages.length;
            
            if(modal) modal.style.display = 'flex';
        }
    });

    const modalClose = document.querySelector('.modal-close-trigger');
    if (modalClose) modalClose.onclick = () => { if(modal) modal.style.display = 'none'; };

    // --- 7. ОКНО OS (EXPLORER.EXE) ---
    const shortcut = document.getElementById('os-shortcut');
    const win = document.getElementById('os-window');
    const winCloseBtn = document.querySelector('.win-btn-close');

    if (shortcut && win) {
        shortcut.onclick = (e) => { e.stopPropagation(); win.classList.toggle('show'); };
    }

    if (winCloseBtn && win) {
        winCloseBtn.onclick = (e) => { e.stopPropagation(); win.classList.remove('show'); };
    }

    // --- 8. ЛОГИКА ПЛЕЕРА ---
    const audio = document.getElementById('main-audio');
    const playPauseBtn = document.getElementById('play-pause');
    const playerMarquee = document.getElementById('player-marquee');

    if (audio && playPauseBtn) {
        if (playerMarquee) playerMarquee.stop();

        playPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (audio.paused) {
                audio.play().catch(() => console.log("User interaction needed"));
                playPauseBtn.innerText = '💔';
                if (playerMarquee) playerMarquee.start();
            } else {
                audio.pause();
                playPauseBtn.innerText = '❤';
                if (playerMarquee) playerMarquee.stop();
            }
        });

        document.getElementById('prev-track').onclick = () => audio.currentTime -= 10;
        document.getElementById('next-track').onclick = () => audio.currentTime += 10;
    }

    // Закрытие всего по клику мимо
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
        if (win && !win.contains(e.target) && !shortcut.contains(e.target)) win.classList.remove('show');
    };

    // Инициализация
    setupMerchEffects();
    updateStore();
}); // ВОТ ЭТА СКОБКА БЫЛА ПОТЕРЯНА!
