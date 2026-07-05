const questions = [
  {
    question: "מהי בירת ישראל?",
    answers: ["תל אביב", "ירושלים", "חיפה", "באר שבע","אילת","דימונה","קריית שמונה","באר יעקוב"],
    correct: [1]
  },
  {
    question: "אילו מהבאים הם פירות?",
    answers: ["תפוח", "מלפפון", "בננה", "עגבנייה"],
    correct: [0, 2]
  },
  {
    question: "אילו צבעים הם צבעי יסוד?",
    answers: ["אדום", "ירוק", "כחול", "צהוב"],
    correct: [0, 2, 3]
  }
];


let queue = questions.map(q => ({ ...q, wasWrong: false, attempted: false }));
let currentIndex = 0;
let attemptedCount = 0;
let wrongCount = 0;
let selectedAnswers = [];
let advanceTimer = null;
let quizStarted = false;

const startScreen = document.getElementById("startScreen");
const startQuizBtn = document.getElementById("startQuizBtn");
const quizScreen = document.getElementById("quizScreen");
const quizHeader = document.getElementById("quizHeader");
const questionCard = document.getElementById("questionCard");
const endScreen = document.getElementById("endScreen");
const restartQuizBtn = document.getElementById("restartQuizBtn");

const els = {
  questionCounter: document.getElementById("questionCounter"),
  progressFill: document.getElementById("progressFill"),
  wrongCounter: document.getElementById("wrongCounter"),
  questionText: document.getElementById("questionText"),
  questionSubtext: document.getElementById("questionSubtext"),
  answers: document.getElementById("answers")
};

function setScreenTheme(screen) {
  const body = document.body;

  if (screen === "start") {
    body.style.backgroundColor = "#d3d2d2ff";
    startScreen.style.backgroundColor = "#d3d2d2ff";
    quizScreen.style.backgroundColor = "#d3d2d2ff";
    endScreen.style.backgroundColor = "#d3d2d2ff";
  } else if (screen === "quiz") {
    body.style.backgroundColor = "#f3f3f3";
    startScreen.style.backgroundColor = "#f3f3f3";
    quizScreen.style.backgroundColor = "#f3f3f3";
    endScreen.style.backgroundColor = "#f3f3f3";
  } else if (screen === "end") {
    body.style.backgroundColor = "#d3d2d2ff";
    startScreen.style.backgroundColor = "#d3d2d2ff";
    quizScreen.style.backgroundColor = "#d3d2d2ff";
    endScreen.style.backgroundColor = "#d3d2d2ff";
  }
}

function setOverflow(mode) {
  document.documentElement.style.overflowX = "auto";
  document.body.style.overflowX = "auto";
  // document.documentElement.style.overflowY = mode;
  // document.body.style.overflowY = mode;
}

startQuizBtn.addEventListener("click", () => {
  quizStarted = true;
  setScreenTheme("quiz");
  setOverflow("auto");

  startScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");
  quizHeader.classList.remove("hidden");
  questionCard.classList.remove("hidden");
  endScreen.classList.add("hidden");

  renderQuestion();
});

restartQuizBtn.addEventListener("click", () => {
  queue = questions.map(q => ({ ...q, wasWrong: false, attempted: false }));
  currentIndex = 0;
  attemptedCount = 0;
  wrongCount = 0;
  selectedAnswers = [];
  clearTimeout(advanceTimer);
  quizStarted = false;

  setScreenTheme("start");
  setOverflow("hidden");

  endScreen.classList.add("hidden");
  quizHeader.classList.add("hidden");
  questionCard.classList.add("hidden");
  quizScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");

  updateHeader();
});

function updateHeader() {
  const total = questions.length;
  const progress = total === 0 ? 0 : Math.round((attemptedCount / total) * 100);
  els.questionCounter.textContent = `${attemptedCount}/${total}`;
  els.progressFill.style.width = `${progress}%`;
  els.wrongCounter.textContent = wrongCount;
}

function renderQuestion() {
  clearTimeout(advanceTimer);
  selectedAnswers = [];

  if (!quizStarted) return;

  if (queue.length === 0) {
    setScreenTheme("end");
    setOverflow("hidden");
    quizHeader.classList.add("hidden");
    questionCard.classList.add("hidden");
    endScreen.classList.remove("hidden");
    return;
  }

  setScreenTheme("quiz");
  setOverflow("auto");
  quizHeader.classList.remove("hidden");
  questionCard.classList.remove("hidden");
  endScreen.classList.add("hidden");

  if (currentIndex >= queue.length) currentIndex = 0;

  const q = queue[currentIndex];
  const needed = q.correct.length;

  els.questionText.textContent = q.question;
  els.questionSubtext.textContent = needed === 1 ? "בחר תשובה אחת" : `בחר ${needed} תשובות`;
  els.answers.innerHTML = "";

  q.answers.forEach((answerText, index) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = answerText;
    btn.onclick = () => selectAnswer(index, btn);
    els.answers.appendChild(btn);
  });

  updateHeader();
}

function selectAnswer(index, btn) {
  const q = queue[currentIndex];
  const needed = q.correct.length;
  const buttons = [...document.querySelectorAll(".answer-btn")];

  if (!q.attempted) {
    q.attempted = true;
    attemptedCount++;
    updateHeader();
  }

  if (selectedAnswers.includes(index)) return;

  selectedAnswers.push(index);

  const isThisCorrect = q.correct.includes(index);
  btn.classList.add(isThisCorrect ? "correct" : "wrong");

  if (selectedAnswers.length < needed) return;

  buttons.forEach(b => b.classList.add("disabled"));

  const selectedSorted = [...selectedAnswers].sort((a, b) => a - b);
  const correctSorted = [...q.correct].sort((a, b) => a - b);
  const isFullyCorrect =
    selectedSorted.length === correctSorted.length &&
    selectedSorted.every((v, i) => v === correctSorted[i]);

  if (isFullyCorrect) {
    if (q.wasWrong) {
      wrongCount--;
      q.wasWrong = false;
    }

    advanceTimer = setTimeout(() => {
      queue.splice(currentIndex, 1);
      if (currentIndex >= queue.length) currentIndex = 0;
      updateHeader();
      renderQuestion();
    }, 700);
  } else {
    if (!q.wasWrong) {
      q.wasWrong = true;
      wrongCount++;
      updateHeader();
    }

    advanceTimer = setTimeout(() => {
      const [wrongQuestion] = queue.splice(currentIndex, 1);
      queue.push(wrongQuestion);
      if (currentIndex >= queue.length) currentIndex = 0;
      updateHeader();
      renderQuestion();
    }, 900);
  }
}

setScreenTheme("start");
setOverflow("auto");
updateHeader();
