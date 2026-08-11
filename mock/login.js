(function () {
  "use strict";

  var form = document.getElementById("login-form");
  var emailInput = document.getElementById("login-email");
  var message = document.getElementById("login-message");
  var submit = document.getElementById("login-submit");
  var agreement = document.getElementById("agreement");
  var agreementForm = document.getElementById("agreement-form");
  var agreementCheck = document.getElementById("agreement-accept");
  var agreementGroup = document.getElementById("agreement-group");
  var agreementMessage = document.getElementById("agreement-message");
  var agreementSubmit = document.getElementById("agreement-submit");
  var agreementBack = document.getElementById("agreement-back");
  var groupLink = document.getElementById("group-link");
  var groupProof = document.getElementById("group-proof");
  var privacyNote = document.getElementById("privacy-note");
  var pendingEmail = "";
  var agreementVersion = "";
  var groupInviteOpened = false;

  async function readJson(response) {
    try { return await response.json(); } catch (error) { return {}; }
  }

  function validCommunityInvite(value) {
    return typeof value === "string" && /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/.test(value);
  }

  function showAgreement(email, version, communityInviteUrl) {
    pendingEmail = email;
    agreementVersion = version;
    if (validCommunityInvite(communityInviteUrl)) groupLink.href = communityInviteUrl;
    else groupLink.removeAttribute("href");
    form.hidden = true;
    document.querySelector(".login-panel > .lede").hidden = true;
    document.getElementById("login-title").hidden = true;
    agreement.hidden = false;
    privacyNote.hidden = true;
    document.getElementById("agreement-title").focus();
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
        showAgreement(emailInput.value.trim().toLowerCase(), payload.agreementVersion, payload.communityInviteUrl);
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
    agreementGroup.checked = false;
    agreementGroup.disabled = true;
    groupInviteOpened = false;
    groupProof.textContent = "Dungeon can record that you opened this invite, but WhatsApp does not expose group membership to this page.";
    agreement.hidden = true;
    form.hidden = false;
    document.querySelector(".login-panel > .lede").hidden = false;
    document.getElementById("login-title").hidden = false;
    privacyNote.hidden = false;
    submit.disabled = false;
    message.textContent = "";
    emailInput.focus();
  });

  groupLink.addEventListener("click", function () {
    if (!groupLink.getAttribute("href")) return;
    groupInviteOpened = true;
    agreementGroup.disabled = false;
    groupProof.textContent = "Invite opened. Join in WhatsApp, then return here and confirm truthfully.";
  });

  agreementForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!agreementCheck.checkValidity()) {
      agreementCheck.reportValidity();
      return;
    }
    if (!groupInviteOpened) {
      agreementMessage.className = "form-message";
      agreementMessage.textContent = "Open the WhatsApp invite before confirming that you joined.";
      groupLink.focus();
      return;
    }
    if (!agreementGroup.checkValidity()) {
      agreementGroup.reportValidity();
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
        body: JSON.stringify({
          email: pendingEmail,
          acceptAgreement: true,
          agreementVersion: agreementVersion,
          communityInviteOpened: groupInviteOpened,
          communityJoinedAcknowledged: agreementGroup.checked
        })
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

  if (new URLSearchParams(window.location.search).get("scenario") === "agreement") {
    showAgreement("tester@example.com", "2026-08-11-community-v2", new URLSearchParams(window.location.search).get("invite"));
  }
}());
