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

---

## Making Updates to the App
> **Do not** edit the files in the GAS IDE. Changes to the app should be made by cloning the repository and editing the code as below. If you edit directly, those changes will be erased next time the repo is updated and pushed to the server.

1. **Edit the code**
  Edit the server or client code to fix the bugs or add the features you want.

2. **Edit locally**
   a. Edit src/client/common/sample-data.ts to add data that can test your changes
   b. Edit src/client/main.ts to force the local test view to either "signup", "attendance", or "admin"
   ```ts
   const view = (pageParam && ['signup', 'attendance', 'admin'].includes(pageParam))
    ? pageParam
    // set to 'signup', 'attendance', or 'admin' to force local debug view
    : (IS_DEBUG ? 'signup' : appConfig.view); 
   ```

3. **Test locally**
   a. In the terminal, serve the local instance in dev mode
   ```bash
   npm run dev
   ```
   b. In a browser, navigate to https://localhost:3000 and test the app with mock data (data does not save)

4. **Test on server** 
   a. In terminal, build and push compiled app to Google Apps Script
   ```bash
   npm run push
   ```
   b. Visit the apps script in the online Google Apps Script IDE
   c. Select Deploy > Test deployments 
   d. Under Web app, click the URL. Test the dev version of your code

   >**NOTE**: This version of the code is only available for testing. Users are still using the old version.
   >**ALSO NOTE**: Testing like this DOES use live data and stores data to storage for all users to see.

5. **Deploy to production**
   a. Visit the apps script in the online Google Apps Script IDE
   b. Select Deploy > Manage deployments 
   c. Hit the edit icon. Change the version to "New version"
   d. Click Deploy

---

# App Structure
This app is a Google Apps Script webapp. The page is not served as a traditional webserver, but via Google Apps Scripts HTMLService. This allows for the development serving of the page without the need for a separate web host server.

The data for the app is stored in a Google Apps Sheet file. The signup data, settings, and other information are stored in separate sheets, and old signup data is archived into a separate sheet to reduce processing time when looking at current data.

## Page Serving
When a user browses to the app's URL, the page is served from Google Apps Script:
1. Google Apps Script calls the doGet(function) [found in server/page-server.gs in GAS and in src/server/page-server.ts in the repo]. This function runs permissions checks, gathers initial data, parses the compiled HTML file, and serves it to the user.
2. The served page contains all HTML, CSS, and JS within the page.
3. All UI code is controlled via the Javascript client code. If the webapp needs to request or save additional data (ie. submit the form, search for a student, update attendance checkins), it runs a special google.script.run() function to call or put data. GAS server code responds to those functions and returns data as appropriate.

## Directory Structure
Source code is stored in the src folder and the repo directory structure mimics the Page Serving process. 

