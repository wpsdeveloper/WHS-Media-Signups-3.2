export const qs = (selector) => document.querySelector(selector);
export const qsa = (selector) => [...document.querySelectorAll(selector)];
export const isVisible = (selector) => {
    const element = qs(selector);
    return !!(element && !element.classList.contains("d-none") && !element.classList.contains("hidden") && (element.style.display !== 'none'));
};
export const isChecked = (selector) => {
    const element = qs(selector);
    return !!(element && element.checked);
};
export const getAttribute = (selector, attrName) => {
    const element = qs(selector);
    if (!element)
        return "";
    return element.getAttribute(attrName) ?? "";
};
export const valueOf = (param) => {
    const get = (element) => {
        let value = element.value;
        if (element.type === "number") {
            return Number(element.value);
        }
        return value;
    };
    return getterFunction(get, param);
};
export const setVisible = (param, isVisible) => {
    const toggleVisibility = (element, visible) => {
        element.classList.toggle("d-none", !visible);
        element.classList.toggle("hidden", !visible);
        element.hidden = !visible;
    };
    setterFunction(toggleVisibility, param, isVisible);
};
export const setChecked = (param, isChecked) => {
    const set = (element, checked) => element.checked = checked;
    setterFunction(set, param, isChecked);
};
export const setValue = (param, value) => {
    const set = (element, value) => element.value = value || "";
    setterFunction(set, param, value);
};
export const setText = (param, text) => {
    const set = (element, text) => element.textContent = text || "";
    setterFunction(set, param, text);
};
export const setHTML = (param, html) => {
    const set = (element, text) => element.innerHTML = html || "";
    setterFunction(set, param, html);
};
export const setDisabled = (param, isDisabled) => {
    const set = (element, isDisabled) => element.disabled = isDisabled;
    setterFunction(set, param, isDisabled);
};
export const setAttribute = (param, attrName, attrValue) => {
    const set = (element, attrName, attrValue) => element.setAttribute(attrName, attrValue);
    setterFunction(set, param, attrName, attrValue);
};
export const setInvalid = (param, isInvalid) => {
    const set = (element, isInvalid) => element.classList.toggle("invalid", isInvalid);
    setterFunction(set, param, isInvalid);
};
// export const parseJsonValue = value => typeof value === "string" ? JSON.parse(value) : value;
export const appendOption = (param, value, text, selected = false) => {
    const set = (element, value, text, selected = false) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        option.selected = selected;
        element.append(option);
    };
    setterFunction(set, param, value, text, selected);
};
export const clearOptions = (param) => {
    const set = (element) => element.replaceChildren();
    setterFunction(set, param);
};
export const addEventListener = (param, eventName, callback) => {
    const set = (element, eventName, callback) => element.addEventListener(eventName, callback);
    setterFunction(set, param, eventName, callback);
};
export const showBootstrapModal = selector => bootstrap.Modal.getOrCreateInstance(qs(selector)).show();
export const hideBootstrapModal = selector => bootstrap.Modal.getOrCreateInstance(qs(selector)).hide();
export const showBootstrapToast = (selector, message) => {
    bootstrap.Toast.getOrCreateInstance(qs(selector)).show();
    setVisible(`${selector} .toast-body`, true);
    setText(`${selector} .toast-body`, message);
};
function setterFunction(functionName, param, ...args) {
    if (typeof functionName !== "function") {
        return;
    }
    if (param instanceof HTMLElement) {
        functionName(param, ...args);
    }
    else if (typeof param === "string") {
        qsa(param).forEach(element => {
            functionName(element, ...args);
        });
    }
}
function getterFunction(functionName, param, ...args) {
    if (typeof functionName !== "function") {
        return;
    }
    if (param instanceof HTMLElement) {
        return functionName(param, ...args);
    }
    else if (typeof param === "string") {
        return functionName(qs(param), ...args);
    }
}
export const setTimeInputValue = (element, timeString) => {
    // Extract hours, minutes, and AM/PM using Regex for "4:32 PM"
    const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) {
        console.error("Invalid time format");
        return;
    }
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const modifier = match[3].toUpperCase();
    // Convert to 24-hour format (required by HTML time inputs)
    if (modifier === 'PM' && hours < 12) {
        hours += 12;
    }
    else if (modifier === 'AM' && hours === 12) {
        hours = 0;
    }
    // Pad single-digit hours (e.g., "04") and combine into HH:mm
    const finalTimeValue = `${hours.toString().padStart(2, '0')}:${minutes}`;
    // Set the input value
    setValue(element, finalTimeValue);
};
export const toggleStaffOnlyViews = (isStaff) => {
    setVisible('.staff-only', isStaff);
};
export const toggleAdminOnlyViews = (isAdmin) => {
    setVisible('.admin-only', isAdmin);
};
export const toggleEditorOnlyViews = (isEditor) => {
    setVisible('.editors-only', isEditor);
};
