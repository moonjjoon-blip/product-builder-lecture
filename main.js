const recommendBtn = document.getElementById('recommend');
const menuName = document.getElementById('menu-name');
const menuDescription = document.getElementById('menu-description');
const menuTags = document.getElementById('menu-tags');
const historyList = document.getElementById('history-list');
const themeToggleBtn = document.getElementById('theme-toggle');
const categoryButtons = document.querySelectorAll('.chip');

const lang = document.body.dataset.lang === 'en' ? 'en' : 'ko';
const themeStorageKey = 'dinner-theme';
const historyStorageKey = 'dinner-history-' + lang;

const content = {
    ko: {
        theme: { dark: 'Day Mode', light: 'Night Mode' },
        emptyHistory: '아직 추천 기록이 없습니다.',
        menus: [
            { name: '매콤 제육볶음 정식', description: '매운맛으로 피로를 날리고 싶을 때 어울리는 든든한 한식 메뉴입니다.', tags: ['한식', '든든함', '퇴근 후'], category: 'korean' },
            { name: '얼큰한 김치찌개', description: '실패 확률이 낮고 밥 한 공기까지 확실하게 해결되는 저녁입니다.', tags: ['한식', '국물', '무난함'], category: 'korean' },
            { name: '차돌짬뽕', description: '칼칼한 국물과 면이 당기는 날 선택하기 좋은 강한 한 끼입니다.', tags: ['아시안', '면요리', '칼칼함'], category: 'asian' },
            { name: '팟타이', description: '너무 무겁지 않으면서도 만족감 있는 달콤짭짤한 메뉴입니다.', tags: ['아시안', '가벼움', '색다름'], category: 'asian' },
            { name: '크림 파스타', description: '조금 부드럽고 편안한 분위기의 저녁을 원할 때 적합합니다.', tags: ['양식', '부드러움', '분위기'], category: 'western' },
            { name: '수제버거 세트', description: '생각 많이 하기 싫고 만족도 높은 메뉴가 필요할 때 가장 빠릅니다.', tags: ['양식', '직관적', '만족감'], category: 'western' },
            { name: '참치마요 덮밥', description: '배달도 빠르고 부담이 적어서 바쁜 저녁에 잘 맞습니다.', tags: ['간단하게', '가성비', '빠름'], category: 'quick' },
            { name: '잔치국수와 김밥', description: '가볍게 먹고 싶지만 허전하지는 않게 마무리하고 싶을 때 좋습니다.', tags: ['간단하게', '가벼움', '편안함'], category: 'quick' }
        ]
    },
    en: {
        theme: { dark: 'Day Mode', light: 'Night Mode' },
        emptyHistory: 'No recommendations yet.',
        menus: [
            { name: 'Spicy Pork Stir-Fry Set', description: 'A bold Korean comfort meal when you want something hot, savory, and filling after work.', tags: ['Korean', 'Hearty', 'After Work'], category: 'korean' },
            { name: 'Kimchi Stew', description: 'A dependable dinner pick with rich broth, warm rice, and very little chance of regret.', tags: ['Korean', 'Soup', 'Reliable'], category: 'korean' },
            { name: 'Spicy Beef Jjamppong', description: 'A strong noodle choice for nights when you want smoky flavor and a spicy broth.', tags: ['Asian', 'Noodles', 'Spicy'], category: 'asian' },
            { name: 'Pad Thai', description: 'Balanced, satisfying, and not too heavy if you want something flavorful but easy.', tags: ['Asian', 'Balanced', 'Comfort'], category: 'asian' },
            { name: 'Cream Pasta', description: 'A softer, calmer dinner option for evenings that call for something mellow and rich.', tags: ['Western', 'Creamy', 'Cozy'], category: 'western' },
            { name: 'Craft Burger Set', description: 'Fast decision, high satisfaction. Ideal when you just want a solid dinner without debate.', tags: ['Western', 'Direct', 'Satisfying'], category: 'western' },
            { name: 'Tuna Mayo Rice Bowl', description: 'Quick, budget-friendly, and easy to order when your evening is already packed.', tags: ['Quick', 'Budget', 'Fast'], category: 'quick' },
            { name: 'Noodle Soup and Kimbap', description: 'Light but still complete, for nights when you want dinner without feeling too full.', tags: ['Quick', 'Light', 'Comfort'], category: 'quick' }
        ]
    }
};

const pageContent = content[lang];
let activeCategory = 'all';

const applyTheme = (theme) => {
    const isDarkMode = theme === 'dark';
    document.body.classList.toggle('dark-mode', isDarkMode);
    themeToggleBtn.textContent = isDarkMode ? pageContent.theme.dark : pageContent.theme.light;
};

const renderTags = (tags) => {
    menuTags.innerHTML = '';
    tags.forEach((tag) => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        menuTags.appendChild(tagElement);
    });
};

const renderHistory = (history) => {
    historyList.innerHTML = '';

    if (history.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'history-empty';
        emptyItem.textContent = pageContent.emptyHistory;
        historyList.appendChild(emptyItem);
        return;
    }

    history.forEach((item) => {
        const historyItem = document.createElement('li');
        historyItem.innerHTML = '<strong>' + item.name + '</strong><span>' + item.categoryLabel + '</span>';
        historyList.appendChild(historyItem);
    });
};

const loadHistory = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(historyStorageKey) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const saveHistory = (menu) => {
    const categoryLabel = menu.tags[0];
    const nextHistory = [{ name: menu.name, categoryLabel: categoryLabel }].concat(loadHistory()).slice(0, 6);
    localStorage.setItem(historyStorageKey, JSON.stringify(nextHistory));
    renderHistory(nextHistory);
};

const pickMenu = () => {
    const availableMenus = activeCategory === 'all'
        ? pageContent.menus
        : pageContent.menus.filter((menu) => menu.category === activeCategory);

    const selectedMenu = availableMenus[Math.floor(Math.random() * availableMenus.length)];

    menuName.textContent = selectedMenu.name;
    menuDescription.textContent = selectedMenu.description;
    renderTags(selectedMenu.tags);
    saveHistory(selectedMenu);
};

const savedTheme = localStorage.getItem(themeStorageKey);
if (savedTheme === 'dark' || savedTheme === 'light') {
    applyTheme(savedTheme);
} else {
    applyTheme('light');
}

themeToggleBtn.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem(themeStorageKey, nextTheme);
});

categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
        activeCategory = button.dataset.category;
        categoryButtons.forEach((chip) => chip.classList.remove('active'));
        button.classList.add('active');
    });
});

recommendBtn.addEventListener('click', pickMenu);

renderHistory(loadHistory());
