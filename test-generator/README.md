# 🎓 AI Test Generator - O'quvchilar uchun

AI-powered test generator for school students in Uzbek language (Latin alphabet). This application creates personalized tests for different subjects and grade levels using artificial intelligence.

## ✨ Features

- **Multi-language Support**: Full Uzbek language interface (Latin alphabet)
- **Grade-based Testing**: Supports grades 1-11 with appropriate difficulty levels
- **Subject Selection**: Mathematics, English, and History (History only for grades 5+)
- **AI-powered Questions**: Real-time question generation using OpenAI GPT
- **Google Authentication**: Secure sign-in with Google OAuth
- **Timer System**: 10-minute countdown timer for tests
- **Detailed Results**: Comprehensive score breakdown and question analysis
- **Responsive Design**: Works perfectly on both mobile and desktop devices
- **Local Storage**: Saves user preferences and progress

## 🚀 Quick Start

### Prerequisites

- Node.js (version 16 or higher)
- Google Cloud Console account (for Google OAuth)
- OpenAI API account (for AI question generation)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd test-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id_here
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   ```

4. **Configure Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add your domain to authorized origins
   - Copy the Client ID to your `.env` file

5. **Configure OpenAI API**
   - Go to [OpenAI Platform](https://platform.openai.com/)
   - Create an API key
   - Copy the API key to your `.env` file

6. **Update HTML file**
   Replace `YOUR_GOOGLE_CLIENT_ID` in `index.html` with your actual Google Client ID:
   ```html
   <div id="g_id_onload"
        data-client_id="your_actual_google_client_id"
        ...>
   ```

7. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

8. **Open the application**
   Navigate to `http://localhost:3000` in your browser

## 📱 How to Use

1. **Enter Your Name**: Start by entering your name on the welcome screen
2. **Sign In**: Authenticate using your Google account
3. **Select Grade**: Choose your grade level (1-11)
4. **Choose Subject**: Pick from Mathematics, English, or History
5. **Take the Test**: Answer 10 AI-generated questions within 10 minutes
6. **View Results**: See your score and detailed breakdown

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/google` - Verify Google OAuth token

### Question Generation
- `POST /api/generate-questions` - Generate AI-powered test questions
  ```json
  {
    "subject": "matematika|ingliz|tarix",
    "grade": 1-11,
    "count": 10
  }
  ```

### Health Check
- `GET /api/health` - Server health status

## 🎨 Customization

### Adding New Subjects
1. Update the subject selection in `index.html`
2. Add question generation logic in `server.js`
3. Update the frontend JavaScript in `script.js`

### Modifying Question Types
Edit the `generateQuestionsWithAI` function in `server.js` to customize:
- Question difficulty
- Question formats
- Subject-specific content

### Styling Changes
Modify `style.css` to customize:
- Colors and themes
- Layout and spacing
- Responsive breakpoints

## 🔧 Configuration

### Environment Variables
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `OPENAI_API_KEY`: Your OpenAI API key
- `PORT`: Server port (default: 3000)

### Google OAuth Setup
1. Create project in Google Cloud Console
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Configure authorized origins and redirect URIs

### OpenAI Setup
1. Create account at OpenAI Platform
2. Generate API key
3. Set up billing (required for API usage)

## 📊 Question Generation

The app uses OpenAI's GPT-3.5-turbo model to generate questions in Uzbek language. If AI generation fails, it falls back to a predefined question bank.

### Question Format
```json
{
  "question": "Question text in Uzbek",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct": 0
}
```

## 🌐 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check that all environment variables are set correctly
2. Ensure Google OAuth is configured properly
3. Verify OpenAI API key is valid and has credits
4. Check the console for error messages

## 🔮 Future Enhancements

- [ ] Database integration for user progress tracking
- [ ] More subjects (Physics, Chemistry, Biology)
- [ ] Difficulty level selection
- [ ] Question categories and tags
- [ ] Teacher dashboard for creating custom tests
- [ ] Student progress analytics
- [ ] Offline mode support
- [ ] Multi-language support (Cyrillic Uzbek, Russian)

## 📞 Contact

For questions or support, please contact:
- Email: [your-email@example.com]
- GitHub: [your-github-username]

---

Made with ❤️ for Uzbek students
