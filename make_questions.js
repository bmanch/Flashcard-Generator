var ClozeCard = require("./ClozeCard.js");

ClozeCard.prototype.checkCloze = function() {
	if (this.fullText.indexOf(this.cloze) === -1) {
		console.log("Sorry, but your cloze text -- '" + this.cloze + "' -- does not exactly match any portion of your question. Double check for spacing. Also note that the cloze text is case sensitive.");
	} else {
		console.log("\nFlashcard is made! Here's what it looks like: \n   Full Text: " + this.fullText + "\n   Cloze Portion: " + this.cloze + "\n   Partial Text for the Flashcard: " + this.partial + "\n");
	}
}

var question = new ClozeCard("Abraham Lincoln wrote the Emancipation Proclamation.", "Abraham Lincoln");

question.checkCloze();