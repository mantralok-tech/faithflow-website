/**
 * Mantralok website forms.
 *
 * Posts the contact form and the footer newsletter signup to the Google Apps
 * Script endpoint, then reports success or failure in the page. Until the
 * endpoint below is filled in, both forms say so plainly rather than pretending
 * the message was sent.
 *
 * Endpoint source and setup: apps-script/ in this repository.
 */
(function () {
  'use strict';

  // Paste the /exec URL from your Apps Script deployment here.
  var ENDPOINT = 'PASTE_YOUR_APPS_SCRIPT_EXEC_URL_HERE';

  var FALLBACK_EMAIL = 'info@mantraloktech.com';
  var CONFIGURED = ENDPOINT.indexOf('https://script.google.com/') === 0;

  var NOT_CONFIGURED =
    'This form is not connected yet. Please email ' + FALLBACK_EMAIL + ' and we will reply.';
  var NETWORK_ERROR =
    'We could not send that just now. Please try again, or email ' + FALLBACK_EMAIL + '.';

  document.addEventListener('DOMContentLoaded', function () {
    var forms = document.querySelectorAll('form[data-form]');
    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener('submit', onSubmit);
    }
  });

  function onSubmit(event) {
    event.preventDefault();

    var form   = event.currentTarget;
    var status = form.querySelector('[data-form-status]');
    var button = form.querySelector('button[type="submit"]');

    if (!CONFIGURED) {
      say(status, NOT_CONFIGURED, 'error');
      return;
    }

    var payload = collect(form);
    payload.formType = form.getAttribute('data-form');

    var idle = button ? button.innerHTML : '';
    if (button) {
      button.disabled = true;
      button.innerHTML = 'Sending&hellip;';
    }
    say(status, '', 'clear');

    // text/plain keeps this a "simple" request, so the browser skips the CORS
    // preflight that Apps Script web apps cannot answer.
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    })
      .then(function (response) { return response.json(); })
      .then(function (result) {
        if (result && result.ok) {
          say(status, result.message || 'Thank you. We have received your message.', 'success');
          form.reset();
        } else {
          say(status, (result && result.error) || NETWORK_ERROR, 'error');
        }
      })
      .catch(function (error) {
        console.error('Form submission failed:', error);
        say(status, NETWORK_ERROR, 'error');
      })
      .then(function () {
        if (button) {
          button.disabled = false;
          button.innerHTML = idle;
        }
      });
  }

  function collect(form) {
    var data = {};
    var fields = form.querySelectorAll('input[name], select[name], textarea[name]');
    for (var i = 0; i < fields.length; i++) {
      data[fields[i].name] = fields[i].value;
    }
    return data;
  }

  function say(element, message, kind) {
    if (!element) return;

    element.textContent = message;
    element.classList.remove(
      'hidden',
      'text-green-600', 'dark:text-green-400',
      'text-red-600', 'dark:text-red-400'
    );

    if (kind === 'clear' || !message) {
      element.classList.add('hidden');
      return;
    }
    if (kind === 'success') {
      element.classList.add('text-green-600', 'dark:text-green-400');
    } else {
      element.classList.add('text-red-600', 'dark:text-red-400');
    }
  }
})();
