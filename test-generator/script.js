// Global variables
let currentUser = null;
let currentGrade = null;
let currentSubject = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let testTimer = null;
let timeRemaining = 600; // 10 minutes in seconds
let testStartTime = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Check if user data exists in localStorage
    const savedUser = localStorage.getItem('testGeneratorUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        // Skip to grade selection if user is already saved
        showScreen('grade-screen');
        document.getElementById('greeting').textContent = `Salom, ${currentUser.name}!`;
    } else {
        showScreen('welcome-screen');
    }

    // Set up event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Welcome screen
    document.getElementById('name-submit').addEventListener('click', handleNameSubmit);
    document.getElementById('user-name').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleNameSubmit();
    });

    // Sign in screen
    document.getElementById('demo-signin').addEventListener('click', handleGoogleSignIn);

    // Grade selection
    document.getElementById('grade-select').addEventListener('change', function() {
        document.getElementById('grade-submit').disabled = !this.value;
    });
    document.getElementById('grade-submit').addEventListener('click', handleGradeSubmit);

    // Subject selection
    document.querySelectorAll('.subject-btn').forEach(btn => {
        btn.addEventListener('click', handleSubjectSelect);
    });

    // Test navigation
    document.getElementById('prev-question').addEventListener('click', () => navigateQuestion(-1));
    document.getElementById('next-question').addEventListener('click', () => navigateQuestion(1));
    document.getElementById('finish-test').addEventListener('click', finishTest);

    // Option selection
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', selectOption);
    });

    // Results actions
    document.getElementById('restart-test').addEventListener('click', restartTest);
    document.getElementById('new-test').addEventListener('click', newTest);
    document.getElementById('view-results').addEventListener('click', () => {
        document.getElementById('time-up-modal').classList.remove('active');
        showResults();
    });
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function handleNameSubmit() {
    const nameInput = document.getElementById('user-name');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Iltimos, ismingizni kiriting!');
        return;
    }

    currentUser = { name: name };
    localStorage.setItem('testGeneratorUser', JSON.stringify(currentUser));
    showScreen('signin-screen');
}

// Google Sign In handler
async function handleCredentialResponse(response) {
    try {
        // Send the credential to backend for verification
        const backendResponse = await fetch('/api/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: response.credential
            })
        });
        
        if (backendResponse.ok) {
            const data = await backendResponse.json();
            if (data.success) {
                console.log('Google Sign In successful:', data.user);
                // Update current user with Google info
                currentUser.googleUser = data.user;
                localStorage.setItem('testGeneratorUser', JSON.stringify(currentUser));
                proceedAfterSignIn();
                return;
            }
        }
        
        // Fallback to demo sign in if backend fails
        console.log('Backend auth failed, using demo sign in');
        proceedAfterSignIn();
        
    } catch (error) {
        console.error('Google authentication error:', error);
        // Fallback to demo sign in
        proceedAfterSignIn();
    }
}

function handleGoogleSignIn() {
    // Demo sign in - fallback when real Google OAuth is not available
    console.log('Demo Google Sign In');
    proceedAfterSignIn();
}

function proceedAfterSignIn() {
    showScreen('grade-screen');
    document.getElementById('greeting').textContent = `Salom, ${currentUser.name}!`;
}

function handleGradeSubmit() {
    currentGrade = parseInt(document.getElementById('grade-select').value);
    
    // Hide history subject for grades 1-4
    const historyBtn = document.getElementById('history-btn');
    if (currentGrade <= 4) {
        historyBtn.style.display = 'none';
    } else {
        historyBtn.style.display = 'flex';
    }
    
    showScreen('subject-screen');
}

