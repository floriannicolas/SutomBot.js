/**
 * Ameliorated bot. 
 * Filter by good and bad characters using regex
 * Take advantage of miss placed characters.
 * Select best word using score
 * Score represent:
 * - word sharing the most letters with other possible words
 * - word sharing the most letters in miss placed characters
 * - On first attempt, word having the most vowels. 
 */
class SutomBotV3 extends SutomBotV2 {
    constructor (allWords) {
        super(allWords);
        this.version = SutomManager.BOT_VERSION.V3;
    }

    __getScore (word) {
        let score = 0;
        const wordChars = word.split('');
        const removedVowels = [];
        for (let charIndex = 0; charIndex < wordChars.length; charIndex++) {
            if (!this.currentChars[charIndex]) {
                let regex = this.__getScoreRegex(wordChars[charIndex], charIndex);
                const addedScore = (this.wordScoreRegex[regex]) ? this.wordScoreRegex[regex] : this.___addedScoreByRegex(regex);
                this.wordScoreRegex[regex] = addedScore;
                score += addedScore;
            }
            if (this.attempts === 1 && ['A', 'E', 'I', 'O', 'U', 'Y'].includes(wordChars[charIndex]) && !removedVowels.includes(wordChars[charIndex])) {
                score += 500;
                removedVowels.push(wordChars[charIndex]);
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
}

