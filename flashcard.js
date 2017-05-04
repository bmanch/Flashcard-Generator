var BasicCard = require("./BasicCard.js");
var ClozeCard = require("./ClozeCard.js");
var inquirer = require("inquirer");
var fs = require("fs");
//The following three arrays are sort of placeholders.
var basicFlashcards = [];
var clozeFlashcards = [];
var allFlashcards = [];
//This array will be used to study all the flashcards.
var parsedAllFlashcards = [];
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
var questionThree = new BasicCard("Who was the eighth President of the United Sates of America?", "Martin Van Buren");
var questionFour = new BasicCard("Who was the first unanimous NBA MVP?", "Stephen Curry");

basicFlashcards.push(questionThree, questionFour);
clozeFlashcards.push(questionOne, questionTwo);

for (var i = 0; i < basicFlashcards.length; i++) {
		allFlashcards.push(JSON.stringify(basicFlashcards[i]));
	}

for (var i = 0; i < clozeFlashcards.length; i++) {
	//It might seem odd that I'm transforming my cloze cards into basic cards, but this will help with running the study application.
	var simplifiedClozeObject = new BasicCard(clozeFlashcards[i].partial, clozeFlashcards[i].cloze);
	allFlashcards.push(JSON.stringify(simplifiedClozeObject));
}

//I'm resetting these arrays back to empty arrays so that if the user wants to study just her/his basic or cloze cards, she/he won't have to use my dummy cards.
basicFlashcards = [];
clozeFlashcards = [];

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
	if (basicFlashcards.length > 0) {
		for (var i = 0; i < basicFlashcards.length; i++) {
			allFlashcards.push(JSON.stringify(basicFlashcards[i]));
		}
	}

	if (clozeFlashcards.length > 0) {
		for (var i = 0; i < clozeFlashcards.length; i++) {
			var simplifiedClozeObject = new BasicCard(clozeFlashcards[i].partial, clozeFlashcards[i].cloze);
			allFlashcards.push(JSON.stringify(simplifiedClozeObject));
		}
	}

	fs.writeFile("your_questions.json", "[" + allFlashcards + "]", function(err) {
		if (err) console.log(err);
	});

	fs.readFile("your_questions.json", "utf8", function(err, data) {
		if (err) {
			console.log(err);
		} else {
			parsedAllFlashcards = JSON.parse(data);
		}
	});

	inquirer.prompt([
		{
			type: "list",
			message: "What flashcards to you want to study?",
			//I decided to give the user a few options. Maybe she/he would like to test out their recently created cards before studying all their cards.
			choices: ["All my flashcards!", "Your new basic flashcards.", "Your new cloze flashcards."],
			name: "cardChoice"
		}
	]).then(function(user) {
		if (user.cardChoice === "Your new basic flashcards.") {
			questionCount = basicFlashcards.length;
			usedNumbers = [];
			correct = 0;
			incorrect = 0;
			basicStudy();
		} else if (user.cardChoice === "Your new cloze flashcards.") {
			questionCount = clozeFlashcards.length;
			usedNumbers = [];
			correct = 0;
			incorrect = 0;
			clozeStudy();
		} else {
			questionCount = parsedAllFlashcards.length;
			usedNumbers = [];
			correct = 0;
			incorrect = 0;
			allStudy();
		}
	});
}

function allStudy() {
	if (questionCount !== 0) {
		ranNum = Math.floor(Math.random() * parsedAllFlashcards.length);

		if (usedNumbers.indexOf(ranNum) !== -1) {
			allStudy();
		} else {
			usedNumbers.push(ranNum);
			inquirer.prompt([
				{
					type: "input",
					message: parsedAllFlashcards[ranNum].front,
					name: "answer"
				}
			]).then(function(user) {
				if (user.answer === parsedAllFlashcards[ranNum].back || user.answer === parsedAllFlashcards[ranNum].back.toLowerCase()) {
					console.log("Correct!");
					correct++;
					questionCount--;
					allStudy();
				} else {
					console.log("Incorrect! The correct answer is: " + parsedAllFlashcards[ranNum].back);
					incorrect++;
					questionCount--;
					allStudy();
				}
			});
		}

	} else {
		inquirer.prompt([
			{
				type: "list",
				message: "You've gone through all your basic flashcards. You got " + correct + " correct and " + incorrect + " incorrect answer(s). What would you like to do next?",
				choices: ["Study your new basic flashcards", "Study your new cloze flashcards", "Make more flashcards", "Stop studying"],
				name: "userChoice"
			}
		]).then(function(user) {
			if (user.userChoice === "Study your new basic flashcards") {
				questionCount = basicFlashcards.length;
				usedNumbers = [];
				correct = 0;
				incorrect = 0;
				basicStudy();
			} else if (user.userChoice === "Study your new cloze flashcards") {
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

function basicStudy() {
	if (!basicFlashcards.length) {
		console.log("You haven't created any new basic cards, or you've already studied your new basic cards. Try making more then studying them.");
		setTimeout(getUserInput, 2000);
	} else {

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
					if (user.answer === basicFlashcards[ranNum].back || user.answer === basicFlashcards[ranNum].back.toLowerCase()) {
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
					choices: ["Study your new cloze flashcards", "Study all your flashcards", "Make more flashcards", "Stop studying"],
					name: "userChoice"
				}
			]).then(function(user) {
				basicFlashcards = [];
				if (user.userChoice === "Study your new cloze flashcards") {
					questionCount = clozeFlashcards.length;
					usedNumbers = [];
					correct = 0;
					incorrect = 0;
					clozeStudy();
				} else if (user.userChoice === "Study all your flashcards") {
					questionCount = parsedAllFlashcards.length;
					usedNumbers = [];
					correct = 0;
					incorrect = 0;
					allStudy();
				} else if (user.userChoice === "Make more flashcards") {
					getUserInput();
				} else {
					console.log("Thanks for studying!");
				}
			});
		}
	}
}

function clozeStudy() {
	if (!clozeFlashcards.length) {
		console.log("You haven't created any new cloze cards, or you've already studied your new cloze cards. Try making more then studying them.");
		setTimeout(getUserInput, 2000);
	} else {

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
					if (user.answer === clozeFlashcards[ranNum].cloze || user.answer === clozeFlashcards[ranNum].cloze.toLowerCase()) {
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
			clozeFlashcards = [];
			inquirer.prompt([
				{
					type: "list",
					message: "You've gone through all your basic flashcards. You got " + correct + " correct and " + incorrect + " incorrect answer(s). What would you like to do next?",
					choices: ["Study your new basic flashcards", "Study all your flashcards", "Make more flashcards", "Stop studying"],
					name: "userChoice"
				}
			]).then(function(user) {
				if (user.userChoice === "Study your new basic flashcards") {
					questionCount = basicFlashcards.length;
					usedNumbers = [];
					correct = 0;
					incorrect = 0;
					basicStudy();
				} else if (user.userChoice === "Study all your flashcards") {
					questionCount = parsedAllFlashcards.length;
					usedNumbers = [];
					correct = 0;
					incorrect = 0;
					allStudy();
				} else if (user.userChoice === "Make more flashcards") {
					getUserInput();
				} else {
					console.log("Thanks for studying!");
				}
			});
		}
	}
}

getUserInput();