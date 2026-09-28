# WHS Intervention & Media Center 3.0

## Executive Summary
The **WHS Intervention & Media Center 3.0** application is a comprehensive web-based management system built for Walpole High School (WHS) to streamline student academic interventions, library/media center reservations, glass room bookings, attendance tracking, and administrative audits.

## Key Features
- **Student Sign-Up Portal**: Allows students or staff to book intervention periods, academic support, assessments, NHS tutoring, alt settings, and media center study sessions with real-time capacity validation and conflict checks.
- **Attendance & Check-in Tracker**: Provides staff and administrators with live attendance monitoring, timestamp logging (study-in, media-in, media-out, study-out), glass room reservation status tracking (Rooms 1 & 2), and sortable student lists.
- **Admin Audit & Settings Dashboard**: Enables administrators and data editors to search student sign-up histories across active and archived periods, configure app settings, and adjust scheduling parameters.
- **Google Apps Script Backend**: Integrates natively with Google Sheets (signups, student roster, recent schedules, app settings), Google Calendar (daily rotation schedule syncing), and Google Workspace Admin Directory.

## High-Level Architecture
- **Frontend**: Single-Page Application (SPA) powered by Vite, TypeScript, Bootstrap 5, and custom modular vanilla TypeScript stores (pub/sub pattern).
- **Backend**: Google Apps Script (GAS) server-side services handling database queries (`SpreadsheetApp`), calendar synchronization (`CalendarApp`), mailing (`GmailApp`), and Directory lookups (`AdminDirectory`).
- **Deployment Bridge**: Google Apps Script CLI (`clasp`) compiles TypeScript frontends and server scripts into Google-compatible `.js`/`.gs`/`.html` artifacts and pushes them to the bound Google Apps Script project.

## Deployment & Environment
- **Deployed Google Workspace Account / Script ID**: Bound to the Google Apps Script project specified in `.clasp.json` (`1LoW9U2OGsG_aI0fQ8OoZbu8FHdjR8bNBPLAudCYvK9b4nAVle0Z58xHJ`).
- **Database**: Google Sheets instance acting as the backing relational store (`SPREADSHEET_ID`).
