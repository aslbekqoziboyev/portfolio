// Global Variables
let currentUser = null;
let currentGrade = null;
let currentSubject = null;
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let testTimer = null;
let timeRemaining = 600; // 10 minutes in seconds
let isTestActive = false;

// Configuration
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with actual client ID
const AI_API_KEY = 'YOUR_AI_API_KEY'; // Replace with actual API key

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Check if user data exists in localStorage
    const savedUser = localStorage.getItem('testGeneratorUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showScreen('grade-screen');
        document.getElementById('greeting').textContent = `Salom, ${currentUser.name}!`;
    } else {
        showScreen('welcome-screen');
    }

    // Set up event listeners
    setupEventListeners();
    
    // Initialize Google Sign-In
    initializeGoogleSignIn();
}

function setupEventListeners() {
    // Name submission
    document.getElementById('name-submit').addEventListener('click', handleNameSubmit);
    document.getElementById('user-name').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleNameSubmit();
    });

    // Demo sign-in
    document.getElementById('demo-signin').addEventListener('click', handleDemoSignIn);

    // Grade selection
    document.getElementById('grade-select').addEventListener('change', handleGradeChange);
    document.getElementById('grade-submit').addEventListener('click', handleGradeSubmit);

    // Subject selection
    document.querySelectorAll('.subject-btn').forEach(btn => {
        btn.addEventListener('click', handleSubjectSelection);
    });

    // Test navigation
    document.getElementById('prev-question').addEventListener('click', () => navigateQuestion(-1));
    document.getElementById('next-question').addEventListener('click', () => navigateQuestion(1));
    document.getElementById('finish-test').addEventListener('click', finishTest);

    // Option selection
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', handleOptionSelection);
    });

    // Results actions
    document.getElementById('restart-test').addEventListener('click', restartTest);
    document.getElementById('new-test').addEventListener('click', startNewTest);
}

function initializeGoogleSignIn() {
    // Update the client ID in the HTML
    const gOnload = document.getElementById('g_id_onload');
    if (gOnload && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID') {
        gOnload.setAttribute('data-client_id', GOOGLE_CLIENT_ID);
    }
}

