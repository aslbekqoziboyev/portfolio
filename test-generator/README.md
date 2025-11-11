# 🎓 AI Test Generator - Uzbek

Maktab o'quvchilari uchun AI yordamida test yaratuvchi veb-ilova. Bu ilova o'zbek tilida (lotin alifbosida) yozilgan va Google Sign-In hamda AI-powered savol generatsiyasini qo'llab-quvvatlaydi.

## ✨ Xususiyatlar

- **O'zbek tilida interfeys** - Barcha matnlar va tugmalar o'zbek tilida
- **Google Sign-In integratsiyasi** - Haqiqiy Google autentifikatsiyasi
- **AI-powered savol generatsiyasi** - Har bir fan va sinf uchun maxsus savollar
- **3 ta fan** - Ingliz tili, Matematika, Tarix (5-11 sinflar uchun)
- **11 ta sinf darajasi** - 1-sinfdan 11-sinfgacha
- **10 daqiqalik timer** - Vaqt cheklovi bilan test
- **Batafsil natijalar** - To'g'ri/noto'g'ri javoblar tahlili
- **Responsive dizayn** - Mobil va desktop uchun moslashtirilgan
- **LocalStorage** - Ma'lumotlarni saqlash

## 🚀 O'rnatish va sozlash

### 1. Fayllarni yuklab oling

```bash
git clone <repository-url>
cd test-generator
```

### 2. Google Sign-In sozlash

1. [Google Cloud Console](https://console.cloud.google.com/) ga kiring
2. Yangi loyiha yarating yoki mavjudini tanlang
3. "APIs & Services" > "Credentials" ga o'ting
4. "Create Credentials" > "OAuth 2.0 Client IDs" ni tanlang
5. Application type: "Web application"
6. Authorized JavaScript origins: `http://localhost:3000` (yoki sizning domeningiz)
7. Client ID ni nusxalang

### 3. Konfiguratsiya

`script.js` faylida quyidagi o'zgaruvchilarni o'zgartiring:

```javascript
const GOOGLE_CLIENT_ID = 'YOUR_ACTUAL_GOOGLE_CLIENT_ID'; // Google Client ID ni kiriting
const AI_API_KEY = 'YOUR_AI_API_KEY'; // AI API kalitini kiriting (ixtiyoriy)
```

`index.html` faylida ham Client ID ni yangilang:

```html
<div id="g_id_onload"
     data-client_id="YOUR_ACTUAL_GOOGLE_CLIENT_ID"
     ...>
</div>
```

### 4. AI integratsiyasi (ixtiyoriy)

Haqiqiy AI savollar uchun `script.js` faylida `generateAIQuestions` funksiyasini o'zgartiring:

```javascript
async function generateAIQuestions(subject, grade) {
    const prompt = createPromptForSubject(subject, grade);
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 2000
            })
        });
        
        const data = await response.json();
        return parseAIResponse(data.choices[0].message.content);
    } catch (error) {
        console.error('AI API error:', error);
        return generateAdvancedQuestions(subject, grade);
    }
}
```

### 5. Ishga tushirish

Oddiy HTTP server ishga tushiring:

```bash
# Python bilan
python -m http.server 3000

# Node.js bilan
npx http-server -p 3000

# PHP bilan
php -S localhost:3000
```

Brauzerda `http://localhost:3000` ga o'ting.

## 📱 Foydalanish

1. **Ism kiriting** - O'z ismingizni kiriting
2. **Google bilan kiring** - Google akkauntingiz bilan autentifikatsiya qiling
3. **Sinfni tanlang** - 1-11 sinflar orasidan tanlang
4. **Fanni tanlang** - Ingliz tili, Matematika yoki Tarix (5+ sinflar uchun)
5. **Test yechish** - 10 ta savol, 10 daqiqa vaqt
6. **Natijalarni ko'rish** - Batafsil tahlil va ball

## 🏗️ Arxitektura

### Fayllar tuzilishi

```
test-generator/
├── index.html          # Asosiy HTML fayl
├── styles.css          # CSS stillari
├── script.js           # JavaScript mantiq
└── README.md          # Hujjatlar
```

### Texnologiyalar

- **HTML5** - Semantik markup
- **CSS3** - Modern stillar, Grid, Flexbox
- **Vanilla JavaScript** - ES6+ xususiyatlari
- **Google Sign-In API** - Autentifikatsiya
- **LocalStorage** - Ma'lumotlarni saqlash

### Ekranlar

1. **Welcome Screen** - Ism kiritish
2. **Sign-In Screen** - Google autentifikatsiyasi
3. **Grade Screen** - Sinf tanlash
4. **Subject Screen** - Fan tanlash
5. **Loading Screen** - AI savollar yaratish
6. **Test Screen** - Savollarga javob berish
7. **Results Screen** - Natijalar va tahlil

## 🎨 Dizayn xususiyatlari

- **Rangli va zamonaviy** - Gradient fonlar, yumshoq soyalar
- **Responsive** - Barcha qurilmalar uchun moslashtirilgan
- **Accessibility** - Screen reader va keyboard navigation
- **Smooth animations** - CSS transitions va keyframes
- **Mobile-first** - Mobil qurilmalar uchun optimallashtirilgan

## 🔧 Kengaytirish imkoniyatlari

### Yangi fanlar qo'shish

`generateAdvancedQuestions` funksiyasida yangi fan qo'shing:

```javascript
const questionSets = {
    // ... mavjud fanlar
    fizika: {
        5: [
            {
                question: "Fizika savoli...",
                options: ["A", "B", "C", "D"],
                correct: 0
            }
            // ... boshqa savollar
        ]
    }
};
```

### AI provayderlarini o'zgartirish

- OpenAI GPT
- Google Gemini
- Anthropic Claude
- Local AI models

### Ma'lumotlar bazasi integratsiyasi

LocalStorage o'rniga:
- Firebase Firestore
- MongoDB
- PostgreSQL
- Supabase

## 🐛 Muammolarni hal qilish

### Google Sign-In ishlamayapti

1. Client ID to'g'ri kiritilganini tekshiring
2. Domain authorized origins ro'yxatida ekanini tekshiring
3. HTTPS ishlatayotganingizni tekshiring (production uchun)

### AI savollar yaratilmayapti

1. API kaliti to'g'ri ekanini tekshiring
2. Internet aloqasini tekshiring
3. Fallback savollar ishlatilayotganini tekshiring

### Timer ishlamayapti

1. JavaScript xatolari borligini tekshiring
2. Browser console da xatolarni ko'ring
3. `setInterval` qo'llab-quvvatlanishini tekshiring

## 📄 Litsenziya

MIT License - batafsil ma'lumot uchun LICENSE faylini ko'ring.

## 🤝 Hissa qo'shish

1. Repository ni fork qiling
2. Feature branch yarating
3. O'zgarishlarni commit qiling
4. Pull request yuboring

## 📞 Aloqa

Savollar yoki takliflar uchun issue yarating yoki email yuboring.

---

**Eslatma**: Bu demo versiya. Production muhitida qo'shimcha xavfsizlik choralari va optimizatsiya kerak bo'ladi.
