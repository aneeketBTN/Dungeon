(function () {
  "use strict";

  var form = document.getElementById("login-form");
  var emailInput = document.getElementById("login-email");
  var message = document.getElementById("login-message");
  var submit = document.getElementById("login-submit");
  var agreement = document.getElementById("agreement");
  var agreementForm = document.getElementById("agreement-form");
  var agreementCheck = document.getElementById("agreement-accept");
  var agreementMessage = document.getElementById("agreement-message");
  var agreementSubmit = document.getElementById("agreement-submit");
  var agreementBack = document.getElementById("agreement-back");
  var privacyNote = document.getElementById("privacy-note");
  var pendingEmail = "";
  var agreementVersion = "";

  async function readJson(response) {
    try { return await response.json(); } catch (error) { return {}; }
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!emailInput.checkValidity()) {
      emailInput.reportValidity();
      return;
    }

    submit.disabled = true;
    message.className = "form-message waiting";
    message.textContent = "Checking access…";
    try {
      var response = await fetch("api/session", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email: emailInput.value.trim().toLowerCase()})
      });
      var payload = await readJson(response);
      if (response.status === 428 && payload.agreementRequired) {
        pendingEmail = emailInput.value.trim().toLowerCase();
        agreementVersion = payload.agreementVersion;
        form.hidden = true;
        document.querySelector(".login-panel > .lede").hidden = true;
        document.getElementById("login-title").hidden = true;
        agreement.hidden = false;
        privacyNote.hidden = true;
        agreementBack.focus();
        return;
      }
      if (!response.ok) throw new Error(payload.message || "Access could not be checked. Try again.");
      message.textContent = "Access confirmed. Opening your dashboard…";
      window.location.replace("./");
    } catch (error) {
      message.className = "form-message";
      message.textContent = error.message || "Access could not be checked. Try again.";
      submit.disabled = false;
      emailInput.focus();
    }
  });

  agreementBack.addEventListener("click", function () {
    pendingEmail = "";
    agreementVersion = "";
    agreementCheck.checked = false;
    agreement.hidden = true;
    form.hidden = false;
    document.querySelector(".login-panel > .lede").hidden = false;
    document.getElementById("login-title").hidden = false;
    privacyNote.hidden = false;
    submit.disabled = false;
    message.textContent = "";
    emailInput.focus();
  });

  agreementForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!agreementCheck.checkValidity()) {
      agreementCheck.reportValidity();
      return;
    }
    agreementSubmit.disabled = true;
    agreementMessage.className = "form-message waiting";
    agreementMessage.textContent = "Recording your agreement…";
    try {
      var response = await fetch("api/session", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email: pendingEmail, acceptAgreement: true, agreementVersion: agreementVersion})
      });
      var payload = await readJson(response);
      if (!response.ok) throw new Error(payload.message || "The agreement could not be recorded. Try again.");
      agreementMessage.textContent = "Accepted. Opening your dashboard…";
      window.location.replace("./");
    } catch (error) {
      agreementMessage.className = "form-message";
      agreementMessage.textContent = error.message || "The agreement could not be recorded. Try again.";
      agreementSubmit.disabled = false;
    }
  });
}());
