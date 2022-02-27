class SutomManager {
    constructor (allWords) {
        this.allWords = allWords;
        this.dryRun = false;
        this.maxAttempts = 6;
        this.testIds = {
            selectVersionId: 'test-bot-version',
            selectWordTypeId: 'test-bot-word-type',
            customInputId: 'run-test-custom-input',
            runButtonId: 'run-test-button',
            contentLoaderId: 'test-bot-form-loader',
            contentRunTestButtonId: 'content-test-bot-form-validation'
        }
        this.statisticsIds = {
            formId: 'statistics-form',
            selectVersionId: 'statistics-version',
            runButtonId: 'calculate-statistics-button',
            contentProgressId: 'statistics-content-progress',
            progressBarId: 'statistics-progress-bar',
            progressPercentId: 'statistics-progress-percent',
            tableId: 'statistics-table'
        }

        this.gameHelperIds = {
            selectVersionId: 'game-helper-version',
            selectNbCharsId: 'game-helper-nb-letters',
            runButtonId: 'run-game-helper',
            tableId: 'game-table-helper'
        }
        this.gameHelperAttempt = 0;

        this.statistics = {};
        this.statisticsLSKey = 'sutom-bot-statistics';
        this.game = new SutomGame(allWords);
        this.bot = null;
        this.statsMaxLength = 10000; //this.allWords.length;

        this.onWordTypeChange = this.onWordTypeChange.bind(this);
        this.onRunTestClick = this.onRunTestClick.bind(this);
        this.onRunStatisticsClick = this.onRunStatisticsClick.bind(this);
        this.onRunGameHelperClick = this.onRunGameHelperClick.bind(this);
        this.onChangeGameHelperNbChars = this.onChangeGameHelperNbChars.bind(this);
        this.onGameHelperInputClick = this.onGameHelperInputClick.bind(this);
        this.init();
    }

    static BOT_VERSION = {
        V1: 'V1',
        V2: 'V2',
        V3: 'V3',
        V4: 'V4',
        LAST: 'V3'
    }

    init () {
        this.statistics = this.getSavedStats();
        this.__initTests();
        this.__initStatistics();
        this.__initGameHelper();
        //this.removeStatisticByVersion(SutomManager.BOT_VERSION.V4);
    }

    __initTests () {
        const select = document.getElementById(this.testIds.selectVersionId);
        for (const [key, value] of Object.entries(SutomManager.BOT_VERSION)) {
            if (key !== 'LAST') {
                var option = document.createElement("option");
                option.text = value;
                option.value = value;
                select.add(option);
            }
        }
        document.getElementById(this.testIds.selectWordTypeId).value = 'auto';
        document.getElementById(this.testIds.selectVersionId).value = SutomManager.BOT_VERSION.LAST;
        document.getElementById(this.testIds.selectWordTypeId).onchange = this.onWordTypeChange;
        document.getElementById(this.testIds.runButtonId).onclick = this.onRunTestClick;
    }

    __initStatistics () {
        const select = document.getElementById(this.statisticsIds.selectVersionId);
        for (const [key, value] of Object.entries(SutomManager.BOT_VERSION)) {
            if (key !== 'LAST') {
                var option = document.createElement("option");
                option.text = value;
                option.value = value;
                select.add(option);
            }
        }
        document.getElementById(this.statisticsIds.selectVersionId).value = SutomManager.BOT_VERSION.LAST;
        document.getElementById(this.statisticsIds.runButtonId).onclick = this.onRunStatisticsClick;
        this.loadStatisticsTables();
    }

    __initGameHelper () {
        const select = document.getElementById(this.gameHelperIds.selectVersionId);
        for (const [key, value] of Object.entries(SutomManager.BOT_VERSION)) {
            if (key !== 'LAST') {
                var option = document.createElement("option");
                option.text = value;
                option.value = value;
                select.add(option);
            }
        }
        document.getElementById(this.gameHelperIds.selectNbCharsId).value = 6;
        document.getElementById(this.gameHelperIds.selectVersionId).value = SutomManager.BOT_VERSION.LAST;
        document.getElementById(this.gameHelperIds.runButtonId).onclick = this.onRunGameHelperClick;
        this.drawGameHelper();
        document.getElementById(this.gameHelperIds.selectNbCharsId).onchange = this.onChangeGameHelperNbChars;
    }

    resetGameHelper () {
        this.drawGameHelper();
    }

    onWordTypeChange (e) {
        const input = document.getElementById(this.testIds.customInputId);
        if (e.target.value === 'custom') {
            input.classList.remove('display-none');
        } else {
            input.classList.add('display-none');
        }
    }

    onRunTestClick () {
        this.stopGame();
        const newVersion = document.getElementById(this.testIds.selectVersionId).value;
        const wordType = document.getElementById(this.testIds.selectWordTypeId).value;
        const word = (wordType === 'custom') ? document.getElementById(this.testIds.customInputId).value : null;
        const contentLoader = document.getElementById(this.testIds.contentLoaderId);
        document.getElementById(this.testIds.contentRunTestButtonId).classList.add('display-none');
        contentLoader.innerHTML = this.__getLoader();
        setTimeout(() => {
            this.loadBot(newVersion);
            this.resetGame(word);
            this.runBot();
            document.getElementById(this.testIds.contentRunTestButtonId).classList.remove('display-none');
            contentLoader.innerHTML = '';
        }, 100);
    }


    async onRunStatisticsClick () {
        const version = document.getElementById(this.statisticsIds.selectVersionId).value;
        const contentLoader = document.getElementById(this.statisticsIds.contentProgressId);
        const form = document.getElementById(this.statisticsIds.formId);
        form.classList.add('display-none');
        contentLoader.innerHTML = this.__getProgress(version);
        const initialStats = {
            wordIndex: 0,
            version: version,
            won: 0,
            lost: 0,
            total_words: this.allWords.length,
            lost_words: [],
            victories: {
                1: { nb: 0 },
                2: { nb: 0 },
                3: { nb: 0 },
                4: { nb: 0 },
                5: { nb: 0, words: [] },
                6: { nb: 0, words: [] }
            },
            start: Date.now(),
            finalized: false,
            average_victory: null
        }
        const versionStats = (this.statistics[version]) ? this.statistics[version] : initialStats;
        this.runStatBot(versionStats);
    }

    getBotHelp (version = null) {
        version = version || SutomManager.BOT_VERSION.LAST;
        this.loadBot(version);
        this.bot.reset(null, null);
        this.bot.__init();
        this.bot.__updateInfos();
        this.game.__displayMessage({ status: 'notice', message: `Bot ${version} guess ${this.bot.__guessWord()}` })
    }

    getBotHelpFromData (nbChars, knownWord, wrongsChars = [], missPlacedChars = [], version = null) {
        version = version || SutomManager.BOT_VERSION.LAST;
        this.loadBot(version);
        this.bot.reset();
        this.bot.__init();
        const wordsFiltered = this.bot.__manualfilterAllWords(nbChars, knownWord, wrongsChars, missPlacedChars);
        console.log('wordsFiltered', wordsFiltered);
        this.game.__displayMessage({ status: 'notice', message: `Bot ${version} guess ${this.bot.__guessWord()}` })
    }

    getSavedStats () {
        if (this.dryRun) {
            return {};
        }
        if (typeof (localStorage) !== 'undefined') {
            return JSON.parse(localStorage.getItem(this.statisticsLSKey)) || {};
        }
        return {};
    }

    saveCurrentStats (versionStats) {
        if (this.dryRun) {
            return null;
        }
        this.statistics[versionStats.version] = versionStats;
        return this.saveStats();
    }

    saveStats () {
        if (this.dryRun) {
            return null;
        }
        if (typeof (localStorage) !== 'undefined') {
            return localStorage.setItem(this.statisticsLSKey, JSON.stringify(this.statistics));
        }
        return null;
    }

    loadBot (version) {
        this.version = version;
        switch (version) {
            case SutomManager.BOT_VERSION.V1:
                this.bot = new SutomBotV1(this.allWords);
                break;
            case SutomManager.BOT_VERSION.V2:
                this.bot = new SutomBotV2(this.allWords);
                break;
            case SutomManager.BOT_VERSION.V3:
                this.bot = new SutomBotV3(this.allWords);
                break;
            case SutomManager.BOT_VERSION.V4:
                this.bot = new SutomBotV4(this.allWords);
                break;
            default:
                break;
        }
    }



    runStatBot (stats) {
        const word = this.allWords[stats.wordIndex];
        const progressBar = document.getElementById(this.statisticsIds.progressBarId);
        const progressPercent = document.getElementById(this.statisticsIds.progressPercentId);
        const percentProgress = Math.round(((stats.wordIndex + 1) / this.statsMaxLength) * 100);
        if (!word || stats.wordIndex >= this.statsMaxLength) {
            const end = Date.now();
            const duration = end - stats.start;
            delete stats.start;
            stats.duration = duration;
            stats.finalized = true;
            const totalAttempts = stats.victories[1].nb + (stats.victories[2].nb * 2) + (stats.victories[3].nb * 3) + (stats.victories[4].nb * 4) + (stats.victories[5].nb * 5) + (stats.victories[1].nb * 6);
            stats.average_victory = totalAttempts / stats.won;
            // stop statistics
            this.statistics[stats.version] = stats;
            this.saveStats();
            this.loadStatisticsTables();
            const contentLoader = document.getElementById(this.statisticsIds.contentProgressId);
            const form = document.getElementById(this.statisticsIds.formId);
            form.classList.remove('display-none');
            contentLoader.innerHTML = '';
            return false;
        }
        this.loadBot(stats.version);
        this.resetGame(word, false);
        if (this.bot) {
            this.bot.init(({ status, attempts }) => {
                if (status === 'won') {
                    stats.won++;
                    stats.victories[attempts].nb++;
                    if ([5, 6].includes(attempts)) {
                        stats.victories[attempts].words.push(word);
                    }
                } else {
                    stats.lost++;
                    stats.lost_words.push(word);
                }
                const totalAttempts = stats.victories[1].nb + (stats.victories[2].nb * 2) + (stats.victories[3].nb * 3) + (stats.victories[4].nb * 4) + (stats.victories[5].nb * 5) + (stats.victories[1].nb * 6);
                stats.average_victory = totalAttempts / stats.won;
                progressPercent.innerText = `${stats.wordIndex + 1}/${this.statsMaxLength} (${percentProgress}%)`;
                progressBar.style.width = percentProgress + "%";
                stats.wordIndex += 1;
                if (stats.wordIndex % 10 === 0) {
                    this.saveCurrentStats(stats);
                    this.loadStatisticsTables();
                }
                this.runStatBot(stats);
            }, false)
        }

    }

    runBot () {
        if (this.bot) {
            this.bot.init();
        }
    }

    initGame () {
        this.game.init();
    }

    resetGame (customWord = null, withMessage = true) {
        this.game.reset(customWord, withMessage);
    }

    stopGame () {
        this.game.stop();
    }

    removeStatisticByVersion (version) {
        if (this.statistics[version]) {
            delete this.statistics[version];
            this.saveStats();
        }
    }

    loadStatisticsTables () {
        const refTable = document.getElementById(this.statisticsIds.tableId);
        const tBody = refTable.getElementsByTagName('tbody')[0];
        for (let i = tBody.rows.length; i > 0; i--) {
            tBody.deleteRow(i - 1);
        }
        let rowIndex = 0;
        for (const [version, stats] of Object.entries(this.statistics)) {
            const newLine = tBody.insertRow(rowIndex);
            const lineStats = [];
            lineStats.push(version);
            lineStats.push(stats.wordIndex);
            lineStats.push(Math.round((stats.won / stats.wordIndex) * 100) + '% (' + stats.won + ')');
            lineStats.push(Math.round((stats.lost / stats.wordIndex) * 100) + '% (' + stats.lost + ')');
            lineStats.push(Math.round(stats.average_victory * 100) / 100);
            for (let cellIndex = 0; cellIndex < lineStats.length; cellIndex++) {
                const newCell = newLine.insertCell(cellIndex);
                const text = document.createTextNode(lineStats[cellIndex]);
                newCell.appendChild(text);
            }
        }
    }

    __getLoader () {
        return (
            '<div class="loader"><div></div><div></div><div></div><div></div></div>'
        );
    }

    __getProgress (version) {
        return (
            `<div class="progress-version">Calculating statistics for bot ${version}:</div><div class="content-progress-bar"><div id="statistics-progress-bar" class="progress-bar"></div><div id="statistics-progress-percent" class="progress-percent">0%</div></div>`
        );
    }

    async onRunGameHelperClick () {
        this.game.__clearMessages();
        if(document.getElementById('ghi-0-0').value === ''){
            this.game.__displayMessage({
                status: 'error',
                message: 'You must specify the first letter!'
            })
            return false;
        }
        if(this.gameHelperAttempt >= this.maxAttempts){
            return false;
        }
        const nbChars = parseInt(document.getElementById(this.gameHelperIds.selectNbCharsId).value);
        const version = document.getElementById(this.gameHelperIds.selectVersionId).value;
        this.loadBot(version);
        this.bot.reset();
        this.bot.__init(nbChars);
        this.bot.__updateInfosFromGameHelper();
        const wordsFiltered = this.bot.allWords;
        console.log('wordsFiltered', wordsFiltered);
        const word = this.bot.__guessWord();
        if (!word) {
            this.game.__displayMessage({
                status: 'error',
                message: 'No word found!'
            })
            return false;
        }
        const wordChars = word.trim().split('');
        this.game.__displayMessage({ status: 'notice', message: `Bot ${version} guess ${word}` })
        const refTable = this.__getRefTableGameHelper();
        for (let rowIndex = 0; rowIndex < refTable.rows.length; rowIndex++) {
            const row = refTable.rows[rowIndex];
            if (rowIndex === (this.gameHelperAttempt - 1) && row.cells.length > 0) {
                for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
                    if(!(rowIndex === 0 && cellIndex === 0) && row.cells[cellIndex].className !== 'bien-place' && row.cells[cellIndex].className !== 'mal-place'){
                        row.cells[cellIndex].className = 'non-trouve';
                    }
                }
            }
        }
        let previousRow = null;
        for (let rowIndex = 0; rowIndex < refTable.rows.length; rowIndex++) {
            const row = refTable.rows[rowIndex];
            if (rowIndex === this.gameHelperAttempt && row.cells.length > 0) {
                for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
                    if(!(rowIndex === 0 && cellIndex === 0)){
                        row.cells[cellIndex].innerText = wordChars[cellIndex];
                    }
                    if(previousRow && previousRow.cells[cellIndex] && previousRow.cells[cellIndex].className === 'bien-place') {
                        row.cells[cellIndex].className = 'bien-place';
                    }

                }
            }
            previousRow = row;
        }
        this.gameHelperAttempt++;
    }

    __getRefTableGameHelper () {
        return document.getElementById(this.gameHelperIds.tableId);
    }


    __clearHelperTable () {
        const refTable = this.__getRefTableGameHelper();
        for (let i = refTable.rows.length; i > 0; i--) {
            refTable.deleteRow(i - 1);
        }
    }

    drawGameHelper () {
        this.gameHelperAttempt = 0;
        const nbChars = parseInt(document.getElementById(this.gameHelperIds.selectNbCharsId).value);
        const refTable = this.__getRefTableGameHelper();
        this.__clearHelperTable();
        for (let rowIndex = 0; rowIndex < this.maxAttempts; rowIndex++) {
            const newLine = refTable.insertRow(rowIndex);
            for (let cellIndex = 0; cellIndex < nbChars; cellIndex++) {
                const newCell = newLine.insertCell(cellIndex);
                if(cellIndex === 0 && rowIndex === 0){
                    newCell.className = 'bien-place';
                    const input = document.createElement("input");
                    input.type = "text";
                    input.className = "input-inner-grid";
                    input.setAttribute('placeholder', '.');
                    input.setAttribute('maxlength', 1);
                    input.setAttribute('size', 1);
                    input.id = 'ghi-'+rowIndex+'-'+cellIndex;
                    newCell.appendChild(input);
                } else {
                    const text = document.createTextNode((rowIndex === 0) ? '.' : '');
                    newCell.appendChild(text);
                    newCell.id = 'ghi-'+rowIndex+'-'+cellIndex;
                    newCell.onclick = this.onGameHelperInputClick;
                }
            }
        }
    }

    onChangeGameHelperNbChars (e) {
        this.drawGameHelper();
    }

    onGameHelperInputClick (e) {
        const element = e.target;
        if(element.innerText === '' || element.innerText === '.'){
            return false;
        }
        let nextClass = 'mal-place';
        if (element.classList.contains('mal-place')) {
            nextClass = 'bien-place';
        } else if(element.classList.contains('bien-place')){
            nextClass = 'non-trouve';
        } else if (element.classList.contains('non-trouve')) {
            nextClass = null;
        }
        element.classList.remove('bien-place', 'mal-place', 'non-trouve');
        if (nextClass) {
            element.classList.add(nextClass);
        }
    }
}

