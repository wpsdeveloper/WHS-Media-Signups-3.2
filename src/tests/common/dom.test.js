import {
  qs,
  qsa,
  isVisible,
  isChecked,
  getAttribute,
  valueOf,
  setVisible,
  setChecked,
  setValue,
  setText,
  setHTML,
  setDisabled,
  setAttribute,
  setInvalid,
  parseJsonValue,
  appendOption,
  clearOptions,
  addEventListener,
  setTimeInputValue,
  showBootstrapModal,
  hideBootstrapModal,
  showBootstrapToast,
} from '../../client/common/dom.js';

describe('Dom Utilities', () => {
  // --- Query and Visibility Tests ---

  describe('qs (querySelector)', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="test">Test Content</div>
        <span class="item" data-value="42">Item</span>
        <input type="text" value="hello" id="input1"/>
        <button checked>Checked</button>
      `;
    });

    test('finds element by ID', () => {
      const el = qs('#test');
      expect(el).not.toBeNull();
      expect(el.id).toBe('test');
    });

    test('returns null when element not found', () => {
      const el = qs('#nonexistent');
      expect(el).toBeNull();
    });
  });

  describe('qsa (querySelectorAll)', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="item" data-value="1">Item 1</div>
        <div class="item" data-value="2">Item 2</div>
        <div class="other">Other</div>
      `;
    });

    test('returns all matching elements', () => {
      const els = qsa('.item');
      expect(els.length).toBe(2);
      expect(els[0].getAttribute('data-value')).toBe('1');
      expect(els[1].getAttribute('data-value')).toBe('2');
    });

    test('returns empty array when no matches', () => {
      const els = qsa('.nonexistent');
      expect(Array.isArray(els)).toBe(true);
      expect(els.length).toBe(0);
    });
  });

  describe('isVisible', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="visible">Visible</div>
        <div class="d-none" id="none-d-none">Hidden d-none</div>
        <div class="hidden" id="none-hidden">Hidden hidden</div>
        <div style="display:none;" id="none-display">Hidden display:none</div>
        <input type="checkbox" checked/>
      `;
    });

    test('returns true for visible element', () => {
      expect(isVisible('#visible')).toBe(true);
    });

    test('returns false for element with d-none class', () => {
      expect(isVisible('#none-d-none')).toBe(false);
    });

    test('returns false for element with hidden class', () => {
      expect(isVisible('#none-hidden')).toBe(false);
    });

    test('returns false for element with display:none style', () => {
      expect(isVisible('#none-display')).toBe(false);
    });

    test('returns false for null element', () => {
      expect(isVisible('#nonexistent')).toBe(false);
    });
  });

  describe('isChecked', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input type="checkbox" checked/>
        <input type="checkbox"/>
      `;
    });

    test('returns true for checked checkbox', () => {
      expect(isChecked('input[type="checkbox"][checked]')).toBe(true);
    });

    test('returns false for unchecked checkbox', () => {
      expect(isChecked('input[type="checkbox"]:not(:checked)')).toBe(false);
    });

    test('returns false for non-existent checkbox', () => {
      expect(isChecked('#nonexistent-checkbox')).toBe(false);
    });
  });

  describe('getAttribute', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="test" data-custom="value" class="a b">Text</div>
      `;
    });

    test('returns attribute value when present', () => {
      const attr = getAttribute('#test', 'data-custom');
      expect(attr).toBe('value');
    });

    test('returns null when attribute not present', () => {
      const attr = getAttribute('#test', 'nonexistent');
      expect(attr).toBeNull();
    });

    test('handles non-existent element', () => {
      const attr = getAttribute('#nonexistent', 'class');
      expect(attr).toBeUndefined(); // qs returns null, so .getAttribute fails silently with optional chaining
    });
  });

  // --- Value Getter Tests ---

  describe('valueOf', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input type="text" value="hello" id="input1"/>
        <input type="number" value="42" id="number1"/>
      `;
    });

    test('returns text value from input element', () => {
      expect(valueOf('#input1')).toBe('hello');
    });

    test('returns number value from number input', () => {
      const val = valueOf('#number1');
      expect(val).toBe(42); // Should return the string "42"
    });
  });

  // --- Setter Tests ---

  describe('setVisible', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="element">Content</div>
      `;
    });

    test('hides element when isVisible=false (adds d-none and hidden)', () => {
      setVisible('#element', false);
      expect(qs('#element').classList.contains('d-none')).toBe(true);
      expect(qs('#element').classList.contains('hidden')).toBe(true);
      expect(qs('#element').hidden).toBe(true);
    });

    test('shows element when isVisible=true (removes d-none and hidden)', () => {
      setVisible('#element', true);
      expect(qs('#element').classList.contains('d-none')).toBe(false);
      expect(qs('#element').classList.contains('hidden')).toBe(false);
      expect(qs('#element').hidden).toBe(false);
    });

    test('handles non-existent element gracefully', () => {
      setVisible('#nonexistent', true); // Should not throw
      expect(true).toBe(true); // Test passed if no error thrown
    });
  });

  describe('setChecked', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input type="checkbox" id="check1"/>
      `;
    });

    test('checks checkbox when isChecked=true', () => {
      setChecked('#check1', true);
      expect(qs('#check1').checked).toBe(true);
    });

    test('unchecks checkbox when isChecked=false', () => {
      setChecked('#check1', false);
      expect(qs('#check1').checked).toBe(false);
    });
  });

  describe('setValue', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input type="text" id="input1"/>
        <input type="number" id="number1"/>
      `;
    });

    test('sets text value on input', () => {
      setValue('#input1', 'hello world');
      expect(qs('#input1').value).toBe('hello world');
    });

    test('handles empty/null/undefined values (defaults to empty string)', () => {
      setValue('#input1', null);
      expect(qs('#input1').value).toBe('');

      setValue('#input1', undefined);
      expect(qs('#input1').value).toBe('');
    });
  });

  describe('setText', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="text">Old Content</div>
      `;
    });

    test('sets text content on element', () => {
      setText('#text', 'New Content');
      expect(qs('#text').textContent).toBe('New Content');
    });

    test('handles empty/null values (defaults to empty string)', () => {
      setText('#text', null);
      expect(qs('#text').textContent).toBe('');
    });
  });

  describe('setHTML', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="html">Old</div>
      `;
    });

    test('sets innerHTML on element', () => {
      setHTML('#html', '<span>New HTML</span>');
      expect(qs('#html').innerHTML).toBe('<span>New HTML</span>');
    });

    test('handles empty/null values (defaults to empty string)', () => {
      setHTML('#html', null);
      expect(qs('#html').innerHTML).toBe('');
    });
  });

  describe('setDisabled', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input type="text" id="input1"/>
      `;
    });

    test('disables element when isDisabled=true', () => {
      setDisabled('#input1', true);
      expect(qs('#input1').disabled).toBe(true);
    });

    test('enables element when isDisabled=false', () => {
      setDisabled('#input1', false);
      expect(qs('#input1').disabled).toBe(false);
    });
  });

  describe('setAttribute', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="element"></div>
      `;
    });

    test('sets custom attribute', () => {
      setAttribute('#element', 'data-test', 'value');
      expect(qs('#element').getAttribute('data-test')).toBe('value');
    });

    test('can overwrite existing attribute', () => {
      document.body.innerHTML = `
        <div id="element" data-old="old"></div>
      `;
      setAttribute('#element', 'data-old', 'new');
      expect(qs('#element').getAttribute('data-old')).toBe('new');
    });
  });

  describe('setInvalid', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input type="text" id="input1"/>
      `;
    });

    test('adds invalid class when isInvalid=true', () => {
      setInvalid('#input1', true);
      expect(qs('#input1').classList.contains('invalid')).toBe(true);
    });

    test('removes invalid class when isInvalid=false', () => {
      setInvalid('#input1', false);
      expect(qs('#input1').classList.contains('invalid')).toBe(false);
    });
  });

  // --- JSON Parser Tests ---

  // describe('parseJsonValue', () => {
  //   test('parses JSON string to object', () => {
  //     const result = parseJsonValue('{"key": "value"}');
  //     expect(result).toEqual({ key: 'value' });
  //     expect(typeof result).toBe('object');
  //   });

  //   test('returns non-string value unchanged', () => {
  //     const obj = parseJsonValue({ nested: 'object' });
  //     expect(obj).toEqual({ nested: 'object' });

  //     const arr = parseJsonValue([1, 2, 3]);
  //     expect(arr).toEqual([1, 2, 3]);

  //     const str = parseJsonValue('already a string');
  //     expect(str).toBe('already a string');
  //   });

  //   test('handles null', () => {
  //     const result = parseJsonValue(null);
  //     expect(result).toBeNull();
  //   });

  //   test('handles number', () => {
  //     const result = parseJsonValue(42);
  //     expect(result).toBe(42);
  //   });
  // });

  // --- Option Manipulation Tests ---

  describe('appendOption', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <select id="select1"></select>
      `;
    });

    test('appends option with value and text', () => {
      appendOption('#select1', 'option1', 'Option 1 Text');
      const options = qsa('#select1 option');
      expect(options.length).toBe(1);
      expect(options[0].value).toBe('option1');
      expect(options[0].textContent.trim()).toBe('Option 1 Text');
    });

    test('sets selected attribute when selected=true', () => {
      appendOption('#select1', 'selected', 'Selected', true);
      const options = qsa('#select1 option');
      expect(options[0].selected).toBe(true);
    });

    test('handles non-existent select element gracefully', () => {
      // Should not throw
      appendOption('#nonexistent', 'value', 'text');
      expect(true).toBe(true);
    });
  });

  describe('clearOptions', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <select id="select1">
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </select>
      `;
    });

    test('clears all options from select', () => {
      clearOptions('#select1');
      const options = qsa('#select1 option');
      expect(options.length).toBe(0);
    });

    test('handles non-existent element gracefully', () => {
      // Should not throw
      clearOptions('#nonexistent');
      expect(true).toBe(true);
    });
  });

  // --- Event Listener Tests ---

  describe('addEventListener', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <button id="button1">Click me</button>
      `;
    });

    test('adds click event listener', () => {
      let clicked = false;
      const handler = () => {
        clicked = true;
      };

      addEventListener('#button1', 'click', handler);

      qs('#button1').click(); // Trigger click

      expect(clicked).toBe(true);
    });

    test('handles non-existent element gracefully', () => {
      let called = false;
      const handler = () => {
        called = true;
      };

      // Should not throw
      addEventListener('#nonexistent', 'click', handler);
      expect(true).toBe(true);
    });
  });

  // --- Time Input Value Tests ---

  describe('setTimeInputValue', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input type="time" id="time1"/>
      `;
    });
    // Standard PM times
    test('sets PM time with single-digit hour', () => {
      const element = document.querySelector("#time1");
      setTimeInputValue(element, '4:32 PM');
      expect(element.value).toBe('16:32');
    });

    // Standard AM times
    test('sets AM time with single-digit hour', () => {
      const element = document.querySelector("#time1");
      setTimeInputValue(element, '4:32 AM');
      expect(element.value).toBe('04:32');
    });

    test('sets AM time with double-digit hour', () => {
      const element = document.querySelector("#time1");
      setTimeInputValue(element, '14:32 AM');
      expect(element.value).toBe('14:32');
    });

    test('converts midnight (12 AM) to 00:00', () => {
      const element = document.querySelector("#time1");
      setTimeInputValue(element, '12:00 AM');
      expect(element.value).toBe('00:00');
    });

    test('converts noon (12 PM) to 12:00', () => {
      const element = document.querySelector("#time1");
      setTimeInputValue(element, '12:00 PM');
      expect(element.value).toBe('12:00');
    });

    test('handles single-digit minutes', () => {
      const element = document.querySelector("#time1");
      setTimeInputValue(element, '4:5 AM'); // Note: regex expects 2 digits!
      expect(element.value).toBe('');
    });

    test('handles zero minutes', () => {
      const element = document.querySelector("#time1");
      setTimeInputValue(element, '10:00 AM');
      expect(element.value).toBe('10:00');
    });

    test('handles missing time format', () => {
      const element = document.querySelector("#time1");
      setTimeInputValue(element, 'invalid');
      expect(element.value).toBe('');
    });

    test('handles empty string', () => {
      const element = document.querySelector("#time1");
      setTimeInputValue(element, '');
      expect(element.value).toBe('');
    });

    test('handles lowercase am/pm', () => {
      const element = document.querySelector("#time1");
      setTimeInputValue(element, '4:32 pm');
      expect(element.value).toBe('16:32');
    });

    test('handles mixed case', () => {
      const element = document.querySelector("#time1");
      setTimeInputValue(element, '4:32 Am');
      expect(element.value).toBe('04:32');
    });

    function createMockElement() {
      return {
        value: null,
        setProperty(key, val) {
          if (key === 'value') this.value = val;
        },
        getAttribute(attr) {
          return attr === 'readonly' ? false : undefined;
        },
        // Other necessary methods...
      };
    }

    // Mock console.error to track error calls
    const originalError = console.error;
    let errorCalled = false;
    console.error = (...args) => {
      errorCalled = true;
      originalError(...args);
    };

    test('invalid format triggers console.error', () => {
      const element = document.querySelector("#time1");
      setTimeInputValue(element, '4:32');
      expect(errorCalled).toBe(true);
    });
  });
});
