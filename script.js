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
                const randomRotate = (Math.random() * 6 - 3).toFixed(1); // Уменьшил разброс для аккуратности
                item.style.setProperty('--tilt', `${randomRotate}deg`);
                item.style.transform = `rotate(var(--tilt))`;
            }
        });
    }

    // --- 3. МАГАЗИН (ФИЛЬТР + СОРТИРОВКА) ---
    function updateStore() {
        // Находим текущую видимую сетку
        const activeContainer = Array.from(document.querySelectorAll('.pegboard')).find(el => 
            window.getComputedStyle(el).display !== 'none'
        );
        if (!activeContainer) return;

        const items = Array.from(activeContainer.querySelectorAll('.merch-item'));
        
        // Находим активный фильтр в окне OS
        const activeIcon = document.querySelector('.win-item.active:not(.sort-file)');
        const activeFandom = activeIcon ? activeIcon.dataset.fandom : 'all';
        
        const priceFile = document.querySelector('.sort-file[data-sort-type="price"]');

        // 3.1 Фильтрация
        items.forEach(item => {
            const f = item.dataset.fandom;
            if (activeFandom === 'all' || f === activeFandom) {
                item.style.display = ''; // Возвращаем в сетку
            } else {
                item.style.display = 'none'; // Скрываем
            }
        });

        // 3.2 Сортировка по цене
        let visibleItems = items.filter(i => i.style.display !== 'none');

        if (priceFile && priceFile.dataset.dir !== "0") {
            const dir = priceFile.dataset.dir;
            visibleItems.sort((a, b) => {
                const p1 = parseFloat(a.dataset.price) || 0;
                const p2 = parseFloat(b.dataset.price) || 0;
                return dir === "1" ? p1 - p2 : p2 - p1;
            });
            // Перевставляем в DOM в новом порядке
            visibleItems.forEach(item => activeContainer.appendChild(item));
        }
    }

    // --- 4. КЛИКИ ПО ФИЛЬТРАМ (ИНТЕРФЕЙС OS) ---
    document.querySelectorAll('.win-item:not(.sort-file)').forEach(icon => {
        icon.addEventListener('click', function() {
            document.querySelectorAll('.win-item:not(.sort-file)').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            updateStore();
        });
    });

    // Клик по файлу "Price" (Сортировка)
    const priceSort = document.querySelector('.sort-file[data-sort-type="price"]');
    if (priceSort) {
        priceSort.addEventListener('click', function() {
            let currentDir = parseInt(this.dataset.dir || "0");
            // Цикл: 0 -> 1 (min) -> 2 (max) -> back to 0
            this.dataset.dir = (currentDir + 1) % 3;
            
            // Визуальный фидбек
            this.style.filter = this.dataset.dir === "0" ? "grayscale(1)" : "none";
            updateStore();
        });
    }

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

    // --- 6. МОДАЛКА И ГАЛЕРЕЯ ---
    const modal = document.getElementById('product-modal');
    const modalImg = document.getElementById('modal-img');
    let currentImages = [];
    let currentIdx = 0;

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.merch-item');
        if (card && !e.target.closest('.buy-btn')) {
            const imgAttr = card.getAttribute('data-images');
            const mainImg = card.querySelector('.item-img img');
            
            currentImages = imgAttr ? imgAttr.split(',') : (mainImg ? [mainImg.src] : []);
            if (currentImages.length === 0) return;
            
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

    // Кнопки галереи
    const prevBtn = document.getElementById('prev-img');
    const nextBtn = document.getElementById('next-img');

    if (prevBtn) prevBtn.onclick = (e) => {
        e.stopPropagation();
        currentIdx = (currentIdx - 1 + currentImages.length) % currentImages.length;
        modalImg.src = currentImages[currentIdx];
        document.getElementById('current-idx').innerText = currentIdx + 1;
    };

    if (nextBtn) nextBtn.onclick = (e) => {
        e.stopPropagation();
        currentIdx = (currentIdx + 1) % currentImages.length;
        modalImg.src = currentImages[currentIdx];
        document.getElementById('current-idx').innerText = currentIdx + 1;
    };

    const modalClose = document.querySelector('.modal-close-trigger');
    if (modalClose) modalClose.onclick = () => modal.style.display = 'none';

    // --- 7. ОКНО OS (ФИЛЬТРЫ) ---
    const shortcut = document.getElementById('os-shortcut');
    const win = document.getElementById('os-window');
    if (shortcut && win) {
        shortcut.onclick = (e) => { 
            e.stopPropagation(); 
            win.classList.toggle('show'); 
        };
    }

    // Закрытие по клику мимо
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
        if (win && !win.contains(e.target) && !shortcut.contains(e.target)) {
            win.classList.remove('show');
        }
    };

    // Инициализация при загрузке
    setupMerchEffects();
    updateStore();
});
