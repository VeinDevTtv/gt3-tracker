# Porsche GT3 Savings Tracker

A React application to track your savings progress towards purchasing a Porsche GT3.

![Porsche GT3](https://files.porsche.com/filestore/image/multimedia/none/992-gt3-modelimage-sideshot/model/765dfc51-51bc-11eb-80d1-005056bbdc38/porsche-model.png)

## Recent Updates

The application has been enhanced with several major new features:

1. **AI Assistant**: Now supporting multiple providers:
   - OpenAI's API for GPT models
   - Microsoft Azure OpenAI API
   - Anthropic Claude API
   - Ollama for local AI model hosting

2. **Dedicated Settings Page**: All configuration options have been moved to a separate settings page, giving the main tracking interface a cleaner, more focused design.

## Overview

This application helps you track your weekly savings toward a Porsche GT3. It visually represents your progress with charts and indicators, making it easier to stay motivated and on track with your savings goal.

## Features

- **Customizable Goal Settings**:
  - Set your savings target amount
  - Customize the goal name (default is "Porsche GT3")
  - Set a start date for your savings journey
- **Weekly Profit Tracking**: 
  - Input your weekly savings/profits
  - Track consistent saving with streak counter
- **Progress Visualization**: 
  - Visual progress bar showing percentage toward goal with animation
  - Interactive chart showing weekly and cumulative savings
  - Toggle between cumulative and weekly chart views
- **Advanced Statistics**:
  - Total saved and remaining amount
  - Weekly target calculation to reach your goal
  - Current saving streak and best streak tracking
  - Goal prediction based on your current saving rate
- **AI Assistant**:
  - Ask questions about your savings progress
  - Get personalized advice based on your current stats
  - Receive encouragement and motivation from AI
  - Powered by OpenAI's GPT models
- **Dedicated Settings Page**:
  - All configuration options in one organized location
  - Clean, focused main interface for tracking
- **Customization**:
  - Adjust total number of weeks in your tracking period
  - Adjust visible weeks in the interface
  - Dark/Light theme toggle for comfortable viewing
- **Data Management**:
  - Auto-save to local storage so your data persists
  - Export data as CSV for spreadsheet analysis
  - Create JSON backups of your complete saving history
  - Import from JSON backups to restore your data
  - Reset data with confirmation dialog
- **Enhanced Experience**:
  - Confetti celebrations when hitting savings milestones
  - Toast notifications for important actions
  - Responsive design for all devices

## Technical Implementation

The application is built using:

- React 18 with hooks for state management
- React Router for page navigation
- TailwindCSS for styling with dark mode support
- Recharts for data visualization
- Canvas confetti for celebration animations
- OpenAI API for AI assistant functionality
- Local storage for data persistence

## How to Use

1. Set your target amount for the Porsche GT3
2. Customize the goal name if desired
3. Set your start date and adjust the total tracking period
4. Input your weekly savings/profits
5. Track your progress with the visual charts and statistics
6. Toggle between dark and light themes
7. Ask the AI Assistant for insights about your progress
8. Export your data as CSV or JSON for backup
9. Watch confetti celebrations when you hit milestones!

## AI Assistant Setup

The AI Assistant supports multiple providers:

### OpenAI
1. Create an account on [OpenAI](https://openai.com/)
2. Generate an API key in your OpenAI dashboard
3. Select OpenAI as your provider in the AI Assistant settings
4. Enter the API key when prompted
5. Choose your preferred model (e.g., gpt-4, gpt-3.5-turbo)

### Azure OpenAI
1. Set up Azure OpenAI service in your Azure account
2. Obtain your API key, endpoint, and deployment name
3. Select Azure OpenAI as your provider in the AI Assistant settings
4. Enter your Azure API details when prompted

### Anthropic Claude
1. Create an account on [Anthropic](https://www.anthropic.com/)
2. Generate an API key in your Anthropic dashboard
3. Select Anthropic as your provider in the AI Assistant settings
4. Enter the API key when prompted
5. Choose your preferred Claude model

### Ollama (Local AI)
1. Install [Ollama](https://ollama.ai/) on your computer
2. Pull your preferred model using Ollama CLI (e.g., `ollama pull llama3`)
3. Ensure the Ollama server is running (typically on http://localhost:11434)
4. Select Ollama as your provider in the AI Assistant settings
5. Enter the host URL (default: http://localhost:11434)
6. Specify which model to use (e.g., llama3, codellama, mistral)

Your API keys are stored locally on your device and never sent to our servers.

## Installation

```bash
# Clone the repository
git clone https://github.com/VeinDevTtv/gt3-tracker

# Navigate to the project directory
cd gt3-tracker

# Install dependencies
npm install

# Start the development server
npm start
```

## Build for Production

```bash
# Create a production build
npm run build

# The build files will be in the 'build' directory
```

## Future Enhancements

Potential future features:
- Multiple saving goals
- Sharable progress links
- Financial calculators (e.g., compound interest)
- Notifications for weekly deposits
- Mobile app version
- Additional AI capabilities and insights

## About

This Porsche GT3 Tracker was developed to help track savings progress toward purchasing a Porsche GT3, making the journey toward this dream car more manageable and motivating.

## License

This project is for personal use.
