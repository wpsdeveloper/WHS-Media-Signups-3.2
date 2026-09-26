type domParam = HTMLElement | string | null | undefined;

export const qs = <T extends Element = Element>(selector: string): T | null => document.querySelector<T>(selector);
export const qsa  = <T extends Element = Element>(selector: string): T[] => [...document.querySelectorAll<T>(selector)];

export const isVisible = (selector: string): boolean => {
  const element = qs<HTMLElement>(selector);
  return !!(element && !element.classList.contains("d-none") && !element.classList.contains("hidden") && (element.style.display !== 'none'));
}

export const isChecked = (selector:string): boolean => {
  const element = qs<HTMLInputElement>(selector);
  return !!(element && element.checked);
}

export const getAttribute = (selector: string, attrName: string): string => {
  const element = qs<HTMLElement>(selector);
  if (!element) return "";

  return element.getAttribute(attrName) ?? "";
}

export const valueOf = (param: domParam): string => {
  if (typeof param === null || typeof param === "undefined") return "";
  const get = (element:HTMLInputElement | HTMLSelectElement) => {
    let value = element.value; 
    if (element.type === "number") {
      return Number(element.value); 
    } 
    return value;
  }
  return getterFunction(get, param);
}

export const setVisible = (param: domParam, isVisible: boolean): void => {
   if (typeof param === null || typeof param === "undefined") return;
  const toggleVisibility = (element: HTMLElement, visible: boolean): void => {
    element.classList.toggle("d-none", !visible);
    element.classList.toggle("hidden", !visible);
    element.hidden = !visible;
  }
  
  setterFunction(toggleVisibility, param, isVisible);
};

export const setChecked = (param: domParam, isChecked: boolean): void => {
   if (typeof param === null || typeof param === "undefined") return;
   const set = (element:HTMLInputElement, checked: boolean) => element.checked = checked;
  setterFunction(set, param, isChecked);
};

export const setValue = (param: domParam, value:string) => {
  if (typeof param === null || typeof param === "undefined") return;
  const set = (element:HTMLInputElement | HTMLSelectElement, value:string) => element.value = value || "";
  setterFunction(set, param, value);
};

export const setText = (param: domParam, text: string) => {
   if (typeof param === null || typeof param === "undefined") return;
   const set = (element:HTMLElement, text: string) => element.textContent = text || "";  
  setterFunction(set, param, text);
};

export const setHTML = (param: domParam, html: string) => {
  if (typeof param === null || typeof param === "undefined") return;
  const set = (element: HTMLElement, text: string) => element.innerHTML = html || "";  
  setterFunction(set, param, html);
};

export const setDisabled = (param: domParam, isDisabled: boolean) => {
  if (typeof param === null || typeof param === "undefined") return;
  const set = (
    element: HTMLInputElement | HTMLSelectElement | HTMLOptionElement, 
    isDisabled: boolean
  ) => element.disabled = isDisabled;
  setterFunction(set, param, isDisabled);
};

export const setAttribute = (param: domParam, attrName: string, attrValue: string) => {
  if (typeof param === null || typeof param === "undefined") return;
  const set = (element: HTMLElement, attrName: string, attrValue: string) => element.setAttribute(attrName, attrValue);
  setterFunction(set, param, attrName, attrValue);
};

export const setInvalid = (param: domParam, isInvalid: boolean) => {
  if (typeof param === null || typeof param === "undefined") return;
  const set = (element: HTMLElement, isInvalid: boolean) => element.classList.toggle("invalid", isInvalid);
  setterFunction(set, param, isInvalid);
}

// export const parseJsonValue = value => typeof value === "string" ? JSON.parse(value) : value;

export const appendOption = (param: domParam, value: string, text: string, selected: boolean = false) => {
  if (typeof param === null || typeof param === "undefined") return;
  const set = (element: HTMLSelectElement, value: string, text: string, selected: boolean = false) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    option.selected = selected;
    element.append(option);
  };
  setterFunction(set, param, value, text, selected);
};

export const clearOptions = (param: domParam) => {
  if (typeof param === null || typeof param === "undefined") return;
  const set = (element: HTMLSelectElement) => element.replaceChildren();
  setterFunction(set, param)
}

export const addEventListener = <K extends keyof HTMLElementEventMap>(
  param: domParam, 
  eventName: K, 
  callback: (event: HTMLElementEventMap[K]) => void
) => {
  if (typeof param === null || typeof param === "undefined") return;
  const set = (
    element: HTMLElement, 
    eventName: K, 
    callback: (event: HTMLElementEventMap[K]  
    ) => void
  ) => element.addEventListener(eventName, callback);
  setterFunction(set, param, eventName, callback)
}

export const showBootstrapModal = (selector: string): void => {
  const el = qs(selector);
  if (el) window.bootstrap.Modal.getOrCreateInstance(el).show();
};

export const hideBootstrapModal = (selector: string): void => {
  const el = qs(selector);
  if (el) window.bootstrap.Modal.getOrCreateInstance(el).hide();
};

export const showBootstrapToast = (selector: string, message: string): void => {
  const el = qs(selector);
  if (el) {
    window.bootstrap.Toast.getOrCreateInstance(el).show();
    setVisible(`${selector} .toast-body`, true);
    setText(`${selector} .toast-body`, message);
  }
}

function setterFunction(functionName: Function, param: domParam, ...args: unknown[]) {
  if (typeof functionName !== "function") {
    return;
  }
  if (typeof param === null || typeof param === "undefined") return;
  
  if (param instanceof HTMLElement) {
    functionName(param, ...args);
  } else if (typeof param === "string") {
    
    qsa(param).forEach(element => {
      functionName(element, ...args);
    });
  }
}

function getterFunction(functionName: Function, param: domParam, ...args: unknown[]) {
  if (typeof functionName !== "function") {
    return;
  }
  if (typeof param === null || typeof param === "undefined") return;
  
  if (param instanceof HTMLElement) {
    return functionName(param, ...args);
  } else if (typeof param === "string") {
    return functionName(qs(param), ...args);
  }
}


export const setTimeInputValue = (element: HTMLInputElement, timeString: string) => {
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
  } else if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  // Pad single-digit hours (e.g., "04") and combine into HH:mm
  const finalTimeValue = `${hours.toString().padStart(2, '0')}:${minutes}`;

  // Set the input value
  setValue(element, finalTimeValue);
}


export const toggleStaffOnlyViews = (isStaff: boolean) => {
  setVisible('.staff-only', isStaff);
};

export const toggleAdminOnlyViews = (isAdmin: boolean) => {
  setVisible('.admin-only', isAdmin);
};

export const toggleEditorOnlyViews = (isEditor: boolean) => {
  setVisible('.editors-only', isEditor);
};
