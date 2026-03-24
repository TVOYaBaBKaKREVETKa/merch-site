document.addEventListener('DOMContentLoaded', () => {
    // --- 1. КУРСОР ---
const cursor = document.getElementById('custom-cursor');

if (cursor) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.opacity = '1';
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Функция для смены вида банки
    const toggleCursor = (active) => {
        if (active) cursor.classList.add('active');
        else cursor.classList.remove('active');
    };

    // Вешаем события на все интерактивные штуки
    const targets = 'a, button, .merch-item, .nav-side-item, .win-item, #os-shortcut, .buy-btn';
    
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(targets)) toggleCursor(true);
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(targets)) toggleCursor(false);
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
            const f = item.dataset.fandom;
            item.style.display = (activeFandom === 'all' || f === activeFandom) ? '' : 'none';
        });

        let visibleItems = items.filter(i => i.style.display !== 'none');

        if (priceFile && priceFile.dataset.dir !== "0") {
            visibleItems.sort((a, b) => {
                const p1 = parseFloat(a.dataset.price) || 0;
                const p2 = parseFloat(b.dataset.price) || 0;
                return priceFile.dataset.dir === "1" ? p1 - p2 : p2 - p1;
            });
        } else {
            const dir = (dateFile && dateFile.dataset.dir !== "0") ? dateFile.dataset.dir : "1";
            visibleItems.sort((a, b) => {
                const d1 = new Date(a.dataset.date || 0);
                const d2 = new Date(b.dataset.date || 0);
                return dir === "1" ? d2 - d1 : d1 - d2;
            });
        }
        visibleItems.forEach(item => activeContainer.appendChild(item));
    }

    // --- 4. КЛИКИ ---
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
            document.querySelectorAll('.sort-file').forEach(other => { if (other !== this) other.dataset.dir = "0"; });
            this.dataset.dir = (currentDir + 1) % 3;
            updateStore();
        });
    });

    // --- 5. ВКЛАДКИ ---
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

    // --- 6. МОДАЛКА (УМНАЯ ГАЛЕРЕЯ) ---
    const modal = document.getElementById('product-modal');
    const modalImg = document.getElementById('modal-img');
    let currentImages = [];
    let currentIdx = 0;

    function updateModalImage() {
        if (currentImages.length > 0 && modalImg) {
            modalImg.src = currentImages[currentIdx];
            const cur = document.getElementById('current-idx');
            const tot = document.getElementById('total-idx');
            if (cur) cur.innerText = currentIdx + 1;
            if (tot) tot.innerText = currentImages.length;
        }
    }

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.merch-item');
        if (card && !e.target.closest('.buy-btn')) {
            const name = card.querySelector('.item-name').innerText;
            const price = card.querySelector('.price-tag').innerText;
            const mainImg = card.querySelector('.item-img img').src;
            
            // Если нет data-images, просто используем главную картинку
            const imgAttr = card.getAttribute('data-images');
            currentImages = imgAttr ? imgAttr.split(',') : [mainImg];
            currentIdx = 0;

            document.getElementById('modal-title').innerText = name;
            document.getElementById('modal-desc').innerText = card.getAttribute('data-desc') || "Описание скоро будет ✨";
            const mPrice = document.querySelector('.modal-price');
            if (mPrice) mPrice.innerText = price;
            
            updateModalImage();
            if(modal) modal.style.display = 'flex';
        }
    });

    document.getElementById('prev-img').onclick = (e) => {
        e.stopPropagation();
        currentIdx = (currentIdx - 1 + currentImages.length) % currentImages.length;
        updateModalImage();
    };
    document.getElementById('next-img').onclick = (e) => {
        e.stopPropagation();
        currentIdx = (currentIdx + 1) % currentImages.length;
        updateModalImage();
    };

    const modalClose = document.querySelector('.modal-close-trigger');
    if (modalClose) modalClose.onclick = () => { if(modal) modal.style.display = 'none'; };

    // --- 7. ОКНО OS ---
    const shortcut = document.getElementById('os-shortcut');
    const win = document.getElementById('os-window');
    if (shortcut && win) shortcut.onclick = (e) => { e.stopPropagation(); win.classList.toggle('show'); };
    const winClose = document.querySelector('.win-btn-close');
    if (winClose && win) winClose.onclick = (e) => { e.stopPropagation(); win.classList.remove('show'); };

    // --- 8. ПЛЕЕР ---
    const audio = document.getElementById('main-audio');
    const playBtn = document.querySelector('.play-btn');
    const playerMarquee = document.getElementById('player-marquee');
    if (audio && playBtn) {
        if (playerMarquee) playerMarquee.stop();
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (audio.paused) {
                audio.play(); playBtn.innerText = '💔';
                if (playerMarquee) playerMarquee.start();
            } else {
                audio.pause(); playBtn.innerText = '❤';
                if (playerMarquee) playerMarquee.stop();
            }
        });
    }

    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
        if (win && !win.contains(e.target) && !shortcut.contains(e.target)) win.classList.remove('show');
    };

    setupMerchEffects();
    updateStore();
});

const decorImages = ['tortbg.png', 'starbg.png', 'strawberrybg.png'];

function spawnDecor() {
    const layer = document.getElementById('decor-layer');
    if (!layer) return;
    layer.innerHTML = '';

    // Создаем 30 элементов на весь экран
    for (let i = 0; i < 30; i++) {
        const decor = document.createElement('div');
        const randomImg = decorImages[Math.floor(Math.random() * decorImages.length)];
        
        const top = Math.random() * 90; // Распределяем по высоте (0-90%)
        
        // Логика: либо в левой части экрана (0-25%), либо в правой (75-100%)
        // Чтобы не лезли на центральный белый блок
        const isLeft = Math.random() > 0.5;
        const left = isLeft ? (Math.random() * 20) : (80 + Math.random() * 15);
        
        const size = Math.random() * (35 - 20) + 20; 
        const rotation = Math.random() * 360; 
        const delay = Math.random() * 10; 
        const duration = Math.random() * (12 - 7) + 7; 
        
        decor.className = 'bg-decor-item';
        decor.style.backgroundImage = `url('assets/${randomImg}')`;
        decor.style.top = `${top}%`;
        decor.style.left = `${left}%`; 
        decor.style.width = `${size}px`;
        decor.style.height = `${size}px`;
        
        decor.style.setProperty('--rot', `${rotation}deg`);
        decor.style.animationDelay = `${delay}s`;
        decor.style.animationDuration = `${duration}s`;
        
        layer.appendChild(decor);
    }
}

window.addEventListener('DOMContentLoaded', spawnDecor);
