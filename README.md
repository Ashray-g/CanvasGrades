# Canvas Grades App

This application allows users to view their Canvas grades. 
#### *Created with the help of Cursor + Claude 3.5 


## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- git

### How to install Node.js + npm
To install Node.js and npm, follow these steps:

1. Visit the official Node.js website: https://nodejs.org/

2. Download the LTS (Long Term Support) version for your operating system.

3. Run the installer and follow the installation wizard.

4. To verify the installation, open a terminal or command prompt and run:
   ```
   node --version
   npm --version
   ```

   These commands should display the installed versions of Node.js and npm.

Note: npm is included with Node.js, so you don't need to install it separately.

For more detailed instructions or alternative installation methods, refer to the official Node.js documentation: https://nodejs.org/en/download/


## Setup
Run these commands in terminal:

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/CanvasGrades.git
   ```

2. Enter folder
   ```
   cd CanvasGrades
   ```

3. Install dependencies:
   ```
   npm run setup
   ```

4. Start the application:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Note

Make sure to use your own Canvas API token when logging in to the application. This is found in `Account > Settings > + New Access Token > Generate Token`

To quit the application, hit `Control + C` in the terminal window (app will stay running otherwise)