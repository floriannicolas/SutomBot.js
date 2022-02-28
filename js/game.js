class SutomGame {
    constructor (allWords, customWord = null) {
        this.allWords = allWords;
        this.__pickAWord(customWord);
        this.tableId = 'game-table';
        this.answerInputId = 'answer-input';
        this.answerButtonId = 'answer-button';
        this.messengerId = 'messenger';
        this.attempts = [];
        this.maxAttempts = 6;
        this.won = false;
        this.withMessage = true;

        this.onAnswerClick = this.onAnswerClick.bind(this);
    }

    static ANSWER_STATUS = {
        PLAYING: 'playing',
        ERROR: 'error',
        SUCCESS: 'success'
    };

    reset(customWord = null, withMessage = true) {
        this.__pickAWord(customWord);
        this.attempts = [];
        this.won = false;
        this.withMessage = withMessage;
        const input = document.getElementById(this.answerInputId);
        input.setAttribute('maxlength', this.wordChars.length);
        input.setAttribute('size', this.wordChars.length);
        input.value = this.wordChars[0];
        this.drawGame();
    }

    init () {
        document.getElementById(this.answerButtonId).onclick = this.onAnswerClick;
        this.drawGame();
    }

    stop () {
        this.attempts = [];
        this.won = false;
        this.__clearTable();
    }

    __clearMessages() {
        document.getElementById(this.messengerId).innerHTML = '';
    }

    __displayMessage(answer) {
        if(answer.status === SutomGame.ANSWER_STATUS.PLAYING){
            document.getElementById(this.messengerId).innerHTML = '';
            document.getElementById(this.answerInputId).value = this.wordChars[0];
            return false;
        }
        if(!this.withMessage && answer.status === 'success'){
            return false;
        }
        const span = document.createElement("span");
        span.className = answer.status;
        span.innerText = answer.message;
        document.getElementById(this.messengerId).innerHTML = span.outerHTML;
        if(answer.status === SutomGame.ANSWER_STATUS.SUCCESS){
            document.getElementById(this.answerInputId).value = '';   
        }
        return false;
    }

    onAnswerClick () {
        if(this.attempts.length >= this.maxAttempts || this.won){
            return false;
        }
        const guess = document.getElementById(this.answerInputId).value;
        const answer = this.makeProposition(guess);
        this.drawGame();
        this.__displayMessage(answer);
    }

    __clearTable () {
        const refTable = this.__getRefTable();
        for(let i = refTable.rows.length; i > 0;i--) {
            refTable.deleteRow(i-1);
        }
    }

    drawGame () {
        this.__clearTable();
        const refTable = this.__getRefTable();
        const initialChars = this.__getInitialChars();
        const emptyChars = this.__getEmptyChars();
        for (let rowIndex = 0; rowIndex < this.maxAttempts; rowIndex++) {
            let chars = (rowIndex === 0) ? initialChars : emptyChars
            if (this.attempts[rowIndex]) {
                chars = this.attempts[rowIndex].chars;
            }
            const newLine = refTable.insertRow(rowIndex);
            for (let cellIndex = 0; cellIndex < chars.length; cellIndex++) {
                const newCell = newLine.insertCell(cellIndex);
                const char = chars[cellIndex];
                newCell.className = char.className;
                const text = document.createTextNode(char.char);
                newCell.appendChild(text);
            }
        }
    }

    __getWordCharsToCheck(guess) {
        const guessChars = guess.split('');
        let wordCharsToCheck = [];
        for(let charIndex = 0; charIndex < guessChars.length; charIndex++) {
            if (guessChars[charIndex] !== this.wordChars[charIndex]) {
                wordCharsToCheck.push(this.wordChars[charIndex]);
            }
        }
        return wordCharsToCheck;
    }

    makeProposition (guess) {
        guess = guess.trim().toUpperCase();
        if (this.word.length !== guess.length) {
            return {
                status: SutomGame.ANSWER_STATUS.ERROR,
                message: 'Incorrect word!'
            }
        }
        if (!this.allWords.includes(guess)) {
            return {
                status: SutomGame.ANSWER_STATUS.ERROR,
                message: 'Word not found in data!',
            }
        }
        const guessChars = guess.split('');
        if (this.wordChars[0] !== guessChars[0]) {
            return {
                status: SutomGame.ANSWER_STATUS.ERROR,
                message: `Word must begin by ${this.wordChars[0]}.`,
            }
        }
        const chars = [];
        const wordCharsToCheck = this.__getWordCharsToCheck(guess);
        for (let i = 0; i < guessChars.length; i++) {
            let className = 'non-trouve';
            if (guessChars[i] === this.wordChars[i]) {
                className = 'bien-place';
            } else if (wordCharsToCheck.includes(guessChars[i])) {
                className = 'mal-place';
                var idx = wordCharsToCheck.findIndex(char => char === guessChars[i]);
                wordCharsToCheck.splice(idx,1);  
            }
            chars.push({
                char: guessChars[i],
                className: className
            })
        }
        this.attempts.push({
            word: guess,
            chars: chars
        });

        if (this.word === guess) {
            this.won = true;
            return {
                status: SutomGame.ANSWER_STATUS.SUCCESS,
                message: `Word found in ${this.attempts.length} attemps!`,
            }
        }

        if(this.attempts.length >= this.maxAttempts){
            return {
                status: SutomGame.ANSWER_STATUS.ERROR,
                message: `You lost! Word was "${this.word}"`,
            }
        }
        return {
            status: SutomGame.ANSWER_STATUS.PLAYING
        }
    }

    __getRefTable(){
        return document.getElementById(this.tableId);
    }

    __getInitialChars () {
        const ret = [];
        for (let i = 0; i < this.wordChars.length; i++) {
            ret.push({
                char: ((i === 0) ? this.wordChars[i] : '.'),
                className: ''
            });
        }
        return ret;
    }

    __getEmptyChars () {
        const ret = [];
        for (let i = 0; i < this.wordChars.length; i++) {
            ret.push({
                char: '',
                className: ''
            });
        }
        return ret;
    }

    __pickAWord(customWord = null) {
        const word = (customWord) ? customWord : this.allWords[Math.floor(Math.random()*this.allWords.length)];
        this.word = word.trim().toUpperCase();
        this.wordChars = this.word.split('');
    }
}

