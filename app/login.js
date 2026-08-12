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
  var deviceSwitch = document.getElementById("device-switch");
  var deviceSwitchConfirm = document.getElementById("device-switch-confirm");
  var deviceSwitchCancel = document.getElementById("device-switch-cancel");
  var deviceSwitchMessage = document.getElementById("device-switch-message");
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

  function showDeviceSwitch(email) {
    pendingEmail = email;
    form.hidden = true;
    document.querySelector(".login-panel > .lede").hidden = true;
    document.getElementById("login-title").hidden = true;
    deviceSwitch.hidden = false;
    deviceSwitchMessage.textContent = "";
    deviceSwitchMessage.className = "form-message";
    document.getElementById("device-switch-title").focus();
  }

  function hideDeviceSwitch() {
    deviceSwitch.hidden = true;
    form.hidden = false;
    document.querySelector(".login-panel > .lede").hidden = false;
    document.getElementById("login-title").hidden = false;
    submit.disabled = false;
    emailInput.focus();
  }

  /* One request shape for both the ordinary sign-in and the device switch; the only
     difference is whether the learner has agreed to end their other session. */
  async function requestSession(email, releaseOtherDevice) {
    var response = await fetch("api/session", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(releaseOtherDevice ? {email: email, releaseOtherDevice: true} : {email: email})
    });
    return {response: response, payload: await readJson(response)};
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!emailInput.checkValidity()) {
      emailInput.reportValidity();
      return;
    }

    var email = emailInput.value.trim().toLowerCase();
    submit.disabled = true;
    message.className = "form-message waiting";
    message.textContent = "Checking access…";
    try {
      var result = await requestSession(email, false);
      if (result.response.status === 428 && result.payload.agreementRequired) {
        showAgreement(email, result.payload.agreementVersion, result.payload.communityInviteUrl);
        return;
      }
      /* Not an error the learner has to solve on their own — it is the device switch,
         and it has a button. */
      if (result.response.status === 409 && result.payload.code === "ACCOUNT_IN_USE") {
        message.textContent = "";
        showDeviceSwitch(email);
        return;
      }
      if (!result.response.ok) throw new Error(result.payload.message || "Access could not be checked. Try again.");
      message.textContent = "Access confirmed. Opening your dashboard…";
      window.location.replace("./");
    } catch (error) {
      message.className = "form-message";
      message.textContent = error.message || "Access could not be checked. Try again.";
      submit.disabled = false;
      emailInput.focus();
    }
  });

  deviceSwitchCancel.addEventListener("click", function () {
    pendingEmail = "";
    hideDeviceSwitch();
  });

  deviceSwitchConfirm.addEventListener("click", async function () {
    if (!pendingEmail) return hideDeviceSwitch();
    deviceSwitchConfirm.disabled = true;
    deviceSwitchMessage.className = "form-message waiting";
    deviceSwitchMessage.textContent = "Signing out the other device…";
    try {
      var result = await requestSession(pendingEmail, true);
      /* A first sign-in on a new device can still land on the agreement step, so the
         takeover has to be able to hand over to it rather than assuming success. */
      if (result.response.status === 428 && result.payload.agreementRequired) {
        deviceSwitch.hidden = true;
        showAgreement(pendingEmail, result.payload.agreementVersion, result.payload.communityInviteUrl);
        return;
      }
      if (!result.response.ok) throw new Error(result.payload.message || "The other device could not be signed out. Try again.");
      deviceSwitchMessage.textContent = "Done. Opening your dashboard…";
      window.location.replace("./");
    } catch (error) {
      deviceSwitchMessage.className = "form-message";
      deviceSwitchMessage.textContent = error.message || "The other device could not be signed out. Try again.";
      deviceSwitchConfirm.disabled = false;
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
