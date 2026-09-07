export const $ = selector => document.querySelector(selector);
export const $$ = selector => [...document.querySelectorAll(selector)];
export const valueOf = selector => $(selector)?.value || "";
export const isVisible = selector => $(selector) && !$(selector).classList.contains("d-none") && $(selector).offsetParent !== null;
export const isChecked = selector => $(selector) && $(selector).checked;
export const getAttribute = (selector, attrName) => $(selector)?.getAttribute(attrName);

export const setVisible = (selector, visible) => {
  $$(selector).forEach(element => {
    element.classList.toggle("d-none", !visible);
    element.classList.toggle("hidden", !visible);
    element.hidden = !visible;
  });
};

export const setChecked = (selector, isChecked) => {
  $$(selector).forEach(element => { element.checked = isChecked; });
};

export const setValue = (selector, value) => {
  $$(selector).forEach(element => element.value = value ?? "");
};

export const setText = (selector, text) => {
  $$(selector).forEach(element => element.textContent = text ?? "");
};

export const setDisabled = (selector, isDisabled) => {
  $$(selector).forEach(element => element.disabled = isDisabled);
};

export const setAttribute = (selector, attrName, attrValue) => {
  $$(selector).forEach(element => element.setAttribute(attrName, attrValue));
};

export const setInvalid = (selector, isInvalid) => {
  $$(selector).forEach(element => {
    element.classList.toggle("invalid", isInvalid);
  });
}

export const parseJsonValue = value => typeof value === "string" ? JSON.parse(value) : value;

export const appendOption = (selector, value, text, selected = false) => {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  option.selected = selected;
  $(selector)?.append(option);
};

export const clearOptions = (selector) => $$(selector).forEach(element => element.replaceChildren());

export const addEventListener = (selectors, eventName, callback) => {
  $$(selectors).forEach(element => element.addEventListener(eventName, callback));
}

export const initializeStudentDatalist = (studentNames) => {
  const input = $(".student-autocomplete");
  if (!input) return;
  let list = $("#student-suggestions");
  if (!list) {
    list = document.createElement("datalist");
    list.id = "student-suggestions";
    document.body.append(list);
  }
  input.setAttribute("list", list.id);
  input.oninput = () => {
    if (input.value.trim().length < 3) {
      list.replaceChildren();
      return;
    }
    list.replaceChildren(...(studentNames || []).map(name => {
      const option = document.createElement("option");
      option.value = name;
      return option;
    }));
  };
  list.replaceChildren();
}

export const configureDateInput = (selector, minDate, maxDate, initialDate) => {
  const dateInput = $(selector);
  if (dateInput) {
    dateInput.type = "date";
    dateInput.min = minDate;
    dateInput.max = maxDate;
    dateInput.value = initialDate;
  }
}

export const setTooltips = (selector) => {
  const tooltipTriggerList = $$(selector);
  [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
};

export const showBootstrapModal = selector => bootstrap.Modal.getOrCreateInstance($(selector)).show();
export const hideBootstrapModal = selector => bootstrap.Modal.getOrCreateInstance($(selector)).hide();
export const showBootstrapToast = (selector, message) => {
  bootstrap.Toast.getOrCreateInstance($(selector)).show();
  $(`${selector} .toast-body`).show();
  $(`${selector} .toast-body`).text(message);
}
