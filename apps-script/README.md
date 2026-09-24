# Website form endpoint (Google Apps Script)

`Code.gs` receives the contact form and the footer newsletter signup from
www.mantraloktech.com. Every submission is written to a Google Sheet and
emailed to `info@mantraloktech.com`.

The site is served by GitHub Pages, which cannot run server code, so the form
needs an endpoint elsewhere. Apps Script runs inside the Mantralok Google
Workspace account: no third party sees the submissions, and there is nothing
to pay for.

## One-time setup

1. **Create the project.** Sign in to <https://script.google.com> as the
   account that should own the submissions, and choose **New project**.
   Delete the sample code, paste in all of `Code.gs`, and rename the project
   to something like *Mantralok website forms*.

2. **Authorize it.** Choose the `testSubmission` function in the toolbar and
   press **Run**. Google asks for permission to send mail and create a
   spreadsheet. Because the script is unpublished, the consent screen warns
   that the app is unverified — this is your own script, so choose
   **Advanced → Go to (project name)** and allow it. A test entry should
   arrive at `info@mantraloktech.com`.

3. **Deploy it as a web app.** Press **Deploy → New deployment**, choose type
   **Web app**, and set:

   | Setting | Value |
   | --- | --- |
   | Execute as | **Me** (the account that owns the sheet and sends the mail) |
   | Who has access | **Anyone** |

   "Anyone" is required — visitors are not signed in to Google. They can only
   reach `doPost`, which accepts a submission; nothing else is exposed.

4. **Copy the Web app URL.** It ends in `/exec`. Paste it into `forms.js` in
   the website repository, replacing `PASTE_YOUR_APPS_SCRIPT_EXEC_URL_HERE`:

   ```js
   var ENDPOINT = 'https://script.google.com/macros/s/AKfy.../exec';
   ```

5. **Commit and push.** GitHub Pages redeploys in a minute or two. Send a real
   message through the contact form to confirm.

Until step 4 is done, both forms tell the visitor plainly that the form is not
connected yet and to email us instead. They never claim a message was sent.

## Where submissions land

A spreadsheet named **Mantralok Website Submissions** is created automatically
in the Drive of the account that owns the script, the first time anyone
submits. It has two tabs:

- **Contact** — received, name, email, subject, message
- **Newsletter** — subscribed, email

Notification emails are sent to `NOTIFY_TO` at the top of `Code.gs`, with
reply-to set to the sender, so replying in Gmail answers the visitor directly.

## Changing the script later

Edits are **not** live until you redeploy: **Deploy → Manage deployments →**
(pencil icon) **→ Version: New version → Deploy**. The `/exec` URL stays the
same, so `forms.js` does not need to change.

To send notifications elsewhere, edit `NOTIFY_TO` and redeploy.

## Limits and spam

Apps Script caps outgoing mail per day — currently 1,500 recipients for
Workspace accounts and 100 for consumer Gmail. Worth re-checking against
Google's current quota page if volume ever grows; the sheet keeps every
submission regardless of whether the notification email sends.

Both forms carry a hidden honeypot field. Bots fill it in, people never see
it, and those submissions are dropped silently. If spam still gets through,
the next step is a reCAPTCHA check inside `doPost`.

## Checking it is alive

Open the `/exec` URL in a browser. A healthy deployment returns:

```json
{"ok":true,"service":"Mantralok website form endpoint","time":"..."}
```
