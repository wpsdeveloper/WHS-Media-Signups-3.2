# Development & Setup Guide

This guide provides step-by-step instructions for IT administrators and developers setting up the local environment and deployment pipeline for the WHS Intervention & Media Center application.

## Prerequisites & Requirements
- **Node.js**: Version **v18.x** or higher recommended (matching modern Vite and TypeScript toolchains).
- **npm**: Version 9.x or higher.
- **Google Account & Clasp**: Access to the authorized Google Workspace account and Google Apps Script CLI (`@google/clasp`).

---

## Local Environment Setup

1. **Clone the repository** (if not already local):
   ```bash
   git clone https://github.com/wpsdeveloper/WHS-Media-Signups-3.2
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

---

## Google Apps Script & Clasp Authentication

To push code changes to the Google Apps Script project:

1. **Get Access to the Apps Script file**:
   You must have edit access to the App Script file stored in the Google Drive.

2. **Login with Google via Clasp**:
   ```bash
   npx clasp login
   ```
   *Follow the browser authentication prompt to log in with your authorized Google Workspace credentials.*

3. **Understand `.clasp.json`**:
   The `.clasp.json` file in the root directory links your local workspace to the cloud Google Apps Script project:
   ```json
   {
     "scriptId": "1LoW9U2OGsG_aI0fQ8OoZbu8FHdjR8bNBPLAudCYvK9b4nAVle0Z58xHJ",
     "rootDir": "dist"
   }
   ```
   > **Note for IT / New Deployments**: If you clone this project to a brand-new Google Cloud / Apps Script project, create a new script in Google Drive, copy its Script ID, and update `"scriptId"` in `.clasp.json` accordingly.

---

## Build and Deploy Pipeline

- **Development Server (Vite HMR preview)**:
  ```bash
  npm run dev
  ```
  Runs the local preview server on port `3000`.

- **Production Build**:
  ```bash
  npm run build
  ```
  Bundles the frontend (Vite single-file/static build) and compiles server TypeScript (`tsconfig.server.json`) into the `dist/` directory.

- **Deploy to Google Apps Script (Push)**:
  ```bash
  npm run push
  ```
  Runs `npm run build` and automatically uploads the compiled code to Google Apps Script via `clasp push`.

- **Testing**:
  ```bash
  npm run test
  ```
  Executes test suites using Vitest.