### Source code
#### Server source code
Code that runs on the server (e.g. ```doGet()``` and spreadsheet data storage and retrieval) are in src/server. Because these files will be run on the Google Apps Script server they are configured a little differently: 
- All ```.ts``` files in this folder share a global scope. If a function or constant is declared in a file in ```src/server``, it is accessible from any other file within that folder. 

#### Client source code
Client-side code (code that runs on the user's browser) are in ```src/client```. The primary entrypoint to the app are ```index.html``` and ```main.ts```.

Client files are further separated into the folders ```/signup```, ```/attendance```, ```/admin```, ```/common```, and ```/css``` for organization.

### Production code
Source code must be compiled in order to be uploaded to and served by the GAS server. Source code files written in Typescript (``.ts`` files) are compiled into Javascript files in different ways, depending on whether they are server or client files.

Compiled production code is placed in the ```dist``` folder before uploading to GAS.

#### Server production code
All ```.ts``` files in ```src/server``` are compiled into Javascript, renamed as ```.gs``` files, and placed in ```dist/server```.
1. All server ```.gs``` files share a global scope. If a function or constant is declared i the file's root, it is accessible from any other file with the App Script. This is why there are funny typescript.server.json rules to account for global scope.
2. In order to reduce duplication, server files also reference any types saved in ```src/shared``` during compiling. Note that, since files in ```src/shared``` are only type declarations, they are only needed during the compiling process and need not be uploaded to the server.
2. Server files get compiled from Typescript to Javascript but otherwise do not get compressed. After upload to GAS, you will see these files in the GAS IDE file list. (see *Compile/Build and Push Process* below)

#### Client production code
Because the app is served via Google Apps Script, it is not served like a traditional web server that might have files in a directory. That is, inline code like ```  <link rel="stylesheet" href="./css/common-styles.css" />``` does not get served properly, because there is no actual files on a web server. All code is stored in the GAS system, and any client code mut be served via GAS's HTMLService.

In order to develop the app with Typescript in a modern IDE, all client production code must be rolled up into a single, complete ```ui/index.html``` file that contains all Javascript and CSS embedded in it. This is done by Vite during the compiling process (see *Compile/Build and Push Process* below).

## Compile/Build and Push Process
When running ```npm run build``` or ```npm run push```:
1. Vite's Typescript compiler checks all code for errors.
2. Vite's Typescript compiler converts all ```src/server/*.ts``` files into ```dist/server/*.gs``` Javascript files.
1. Vite's Typescript compiler converts all ```src/client/**/*.ts``` files into Javascript code.
2. Vite minifies all client Javascript, CSS, and HTML files, packs them all together, and inserts them into ```dist/ui/index.html```.
3. If pushing, Clasp uploads the ```dist``` folder to the GAS server.

---

# App Logic
There are three "pages" to the app: Signup, Attendance, and Admin. These pages actually a single page behind the scenes; the user sees the appropriate page via URL parameters:

| URL | Page displayed |
| ---- | ---- |
| https://scriptURL | Signup form (default) |
| https://scriptURL?page=signup                 | Signup form |
| https://scriptURL?page=attendance             | Attendance view |
| https://scriptURL?page=attendance             | Admin view |
| https://scriptURL?page=signup&id=someIdNumber | Signup form (updating a record) |

## Signup
Signup data is stored in a Google Sheets sheet. When the Signup form is served, the server must gather and download several sets of data so the form can display the correct options in the form. These data sets include:
- Recent and upcoming signup reservations
- Daily rotation schedule
- School-year calendar (scraped from Google Calendar)
- Study Hall duty rosters (scraped from the WHS shared spreadsheet)
- Interventions duty rosters (scraped from the WHS shared spreadsheet)

When a student or teacher fills out the form, the options respond to the date, period, and type of signup selected. It displays whether Glass Rooms are available.

## Attendance
The Attendance page is the teacher view, to monitor which students are signed up and when they check in/out of study hall and the media center. The data is actually just the signup data is stored in the Google Sheets sheet. 

When a teacher clicks one of the Check In buttons, the signup row is updated with the time indicated. 

Admin users can also edit the details of a row. Clicking the Edit icon bring the user to a pre-populated version of the Signup page, adapted for editing rather than new submissions.

## Admin
The Admin page is a view with two purposes: to collect historical signup data on a student; and to set the app settings. 

App settings are also stored in the Google Spreadsheet.

## Common app flow/logic

### Init
Upon loading, ```main.ts``` imports the ```[page]/init.ts``` module and populates the page. This includes:
- parsing the data sent from the server and placing it in the Store
- initializing all page components and event listeners

### Store
All page data, including downloaded server data and "currentState" data (e.g which date is selected) is stored in the [Page]Store (ie. ```SignupStore```, ```AttendanceStore```, or ```AdminStore```), which are instances of the ```/common/store.ts``` module. These store holds the data for access by components uses a pub/sub model:
- when data is updated, it is saved in the store
- the store then notifies any components listening for changes to that data

### HTML
Each page gets its own separate HTML file for ease of maintenance. These files are rolled up into a single file upon compiling.

### CSS
There is currently only one CSS file for the entire app, since so many components are shared between multiple pages. This CSS file determines much of the styling on the pages
#### Bootstrap
The pages use of Bootstrap 5.3 for visibility, formatting, and modal and toast messages.
#### FontAwesome
The pages use free icons from FontAwesome for minor visual UI enhancements.

