const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configuration (replace with your actual credentials)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY';

// Initialize Google OAuth client
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Google Sign-In verification endpoint
app.post('/api/auth/google', async (req, res) => {
    try {
        const { token } = req.body;
        
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const userId = payload['sub'];
        const email = payload['email'];
        const name = payload['name'];
        
        // Here you would typically save user info to database
        console.log('User authenticated:', { userId, email, name });
        
        res.json({
            success: true,
            user: {
                id: userId,
                email: email,
                name: name
            }
        });
    } catch (error) {
        console.error('Google authentication error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
});

// AI Question Generation endpoint
app.post('/api/generate-questions', async (req, res) => {
    try {
        const { subject, grade, count = 10 } = req.body;
        
        if (!subject || !grade) {
            return res.status(400).json({
                success: false,
                error: 'Subject and grade are required'
            });
        }
        
        const questions = await generateQuestionsWithAI(subject, grade, count);
        
        res.json({
            success: true,
            questions: questions
        });
    } catch (error) {
        console.error('Question generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate questions'
        });
    }
});

// AI Question Generation function
async function generateQuestionsWithAI(subject, grade, count) {
    const subjectNames = {
        'matematika': 'Matematika',
        'ingliz': 'Ingliz tili',
        'tarix': 'Tarix'
    };
    
    const subjectName = subjectNames[subject] || subject;
    
    const prompt = `
    ${grade}-sinf o'quvchilari uchun ${subjectName} fanidan ${count} ta test savoli yarating.
    
    Qoidalar:
    1. Har bir savol 4 ta javob varianti (A, B, C, D) bo'lishi kerak
    2. Faqat bitta to'g'ri javob bo'lishi kerak
    3. Savollar ${grade}-sinf darajasiga mos bo'lishi kerak
    4. Barcha matn o'zbek tilida (lotin alifbosida) bo'lishi kerak
    5. Savollar turli mavzularni qamrab olishi kerak
    
    JSON formatida javob bering:
    {
        "questions": [
            {
                "question": "Savol matni",
                "options": ["A variant", "B variant", "C variant", "D variant"],
                "correct": 0
            }
        ]
    }
    
    Misol (faqat format uchun):
    {
        "questions": [
            {
                "question": "2 + 3 = ?",
                "options": ["4", "5", "6", "7"],
                "correct": 1
            }
        ]
    }
    `;
    
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Siz o'zbek tilida test savollarini yaratuvchi AI assistentsiz. Barcha javoblaringiz o'zbek tilida (lotin alifbosida) bo'lishi kerak."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });
        
        const response = completion.choices[0].message.content;
        const parsedResponse = JSON.parse(response);
        
        return parsedResponse.questions;
    } catch (error) {
        console.error('OpenAI API error:', error);
        
        // Fallback to predefined questions if AI fails
        return generateFallbackQuestions(subject, grade, count);
    }
}

// Fallback question generation
function generateFallbackQuestions(subject, grade, count) {
    const questionBank = {
        matematika: {
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
                },
                {
                    question: "1 + 1 = ?",
                    options: ["1", "2", "3", "4"],
                    correct: 1
                },
                {
                    question: "5 - 2 = ?",
                    options: ["2", "3", "4", "5"],
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
                },
                {
                    question: "10 + 10 = ?",
                    options: ["15", "20", "25", "30"],
                    correct: 1
                }
            ]
        },
        ingliz: {
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
                },
                {
                    question: "\"Dog\" so'zining ma'nosi nima?",
                    options: ["Mushuk", "It", "Qush", "Baliq"],
                    correct: 1
                }
            ]
        },
        tarix: [
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
            }
        ]
    };
    
    let availableQuestions = [];
    
    if (subject === 'tarix') {
        availableQuestions = questionBank.tarix;
    } else if (questionBank[subject] && questionBank[subject][grade]) {
        availableQuestions = questionBank[subject][grade];
    } else if (questionBank[subject] && questionBank[subject][1]) {
        availableQuestions = questionBank[subject][1];
    } else {
        availableQuestions = questionBank.matematika[1];
    }
    
    // Shuffle and select questions
    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
    const selected = [];
    
    for (let i = 0; i < count; i++) {
        if (i < shuffled.length) {
            selected.push(shuffled[i]);
        } else {
            // Repeat questions if not enough available
            selected.push(shuffled[i % shuffled.length]);
        }
    }
    
    return selected;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'AI Test Generator Backend'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 AI Test Generator server running on port ${PORT}`);
    console.log(`📝 Access the app at: http://localhost:${PORT}`);
    console.log(`🔧 API endpoints:`);
    console.log(`   - POST /api/auth/google - Google authentication`);
    console.log(`   - POST /api/generate-questions - AI question generation`);
    console.log(`   - GET /api/health - Health check`);
});

module.exports = app;
