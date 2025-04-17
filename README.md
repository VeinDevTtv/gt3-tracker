# Porsche GT3 Savings Tracker

![Porsche GT3 Savings Tracker](gt3-tracker-demo.png)

A React application designed to track your savings progress toward purchasing your dream Porsche GT3.

## 🚀 Recent Updates

- **Authentication System**: Added a complete authentication system with login, signup, password reset, and profile management.
- **User Profiles**: Users can now create profiles, update their username, and add profile pictures.
- **Theme Enhancements**: Improved theme system with better color variables and selector classes.
- **AI Assistant**: Added support for Ollama in addition to OpenAI for the AI Assistant feature.
- **PDF Reports**: Generate detailed PDF reports of your savings progress.
- **Social Media Sharing**: Share your progress on social media with beautiful, customized images.
- **Settings Enhancement**: Added a more secure data reset confirmation that requires typing "CONFIRM".

## Features
- **User Authentication:** Secure signup, login, and profile management system.
- **Customizable Goal Settings:** Set your target amount, goal name, and weekly savings target.
- **Weekly Profit Tracking:** Record your weekly earnings toward your goal.
- **Progress Visualization:** View your progress with a responsive progress bar and interactive chart.
- **Advanced Statistics:** Access detailed insights including:
  - Total saved
  - Amount remaining
  - Current week
  - Weeks remaining
  - Weekly target average
  - Predicted completion date
- **Enhanced Chart Options:** Visualize your data with multiple chart types:
  - Line charts for trend visualization
  - Bar charts for weekly comparison
  - Area charts for visual impact
  - Combined charts with trend analysis
  - Moving averages and trend lines
- **Community Leaderboard:** Securely and anonymously compare your savings progress with other GT3 enthusiasts:
  - 100% secure and private
  - No personal information shared
  - Strict opt-in only policy
  - See your rank among other savers
  - Compare weekly averages and total savings
- **Data Management:** Save progress locally with options to reset or export data.
- **Theme Selection:** Choose between light, dark, and various accent color themes to customize your experience.
- **PDF Reports:** Generate detailed PDF reports of your savings progress.
- **Social Media Sharing:** Create and share screenshots of your progress on social media.
- **Confetti Celebration:** Enjoy a confetti animation when adding a profitable week.
- **Toast Notifications:** Receive feedback through elegant toast notifications.
- **Responsive Design:** Optimized for both desktop and mobile devices.
- **AI Assistant:** Get help with using the app or planning your savings strategy.

## 🤖 AI Assistant Setup

The GT3 Tracker includes an AI assistant to help you with your savings journey. This assistant can provide advice, answer questions about the application, and help you stay motivated.

### OpenAI Integration
To use the OpenAI-powered assistant:

1. Get an API key from [OpenAI](https://platform.openai.com/account/api-keys)
2. Enter the API key in the assistant's settings panel
3. Choose your preferred model (GPT-4 recommended for best results)

### Ollama Integration
For users who prefer a local, privacy-focused approach, the GT3 Tracker now supports Ollama:

1. Install [Ollama](https://ollama.ai/) on your local machine
2. Run the Ollama server (typically runs on http://localhost:11434)
3. Select "Ollama" as your AI provider in the assistant's settings
4. Choose from available models like Llama 3, Mistral, or other compatible models

The AI Assistant can help with:
- Setting realistic savings goals
- Analyzing your savings patterns
- Suggesting strategies to increase your weekly savings
- Providing motivation during your savings journey

## 🔐 Authentication

GT3 Tracker now includes a complete authentication system for a more personalized experience:

- **User Accounts**: Create and manage your personal account
- **Profile Management**: Customize your profile with a username and profile picture
- **Secure Storage**: Your savings data is now linked to your account
- **Privacy**: Data is stored locally in your browser

Note: While the authentication system provides a personalized experience, all data is still stored locally in your browser for privacy. This is a simulation of a full authentication system for demonstration purposes.

## Technical Implementation
The application is built using:
- React with React Router for navigation
- Context API for state management
- TailwindCSS for styling
- Recharts for data visualization
- HTML2PDF for PDF report generation
- HTML2Canvas for image sharing
- Local Storage for data persistence and user authentication
- React Hot Toast for notifications

## Authentication System
The app includes a secure authentication system:

### Features
- User registration with username, email, and password
- Secure login with remember me functionality
- Password reset flow
- User profile management
- Protected routes for authenticated users
- Mobile-responsive navigation with user menu

### Implementation
- Uses React Context API for global auth state
- Securely stores user data in localStorage with encryption
- Implements form validation for all auth forms
- Provides clear error feedback to users
- Includes "remember me" functionality for persistent sessions

## Installation and Usage
```bash
# Clone the repository
git clone https://github.com/YourUsername/gt3-tracker.git

# Navigate to the project directory
cd gt3-tracker

# Install dependencies
npm install

# Start the development server
npm start

# Build for production
npm run build
```

## Potential Future Enhancements
- More comprehensive statistics
- Multiple goal tracking
- Sharing goals with friends
- Mobile app version
- Import/export functionality
- Cloud synchronization
- Historical data comparison
- Goal revision history
- AI-powered savings recommendations
- Full backend implementation with real database

## License
This project is licensed under the MIT License - see the LICENSE file for details.
