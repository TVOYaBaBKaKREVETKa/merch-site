document.addEventListener('DOMContentLoaded', () => {
    // 1. КУРСОР
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.opacity = '1';
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
    }

    // 2. РАНДОМ ДЛЯ МЕРЧА (СКОТЧ И УМНЫЙ НАКЛОН)
    function setupMerchEffects() {
        const tapes = document.querySelectorAll('.item-tape');
        tapes.forEach(tape => {
            if (![...tape.classList].some(cls => cls.startsWith('tape-'))) {
                const randomNum = Math.floor(Math.random() * 16) + 1;
                tape.classList.add(`tape-${randomNum}`);
            }
        });

        const items = document.querySelectorAll('.merch-item');
        items.forEach(item => {
            const randomRotate = (Math.random() * 14 - 7).toFixed(1); 
            item.style.setProperty('--tilt', `${randomRotate}deg`);
            item.style.transform = `rotate(var(--tilt))`;
        });
    }

    setupMerchEffects();

    // 3. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
    const tabs = document.querySelectorAll('.nav-side-item');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            const target = this.getAttribute('href');
            if (target.startsWith('http')) return;
            e.preventDefault();

            tabs.forEach(t => t.classList.remove('active-tab'));
            panes.forEach(p => p.classList.remove('active'));

            this.classList.add('active-tab');

            const activePane = document.querySelector(target + '-tab');
            if (activePane) {
                activePane.style.opacity = '0';
                activePane.classList.add('active');

                setupMerchEffects();

                setTimeout(() => {
                    activePane.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
                    activePane.style.opacity = '1';
                    activePane.style.transform = 'translateY(0)';
                }, 10);
            }
        });
    });

    // 4. ЛОГИКА МОДАЛЬНОГО ОКНА (ИСПРАВЛЕНО ДЛЯ АВИТО)
    const modal = document.getElementById('product-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const closeBtn = document.querySelector('.modal-close-trigger');

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.merch-item');
        
        // Проверяем, что кликнули по карточке и НЕ по кнопке покупки
        if (card && !e.target.classList.contains('buy-btn')) {
            const title = card.querySelector('.item-name').innerText;
            const imgTag = card.querySelector('.item-img img');
            const imgContainer = card.querySelector('.item-img');

            // Безопасно подставляем заголовок
            modalTitle.innerText = title;

            // Проверяем: есть ли внутри тег img и есть ли у него путь
            if (imgTag && imgTag.getAttribute('src') !== "") {
                modalImg.src = imgTag.src;
                modalImg.style.display = 'block'; // Показываем картинку
                // Если в модалке был текст-заглушка для эмодзи, тут его можно скрыть
            } else {
                // Если картинки нет (как в Авито-заглушках), 
                // можем либо скрыть картинку в модалке, либо оставить пустое место
                modalImg.src = ""; 
                modalImg.style.display = 'none'; 
                // Можно добавить логику, чтобы в модалке рисовался эмодзи из контейнера,
                // но когда ты вставишь реальные фото в Авито, всё заработает само через блок выше.
            }
            
            if (modal) modal.style.display = 'flex';
        }
    });

    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (modal && e.target === modal) modal.style.display = 'none'; };
});

const fandomItems = document.querySelectorAll('.fandom-item');
const footerText = document.getElementById('fandom-name');

fandomItems.forEach(item => {
    // При клике
    item.addEventListener('click', () => {
        fandomItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        // Тут вызывай свою функцию фильтрации товаров
    });

    // При наведении (меняем текст внизу окна)
    item.addEventListener('mouseenter', () => {
        footerText.innerText = `Category: ${item.getAttribute('title')}`;
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const shortcut = document.getElementById('os-shortcut');
    const win = document.getElementById('os-window');
    const closeBtn = document.querySelector('.win-btn-close');
    const fandomIcons = document.querySelectorAll('.win-item:not(.sort-file)');
    const sortFiles = document.querySelectorAll('.sort-file');

    // 1. ОТКРЫТИЕ/ЗАКРЫТИЕ
    if (shortcut) shortcut.onclick = () => win.classList.toggle('show');
    if (closeBtn) closeBtn.onclick = () => win.classList.remove('show');

    // 2. ОБНОВЛЕНИЕ МАГАЗИНА
    function updateStore() {
        const activePane = document.querySelector('.tab-pane.active');
        if (!activePane) return;

        const container = activePane.querySelector('.pegboard');
        const items = Array.from(activePane.querySelectorAll('.merch-item'));
        
        // Берем активный фандом
        const activeIcon = document.querySelector('.win-item.active:not(.sort-file)');
        const activeFandom = activeIcon ? activeIcon.dataset.fandom : 'all';
        
        const priceFile = document.querySelector('.sort-file[data-sort-type="price"]');
        const dateFile = document.querySelector('.sort-file[data-sort-type="date"]');

        items.forEach(item => {
            const f = item.dataset.fandom;
            item.style.display = (activeFandom === 'all' || f === activeFandom) ? 'block' : 'none';
        });

        let visible = items.filter(i => i.style.display !== 'none');

        // Сортировка
        if (priceFile && priceFile.dataset.dir !== "0") {
            visible.sort((a, b) => priceFile.dataset.dir === "1" ? a.dataset.price - b.dataset.price : b.dataset.price - a.dataset.price);
        } else if (dateFile && dateFile.dataset.dir !== "0") {
            visible.sort((a, b) => dateFile.dataset.dir === "1" ? new Date(a.dataset.date) - new Date(b.dataset.date) : new Date(b.dataset.date) - new Date(a.dataset.date));
        }

        visible.forEach(item => container.appendChild(item));
    }

    // 3. ОБРАБОТКА КЛИКОВ
    fandomIcons.forEach(icon => {
        icon.onclick = () => {
            fandomIcons.forEach(i => i.classList.remove('active'));
            icon.classList.add('active');
            updateStore();
        };
    });

    sortFiles.forEach(file => {
        file.onclick = () => {
            let next = (parseInt(file.dataset.dir) + 1) % 3;
            sortFiles.forEach(f => { f.dataset.dir = "0"; f.querySelector('.arr').innerText = "↕"; f.classList.remove('active'); });
            
            file.dataset.dir = next;
            file.querySelector('.arr').innerText = ["↕", "↑", "↓"][next];
            if (next !== 0) file.classList.add('active');
            
            updateStore();
        };
    });

    updateStore();
});

