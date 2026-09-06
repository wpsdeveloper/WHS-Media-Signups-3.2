export const $ = selector => document.querySelector(selector);
export const $$ = selector => [...document.querySelectorAll(selector)];
export const valueOf = selector => $(selector)?.value || "";
export const isVisible = element => Boolean(element) && !element.classList.contains("d-none") && element.offsetParent !== null;

export const setVisible = (element, visible) => {
  if (!element) return;
  element.classList.toggle("d-none", !visible);
  element.hidden = !visible;
};

export const setChecked = (selector, checked) => {
  $$(selector).forEach(element => { element.checked = checked; });
};

export const setValue = (selector, value) => {
  if ($(selector)) $(selector).value = value ?? "";
};

export const setText = (selector, text) => {
  if ($(selector)) $(selector).textContent = text ?? "";
};

export const setDisabled = (selector, disabled) => {
  if ($(selector)) $(selector).disabled = disabled;
};

export const parseJsonValue = value => typeof value === "string" ? JSON.parse(value) : value;

export const appendOption = (selector, value, text, selected = false) => {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  option.selected = selected;
  $(selector)?.append(option);
};

export const showBootstrapModal = selector => bootstrap.Modal.getOrCreateInstance($(selector)).show();
export const hideBootstrapModal = selector => bootstrap.Modal.getOrCreateInstance($(selector)).hide();
export const showBootstrapToast = selector => bootstrap.Toast.getOrCreateInstance($(selector)).show();
