/**
 * Ameliorated bot. 
 * Filter by good and bad characters using regex
 * Take advantage of miss placed characters.
 * Take advantage of known max number specific chars.
 * Select best word using score
 * Score represent:
 * - word sharing the most letters with other possible words
 * - word sharing the most letters in miss placed characters
 * - On first attempt, word having the most vowels. 
 */
class SutomBotV4 extends SutomBotV3 {
    constructor (allWords) {
        super(allWords)
        this.version = SutomManager.BOT_VERSION.V4;
        this.prioritaryChars = null;
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
        for (const [limitedChar, limitation] of Object.entries(this.containedCharsLimitation)) {
            if(possibleChars.filter(char => char === limitedChar).length !== limitation){
                return false;
            }
        }
        return this.containedChars.length === 0 || this.containedChars.every(r => possibleChars.includes(r));
    }
}

