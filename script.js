document.addEventListener('DOMContentLoaded', () => {
    // --- 1. КЭШ ЭЛЕМЕНТОВ ---
    const elements = {
        cursor: document.getElementById('custom-cursor'),
        modal: document.getElementById('product-modal'),
        modalImg: document.getElementById('modal-img'),
        modalTitle: document.getElementById('modal-title'),
        modalDesc: document.getElementById('modal-desc'),
        modalPrice: document.querySelector('.modal-price'),
        lightbox: document.getElementById('lightbox'),
        lbImg: document.getElementById('lightbox-img'),
        shortcut: document.getElementById('os-shortcut'),
        win: document.getElementById('os-window'),
        audio: document.getElementById('main-audio'),
        playBtn: document.querySelector('.play-btn'),
        playerMarquee: document.getElementById('player-marquee'),
        merchContainer: document.getElementById('shop-merch'),
        avitoContainer: document.getElementById('shop-avito'),
        reviewsTab: document.getElementById('reviews-tab'),
        sectionTitle: document.getElementById('current-section-title'),
        tabs: document.querySelectorAll('.nav-side-item')
    };

    let currentImages = [];
    let currentIdx = 0;

    // --- 2. ПЛАВНЫЙ КУРСОР (60 FPS) ---
    if (elements.cursor) {
        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const updateCursor = () => {
            elements.cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
            elements.cursor.style.opacity = '1';
            requestAnimationFrame(updateCursor);
        };
        requestAnimationFrame(updateCursor);

        // Реакция на наведение
        const targets = 'a, button, .merch-item, .nav-side-item, .win-item, #os-shortcut, .buy-btn, .gallery-nav';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(targets)) elements.cursor.classList.add('active');
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(targets)) elements.cursor.classList.remove('active');
        });
    }

    // --- 3. ЭФФЕКТЫ (СКОТЧ + НАКЛОН) ---
    function setupMerchEffects() {
        document.querySelectorAll('.merch-item:not(.processed)').forEach(item => {
            const tape = item.querySelector('.item-tape');
            if (tape) {
                const randomNum = Math.floor(Math.random() * 16) + 1;
                tape.classList.add(`tape-${randomNum}`);
            }
            const randomRotate = (Math.random() * 6 - 3).toFixed(1);
            item.style.setProperty('--tilt', `${randomRotate}deg`);
            item.style.transform = `rotate(${randomRotate}deg)`;
            item.classList.add('processed'); // Чтобы не пересчитывать заново
        });
    }

    // --- 4. МАГАЗИН (ФИЛЬТР + СОРТИРОВКА) ---
    function updateStore() {
        const activeContainer = [elements.merchContainer, elements.avitoContainer].find(el => 
            el && window.getComputedStyle(el).display !== 'none'
        );
        if (!activeContainer) return;

        const items = Array.from(activeContainer.querySelectorAll('.merch-item'));
        const activeIcon = document.querySelector('.win-item.active:not(.sort-file)');
        const activeFandom = activeIcon?.dataset.fandom || 'all';
        
        const priceFile = document.querySelector('.sort-file[data-sort-type="price"]');
        const dateFile = document.querySelector('.sort-file[data-sort-type="date"]');

        // Обновляем стрелочки ↕ ↓ ↑
        const arrows = { "0": "↕", "1": "↓", "2": "↑" }; 
        [priceFile, dateFile].forEach(file => {
            if (file) {
                const span = file.querySelector('span');
                if (span) {
                    const baseText = span.innerText.replace(/[↕↓↑]/g, '').trim();
                    span.innerText = `${baseText} ${arrows[file.dataset.dir || "0"]}`;
                }
            }
        });

        // Фильтрация
        items.forEach(item => {
            const isMatch = (activeFandom === 'all' || item.dataset.fandom === activeFandom);
            item.style.display = isMatch ? '' : 'none';
        });

        let visibleItems = items.filter(i => i.style.display !== 'none');

        // Сортировка
        if (priceFile?.dataset.dir !== "0") {
            visibleItems.sort((a, b) => {
                const p1 = parseFloat(a.dataset.price) || 0;
                const p2 = parseFloat(b.dataset.price) || 0;
                return priceFile.dataset.dir === "1" ? p1 - p2 : p2 - p1;
            });
        } else if (dateFile?.dataset.dir !== "0") {
            visibleItems.sort((a, b) => {
                const d1 = new Date(a.dataset.date || 0);
                const d2 = new Date(b.dataset.date || 0);
                return dateFile.dataset.dir === "1" ? d2 - d1 : d1 - d2;
            });
        }
        visibleItems.forEach(item => activeContainer.appendChild(item));
    }

    // --- 5. МОДАЛКА И ГАЛЕРЕЯ ---
    function updateModalImage() {
        if (currentImages.length > 0 && elements.modalImg) {
            elements.modalImg.src = currentImages[currentIdx];
            document.getElementById('current-idx').innerText = currentIdx + 1;
            document.getElementById('total-idx').innerText = currentImages.length;
        }
    }

    // --- 6. ГЛОБАЛЬНЫЙ КЛИК (ДЕЛЕГИРОВАНИЕ) ---
    document.addEventListener('click', (e) => {
        const target = e.target;

        // 1. Клики по Фандомам (Scott_P, ОС и т.д.)
        const fandomBtn = target.closest('.win-item:not(.sort-file)');
        if (fandomBtn) {
            document.querySelectorAll('.win-item:not(.sort-file)').forEach(i => i.classList.remove('active'));
            fandomBtn.classList.add('active');
            updateStore();
            return;
        }

        // 2. Клики по Сортировке (Цена, Дата)
        const sortBtn = target.closest('.sort-file');
        if (sortBtn) {
            let currentDir = parseInt(sortBtn.dataset.dir || "0");
            document.querySelectorAll('.sort-file').forEach(other => { if (other !== sortBtn) other.dataset.dir = "0"; });
            sortBtn.dataset.dir = (currentDir + 1) % 3;
            updateStore();
            return;
        }

        // 3. Открытие модалки товара
        const card = target.closest('.merch-item');
        if (card && !target.closest('.buy-btn')) {
            elements.modalTitle.innerText = card.querySelector('.item-name').innerText;
            elements.modalDesc.innerText = card.dataset.desc || "Описание скоро будет ✨";
            const priceTag = card.querySelector('.price-tag');
            if (elements.modalPrice && priceTag) elements.modalPrice.innerHTML = priceTag.innerHTML;

            const imgAttr = card.getAttribute('data-images');
            currentImages = imgAttr ? imgAttr.split(',') : [card.querySelector('.item-img img').src];
            currentIdx = 0;
            updateModalImage();
            elements.modal.style.display = 'flex';
            return;
        }

        // 4. Кнопки галереи и закрытие
        if (target.id === 'prev-img') { currentIdx = (currentIdx - 1 + currentImages.length) % currentImages.length; updateModalImage(); }
        if (target.id === 'next-img') { currentIdx = (currentIdx + 1) % currentImages.length; updateModalImage(); }
        if (target.classList.contains('modal-close-trigger') || target === elements.modal) {
            elements.modal.style.display = 'none';
        }

        // 5. Лайтбокс (увеличение по клику на фото в модалке)
        if (target === elements.modalImg) {
            elements.lbImg.src = elements.modalImg.src;
            elements.lightbox.style.display = 'flex';
        }
        if (target === elements.lightbox) elements.lightbox.style.display = 'none';

        // 6. OS Window (Пуск)
        if (target.id === 'os-shortcut') elements.win.classList.toggle('show');
        if (target.classList.contains('win-btn-close')) elements.win.classList.remove('show');
        
        // 7. Переключение вкладок (Мерч / Авито / Отзывы)
        const tab = target.closest('.nav-side-item');
        if (tab) {
            const href = tab.getAttribute('href');
            if (!href?.startsWith('#')) return;
            e.preventDefault();
            elements.tabs.forEach(t => t.classList.remove('active-tab'));
            tab.classList.add('active-tab');

            // Скрываем всё
            [elements.merchContainer, elements.avitoContainer, elements.reviewsTab].forEach(c => { if(c) c.style.display = 'none'; });

            if (href === '#merch') {
                elements.merchContainer.style.display = 'grid';
                elements.sectionTitle.innerText = "New Merch Drops ✨";
                setupMerchEffects();
                updateStore();
            } else if (href === '#avito') {
                elements.avitoContainer.style.display = 'grid';
                elements.sectionTitle.innerText = "Garage Sale (Avito) 🧺";
                setupMerchEffects();
                updateStore();
            } else if (href === '#reviews') {
                if (elements.reviewsTab) elements.reviewsTab.style.display = 'block';
                elements.sectionTitle.innerText = "Customer Reviews 💬";
            }
        }
    });

    // --- 7. ПЛЕЕР ---
    if (elements.audio && elements.playBtn) {
        elements.playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (elements.audio.paused) {
                elements.audio.play(); elements.playBtn.innerText = '💔';
                elements.playerMarquee?.start();
            } else {
                elements.audio.pause(); elements.playBtn.innerText = '❤';
                elements.playerMarquee?.stop();
            }
        });
    }

    // Закрытие окна OS при клике мимо
    window.addEventListener('click', (e) => {
        if (elements.win && !elements.win.contains(e.target) && !elements.shortcut.contains(e.target)) {
            elements.win.classList.remove('show');
        }
    });

    // Инициализация
    setupMerchEffects();
    updateStore();
});

// --- 8. ДЕКОР (ФОНОВЫЕ ЭЛЕМЕНТЫ) ---
function spawnDecor() {
    const layer = document.getElementById('decor-layer');
    if (!layer) return;
    const decorImages = ['tortbg.webp', 'starbg.webp', 'strawberrybg.webp'];
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < 30; i++) {
        const decor = document.createElement('div');
        const isLeft = Math.random() > 0.5;
        decor.className = 'bg-decor-item';
        Object.assign(decor.style, {
            backgroundImage: `url('assets/${decorImages[Math.floor(Math.random() * 3)]}')`,
            top: `${Math.random() * 90}%`,
            left: isLeft ? `${Math.random() * 20}%` : `${80 + Math.random() * 15}%`,
            width: `${Math.random() * 15 + 20}px`,
            height: `${Math.random() * 15 + 20}px`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${Math.random() * 5 + 7}s`,
            pointerEvents: 'none' // Чтобы не мешали кликам
        });
        decor.style.setProperty('--rot', `${Math.random() * 360}deg`);
        fragment.appendChild(decor);
    }
    layer.appendChild(fragment);
}
window.addEventListener('load', spawnDecor);
