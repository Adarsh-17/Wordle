let guessedWords = [[]]; //to keep count of guessed words
let availableSpace = 1;  //for the current tile to be operated
let word; //the correct word aka solution of the game
let guessedWordCount = 0; //to keep count of attempts
let gamestate = 1; // to show gamestate


getNewWord();
addKeyboardClicks();
function getNewWord() {
  fetch(`https://wordsapiv1.p.rapidapi.com/words/?random=true&lettersMin=5&lettersMax=5`,
      {
          method: "GET",
          headers: {
              "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
              // my key : 8f64bab846mshf3f9be435e389f9p1e6211jsn3e1aa3a9fc67
              "x-rapidapi-key": "8f64bab846mshf3f9be435e389f9p1e6211jsn3e1aa3a9fc67",
          },
      }
  )
  .then((res)=>{
      return res.json();
  })
  .then((res)=>{
      word = res.word.toUpperCase();
      console.log(word);
  })
  .catch((err)=>{
      console.log(err);
  });
}

//Added onclick functionality to delete to update and to submit

function addKeyboardClicks(){
  const keys = document.querySelectorAll(".keyboard-row button");
  for (let i = 0; i < keys.length; i++) {
    keys[i].onclick = ({ target }) => {
      const letter = target.getAttribute("data-key");
      if (letter === "enter" && gamestate) {
        handleSubmitWord();
        return;
      }
  
      if (letter === "del" && gamestate) {
        handleDeleteLetter();
        return;
      }
      if(gamestate){
        updateGuessedWords(letter);
      }
      
    };
  }
  
  
  //Added keyboard typing functionality
  document.addEventListener("keyup", (e) => {
    let pressedKey = String(e.key);
    if (pressedKey === "Backspace" && gamestate) {
      handleDeleteLetter();
      return;
    }
    if (pressedKey === "Enter" && gamestate) {
      handleSubmitWord();
      return;
    }
    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return
    } else {
        if(gamestate){
          updateGuessedWords(pressedKey);
        }
    }
  })
}

//to return the currentrow from guessedWords list
function getCurrentWordArr() {
  const numberOfGuessedWords = guessedWords.length;
  return guessedWords[numberOfGuessedWords - 1];
}

//update after every input
function updateGuessedWords(letter) {
  const currentWordArr = getCurrentWordArr();

  if (currentWordArr && currentWordArr.length < 5) {
      currentWordArr.push(letter);
      const availableSpaceEl = document.getElementById(String(availableSpace));
      availableSpace = availableSpace + 1;
      availableSpaceEl.textContent = letter;
  }
  }

//handle submit option via enter
function handleSubmitWord() {
    const currentWordArr = getCurrentWordArr();
    
    if (currentWordArr.length !== 5) {
      window.alert("Word must be 5 letters");
      return;
    }

    const currentWord = currentWordArr.join("");
    //check for valid word via api
    fetch(`https://wordsapiv1.p.rapidapi.com/words/${currentWord}`, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
        "x-rapidapi-key": "8f64bab846mshf3f9be435e389f9p1e6211jsn3e1aa3a9fc67",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw Error();
        }
        const firstLetterId = guessedWordCount * 5 + 1;
        const interval = 100;
        currentWordArr.forEach((letter, index) => {
          setTimeout(() => {
            const tileColor = getTileColor(letter, index);

            const letterId = firstLetterId + index;
            const letterEl = document.getElementById(letterId);
            letterEl.classList.add("animate__flipInX");
            letterEl.style = `background-color:${tileColor};border-color:${tileColor}`;
          }, interval * index);
        });

        guessedWordCount += 1;

        if (currentWord.toUpperCase()=== word) {
          console.log("win");
          toastr.success('You have guessed the correct word','Congratulations!')
          gamestate = 0;
        }

        else if (guessedWords.length === 6) {
          toastr.warning(`Sorry, you have no more guesses! The word is ${word}.`);
        }

        guessedWords.push([]);
      })
      .catch(() => {
        toastr.info(`Sorry, Word is not recognised`);
      });
  }

//to get tile color after submission
function getTileColor(letter, index) {
    const isCorrectLetter = word.includes(letter.toUpperCase());

    if (!isCorrectLetter) {
      return "rgb(176,196,222)";
    }

    const letterInThatPosition = word.charAt(index);
    const isCorrectPosition = letter.toUpperCase() === letterInThatPosition;

    if (isCorrectPosition) {
      return "rgb(0,255,0)";
    }

    return "rgb(255,255,0)";
}


//to delete a letter
function handleDeleteLetter() {
  if(getCurrentWordArr().length>0){
    const currentWordArr = getCurrentWordArr();
    const removedLetter = currentWordArr.pop();
  
    guessedWords[guessedWords.length - 1] = currentWordArr;
  
    const lastLetterEl = document.getElementById(String(availableSpace - 1));
  
    lastLetterEl.textContent = "";
    availableSpace = availableSpace - 1;
  }
  
}

