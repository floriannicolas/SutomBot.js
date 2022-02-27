/**
 * Very naive bot. 
 * Filter by good and bad characters using regex
 * Do not really take advantage of miss placed characters.
 * take first word of the list
 */
class SutomBotV1 extends SutomBot {
    constructor (allWords) {
        super(allWords);
    }

    __updateInfos () {
        let currentChars = [];
        let won = true;
        const refTable = this.__getRefTable();
        for (let rowIndex = 0; rowIndex < refTable.rows.length; rowIndex++) {
            const row = refTable.rows[rowIndex];
            if (row.cells.length > 0 && row.cells[0].innerText !== "") {
                currentChars = [];
                won = true;
                for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
                    const cell = row.cells[cellIndex];
                    const cellValue = cell.innerText;
                    const currentChar = (cellIndex === 0 || cell.className === 'bien-place') ? cellValue : null;
                    currentChars.push(currentChar);
                    if (cell.className !== 'bien-place') {
                        won = false;
                    }
                    if (cell.className === 'mal-place') {
                        this.missPlacedChars[cellIndex].push(cellValue);
                        this.containedChars.push(cellValue);
                        this.missPlacedChars[cellIndex] = [...new Set(this.missPlacedChars[cellIndex])];
                    }
                    if (cell.className === 'non-trouve' && !this.containedChars.includes(cellValue)) {
                        this.wrongsChars.push(cellValue);
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
}

