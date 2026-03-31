const generateBtn = document.getElementById('generate');
const numbersDiv = document.getElementById('numbers');
const historyList = document.getElementById('history-list');
const themeToggleBtn = document.getElementById('theme-toggle');
const themeStorageKey = 'lotto-theme';

const applyTheme = (theme) => {
    const isDarkMode = theme === 'dark';
    document.body.classList.toggle('dark-mode', isDarkMode);
    themeToggleBtn.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
};

const savedTheme = localStorage.getItem(themeStorageKey);
if (savedTheme === 'dark' || savedTheme === 'light') {
    applyTheme(savedTheme);
}

themeToggleBtn.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem(themeStorageKey, nextTheme);
});

generateBtn.addEventListener('click', () => {
    const generatedNumbers = new Set();
    while (generatedNumbers.size < 6) {
        generatedNumbers.add(Math.floor(Math.random() * 45) + 1);
    }

    const numbersArray = Array.from(generatedNumbers);
    numbersDiv.innerHTML = '';
    numbersArray.forEach(number => {
        const numberDiv = document.createElement('div');
        numberDiv.classList.add('number');
        numberDiv.textContent = number;
        numbersDiv.appendChild(numberDiv);
    });

    const historyItem = document.createElement('li');
    historyItem.textContent = numbersArray.join(', ');
    historyList.appendChild(historyItem);
});