// Google Sign-In callback
function handleCredentialResponse(response) {
    try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        currentUser = {
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
            signedIn: true
        };
        
        localStorage.setItem('testGeneratorUser', JSON.stringify(currentUser));
        showScreen('grade-screen');
        document.getElementById('greeting').textContent = `Salom, ${currentUser.name}!`;
    } catch (error) {
        console.error('Google Sign-In error:', error);
        alert('Google bilan kirish xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    }
}

function handleNameSubmit() {
    const nameInput = document.getElementById('user-name');
    const name = nameInput.value.trim();
    
    if (name) {
        currentUser = { name: name, signedIn: false };
        localStorage.setItem('testGeneratorUser', JSON.stringify(currentUser));
        showScreen('signin-screen');
    } else {
        alert('Iltimos, ismingizni kiriting!');
    }
}

function handleDemoSignIn() {
    if (currentUser) {
        currentUser.signedIn = true;
        localStorage.setItem('testGeneratorUser', JSON.stringify(currentUser));
        showScreen('grade-screen');
        document.getElementById('greeting').textContent = `Salom, ${currentUser.name}!`;
    }
}

function handleGradeChange() {
    const gradeSelect = document.getElementById('grade-select');
    const gradeSubmit = document.getElementById('grade-submit');
    
    if (gradeSelect.value) {
        gradeSubmit.disabled = false;
        currentGrade = parseInt(gradeSelect.value);
    } else {
        gradeSubmit.disabled = true;
    }
}

function handleGradeSubmit() {
    if (currentGrade) {
        // Show/hide history subject based on grade
        const historyBtn = document.getElementById('history-btn');
        if (currentGrade <= 4) {
            historyBtn.style.display = 'none';
        } else {
            historyBtn.style.display = 'flex';
        }
        
        showScreen('subject-screen');
    }
}

function handleSubjectSelection(event) {
    const subject = event.currentTarget.getAttribute('data-subject');
    currentSubject = subject;
    
    // Visual feedback
    document.querySelectorAll('.subject-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    // Start generating questions after a short delay
    setTimeout(() => {
        generateQuestions();
    }, 500);
}

async function generateQuestions() {
    showScreen('loading-screen');
    
    try {
        // Generate questions using AI or fallback to predefined questions
        questions = await generateAIQuestions(currentSubject, currentGrade);
        
        if (questions.length === 0) {
            throw new Error('No questions generated');
        }
        
        // Initialize test
        currentQuestionIndex = 0;
        userAnswers = new Array(questions.length).fill(null);
        
        // Start the test
        startTest();
        
    } catch (error) {
        console.error('Question generation error:', error);
        // Fallback to predefined questions
        questions = generateFallbackQuestions(currentSubject, currentGrade);
        currentQuestionIndex = 0;
        userAnswers = new Array(questions.length).fill(null);
        startTest();
    }
}

async function generateAIQuestions(subject, grade) {
    // This is where you would integrate with an AI service like OpenAI, Gemini, etc.
    // For now, we'll simulate AI generation with more sophisticated fallback questions
    
    const prompt = createPromptForSubject(subject, grade);
    
    try {
        // Simulate AI API call
        // In a real implementation, you would call your AI service here
        // const response = await fetch('https://api.openai.com/v1/chat/completions', {
        //     method: 'POST',
        //     headers: {
        //         'Authorization': `Bearer ${AI_API_KEY}`,
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         model: 'gpt-3.5-turbo',
        //         messages: [{ role: 'user', content: prompt }],
        //         max_tokens: 2000
        //     })
        // });
        
        // For demo purposes, return sophisticated fallback questions
        return generateAdvancedQuestions(subject, grade);
        
    } catch (error) {
        console.error('AI API error:', error);
        return generateAdvancedQuestions(subject, grade);
    }
}

function createPromptForSubject(subject, grade) {
    const subjectNames = {
        'ingliz': 'Ingliz tili',
        'matematika': 'Matematika',
        'tarix': 'Tarix'
    };
    
    return `${grade}-sinf ${subjectNames[subject]} fanidan 10 ta test savoli yarating. Har bir savol uchun 4 ta variant (A, B, C, D) va to'g'ri javobni ko'rsating. Savollar o'zbek tilida bo'lsin va ${grade}-sinf darajasiga mos kelsin.`;
}

function generateAdvancedQuestions(subject, grade) {
    const questionSets = {
        matematika: {
            1: [
                {
                    question: "5 + 3 = ?",
                    options: ["6", "7", "8", "9"],
                    correct: 2
                },
                {
                    question: "10 - 4 = ?",
                    options: ["5", "6", "7", "8"],
                    correct: 1
                },
                {
                    question: "2 × 3 = ?",
                    options: ["5", "6", "7", "8"],
                    correct: 1
                },
                {
                    question: "8 ÷ 2 = ?",
                    options: ["3", "4", "5", "6"],
                    correct: 1
                },
                {
                    question: "Qaysi raqam eng katta?",
                    options: ["7", "9", "5", "8"],
                    correct: 1
                },
                {
                    question: "1 + 1 + 1 = ?",
                    options: ["2", "3", "4", "5"],
                    correct: 1
                },
                {
                    question: "6 - 2 = ?",
                    options: ["3", "4", "5", "6"],
                    correct: 1
                },
                {
                    question: "3 + 4 = ?",
                    options: ["6", "7", "8", "9"],
                    correct: 1
                },
                {
                    question: "9 - 5 = ?",
                    options: ["3", "4", "5", "6"],
                    correct: 1
                },
                {
                    question: "2 + 2 = ?",
                    options: ["3", "4", "5", "6"],
                    correct: 1
                }
            ],
            5: [
                {
                    question: "25 × 4 = ?",
                    options: ["90", "100", "110", "120"],
                    correct: 1
                },
                {
                    question: "144 ÷ 12 = ?",
                    options: ["11", "12", "13", "14"],
                    correct: 1
                },
                {
                    question: "3/4 + 1/4 = ?",
                    options: ["4/8", "1", "3/8", "1/2"],
                    correct: 1
                },
                {
                    question: "Kvadratning perimetri 20 sm bo'lsa, bir tomoni necha sm?",
                    options: ["4", "5", "6", "10"],
                    correct: 1
                },
                {
                    question: "0.5 + 0.3 = ?",
                    options: ["0.7", "0.8", "0.9", "1.0"],
                    correct: 0
                },
                {
                    question: "15% dan 200 = ?",
                    options: ["25", "30", "35", "40"],
                    correct: 1
                },
                {
                    question: "2³ = ?",
                    options: ["6", "8", "9", "12"],
                    correct: 1
                },
                {
                    question: "Uchburchakning burchaklari yig'indisi necha gradus?",
                    options: ["90", "180", "270", "360"],
                    correct: 1
                },
                {
                    question: "√16 = ?",
                    options: ["3", "4", "5", "6"],
                    correct: 1
                },
                {
                    question: "7 × 8 = ?",
                    options: ["54", "56", "58", "60"],
                    correct: 1
                }
            ]
        },
        ingliz: {
            1: [
                {
                    question: "\"Hello\" so'zining ma'nosi nima?",
                    options: ["Xayr", "Salom", "Rahmat", "Kechirasiz"],
                    correct: 1
                },
                {
                    question: "\"Cat\" so'zi nimani bildiradi?",
                    options: ["It", "Mushuk", "Qush", "Baliq"],
                    correct: 1
                },
                {
                    question: "\"Red\" rangning ma'nosi:",
                    options: ["Ko'k", "Yashil", "Qizil", "Sariq"],
                    correct: 2
                },
                {
                    question: "\"Book\" so'zining tarjimasi:",
                    options: ["Qalam", "Kitob", "Stol", "O'rindiq"],
                    correct: 1
                },
                {
                    question: "\"Thank you\" nimani bildiradi?",
                    options: ["Kechirasiz", "Salom", "Rahmat", "Xayr"],
                    correct: 2
                },
                {
                    question: "\"Apple\" - bu:",
                    options: ["Olma", "Banan", "Apelsin", "Uzum"],
                    correct: 0
                },
                {
                    question: "\"Water\" so'zining ma'nosi:",
                    options: ["Suv", "Choy", "Qahva", "Sharbat"],
                    correct: 0
                },
                {
                    question: "\"Good morning\" qachon aytiladi?",
                    options: ["Kechqurun", "Ertalab", "Tushda", "Kechasi"],
                    correct: 1
                },
                {
                    question: "\"Dog\" so'zi nimani bildiradi?",
                    options: ["Mushuk", "It", "Qush", "Sichqon"],
                    correct: 1
                },
                {
                    question: "\"Blue\" rangning ma'nosi:",
                    options: ["Qizil", "Ko'k", "Yashil", "Qora"],
                    correct: 1
                }
            ],
            5: [
                {
                    question: "\"I am a student\" jumlasidagi \"am\" qaysi fe'l shakli?",
                    options: ["Past tense", "Present tense", "Future tense", "Perfect tense"],
                    correct: 1
                },
                {
                    question: "\"She _____ to school every day.\" Bo'sh joyni to'ldiring:",
                    options: ["go", "goes", "going", "gone"],
                    correct: 1
                },
                {
                    question: "\"Beautiful\" so'zining antonimi:",
                    options: ["Pretty", "Ugly", "Nice", "Good"],
                    correct: 1
                },
                {
                    question: "\"How old are you?\" savoliga javob:",
                    options: ["I am fine", "I am 10 years old", "I am happy", "I am tall"],
                    correct: 1
                },
                {
                    question: "\"There _____ many books on the table.\" To'g'ri variant:",
                    options: ["is", "are", "was", "were"],
                    correct: 1
                },
                {
                    question: "\"Yesterday\" so'zining ma'nosi:",
                    options: ["Bugun", "Ertaga", "Kecha", "Hozir"],
                    correct: 2
                },
                {
                    question: "\"Can you help me?\" - bu qanday gap?",
                    options: ["Darak gap", "So'roq gap", "Buyruq gap", "Undov gap"],
                    correct: 1
                },
                {
                    question: "\"My brother is _____ than me.\" (tall)",
                    options: ["tall", "taller", "tallest", "more tall"],
                    correct: 1
                },
                {
                    question: "\"I have _____ apple.\" To'g'ri artikl:",
                    options: ["a", "an", "the", "artikl kerak emas"],
                    correct: 1
                },
                {
                    question: "\"What time is it?\" savoliga 3:30 uchun javob:",
                    options: ["It's three thirty", "It's half past three", "It's thirty three", "A va B to'g'ri"],
                    correct: 3
                }
            ]
        },
        tarix: {
            5: [
                {
                    question: "O'zbekistonning poytaxti qaysi shahar?",
                    options: ["Samarqand", "Buxoro", "Toshkent", "Farg'ona"],
                    correct: 2
                },
                {
                    question: "Amir Temur qaysi asrda yashagan?",
                    options: ["XIII asr", "XIV asr", "XV asr", "XVI asr"],
                    correct: 1
                },
                {
                    question: "\"Avesto\" - bu nima?",
                    options: ["Shahar nomi", "Qadimiy kitob", "Daryoning nomi", "Tog' nomi"],
                    correct: 1
                },
                {
                    question: "Samarqand shahri qaysi hukmdor davrida gullab-yashnagan?",
                    options: ["Amir Temur", "Ulug'bek", "Bobur", "Barchasi"],
                    correct: 3
                },
                {
                    question: "O'zbekistonda birinchi temir yo'l qachon qurilgan?",
                    options: ["1874-yil", "1888-yil", "1899-yil", "1901-yil"],
                    correct: 2
                },
                {
                    question: "Buxoro xonligi qachon tashkil topgan?",
                    options: ["XV asr", "XVI asr", "XVII asr", "XVIII asr"],
                    correct: 1
                },
                {
                    question: "\"Boburnoma\" asarining muallifi kim?",
                    options: ["Amir Temur", "Ulug'bek", "Zahiriddin Muhammad Bobur", "Alisher Navoiy"],
                    correct: 2
                },
                {
                    question: "Qadimgi Xorazm poytaxti qaysi shahar bo'lgan?",
                    options: ["Urganch", "Xiva", "Koʻhna Urganch", "Nukus"],
                    correct: 2
                },
                {
                    question: "O'rta Osiyoda birinchi observatoriya qayerda qurilgan?",
                    options: ["Toshkentda", "Samarqandda", "Buxoroda", "Xivada"],
                    correct: 1
                },
                {
                    question: "\"Devonu lug'otit turk\" asarining muallifi kim?",
                    options: ["Yusuf Xos Hojib", "Mahmud Koshg'ariy", "Ahmad Yugnakiy", "Alisher Navoiy"],
                    correct: 1
                }
            ]
        }
    };

    const subjectQuestions = questionSets[subject];
    if (!subjectQuestions) return generateFallbackQuestions(subject, grade);

    // Find the closest grade level
    const availableGrades = Object.keys(subjectQuestions).map(Number).sort((a, b) => a - b);
    let selectedGrade = grade;
    
    if (!subjectQuestions[grade]) {
        // Find the closest lower grade
        selectedGrade = availableGrades.find(g => g <= grade) || availableGrades[0];
    }

    return subjectQuestions[selectedGrade] || generateFallbackQuestions(subject, grade);
}

function generateFallbackQuestions(subject, grade) {
    // Basic fallback questions
    const fallbackQuestions = [
        {
            question: `${grade}-sinf ${subject} fanidan savol 1`,
            options: ["A variant", "B variant", "C variant", "D variant"],
            correct: 0
        },
        {
            question: `${grade}-sinf ${subject} fanidan savol 2`,
            options: ["A variant", "B variant", "C variant", "D variant"],
            correct: 1
        },
        {
            question: `${grade}-sinf ${subject} fanidan savol 3`,
            options: ["A variant", "B variant", "C variant", "D variant"],
            correct: 2
        },
        {
            question: `${grade}-sinf ${subject} fanidan savol 4`,
            options: ["A variant", "B variant", "C variant", "D variant"],
            correct: 3
        },
        {
            question: `${grade}-sinf ${subject} fanidan savol 5`,
            options: ["A variant", "B variant", "C variant", "D variant"],
            correct: 0
        },
        {
            question: `${grade}-sinf ${subject} fanidan savol 6`,
            options: ["A variant", "B variant", "C variant", "D variant"],
            correct: 1
        },
        {
            question: `${grade}-sinf ${subject} fanidan savol 7`,
            options: ["A variant", "B variant", "C variant", "D variant"],
            correct: 2
        },
        {
            question: `${grade}-sinf ${subject} fanidan savol 8`,
            options: ["A variant", "B variant", "C variant", "D variant"],
            correct: 3
        },
        {
            question: `${grade}-sinf ${subject} fanidan savol 9`,
            options: ["A variant", "B variant", "C variant", "D variant"],
            correct: 0
        },
        {
            question: `${grade}-sinf ${subject} fanidan savol 10`,
            options: ["A variant", "B variant", "C variant", "D variant"],
            correct: 1
        }
    ];

    return fallbackQuestions;
}

function startTest() {
    showScreen('test-screen');
    isTestActive = true;
    timeRemaining = 600; // 10 minutes
    
    // Start timer
    startTimer();
    
    // Display first question
    displayQuestion();
}

function startTimer() {
    const timerElement = document.getElementById('timer');
    
    testTimer = setInterval(() => {
        timeRemaining--;
        
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Warning when less than 2 minutes
        if (timeRemaining <= 120) {
            timerElement.classList.add('warning');
        }
        
        // Time's up
        if (timeRemaining <= 0) {
            clearInterval(testTimer);
            finishTest();
        }
    }, 1000);
}

function displayQuestion() {
    const question = questions[currentQuestionIndex];
    
    // Update question counter
    document.getElementById('question-counter').textContent = 
        `Savol ${currentQuestionIndex + 1}/${questions.length}`;
    
    // Update question text
    document.getElementById('question-text').textContent = question.question;
    
    // Update options
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach((btn, index) => {
        const optionText = btn.querySelector('.option-text');
        optionText.textContent = question.options[index];
        
        // Reset styles
        btn.classList.remove('selected');
        
        // Show selected answer if exists
        if (userAnswers[currentQuestionIndex] === index) {
            btn.classList.add('selected');
        }
    });
    
    // Update navigation buttons
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-question');
    const nextBtn = document.getElementById('next-question');
    const finishBtn = document.getElementById('finish-test');
    
    // Previous button
    prevBtn.disabled = currentQuestionIndex === 0;
    
    // Next button
    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        finishBtn.style.display = 'none';
        nextBtn.disabled = userAnswers[currentQuestionIndex] === null;
    }
}

function handleOptionSelection(event) {
    if (!isTestActive) return;
    
    const selectedOption = parseInt(event.currentTarget.getAttribute('data-option').charCodeAt(0) - 65);
    userAnswers[currentQuestionIndex] = selectedOption;
    
    // Update visual selection
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    // Update navigation buttons
    updateNavigationButtons();
}

function navigateQuestion(direction) {
    const newIndex = currentQuestionIndex + direction;
    
    if (newIndex >= 0 && newIndex < questions.length) {
        currentQuestionIndex = newIndex;
        displayQuestion();
    }
}

function finishTest() {
    isTestActive = false;
    clearInterval(testTimer);
    
    // Calculate results
    const results = calculateResults();
    
    // Display results
    displayResults(results);
}

function calculateResults() {
    let correctAnswers = 0;
    const questionResults = [];
    
    questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correct;
        
        if (isCorrect) correctAnswers++;
        
        questionResults.push({
            questionNumber: index + 1,
            question: question.question,
            userAnswer: userAnswer !== null ? question.options[userAnswer] : 'Javob berilmagan',
            correctAnswer: question.options[question.correct],
            isCorrect: isCorrect
        });
    });
    
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    
    return {
        correctAnswers,
        totalQuestions: questions.length,
        percentage,
        questionResults
    };
}

