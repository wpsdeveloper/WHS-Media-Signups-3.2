"use strict";
/**
 * Determines if two Date object are the same date, regardless of time-of-day
 */
const isSameDate = (date1, date2) => {
    const monthMatch = date1.getMonth() === date2.getMonth();
    const yearMatch = date1.getFullYear() === date2.getFullYear();
    const dateMatch = date1.getDate() === date2.getDate();
    return monthMatch && yearMatch && dateMatch;
};
/**
 * Formats a Date into MM/DD/YYYY
 */
function formatDateSlashes(date) {
    return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
}
/**
 * Returns the URL to the script/webpage
 */
function getScriptUrl() {
    return ScriptApp.getService().getUrl();
}
/**
 * Returns the email address of the currently signin user.
 * Note: user must be signed into Chrome, and this only works for users within the domain
 */
function getEmail() {
    if (!email)
        email = Session.getActiveUser().getEmail();
    return email;
}
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
function hydrateSignup(rawData) {
    return {
        ...rawData,
        date: new Date(rawData.date),
        timestamp: new Date(rawData.timestamp),
        period: String(rawData.period),
    };
}
