# Porsche GT3 Savings Tracker

![Porsche GT3 Savings Tracker](gt3-tracker-demo.png)

A React application designed to track your savings progress toward purchasing your dream Porsche GT3.

## Recent Updates
- Added AI Assistant powered by OpenAI's API, Ollama, or other providers
- PDF report generation with shareable screenshots
- Dedicated settings page with theme options
- Social media sharing functionality
- Weekly profit tracking with graphical visualization

## Features
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
- **Data Management:** Save progress locally with options to reset or export data.
- **Theme Selection:** Choose between light, dark, and various accent color themes to customize your experience.
- **PDF Reports:** Generate detailed PDF reports of your savings progress.
- **Social Media Sharing:** Create and share screenshots of your progress on social media.
- **Confetti Celebration:** Enjoy a confetti animation when adding a profitable week.
- **Toast Notifications:** Receive feedback through elegant toast notifications.
- **Responsive Design:** Optimized for both desktop and mobile devices.
- **AI Assistant:** Get help with using the app or planning your savings strategy.

## Technical Implementation
The application is built using:
- React
- TailwindCSS
- Recharts for data visualization
- HTML2PDF for PDF report generation
- HTML2Canvas for image sharing
- Local Storage for data persistence

## AI Assistant Setup
The app includes an AI-powered assistant with support for multiple providers:

### OpenAI Configuration
1. Obtain an API key from OpenAI: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. In the app, navigate to the AI Assistant panel
3. Click on "Configure API Key"
4. Enter your OpenAI API key
5. Click "Save Key"

### Ollama Configuration (Local AI)
1. Download and install Ollama from [ollama.com](https://ollama.com)
2. Run Ollama after installation
3. Open a terminal/command prompt and pull a model: `ollama pull llama3`
4. In the app, navigate to the AI Assistant panel
5. Select "Ollama (Local AI)" as the provider
6. Configure the server address (default: http://localhost:11434)
7. Select your desired model (default: llama3)
8. Click "Save Settings"

### Other Providers
The app also supports Poe and Replicate as AI providers, with similar configuration steps.

## Installation and Usage
```bash
# Clone the repository
git clone https://github.com/your-username/gt3-tracker.git

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

## License
This project is licensed under the MIT License - see the LICENSE file for details.
