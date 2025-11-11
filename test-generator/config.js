// Configuration file for AI Test Generator
// Bu faylda barcha sozlamalarni o'zgartiring

const CONFIG = {
    // Google Sign-In sozlamalari
    GOOGLE: {
        CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID', // Google Cloud Console dan olingan Client ID
        SCOPES: 'profile email'
    },
    
    // AI API sozlamalari
    AI: {
        PROVIDER: 'openai', // 'openai', 'gemini', 'claude', 'local'
        API_KEY: 'YOUR_AI_API_KEY',
        MODEL: 'gpt-3.5-turbo',
        MAX_TOKENS: 2000,
        TEMPERATURE: 0.7
    },
    
    // Test sozlamalari
    TEST: {
        DURATION_MINUTES: 10, // Test davomiyligi (daqiqada)
        QUESTIONS_COUNT: 10,  // Savollar soni
        WARNING_TIME_MINUTES: 2, // Ogohlantirish vaqti (qolgan daqiqalar)
        AUTO_SUBMIT: true // Vaqt tugaganda avtomatik yuborish
    },
    
    // Fanlar va sinflar sozlamalari
    SUBJECTS: {
        matematika: {
            name: 'Matematika',
            icon: '🔢',
            grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            enabled: true
        },
        ingliz: {
            name: 'Ingliz tili',
            icon: '🇬🇧',
            grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            enabled: true
        },
        tarix: {
            name: 'Tarix',
            icon: '📚',
            grades: [5, 6, 7, 8, 9, 10, 11], // Faqat 5-11 sinflar uchun
            enabled: true
        }
    },
    
    // UI sozlamalari
    UI: {
        THEME: 'default', // 'default', 'dark', 'light'
        LANGUAGE: 'uz', // 'uz', 'en', 'ru'
        ANIMATIONS: true,
        SOUND_EFFECTS: false
    },
    
    // Ma'lumotlarni saqlash sozlamalari
    STORAGE: {
        TYPE: 'localStorage', // 'localStorage', 'sessionStorage', 'firebase', 'api'
        AUTO_SAVE: true,
        SAVE_HISTORY: true,
        MAX_HISTORY_ITEMS: 50
    },
    
    // Xavfsizlik sozlamalari
    SECURITY: {
        PREVENT_TAB_SWITCH: true,
        PREVENT_COPY_PASTE: true,
        PREVENT_RIGHT_CLICK: false,
        SESSION_TIMEOUT_MINUTES: 60
    },
    
    // Debug sozlamalari
    DEBUG: {
        ENABLED: false, // Production da false qiling
        LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
        SHOW_CORRECT_ANSWERS: false // Faqat development uchun
    }
};

// Konfiguratsiyani eksport qilish
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

// Konfiguratsiyani tekshirish funksiyasi
function validateConfig() {
    const errors = [];
    
    // Google Client ID tekshirish
    if (!CONFIG.GOOGLE.CLIENT_ID || CONFIG.GOOGLE.CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
        errors.push('Google Client ID sozlanmagan');
    }
    
    // AI API key tekshirish (ixtiyoriy)
    if (CONFIG.AI.PROVIDER !== 'local' && (!CONFIG.AI.API_KEY || CONFIG.AI.API_KEY === 'YOUR_AI_API_KEY')) {
        console.warn('AI API key sozlanmagan. Fallback savollar ishlatiladi.');
    }
    
    // Test sozlamalari tekshirish
    if (CONFIG.TEST.DURATION_MINUTES <= 0) {
        errors.push('Test davomiyligi 0 dan katta bo\'lishi kerak');
    }
    
    if (CONFIG.TEST.QUESTIONS_COUNT <= 0) {
        errors.push('Savollar soni 0 dan katta bo\'lishi kerak');
    }
    
    if (errors.length > 0) {
        console.error('Konfiguratsiya xatolari:', errors);
        return false;
    }
    
    return true;
}

// Konfiguratsiyani yuklash funksiyasi
function loadConfig() {
    try {
        // LocalStorage dan foydalanuvchi sozlamalarini yuklash
        const userConfig = localStorage.getItem('userConfig');
        if (userConfig) {
            const parsed = JSON.parse(userConfig);
            // Foydalanuvchi sozlamalarini asosiy konfiguratsiya bilan birlashtirish
            Object.assign(CONFIG.UI, parsed.UI || {});
            Object.assign(CONFIG.TEST, parsed.TEST || {});
        }
    } catch (error) {
        console.warn('Foydalanuvchi sozlamalarini yuklashda xatolik:', error);
    }
}

// Foydalanuvchi sozlamalarini saqlash funksiyasi
function saveUserConfig() {
    try {
        const userConfig = {
            UI: CONFIG.UI,
            TEST: {
                DURATION_MINUTES: CONFIG.TEST.DURATION_MINUTES,
                WARNING_TIME_MINUTES: CONFIG.TEST.WARNING_TIME_MINUTES
            }
        };
        localStorage.setItem('userConfig', JSON.stringify(userConfig));
    } catch (error) {
        console.warn('Foydalanuvchi sozlamalarini saqlashda xatolik:', error);
    }
}

// Konfiguratsiyani avtomatik yuklash
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        loadConfig();
        if (!validateConfig()) {
            alert('Konfiguratsiya xatolari mavjud. Console ni tekshiring.');
        }
    });
}
