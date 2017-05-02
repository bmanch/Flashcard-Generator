var BasicCard = require("./BasicCard.js");
var ClozeCard = require("./ClozeCard.js");
var inquirer = require("inquirer");
var fs = require("fs");
var basicFlashcards = [];
var clozeFlashcards = [];
var allFlashcards = [];
var ranNum = 0;
var usedNumbers = [];
var questionCount = 0;
var correct = 0;
var incorrect = 0;

ClozeCard.prototype.checkCloze = function() {
	if (this.fullText.indexOf(this.cloze) === -1) {
		console.log("Sorry, but your cloze text -- '" + this.cloze + "' -- does not exactly match any portion of your question. Double check for spacing. Also note that the cloze text is case sensitive. You can trying making it again.");
		setTimeout(getUserInput, 2000);
	} else {
		console.log("\nFlashcard is made! Here's what it looks like: \n   Full Text: " + this.fullText + "\n   Cloze Portion: " + this.cloze + "\n   Partial Text for the Flashcard: " + this.partial + "\n");
		clozeFlashcards.push(this);
		setTimeout(getUserInput, 2000);
	}
}

//I made these flashcards in case the user doesn't make any but wants to study.
var questionOne = new ClozeCard("Abraham Lincoln wrote the Emancipation Proclamation.", "Abraham Lincoln");
var questionTwo = new ClozeCard("Facebook owes its existence to Myspace.", "Myspace");
var questionThree = new BasicCard("Who was the eight President of the United Sates of America?", "Martin Van Buren");
var questionFour = new BasicCard("Who was the first unanimous NBA MVP?", "Stephen Curry");

clozeFlashcards.push(questionOne, questionTwo);
basicFlashcards.push(questionThree, questionFour);

function getUserInput() {
	inquirer.prompt([
		{
			type: "list",
			message: "What would you like to do?",
			choices: ["Make a basic flashcard", "Make a cloze flashcard", "Study the flashcards"],
			name: "userChoice"
		}
	]).then(function(user) {
		if (user.userChoice === "Make a basic flashcard") {
			makeBasicCard();
		} else if (user.userChoice === "Make a cloze flashcard") {
			makeClozeCard();
		} else {
			study();
		}
	});
}

function makeBasicCard() {
	inquirer.prompt([
		{
			type: "input",
			message: "What do you want on the front of the card (the question)?",
			name: "question"
		},
		{
			type: "input",
			message: "What do you want on the back of the card (the answer)?",
			name: "answer"
		}
	]).then(function(user) {
		var newCard = new BasicCard(user.question, user.answer);
		basicFlashcards.push(newCard);
		console.log("\nFlashcard is made! Here's what it looks like: \n   Front Text: " + user.question + "\n   Back Text: " + user.answer + "\n");
		setTimeout(getUserInput, 2000);
	});
} 

function makeClozeCard() {
	inquirer.prompt([
		{
			type: "input",
			message: "What do you want on the full statement/question to be?",
			name: "question"
		},
		{
			type: "input",
			message: "What do you want on the cloze text to be?",
			name: "answer"
		}
	]).then(function(user) {
		var newCard = new ClozeCard(user.question, user.answer);
		newCard.checkCloze();
	});
}

