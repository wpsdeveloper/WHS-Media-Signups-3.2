"use strict";
/**
 * @file utilities.ts
 * @description Provides common server-side utility functions for date comparisons, active date windows, script URL resolution, active user email retrieval, safe JSON parsing, and signup hydration.
 */
/**
 * Determines if two Date objects are the same date, regardless of time-of-day.
 *
 * @param date1 - The first date to compare.
 * @param date2 - The second date to compare.
 * @returns True if both dates fall on the same calendar day, month, and year.
 */
const isSameDate = (date1, date2) => {
    const monthMatch = date1.getMonth() === date2.getMonth();
    const yearMatch = date1.getFullYear() === date2.getFullYear();
    const dateMatch = date1.getDate() === date2.getDate();
    return monthMatch && yearMatch && dateMatch;
};
/**
 * Calculates a start and end date window based on the current date, looking into the past and future.
 *
 * @param weeksPast - The number of weeks in the past to start the window (defaults to 2).
 * @param weeksFuture - The number of weeks in the future to end the window (defaults to 2).
 * @returns An object containing the start and end dates of the active window.
 */
function getActiveDateWindow(weeksPast = 2, weeksFuture = 2) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (weeksPast * 7), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (weeksFuture * 7), 23, 59, 59, 999);
    return { start, end };
}
/**
 * Formats a Date into a string with MM/DD/YYYY format.
 *
 * @param date - The date object to format.
 * @returns Formatted date string.
 */
function formatDateSlashes(date) {
    return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
}
/**
 * Returns the URL to the published script/webpage.
 *
 * @returns The service URL string.
 */
function getScriptUrl() {
    return ScriptApp.getService().getUrl();
}
/**
 * Returns the email address of the currently signed in user.
 * Note: User must be signed into Chrome, and this only works for users within the domain.
 *
 * @returns The user's email address.
 */
function getEmail() {
    if (!email)
        email = Session.getActiveUser().getEmail();
    return email;
}
/**
 * Safely parses a JSON string into an object, falling back to a default value on error.
 *
 * @param data - The JSON string to parse.
 * @param fallback - The fallback value to return if parsing fails (defaults to an empty array).
 * @returns The parsed object or the fallback value.
 */
const safeJsonParse = (data, fallback = []) => {
    if (data === null || data === undefined)
        return fallback;
    if (typeof data !== 'string')
        return data;
    try {
        return JSON.parse(data) || fallback;
    }
    catch (error) {
        console.error("Failed to parse JSON string:", error);
        return fallback;
    }
};
/**
 * Hydrates a raw signup object (e.g., from an RPC call or parsing) into a proper Signup object
 * by converting date strings back into Date objects and ensuring correct types.
 *
 * @param rawData - The raw signup data.
 * @returns A hydrated Signup object with correct Date properties.
 */
function hydrateSignup(rawData) {
    return {
        ...rawData,
        date: new Date(rawData.date),
        timestamp: new Date(rawData.timestamp),
        period: String(rawData.period),
    };
}
