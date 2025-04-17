# Porsche GT3 Savings Tracker

A React application to track your savings progress towards purchasing a Porsche GT3.

![Porsche GT3](https://files.porsche.com/filestore/image/multimedia/none/992-gt3-modelimage-sideshot/model/765dfc51-51bc-11eb-80d1-005056bbdc38/porsche-model.png)

## Overview

This application helps you track your weekly savings toward a Porsche GT3. It visually represents your progress with charts and indicators, making it easier to stay motivated and on track with your savings goal.

## Features

- **Target Setting**: Set your savings target for the Porsche GT3
- **Weekly Profit Tracking**: Input your weekly savings/profits
- **Progress Visualization**: 
  - Visual progress bar showing percentage toward goal with animation
  - Interactive chart showing weekly and cumulative savings
  - Dynamic weekly target calculation to reach your goal
- **Data Analysis**:
  - Automatically calculates remaining amount
  - Shows weekly average needed to reach target
  - Predicts goal achievement date based on current pace
- **Customization**:
  - Adjust total number of weeks in your tracking period
  - Adjust visible weeks in the interface
  - Toggle between cumulative and weekly chart views
- **Enhanced Experience**:
  - Auto-save to local storage so your data persists
  - Confirmation dialog when resetting data
  - Tooltips for weekly targets
  - Celebration animations when hitting milestones
  - Dark/Light theme toggle
  - Export data as CSV for backup
  - Responsive design for all devices

## Technical Implementation

The application is built using:

- React 18 with hooks and memoization for performance
- TailwindCSS for styling with dark mode support
- Recharts for data visualization
- Custom UI components (Card, Button, Input, Dialog, etc.)
- Local storage for data persistence
- Canvas confetti for celebration animations

## How to Use

1. Set your target amount for the Porsche GT3
2. Customize the total number of weeks for your tracking period
3. Input your weekly savings/profits
4. Track your progress with the visual charts and indicators
5. Export your data as CSV for backup if needed
6. Toggle between dark and light themes
7. Watch confetti celebrations when you hit milestones!

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

## About

This Porsche GT3 Tracker was developed by Abdelkarim to help track savings progress toward purchasing a Porsche GT3, making the journey toward this dream car more manageable and motivating.

## License

This project is for personal use.