function displayResults(results) {
    showScreen('results-screen');
    
    // Update summary
    document.getElementById('correct-answers').textContent = 
        `${results.correctAnswers} / ${results.totalQuestions}`;
    document.getElementById('total-score').textContent = `${results.percentage}%`;
    
    // Update detailed results
    const questionResultsContainer = document.getElementById('question-results');
    questionResultsContainer.innerHTML = '';
    
    results.questionResults.forEach(result => {
        const resultDiv = document.createElement('div');
        resultDiv.className = `question-result ${result.isCorrect ? 'correct' : 'incorrect'}`;
        
        resultDiv.innerHTML = `
            <span class="question-number">Savol ${result.questionNumber}:</span>
            <span class="question-status">${result.isCorrect ? '✅' : '❌'}</span>
            <div>
                <div><strong>Sizning javobingiz:</strong> ${result.userAnswer}</div>
                <div><strong>To'g'ri javob:</strong> ${result.correctAnswer}</div>
            </div>
        `;
        
        questionResultsContainer.appendChild(resultDiv);
    });
    
    // Save results to localStorage
    const testHistory = JSON.parse(localStorage.getItem('testHistory') || '[]');
    testHistory.push({
        date: new Date().toISOString(),
        subject: currentSubject,
        grade: currentGrade,
        results: results
    });
    localStorage.setItem('testHistory', JSON.stringify(testHistory));
}

function restartTest() {
    // Reset test state
    currentQuestionIndex = 0;
    userAnswers = new Array(questions.length).fill(null);
    timeRemaining = 600;
    
    // Start test again
    startTest();
}

function startNewTest() {
    // Reset all state
    currentGrade = null;
    currentSubject = null;
    questions = [];
    currentQuestionIndex = 0;
    userAnswers = [];
    
    // Go back to grade selection
    showScreen('grade-screen');
    document.getElementById('grade-select').value = '';
    document.getElementById('grade-submit').disabled = true;
}

function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    document.getElementById(screenId).classList.add('active');
}

// Utility functions
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Prevent page refresh during test
window.addEventListener('beforeunload', function(e) {
    if (isTestActive) {
        e.preventDefault();
        e.returnValue = 'Test davom etmoqda. Sahifani yopishni xohlaysizmi?';
    }
});

// Handle visibility change (tab switching)
document.addEventListener('visibilitychange', function() {
    if (isTestActive && document.hidden) {
        console.log('User switched tabs during test');
        // You could implement anti-cheating measures here
    }
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateAdvancedQuestions,
        calculateResults,
        shuffleArray
    };
}