function study() {
	for (var i = 0; i < basicFlashcards.length; i++) {
		fs.appendFile("your_flashcards.json", JSON.stringify(basicFlashcards[i]), function(err) {
			if (err) console.log(err);
		});
	}

	//This is just so the user can have a record of their basic flashcards. The file -- "your_questions.txt" -- will be created in their folder where this application runs.
	// for (var i = 0; i < basicFlashcards.length; i++) {
	// 	fs.appendFile("your_questions.txt", "Front: " + basicFlashcards[i].front + "\nBack: " + basicFlashcards[i].back + "\n\n", function(err) {
	// 		if (err) console.log(err);
	// 	});
	// }
	// //ditto, but with cloze flashcards.
	// for (var i = 0; i < clozeFlashcards.length; i++) {
	// 	fs.appendFile("your_questions.txt", "Front: " + clozeFlashcards[i].partial + "\nBack: " + clozeFlashcards[i].cloze + "\n\n", function(err) {
	// 		if (err) console.log(err);
	// 	});
	// }

	//I didn't yet devise a way to study all the flashcards at once; thus, I give the user the option to study the basic flashcards or the cloze flashcards.
	//Ideally, I would figure out a way to enable the user to study both at once. I ran into difficulties accomplishing that, though, because their constructors are different, and, thus, so too are their key names.
	//I think it would be nice to figure out a way to store them as objects in a file and then read the file and produce the flashcards from it. That way the user could 'save' their flashcards to the app. Something for the future...
	inquirer.prompt([
		{
			type: "list",
			message: "What flashcards to you want to study?",
			choices: ["Basic Flashcards", "Cloze Flashcards"],
			name: "cardChoice"
		}
	]).then(function(user) {
		if (user.cardChoice === "Basic Flashcards") {
			questionCount = basicFlashcards.length;
			usedNumbers = [];
			correct = 0;
			incorrect = 0;
			basicStudy();
		} else {
			questionCount = clozeFlashcards.length;
			usedNumbers = [];
			correct = 0;
			incorrect = 0;
			clozeStudy();
		}
	});
}

function basicStudy() {
	if (questionCount !== 0) {
		ranNum = Math.floor(Math.random() * basicFlashcards.length);

		if (usedNumbers.indexOf(ranNum) !== -1) {
			basicStudy();
		} else {
			usedNumbers.push(ranNum);
			inquirer.prompt([
				{
					type: "input",
					message: basicFlashcards[ranNum].front,
					name: "answer"
				}
			]).then(function(user) {
				if (user.answer === basicFlashcards[ranNum].back) {
					console.log("Correct!");
					correct++;
					questionCount--;
					basicStudy();
				} else {
					console.log("Incorrect! The correct answer is: " + basicFlashcards[ranNum].back);
					incorrect++;
					questionCount--;
					basicStudy();
				}
			});
		}

	} else {
		inquirer.prompt([
			{
				type: "list",
				message: "You've gone through all your basic flashcards. You got " + correct + " correct and " + incorrect + " incorrect answer(s). What would you like to do next?",
				choices: ["Study the cloze flashcards", "Make more flashcards", "Stop studying"],
				name: "userChoice"
			}
		]).then(function(user) {
			if (user.userChoice === "Study the cloze flashcards") {
				questionCount = clozeFlashcards.length;
				usedNumbers = [];
				correct = 0;
				incorrect = 0;
				clozeStudy();
			} else if (user.userChoice === "Make more flashcards") {
				getUserInput();
			} else {
				console.log("Thanks for studying!");
			}
		});
	}
}

function clozeStudy() {
	if (questionCount !== 0) {
		ranNum = Math.floor(Math.random() * clozeFlashcards.length);

		if (usedNumbers.indexOf(ranNum) !== -1) {
			clozeStudy();
		} else {
			usedNumbers.push(ranNum);
			inquirer.prompt([
				{
					type: "input",
					message: clozeFlashcards[ranNum].partial,
					name: "answer"
				}
			]).then(function(user) {
				if (user.answer === clozeFlashcards[ranNum].cloze) {
					console.log("Correct!");
					correct++;
					questionCount--;
					clozeStudy();
				} else {
					console.log("Incorrect! The correct answer is: " + clozeFlashcards[ranNum].cloze);
					incorrect++;
					questionCount--;
					clozeStudy();
				}
			});
		}

	} else {
		inquirer.prompt([
			{
				type: "list",
				message: "You've gone through all your basic flashcards. You got " + correct + " correct and " + incorrect + " incorrect answer(s). What would you like to do next?",
				choices: ["Study the basic flashcards", "Make more flashcards", "Stop studying"],
				name: "userChoice"
			}
		]).then(function(user) {
			if (user.userChoice === "Study the basic flashcards") {
				questionCount = basicFlashcards.length;
				usedNumbers = [];
				correct = 0;
				incorrect = 0;
				basicStudy();
			} else if (user.userChoice === "Make more flashcards") {
				getUserInput();
			} else {
				console.log("Thanks for studying!");
			}
		});
	}
}

getUserInput();