/**
 * Ameliorated bot. 
 * Filter by good and bad characters using regex
 * Take advantage of miss placed characters.
 * Select best word using score
 * Score represent:
 * - word sharing the most letters with other possible words
 * - word sharing the most letters in miss placed characters 
 */
class SutomBotV2 extends SutomBot {
    constructor (allWords) {
        super(allWords);
        this.version = SutomManager.BOT_VERSION.V2;
    }

    __updateInfos () {
        let currentChars = [];
        let won = true;
        const refTable = this.__getRefTable();
        for (let rowIndex = 0; rowIndex < refTable.rows.length; rowIndex++) {
            const row = refTable.rows[rowIndex];
            if (row.cells.length > 0 && row.cells[0].innerText !== "") {
                won = true;
                for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
                    const cell = row.cells[cellIndex];
                    const cellValue = cell.innerText;
                    const currentChar = (cellIndex === 0 || cell.className === 'bien-place') ? cellValue : null;
                    if(!currentChars[cellIndex] || currentChar){
                        currentChars[cellIndex] = currentChar;
                    }
                    if (cell.className !== 'bien-place') {
                        won = false;
                    } else if (cellIndex !== 0) {
                        this.containedChars = this.containedChars.filter(e => e !== cellValue);
                    }
                    if (cell.className === 'mal-place') {
                        this.missPlacedChars[cellIndex].push(cellValue);
                        this.containedChars.push(cellValue);
                        this.missPlacedChars[cellIndex] = [...new Set(this.missPlacedChars[cellIndex])];
                    }
                    if (cell.className === 'non-trouve') {
                        if(!this.containedChars.includes(cellValue)) {
                            this.wrongsChars.push(cellValue);
                        } else {
                            this.missPlacedChars[cellIndex].push(cellValue);
                            this.missPlacedChars[cellIndex] = [...new Set(this.missPlacedChars[cellIndex])];
                        }
                    }
                }
            }
        }
        this.currentChars = currentChars;
        this.won = won;
        this.wrongsChars = [...new Set(this.wrongsChars)];
        this.containedChars = [...new Set(this.containedChars)];
        this.__filterWords();
    }

    ___isPossibleWord (word) {
        const wordChars = word.split('');
        let possibleChars = [];
        for (let charIndex = 0; charIndex < this.currentChars.length; charIndex++) {
            const currentChar = this.currentChars[charIndex];
            const char = wordChars[charIndex];
            if (!currentChar) {
                possibleChars.push(char);
            }
        }
        return this.containedChars.length === 0 || possibleChars.some(r => this.containedChars.includes(r));
    }

    __filterWords () {
        const regexString = this.__getRegex();
        const regex = new RegExp(regexString, 'g');
        const nbChars = this.nbChars;
        const newFilteredWords = this.filteredWords.filter(str => str.length === nbChars && str.match(regex) && this.___isPossibleWord(str));
        this.filteredWords = newFilteredWords;
        //console.log(`Attempt n°${this.attempts} | ${newFilteredWords.length} possibilities | regex -> ${regexString} |`, newFilteredWords);
    }

    __getScoreRegex (char, index) {
        let regexString = '';
        for (let charIndex = 0; charIndex < this.currentChars.length; charIndex++) {
            if (charIndex === index) {
                regexString += char;
            } else {
                regexString += '.';
            }
        }
        return `^${regexString}\\b`;
    }

    ___addedScoreByRegex (regex) {
        return this.filteredWords.filter(str => str.match(regex)).length;
    }

    __getScore (word) {
        let score = 0;
        const wordChars = word.split('');
        for (let charIndex = 0; charIndex < wordChars.length; charIndex++) {
            if (!this.currentChars[charIndex]) {
                let regex = this.__getScoreRegex(wordChars[charIndex], charIndex);
                const addedScore = (this.wordScoreRegex[regex]) ? this.wordScoreRegex[regex] : this.___addedScoreByRegex(regex);
                this.wordScoreRegex[regex] = addedScore;
                score += addedScore;
            }
        }
        let possibleChars = [];
        for (let charIndex = 0; charIndex < this.currentChars.length; charIndex++) {
            const currentChar = this.currentChars[charIndex];
            const char = wordChars[charIndex];
            if (!currentChar) {
                possibleChars.push(char);
            }
        }
        for (const char of possibleChars) {
            if (this.containedChars.includes(char)) {
                score += 1000;
            }
        }
        return score;
    }

    __guessWord () {
        let word = this.filteredWords[0];
        let bestScore = 0;
        this.wordScoreRegex = {};
        for (const aWord of this.filteredWords) {
            const score = this.__getScore(aWord);
            if (score > bestScore) {
                bestScore = score;
                word = aWord;
            }
            //console.log('word', word, score);
        }
        //console.log('-------------------');
        //console.log('this.wordScoreRegex', this.wordScoreRegex, this.filteredWords);
        this.wordScoreRegex = {};
        return word;
    }
}