function handleSubjectSelect(e) {
    const subjectBtn = e.currentTarget;
    currentSubject = subjectBtn.dataset.subject;
    
    // Visual feedback
    document.querySelectorAll('.subject-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    subjectBtn.classList.add('selected');
    
    // Start generating test after a short delay
    setTimeout(() => {
        generateTest();
    }, 500);
}

async function generateTest() {
    showScreen('loading-screen');
    
    try {
        // Generate questions using AI (simulated for demo)
        currentQuestions = await generateQuestionsWithAI(currentSubject, currentGrade);
        userAnswers = new Array(currentQuestions.length).fill(null);
        currentQuestionIndex = 0;
        
        // Start the test
        startTest();
    } catch (error) {
        console.error('Error generating test:', error);
        alert('Test yaratishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
        showScreen('subject-screen');
    }
}

async function generateQuestionsWithAI(subject, grade) {
    try {
        // Try to use backend API for real AI generation
        const response = await fetch('/api/generate-questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subject: subject,
                grade: grade,
                count: 10
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.questions) {
                return data.questions;
            }
        }
        
        // Fallback to client-side generation if API fails
        console.log('API failed, using fallback question generation');
        return generateFallbackQuestions(subject, grade);
        
    } catch (error) {
        console.error('Error calling AI API:', error);
        // Fallback to client-side generation
        return generateFallbackQuestions(subject, grade);
    }
}

function generateFallbackQuestions(subject, grade) {
    // Simulate AI generation delay
    return new Promise(resolve => {
        setTimeout(() => {
            const questions = [];
            
            for (let i = 0; i < 10; i++) {
                let question;
                
                switch (subject) {
                    case 'matematika':
                        question = generateMathQuestion(grade);
                        break;
                    case 'ingliz':
                        question = generateEnglishQuestion(grade);
                        break;
                    case 'tarix':
                        question = generateHistoryQuestion(grade);
                        break;
                    default:
                        question = generateMathQuestion(grade);
                }
                
                questions.push(question);
            }
            
            resolve(questions);
        }, 2000);
    });
}

function generateMathQuestion(grade) {
    const mathQuestions = {
        1: [
            {
                question: "2 + 3 = ?",
                options: ["4", "5", "6", "7"],
                correct: 1
            },
            {
                question: "8 - 3 = ?",
                options: ["4", "5", "6", "7"],
                correct: 1
            },
            {
                question: "Qaysi raqam eng katta?",
                options: ["3", "7", "5", "2"],
                correct: 1
            }
        ],
        2: [
            {
                question: "15 + 7 = ?",
                options: ["20", "22", "23", "21"],
                correct: 1
            },
            {
                question: "25 - 8 = ?",
                options: ["16", "17", "18", "19"],
                correct: 1
            }
        ],
        3: [
            {
                question: "6 × 4 = ?",
                options: ["20", "24", "28", "22"],
                correct: 1
            },
            {
                question: "36 ÷ 6 = ?",
                options: ["5", "6", "7", "8"],
                correct: 1
            }
        ]
    };
    
    // For higher grades, generate more complex questions
    if (grade >= 4) {
        const complexQuestions = [
            {
                question: `${Math.floor(Math.random() * 50) + 20} + ${Math.floor(Math.random() * 30) + 10} = ?`,
                options: [],
                correct: 0
            },
            {
                question: `${Math.floor(Math.random() * 12) + 2} × ${Math.floor(Math.random() * 8) + 2} = ?`,
                options: [],
                correct: 0
            }
        ];
        
        // Calculate correct answer and generate options
        const question = complexQuestions[Math.floor(Math.random() * complexQuestions.length)];
        const parts = question.question.split(' ');
        const num1 = parseInt(parts[0]);
        const operator = parts[1];
        const num2 = parseInt(parts[2]);
        
        let correctAnswer;
        switch (operator) {
            case '+':
                correctAnswer = num1 + num2;
                break;
            case '×':
                correctAnswer = num1 * num2;
                break;
            case '-':
                correctAnswer = num1 - num2;
                break;
            case '÷':
                correctAnswer = num1 / num2;
                break;
        }
        
        question.options = [
            correctAnswer.toString(),
            (correctAnswer + Math.floor(Math.random() * 5) + 1).toString(),
            (correctAnswer - Math.floor(Math.random() * 5) - 1).toString(),
            (correctAnswer + Math.floor(Math.random() * 10) + 5).toString()
        ];
        
        // Shuffle options
        const correctIndex = 0;
        for (let i = question.options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [question.options[i], question.options[j]] = [question.options[j], question.options[i]];
            if (i === correctIndex) question.correct = j;
            else if (j === correctIndex) question.correct = i;
        }
        
        return question;
    }
    
    const gradeQuestions = mathQuestions[grade] || mathQuestions[1];
    return gradeQuestions[Math.floor(Math.random() * gradeQuestions.length)];
}

function generateEnglishQuestion(grade) {
    const englishQuestions = {
        1: [
            {
                question: "\"Cat\" so'zining ma'nosi nima?",
                options: ["It", "Mushuk", "Qush", "Baliq"],
                correct: 1
            },
            {
                question: "\"Hello\" so'zi qanday tarjima qilinadi?",
                options: ["Salom", "Xayr", "Rahmat", "Kechirasiz"],
                correct: 0
            }
        ],
        2: [
            {
                question: "\"I am a student\" jumlasini tarjima qiling:",
                options: ["Men o'qituvchiman", "Men o'quvchiman", "Men ishchiman", "Men shifokorman"],
                correct: 1
            }
        ]
    };
    
    if (grade >= 3) {
        const advancedQuestions = [
            {
                question: "Choose the correct form: \"She ___ to school every day\"",
                options: ["go", "goes", "going", "gone"],
                correct: 1
            },
            {
                question: "What is the past tense of 'eat'?",
                options: ["eated", "ate", "eaten", "eating"],
                correct: 1
            },
            {
                question: "\"Beautiful\" so'zining antonimi qaysi?",
                options: ["Pretty", "Ugly", "Nice", "Good"],
                correct: 1
            }
        ];
        return advancedQuestions[Math.floor(Math.random() * advancedQuestions.length)];
    }
    
    const gradeQuestions = englishQuestions[grade] || englishQuestions[1];
    return gradeQuestions[Math.floor(Math.random() * gradeQuestions.length)];
}

function generateHistoryQuestion(grade) {
    const historyQuestions = [
        {
            question: "O'zbekistonning poytaxti qaysi shahar?",
            options: ["Samarqand", "Buxoro", "Toshkent", "Andijon"],
            correct: 2
        },
        {
            question: "Amir Temur qaysi asrda yashagan?",
            options: ["XIII asr", "XIV asr", "XV asr", "XVI asr"],
            correct: 1
        },
        {
            question: "O'zbekiston mustaqillikka qachon erishgan?",
            options: ["1990-yil", "1991-yil", "1992-yil", "1993-yil"],
            correct: 1
        },
        {
            question: "Buyuk Ipak yo'li qaysi hududlardan o'tgan?",
            options: ["Faqat Xitoydan", "Markaziy Osiyodan", "Faqat Evropadan", "Faqat Hindistondan"],
            correct: 1
        },
        {
            question: "Samarqandning mashhur yodgorligi qaysi?",
            options: ["Registon", "Ichan qal'a", "Ark qal'asi", "Chor Minor"],
            correct: 0
        }
    ];
    
    return historyQuestions[Math.floor(Math.random() * historyQuestions.length)];
}

function startTest() {
    showScreen('test-screen');
    
    // Set subject display
    const subjectNames = {
        'matematika': 'Matematika',
        'ingliz': 'Ingliz tili',
        'tarix': 'Tarix'
    };
    document.getElementById('subject-display').textContent = subjectNames[currentSubject];
    
    // Start timer
    timeRemaining = 600; // 10 minutes
    testStartTime = Date.now();
    startTimer();
    
    // Display first question
    displayQuestion();
}

function startTimer() {
    testTimer = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(testTimer);
            showTimeUpModal();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('timer-display').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function showTimeUpModal() {
    document.getElementById('time-up-modal').classList.add('active');
}

function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    // Update question counter
    document.getElementById('question-counter').textContent = 
        `Savol ${currentQuestionIndex + 1}/10`;
    
    // Update question text
    document.getElementById('question-text').textContent = question.question;
    
    // Update options
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach((btn, index) => {
        btn.querySelector('.option-text').textContent = question.options[index];
        btn.classList.remove('selected');
        
        // Restore previous selection if exists
        if (userAnswers[currentQuestionIndex] === index) {
            btn.classList.add('selected');
        }
    });
    
    // Update navigation buttons
    document.getElementById('prev-question').disabled = currentQuestionIndex === 0;
    document.getElementById('next-question').disabled = 
        currentQuestionIndex === currentQuestions.length - 1 || userAnswers[currentQuestionIndex] === null;
    
    // Show finish button on last question
    if (currentQuestionIndex === currentQuestions.length - 1) {
        document.getElementById('finish-test').style.display = 'block';
        document.getElementById('next-question').style.display = 'none';
    } else {
        document.getElementById('finish-test').style.display = 'none';
        document.getElementById('next-question').style.display = 'block';
    }
}

function selectOption(e) {
    const optionBtn = e.currentTarget;
    const optionIndex = Array.from(document.querySelectorAll('.option-btn')).indexOf(optionBtn);
    
    // Remove previous selection
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Add selection to clicked option
    optionBtn.classList.add('selected');
    
    // Save answer
    userAnswers[currentQuestionIndex] = optionIndex;
    
    // Enable next button
    document.getElementById('next-question').disabled = false;
}

function navigateQuestion(direction) {
    const newIndex = currentQuestionIndex + direction;
    
    if (newIndex >= 0 && newIndex < currentQuestions.length) {
        currentQuestionIndex = newIndex;
        displayQuestion();
    }
}

function finishTest() {
    // Check if all questions are answered
    const unansweredCount = userAnswers.filter(answer => answer === null).length;
    
    if (unansweredCount > 0) {
        const confirmFinish = confirm(
            `${unansweredCount} ta savolga javob bermaganingiz. Testni yakunlamoqchimisiz?`
        );
        if (!confirmFinish) return;
    }
    
    clearInterval(testTimer);
    showResults();
}

function showResults() {
    showScreen('results-screen');
    
    // Calculate score
    let correctCount = 0;
    const results = [];
    
    currentQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correct;
        
        if (isCorrect) correctCount++;
        
        results.push({
            questionNumber: index + 1,
            question: question.question,
            userAnswer: userAnswer !== null ? question.options[userAnswer] : 'Javob berilmagan',
            correctAnswer: question.options[question.correct],
            isCorrect: isCorrect
        });
    });
    
    const percentage = Math.round((correctCount / currentQuestions.length) * 100);
    
    // Update score display
    document.getElementById('score-percentage').textContent = `${percentage}%`;
    document.getElementById('correct-count').textContent = correctCount;
    document.getElementById('total-score').textContent = percentage;
    
    // Display detailed results
    const resultsContainer = document.getElementById('question-results');
    resultsContainer.innerHTML = '';
    
    results.forEach(result => {
        const resultDiv = document.createElement('div');
        resultDiv.className = `question-result ${result.isCorrect ? 'correct' : 'incorrect'}`;
        resultDiv.innerHTML = `
            <div>
                <strong>Savol ${result.questionNumber}:</strong> ${result.question.substring(0, 50)}...
            </div>
            <div>
                ${result.isCorrect ? '✅' : '❌'} ${result.isCorrect ? 'To\'g\'ri' : 'Noto\'g\'ri'}
            </div>
        `;
        resultsContainer.appendChild(resultDiv);
    });
}

function restartTest() {
    // Reset test state
    currentQuestionIndex = 0;
    userAnswers = new Array(currentQuestions.length).fill(null);
    timeRemaining = 600;
    
    // Start test again
    startTest();
}

function newTest() {
    // Reset all state
    currentGrade = null;
    currentSubject = null;
    currentQuestions = [];
    currentQuestionIndex = 0;
    userAnswers = [];
    timeRemaining = 600;
    
    if (testTimer) {
        clearInterval(testTimer);
        testTimer = null;
    }
    
    // Go back to grade selection
    showScreen('grade-screen');
    document.getElementById('grade-select').value = '';
    document.getElementById('grade-submit').disabled = true;
}
