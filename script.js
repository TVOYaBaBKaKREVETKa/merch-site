document.addEventListener('DOMContentLoaded', () => {
    // --- КЭШ ЭЛЕМЕНТОВ ---
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
        sectionTitle: document.getElementById('current-section-title'),
        tabs: document.querySelectorAll('.nav-side-item')
    };

    let currentImages = [];
    let currentIdx = 0;

    // --- 1. ПЛАВНЫЙ КУРСОР ---
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

        const targets = 'a, button, .merch-item, .nav-side-item, .win-item, #os-shortcut, .buy-btn';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(targets)) elements.cursor.classList.add('active');
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(targets)) elements.cursor.classList.remove('active');
        });
    }

    // --- 2. ЭФФЕКТЫ (СКОТЧ + НАКЛОН) ---
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
            item.classList.add('processed');
        });
    }

    // --- 3. МАГАЗИН (ФИЛЬТР + СОРТИРОВКА) ---
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

        const arrows = { "0": "↕", "1": "↓", "2": "↑" }; 
        [priceFile, dateFile].forEach(file => {
            if (file) {
                const span = file.querySelector('.dir-arrow') || file.querySelector('span');
                if (span) {
                    const base = span.innerText.split(' ')[0];
                    span.innerText = `${base} ${arrows[file.dataset.dir || "0"]}`;
                }
            }
        });

        items.forEach(item => {
            item.style.display = (activeFandom === 'all' || item.dataset.fandom === activeFandom) ? '' : 'none';
        });

        let visibleItems = items.filter(i => i.style.display !== 'none');

        if (priceFile?.dataset.dir !== "0") {
            visibleItems.sort((a, b) => {
                const p1 = parseFloat(a.dataset.price) || 0;
                const p2 = parseFloat(b.dataset.price) || 0;
                return priceFile.dataset.dir === "1" ? p1 - p2 : p2 - p1;
            });
        } else {
            const dir = dateFile?.dataset.dir !== "0" ? dateFile.dataset.dir : "1";
            visibleItems.sort((a, b) => {
                const d1 = new Date(a.dataset.date || 0);
                const d2 = new Date(b.dataset.date || 0);
                return dir === "1" ? d2 - d1 : d1 - d2;
            });
        }
        visibleItems.forEach(item => activeContainer.appendChild(item));
    }

    // --- 4. МОДАЛКА И ГАЛЕРЕЯ ---
    function updateModalImage() {
        if (currentImages.length > 0 && elements.modalImg) {
            elements.modalImg.src = currentImages[currentIdx];
            document.getElementById('current-idx').innerText = currentIdx + 1;
            document.getElementById('total-idx').innerText = currentImages.length;
        }
    }

    // Глобальный клик (делегирование)
    document.addEventListener('click', (e) => {
        const target = e.target;

        // Открытие карточки
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
        }

        // Кнопки модалки
        if (target.id === 'prev-img') { currentIdx = (currentIdx - 1 + currentImages.length) % currentImages.length; updateModalImage(); }
        if (target.id === 'next-img') { currentIdx = (currentIdx + 1) % currentImages.length; updateModalImage(); }
        if (target.classList.contains('modal-close-trigger') || target === elements.modal) elements.modal.style.display = 'none';

        // Лайтбокс
        if (target === elements.modalImg) {
            elements.lbImg.src = elements.modalImg.src;
            elements.lightbox.style.display = 'flex';
        }
        if (target === elements.lightbox) elements.lightbox.style.display = 'none';

        // OS Окно
        if (target.id === 'os-shortcut') elements.win.classList.toggle('show');
        if (target.classList.contains('win-btn-close')) elements.win.classList.remove('show');
        
        // Фильтры и вкладки
        // Фильтры и вкладки
        const tab = target.closest('.nav-side-item');
        if (tab) {
            const href = tab.getAttribute('href');
            if (!href?.startsWith('#')) return;
            e.preventDefault();

            // 1. Управляем активным классом
            elements.tabs.forEach(t => t.classList.remove('active-tab'));
            tab.classList.add('active-tab');

            // 2. Скрываем вообще все контейнеры (Мерч, Авито, Отзывы)
            const reviewsTab = document.getElementById('reviews-tab');
            if (elements.merchContainer) elements.merchContainer.style.display = 'none';
            if (elements.avitoContainer) elements.avitoContainer.style.display = 'none';
            if (reviewsTab) reviewsTab.style.display = 'none';

            // 3. Включаем нужный и меняем заголовок
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
                if (reviewsTab) reviewsTab.style.display = 'block';
                elements.sectionTitle.innerText = "Customer Reviews 💬";
                // Для отзывов updateStore не нужен, там нет товаров
            }
        }

    });

    // --- 5. ПЛЕЕР ---
    if (elements.audio && elements.playBtn) {
        elements.playBtn.addEventListener('click', () => {
            if (elements.audio.paused) {
                elements.audio.play(); elements.playBtn.innerText = '💔';
                elements.playerMarquee?.start();
            } else {
                elements.audio.pause(); elements.playBtn.innerText = '❤';
                elements.playerMarquee?.stop();
            }
        });
    }

    // Закрытие OS окна при клике мимо
    window.addEventListener('click', (e) => {
        if (elements.win && !elements.win.contains(e.target) && !elements.shortcut.contains(e.target)) {
            elements.win.classList.remove('show');
        }
    });

    setupMerchEffects();
    updateStore();
});

// --- ДЕКОР ---
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
            animationDuration: `${Math.random() * 5 + 7}s`
        });
        decor.style.setProperty('--rot', `${Math.random() * 360}deg`);
        fragment.appendChild(decor);
    }
    layer.appendChild(fragment);
}
window.addEventListener('load', spawnDecor);
