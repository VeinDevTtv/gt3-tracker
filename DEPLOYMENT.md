# Porsche GT3 Savings Tracker - Deployment Guide

This guide explains how to run the application locally and deploy it to GitHub Pages using the provided batch files.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later recommended)
- [Git](https://git-scm.com/) installed
- A [GitHub](https://github.com/) account if you want to deploy to GitHub Pages

## Scripts Included

This project includes two Windows batch files to simplify development and deployment:

1. `run-and-deploy.bat` - Main script for running the app locally and deploying to GitHub Pages
2. `configure-deployment.bat` - Sets up your package.json for GitHub Pages deployment

## Getting Started

### Running Locally

1. Navigate to the project directory in File Explorer
2. Double-click on `run-and-deploy.bat`
3. Choose option 1 from the menu to start the development server
4. The application will open in your default browser at http://localhost:3000

To stop the development server, press `Ctrl+C` in the terminal window and then type `Y` to confirm.

### Deploying to GitHub Pages

First, you need to configure the deployment:

1. Double-click on `configure-deployment.bat`
2. Enter your GitHub username when prompted
3. The script will update your package.json with the correct homepage URL

Then, deploy the application:

1. Double-click on `run-and-deploy.bat`
2. Choose option 4 to build and deploy to GitHub Pages
3. Wait for the build and deployment to complete
4. Your site will be available at https://yourusername.github.io/gt3-tracker

## Manual Setup (if needed)

If you prefer to set up deployment manually, you can:

1. Install the gh-pages package:
   ```
   npm install --save-dev gh-pages
   ```

2. Add the following to your package.json:
   ```json
   "homepage": "https://yourusername.github.io/gt3-tracker",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

3. Deploy by running:
   ```
   npm run deploy
   ```

## Troubleshooting

- If deployment fails, make sure you have Git configured with your GitHub credentials
- For "fatal: A branch named 'gh-pages' already exists" errors, try running `git branch -D gh-pages` first
- Check GitHub repository settings to ensure GitHub Pages is enabled for the gh-pages branch

## Other Deployment Options

This setup is configured for GitHub Pages, but you can also deploy to:

- Netlify
- Vercel
- Firebase Hosting
- AWS Amplify

Each service has its own deployment process. If you need to use a different service, refer to their documentation. 