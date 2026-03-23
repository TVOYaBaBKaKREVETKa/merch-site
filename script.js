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
        // Лепим скотч на ВСЕ карточки (и мерч, и авито)
        document.querySelectorAll('.item-tape').forEach(tape => {
            if (![...tape.classList].some(cls => cls.startsWith('tape-'))) {
                const randomNum = Math.floor(Math.random() * 16) + 1;
                tape.classList.add(`tape-${randomNum}`);
            }
        });
        // Наклоняем полароиды
        document.querySelectorAll('.merch-item').forEach(item => {
            if (!item.style.getPropertyValue('--tilt')) {
                const randomRotate = (Math.random() * 14 - 7).toFixed(1);
                item.style.setProperty('--tilt', `${randomRotate}deg`);
                item.style.transform = `rotate(var(--tilt))`;
            }
        });
    }

    // --- 3. МАГАЗИН (ФИЛЬТР + СОРТИРОВКА) ---
    function updateStore() {
        const activeContainer = document.querySelector('.pegboard:not([style*="display: none"])');
        if (!activeContainer) return;

        const items = Array.from(activeContainer.querySelectorAll('.merch-item'));
        const activeIcon = document.querySelector('.win-item.active:not(.sort-file)');
        const activeFandom = activeIcon ? activeIcon.dataset.fandom : 'all';
        
        const priceFile = document.querySelector('.sort-file[data-sort-type="price"]');
        const dateFile = document.querySelector('.sort-file[data-sort-type="date"]');

        items.forEach(item => {
            const f = item.dataset.fandom;
            item.style.display = (activeFandom === 'all' || f === activeFandom) ? 'block' : 'none';
        });

        let visible = items.filter(i => i.style.display !== 'none');

        if (priceFile && priceFile.dataset.dir !== "0") {
            visible.sort((a, b) => {
                const p1 = parseFloat(a.dataset.price) || 0;
                const p2 = parseFloat(b.dataset.price) || 0;
                return priceFile.dataset.dir === "1" ? p1 - p2 : p2 - p1;
            });
        } else if (dateFile && dateFile.dataset.dir !== "0") {
            visible.sort((a, b) => {
                const d1 = new Date(a.dataset.date) || 0;
                const d2 = new Date(b.dataset.date) || 0;
                return dateFile.dataset.dir === "1" ? d1 - d2 : d2 - d1;
            });
        }
        visible.forEach(item => activeContainer.appendChild(item));
    }

    // --- 4. ВКЛАДКИ ---
    const tabs = document.querySelectorAll('.nav-side-item');
    const merchContainer = document.getElementById('shop-merch');
    const avitoContainer = document.getElementById('shop-avito');
    const sectionTitle = document.getElementById('current-section-title');

    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href.startsWith('#')) return;
            e.preventDefault();

            tabs.forEach(t => t.classList.remove('active-tab'));
            this.classList.add('active-tab');

            if (href === '#merch') {
                merchContainer.style.display = 'grid';
                avitoContainer.style.display = 'none';
                sectionTitle.innerText = "New Merch Drops ✨";
            } else if (href === '#avito') {
                merchContainer.style.display = 'none';
                avitoContainer.style.display = 'grid';
                sectionTitle.innerText = "Garage Sale (Avito) 🧺";
            }

            setupMerchEffects(); // СРАЗУ ЛЕПИМ СКОТЧ ПРИ СМЕНЕ
            updateStore();
        });
    });

    // --- 5. МОДАЛКА И ГАЛЕРЕЯ (Универсальная) ---
    const modal = document.getElementById('product-modal');
    const modalImg = document.getElementById('modal-img');
    let currentImages = [];
    let currentIdx = 0;

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.merch-item');
        // Открываем модалку, если кликнули по карточке, но НЕ по кнопке "купить"
        if (card && !e.target.closest('.buy-btn')) {
            const imgAttr = card.getAttribute('data-images');
            currentImages = imgAttr ? imgAttr.split(',') : [card.querySelector('.item-img img').src];
            currentIdx = 0;

            document.getElementById('modal-title').innerText = card.querySelector('.item-name').innerText;
            document.getElementById('modal-desc').innerText = card.dataset.desc || "Описание скоро будет ✨";
            document.querySelector('.modal-price').innerText = (card.dataset.price || 0) + "₽";
            
            modalImg.src = currentImages[currentIdx];
            document.getElementById('current-idx').innerText = "1";
            document.getElementById('total-idx').innerText = currentImages.length;
            modal.style.display = 'flex';
        }
    });

    // Навигация галереи
    document.getElementById('prev-img').onclick = (e) => {
        e.stopPropagation();
        currentIdx = (currentIdx - 1 + currentImages.length) % currentImages.length;
        modalImg.src = currentImages[currentIdx];
        document.getElementById('current-idx').innerText = currentIdx + 1;
    };

    document.getElementById('next-img').onclick = (e) => {
        e.stopPropagation();
        currentIdx = (currentIdx + 1) % currentImages.length;
        modalImg.src = currentImages[currentIdx];
        document.getElementById('current-idx').innerText = currentIdx + 1;
    };

    const modalClose = document.querySelector('.modal-close-trigger');
    if (modalClose) modalClose.onclick = () => modal.style.display = 'none';

    // --- 6. ОКНО ФИЛЬТРОВ ---
    const shortcut = document.getElementById('os-shortcut');
    const win = document.getElementById('os-window');
    if (shortcut && win) {
        shortcut.onclick = (e) => { e.stopPropagation(); win.classList.toggle('show'); };
    }

    // Закрытие всего по клику мимо
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
        if (win && !win.contains(e.target) && !shortcut.contains(e.target)) win.classList.remove('show');
    };

    // Инициализация
    setupMerchEffects();
    updateStore();
});

