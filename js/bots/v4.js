/**
 * Fucking DUMB bot. 
 * Filter by good and bad characters using regex
 * Take advantage of miss placed characters.
 * Select best word using score
 * Score represent:
 * - word sharing the most letters with other possible words
 * - word sharing the most letters in miss placed characters
 * - On first attempt, word having the most vowels. 
 * - On second attempt, try something really stupid.
 */
const getRegexDiff = (s1, s2) => {
    let str = '';
    let nbUnknown = 0;
    const sa1 = s1.split('');
    const sa2 = s2.split('');
    for (let charIndex = 0; charIndex < sa1.length; charIndex++) {
        if (sa1[charIndex] === sa2[charIndex]) {
            str += sa1[charIndex];
        } else {
            str += '.';
            nbUnknown++;
        }
    }
    if (nbUnknown === 1) {
        return str;
    }
    return null;
};

const getBestRegex = (prioritaryRegexs) => {
    const sort = {};
    for (const regex of prioritaryRegexs) {
        if (!sort[regex]) {
            sort[regex] = 1;
        } else {
            sort[regex]++;
        }
    }
    let result = null;
    let bestValue = 0;
    for (const [key, value] of Object.entries(sort)) {
        if (value > bestValue) {
            result = key;
            bestValue = value;
        }
    }
    return result;
};

const getPrioritaryChars = (words, regex) => {
    if(!regex) {
        return null;
    }
    const regexChars = regex.split('');
    let targetIndex = 1;
    for (let index = 0; index < regexChars.length; index++) {
        if (regexChars[index] === '.') {
            targetIndex = index;
        }
    }
    const ret = [];
    for (const word of words) {
        const wordChars = word.split('');
        ret.push(wordChars[targetIndex]);
    }
    return ret;
}

class SutomBotV4 extends SutomBotV3 {
    constructor (allWords) {
        super(allWords)
        this.version = SutomManager.BOT_VERSION.V4;
        this.prioritaryChars = null;
    }

    __updateInfos () {
        super.__updateInfos();
        if (!this.prioritaryChars && this.attempts == 1 && this.filteredWords.length > 5) {
            let prioritaryRegexs = [];
            for (const word of this.filteredWords) {
                for (const otherWord of this.filteredWords) {
                    if (word !== otherWord) {
                        const regex = getRegexDiff(word, otherWord);
                        if (regex) {
                            prioritaryRegexs.push(regex);
                        }
                    }
                }
            }
            const bestRegex = getBestRegex(prioritaryRegexs);
            const prioritaryWords = this.filteredWords.filter(str => str.match(new RegExp(`^${bestRegex}\\b`, 'g')));
            this.prioritaryChars = getPrioritaryChars(prioritaryWords, bestRegex);
            //console.log('this.prioritaryChars', this.prioritaryChars);
        }
    }

    __getScore (word) {
        let score = 0;
        const wordChars = word.split('');
        const prioritaryChars = Object.assign([], this.prioritaryChars);
        let removedChars = [];
        for (let charIndex = 0; charIndex < wordChars.length; charIndex++) {
            if (!this.currentChars[charIndex]) {
                let regex = this.__getScoreRegex(wordChars[charIndex], charIndex);
                const addedScore = (this.wordScoreRegex[regex]) ? this.wordScoreRegex[regex] : this.___addedScoreByRegex(regex);
                this.wordScoreRegex[regex] = addedScore;
                score += addedScore;
            }
            if (this.attempts === 1 && ['A', 'E', 'I', 'O', 'U', 'Y'].includes(wordChars[charIndex])) {
                score += 500;
            }
            if (this.attempts === 2 && this.prioritaryChars && this.prioritaryChars.includes(wordChars[charIndex])) {
                score += (removedChars.includes(wordChars[charIndex])) ? -500 : 500;
                removedChars.push(wordChars[charIndex]);
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

    __getInitialRegex() {
        let regex = '';
        for (let charIndex = 0; charIndex < this.nbChars; charIndex++){
            if(charIndex === 0){
                regex += this.currentChars[charIndex];
            }else{
                regex += '.';
            }
        }
        return regex;
    }

    __guessWord () {
        let word = this.filteredWords[0];
        let bestScore = 0;
        this.wordScoreRegex = {};
        const initialRegex = this.__getInitialRegex();
        const targetList = (this.prioritaryChars) ? this.initialAllWords.filter(str => str.match(new RegExp(`^${initialRegex}\\b`, 'g'))) : this.filteredWords;
        //console.log('targetList', targetList);
        for (const aWord of targetList) {
            const score = this.__getScore(aWord);
            if (score > bestScore) {
                bestScore = score;
                word = aWord;
            }
            //console.log('word', aWord, score);
        }
        this.prioritaryChars = null;
        //console.log('-------------------');
        //console.log('this.wordScoreRegex', this.wordScoreRegex, this.filteredWords);
        this.wordScoreRegex = {};
        return word;
    }
}

