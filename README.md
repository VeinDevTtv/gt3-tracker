# Porsche GT3 Savings Tracker

A React application to track your savings progress towards purchasing a Porsche GT3.

![Porsche GT3](https://files.porsche.com/filestore/image/multimedia/none/992-gt3-modelimage-sideshot/model/765dfc51-51bc-11eb-80d1-005056bbdc38/porsche-model.png)

## Recent Updates

The application has been enhanced with two major new features:

1. **AI Assistant**: Using OpenAI's API, you can now ask questions about your savings progress and receive personalized insights, advice, and encouragement based on your current stats.

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

The AI Assistant requires an OpenAI API key to function:

1. Create an account on [OpenAI](https://openai.com/)
2. Generate an API key in your OpenAI dashboard
3. Enter the API key when prompted in the app
4. Your key is stored locally on your device and never sent to our servers

## Installation

```bash
# Clone the repository
git clone https://github.com/YourUsername/gt3-tracker

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
