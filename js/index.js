const hardWords = [
    'CONNAIT' // 5
];

const failedWords = [
    "AILLENT",
    "ALOSES",
    "APODES",
    "ARBRES",
    "ARMEES",
    "ARYLES"
];

const hardWordsV1 = [
    'CHAUMES'
]

const newWords = [
    "SOUDAINE",
    "SOUDAINES",
    "SOUDAINS"
];

/* manager
----------------------------------------------------------------------------------------*/


const manager = new SutomManager(allWords);
manager.initGame();
manager.stopGame();

/* menu
----------------------------------------------------------------------------------------*/

const body = document.getElementById('body');
const menuItems = document.getElementsByClassName('menu-item');
const onClickMenuItem = (e) => {
    for (let i = 0; i < menuItems.length; i++) {
        menuItems[i].classList.remove('active');
    }
    e.target.classList.add('active');
    body.classList.remove('play', 'test-bot', 'bot-statistics', 'game-helper');
    document.getElementById('messenger').innerHTML = '';
    body.classList.add(e.target.dataset.target);
    switch (e.target.dataset.target) {
        case 'play':
            manager.resetGame();
            break;
        case 'test-bot':
            manager.stopGame();
            break;
        case 'bot-statistics':
            manager.loadStatisticsTables();
            break;
        case 'game-helper':
            manager.resetGameHelper();
        default:
            break;
    }
}

document.getElementById('answer-input').value = '';
for (let i = 0; i < menuItems.length; i++) {
    menuItems[i].addEventListener('click', onClickMenuItem, false);
}