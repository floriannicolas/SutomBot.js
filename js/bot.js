class SutomBot {
    constructor (allWords) {
        this.version = SutomManager.BOT_VERSION.V1;
        this.filteredWords = allWords;
        this.initialAllWords = allWords;
        this.tableId = 'game-table';
        this.tableIdGameHelper = 'game-table-helper';
        this.answerInputId = 'answer-input';
        this.answerButtonId = 'answer-button';
        this.messengerId = 'messenger';
        this.attempts = 0;
        this.maxAttempts = 6;
        this.nbChars = 0;
        this.currentChars = [];
        this.wrongsChars = [];
        this.containedChars = [];
        this.containedCharsLimitation = {};
        this.missPlacedChars = [];
        this.won = false;
        this.playTimeout = 10;
        this.endEvent = null;
        this.withMessage = true;
        this.wordScoreRegex = {};
    }

    reset (endEvent = null, withMessage = true) {
        this.attempts = 0;
        this.nbChars = 0;
        this.currentChars = [];
        this.wrongsChars = [];
        this.containedChars = [];
        this.containedCharsLimitation = {};
        this.missPlacedChars = [];
        this.won = false;
        this.endEvent = endEvent;
        this.withMessage = withMessage;
        this.wordScoreRegex = {};
    }

    init (endEvent = null, withMessage = true) {
        this.reset(endEvent, withMessage);
        this.__init();
        this.__updateInfos();
        this.__play();
    }

    __getRefTable () {
        return document.getElementById(this.tableId);
    }

    __getRefTableGameHelper () {
        return document.getElementById(this.tableIdGameHelper);
    }

    __displayMessage (answer) {
        if (!this.withMessage) {
            return false;
        }
        const span = document.createElement("span");
        span.className = answer.status;
        span.innerText = answer.message;
        document.getElementById(this.messengerId).innerHTML = span.outerHTML;
        return false;
    }

    __init (nbChars = null) {
        const refTable = this.__getRefTable();
        if (!nbChars && refTable.rows.length > 0) {
            const row = refTable.rows[0];
            if (row.cells.length > 0) {
                nbChars = row.cells.length;
            }
        }
        if (nbChars > 0) {
            this.nbChars = nbChars;
            for (let cellIndex = 0; cellIndex < nbChars; cellIndex++) {
                this.missPlacedChars.push([]);
            }
        }
    }

    __updateInfos () {
        let currentChars = [];
        this.containedChars = [];
        this.containedCharsLimitation = {};
        this.wrongsChars = [];
        let won = true;
        const refTable = this.__getRefTable();
        for (let rowIndex = 0; rowIndex < refTable.rows.length; rowIndex++) {
            const row = refTable.rows[rowIndex];
            if (row.cells.length > 0 && row.cells[0].innerText !== "") {
                let rowContainedChars = [];
                won = true;
                for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
                    const cell = row.cells[cellIndex];
                    const cellValue = cell.innerText;
                    const currentChar = (cellIndex === 0 || cell.className === 'bien-place') ? cellValue : null;
                    if (!currentChars[cellIndex] || currentChar) {
                        currentChars[cellIndex] = currentChar;
                    }
                    if (cell.className !== 'bien-place') {
                        won = false;
                    } else if (cellIndex !== 0 && this.containedChars.includes(cellValue)) {
                        const idx = this.containedChars.findIndex(char => char === cellValue);
                        this.containedChars.splice(idx, 1);
                        if(this.containedCharsLimitation[cellValue]){
                            this.containedCharsLimitation[cellValue]--;
                        }
                        if(this.containedCharsLimitation[cellValue] <= 0){
                            delete this.containedCharsLimitation[cellValue];
                        }
                    }
                    if (cell.className === 'mal-place') {
                        this.missPlacedChars[cellIndex].push(cellValue);
                        rowContainedChars.push(cellValue);
                        this.missPlacedChars[cellIndex] = [...new Set(this.missPlacedChars[cellIndex])];
                    }
                    if (cell.className === 'non-trouve') {
                        if (!this.containedChars.includes(cellValue) && !rowContainedChars.includes(cellValue)) {
                            this.wrongsChars.push(cellValue);
                        } else {
                            this.containedCharsLimitation[cellValue] = rowContainedChars.filter(char => char === cellValue).length;
                            this.missPlacedChars[cellIndex].push(cellValue);
                            this.missPlacedChars[cellIndex] = [...new Set(this.missPlacedChars[cellIndex])];
                        }
                    }
                }
                this.containedChars = rowContainedChars;
            }
        }
        this.currentChars = currentChars;
        this.won = won;
        this.wrongsChars = [...new Set(this.wrongsChars)];
        this.__filterWords();
    }

    __getRegexListChars (missPlacedChars) {
        const allChars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        const wrongsChars = this.wrongsChars;
        if (this.wrongsChars.length === 0 && missPlacedChars.length === 0) {
            return '.';
        }
        const newList = allChars.filter(char => !missPlacedChars.includes(char) && !wrongsChars.includes(char));
        return '[' + newList.join('') + ']';
    }

    __getRegex () {
        let regexString = '';
        for (let charIndex = 0; charIndex < this.currentChars.length; charIndex++) {
            const currentChar = this.currentChars[charIndex];
            const missPlacedChars = this.missPlacedChars[charIndex];
            if (currentChar) {
                regexString += currentChar;
            } else {
                regexString += this.__getRegexListChars(missPlacedChars);
            }
        }
        return `^${regexString}\\b`;
    }

    __filterWords () {
        const regexString = this.__getRegex();
        const regex = new RegExp(regexString, 'g');
        const nbChars = this.nbChars;
        const newFilteredWords = this.filteredWords.filter(str => str.length === nbChars && str.match(regex));
        this.filteredWords = newFilteredWords;
        //console.log(`Attempt n°${this.attempts+1} | ${newFilteredWords.length} possibilities | regex -> ${regexString} |`, newFilteredWords, this.wrongsChars, this.containedChars);
    }

    __guessWord () {
        return this.filteredWords[0];
    }

    __updateInfosFromGameHelper () {
        let currentChars = [];
        let won = true;
        this.containedChars = [];
        this.wrongsChars = [];
        this.containedCharsLimitation = {};
        this.attempts = 0;
        const refTable = this.__getRefTableGameHelper();
        for (let rowIndex = 0; rowIndex < refTable.rows.length; rowIndex++) {
            const row = refTable.rows[rowIndex];
            if (row.cells.length > 0 && (rowIndex === 0 || row.cells[0].innerText !== "")) {
                let rowContainedChars = [];
                currentChars = [];
                won = true;
                this.attempts++;
                for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
                    const cell = row.cells[cellIndex];
                    let cellValue = (rowIndex === 0 && cellIndex === 0) ? document.getElementById('ghi-0-0').value.trim().toUpperCase() : cell.innerText.trim().toUpperCase();
                    if(cellValue === '.'){
                        cellValue = null;
                    }
                    const currentChar = (cellIndex === 0 || cell.className === 'bien-place') ? cellValue : null;
                    if (!currentChars[cellIndex] || currentChar) {
                        currentChars[cellIndex] = currentChar;
                    }
                    if (cell.className !== 'bien-place') {
                        won = false;
                    } else if (cellIndex !== 0 && this.containedChars.includes(cellValue)) {
                        const idx = this.containedChars.findIndex(char => char === cellValue);
                        this.containedChars.splice(idx, 1);
                        if(this.containedCharsLimitation[cellValue]){
                            this.containedCharsLimitation[cellValue]--;
                        }
                        if(this.containedCharsLimitation[cellValue] <= 0){
                            delete this.containedCharsLimitation[cellValue];
                        }
                    }
                    if (cell.className === 'mal-place') {
                        this.missPlacedChars[cellIndex].push(cellValue);
                        rowContainedChars.push(cellValue);
                        this.missPlacedChars[cellIndex] = [...new Set(this.missPlacedChars[cellIndex])];
                    }
                    if (cell.className !== 'bien-place' && cell.className !== 'mal-place') {
                        if (!this.containedChars.includes(cellValue) && !rowContainedChars.includes(cellValue)) {
                            if(cellValue !== '.'){
                                this.wrongsChars.push(cellValue);
                            }
                        } else {
                            this.containedCharsLimitation[cellValue] = rowContainedChars.filter(char => char === cellValue).length;
                            this.missPlacedChars[cellIndex].push(cellValue);
                            this.missPlacedChars[cellIndex] = [...new Set(this.missPlacedChars[cellIndex])];
                        }
                    }
                }
                this.containedChars = rowContainedChars;
            }
        }
        this.currentChars = currentChars;
        this.won = won;
        this.wrongsChars = [...new Set(this.wrongsChars)];
        this.__filterWords();
    }


    __play () {
        this.attempts++;
        const word = this.__guessWord();
        //console.log(`Play.Attempt n°${this.attempts} | ${word} | ${this.filteredWords.length} possibilities |`, this.filteredWords);
        //console.log('----------------');
        document.getElementById(this.answerInputId).value = word;
        document.getElementById(this.answerButtonId).click();
        setTimeout(() => {
            this.__updateInfos();
            if (this.won) {
                this.__displayMessage({
                    status: 'success',
                    message: `Bot ${this.version} won in ${this.attempts} attempts!`
                });
                if (this.endEvent) {
                    this.endEvent({
                        status: 'won',
                        attempts: this.attempts
                    })
                }
            } else if (this.attempts < this.maxAttempts) {
                this.__play();
            } else {
                if (this.endEvent) {
                    this.endEvent({
                        status: 'lost',
                        attempts: this.attempts
                    })
                }
            }
        }, this.playTimeout);
    }

    __manualfilterAllWords (nbChars, knownWord, wrongsChars = [], missPlacedChars = []) {
        this.currentChars = [];
        if (knownWord.length < nbChars) {
            const knownWordLoop = (nbChars - knownWord.length);
            for (let i = 0; i < knownWordLoop; i++) {
                knownWord += '.';
            }
        }
        if (missPlacedChars.length < nbChars) {
            const missPlacedCharsLoop = (nbChars - missPlacedChars.length);
            for (let i = 0; i < missPlacedCharsLoop; i++) {
                missPlacedChars.push([]);
            }
        }
        this.containedChars = [];
        for (const missPlacedCharsForChar of missPlacedChars) {
            for (const missChar of missPlacedCharsForChar) {
                this.containedChars.push(missChar);
            }
        }
        this.nbChars = parseInt(nbChars);
        this.missPlacedChars = missPlacedChars;
        this.wrongsChars = wrongsChars;
        const wordChars = knownWord.split('');
        for (const char of wordChars) {
            const currentCharValue = (char !== '.') ? char : null;
            this.currentChars.push(currentCharValue);
        }
        this.wrongsChars = [...new Set(this.wrongsChars)];
        this.__filterWords();
        return this.filteredWords;
    }
}

