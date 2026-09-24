/**
 * Mantralok website form endpoint.
 *
 * Receives submissions from the contact form and the footer newsletter signup
 * on www.mantraloktech.com, records them in a Google Sheet, and emails a
 * notification to the address in NOTIFY_TO.
 *
 * Setup instructions: see apps-script/README.md in the website repository.
 */

var NOTIFY_TO  = 'info@mantraloktech.com';
var SHEET_NAME = 'Mantralok Website Submissions';
var MAX_LENGTH = 5000;

var SUBJECT_LABELS = {
  general:     'General Inquiry',
  support:     'Technical Support',
  partnership: 'Partnership Opportunities',
  press:       'Press & Media',
  feedback:    'Feedback'
};

/**
 * Entry point for form submissions.
 */
function doPost(e) {
  try {
    var data = parseBody_(e);

    // Honeypot: real people never see this field, bots fill it in. Answer with
    // success so the bot does not learn anything, but drop the submission.
    if (text_(data.company) !== '') {
      return json_({ ok: true });
    }

    switch (text_(data.formType)) {
      case 'contact':    return handleContact_(data);
      case 'newsletter': return handleNewsletter_(data);
      default:           return json_({ ok: false, error: 'Unknown form type.' });
    }
  } catch (err) {
    console.error(err);
    return json_({
      ok: false,
      error: 'Something went wrong on our side. Please email ' + NOTIFY_TO + '.'
    });
  }
}

/**
 * Visiting the /exec URL in a browser confirms the deployment is live.
 */
function doGet() {
  return json_({
    ok: true,
    service: 'Mantralok website form endpoint',
    time: new Date().toISOString()
  });
}

/* ---------------------------------------------------------------- handlers */

function handleContact_(data) {
  var name    = text_(data.name);
  var email   = text_(data.email);
  var subject = text_(data.subject) || 'general';
  var message = text_(data.message);

  if (!name)             return json_({ ok: false, error: 'Please enter your name.' });
  if (!isEmail_(email))  return json_({ ok: false, error: 'Please enter a valid email address.' });
  if (!message)          return json_({ ok: false, error: 'Please enter a message.' });
  if (message.length > MAX_LENGTH) {
    return json_({ ok: false, error: 'That message is too long. Please keep it under ' + MAX_LENGTH + ' characters.' });
  }

  var label = SUBJECT_LABELS[subject] || subject;
  var when  = new Date();

  sheetFor_('Contact', ['Received', 'Name', 'Email', 'Subject', 'Message'])
    .appendRow([when, name, email, label, message]);

  MailApp.sendEmail({
    to: NOTIFY_TO,
    replyTo: email,
    name: 'Mantralok Website',
    subject: '[Website] ' + label + ' - ' + name,
    htmlBody:
      '<p><strong>' + esc_(label) + '</strong> enquiry from the website contact form.</p>' +
      '<table cellpadding="6" style="border-collapse:collapse">' +
        row_('Name', name) +
        row_('Email', email) +
        row_('Subject', label) +
        row_('Received', when.toString()) +
      '</table>' +
      '<p style="white-space:pre-wrap;margin-top:16px">' + esc_(message) + '</p>' +
      '<p style="color:#888;font-size:12px">Reply directly to this email to answer ' + esc_(name) + '.</p>'
  });

  return json_({ ok: true, message: 'Thank you. Your message has reached us and we will reply shortly.' });
}

function handleNewsletter_(data) {
  var email = text_(data.email);
  if (!isEmail_(email)) return json_({ ok: false, error: 'Please enter a valid email address.' });

  sheetFor_('Newsletter', ['Subscribed', 'Email'])
    .appendRow([new Date(), email]);

  MailApp.sendEmail({
    to: NOTIFY_TO,
    replyTo: email,
    name: 'Mantralok Website',
    subject: '[Website] Newsletter signup - ' + email,
    htmlBody: '<p>New newsletter signup: <strong>' + esc_(email) + '</strong></p>'
  });

  return json_({ ok: true, message: 'You are subscribed. Thank you.' });
}

/* ----------------------------------------------------------------- helpers */

/**
 * The site posts JSON as text/plain so the browser skips the CORS preflight,
 * which Apps Script cannot answer. Fall back to ordinary form parameters.
 */
function parseBody_(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (ignored) {
      // not JSON - fall through to e.parameter below
    }
  }
  return (e && e.parameter) ? e.parameter : {};
}

/**
 * Returns the named tab, creating the spreadsheet on first use and remembering
 * its id, so there is nothing to configure before the first submission.
 */
function sheetFor_(tabName, headers) {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SPREADSHEET_ID');
  var ss = null;

  if (id) {
    try {
      ss = SpreadsheetApp.openById(id);
    } catch (err) {
      ss = null;  // deleted or inaccessible - make a fresh one below
    }
  }
  if (!ss) {
    ss = SpreadsheetApp.create(SHEET_NAME);
    props.setProperty('SPREADSHEET_ID', ss.getId());
  }

  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function text_(value) {
  return (value === null || value === undefined) ? '' : String(value).trim();
}

function isEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function esc_(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function row_(label, value) {
  return '<tr><td style="color:#888">' + esc_(label) + '</td><td>' + esc_(value) + '</td></tr>';
}

/**
 * Run once from the editor to grant permissions and confirm mail + sheet work.
 */
function testSubmission() {
  var result = handleContact_({
    name: 'Test Person',
    email: 'test@example.com',
    subject: 'general',
    message: 'This is a test submission from the Apps Script editor.'
  });
  console.log(result.getContent());
}
