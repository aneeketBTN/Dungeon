(function () {
  "use strict";

  var toastTimer;
  var testersConnected = false;
  var testersEndpoint = "../admin/api/testers";

  function $(id) { return document.getElementById(id); }

  function showToast(message) {
    var toast = $("toast");
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove("visible"); }, 2600);
  }

  async function copyText(text, success) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(success);
    } catch (error) {
      showToast("Copy was blocked. Select the text and copy it manually.");
    }
  }

  function setCheck(name, passed) {
    var item = document.querySelector('[data-check="' + name + '"]');
    if (!item) return;
    item.classList.toggle("passed", passed);
    item.querySelector("span").textContent = passed ? "✓" : "×";
  }

  function setTesterControls(connected, busy) {
    testersConnected = connected;
    $("add-tester").disabled = !connected || busy;
    $("refresh-testers").disabled = busy;
    $("tester-email").setAttribute("aria-disabled", String(!connected || busy));
  }

  function setTesterState(label, detail, className) {
    $("access-value").textContent = label;
    $("access-detail").textContent = detail;
    $("tester-access-state").textContent = label;
    $("tester-access-state").classList.toggle("passed", className === "passed");
    $("tester-access-state").classList.toggle("secure", className === "passed");
    $("tester-status").textContent = detail;
  }

  function renderTesters(testers) {
    var list = $("tester-list");
    list.replaceChildren();
    $("tester-count").textContent = testers.length === 1 ? "1 approved tester" : testers.length + " approved testers";

    if (!testers.length) {
      var empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "No testers have website access yet.";
      list.appendChild(empty);
      return;
    }

    testers.forEach(function (email) {
      var item = document.createElement("li");
      var address = document.createElement("span");
      var revoke = document.createElement("button");
      address.className = "tester-email";
      address.textContent = email;
      revoke.className = "button danger";
      revoke.type = "button";
      revoke.textContent = "Revoke";
      revoke.setAttribute("aria-label", "Revoke website access for " + email);
      revoke.addEventListener("click", function () { revokeTester(email); });
      item.append(address, revoke);
      list.appendChild(item);
    });
  }

  async function readJson(response) {
    try {
      return await response.json();
    } catch (error) {
      return {};
    }
  }

  async function loadTesters() {
    setTesterControls(testersConnected, true);
    $("tester-count").textContent = "Loading approved testers…";
    try {
      var response = await fetch(testersEndpoint, {cache: "no-store", credentials: "same-origin"});
      var payload = await readJson(response);
      if (!response.ok) {
        var setup = response.status === 503 || payload.code === "SETUP_REQUIRED";
        setTesterState(setup ? "Setup needed" : "Unavailable", setup ? "Activate Cloudflare Access to enable add and revoke here." : "The protected tester list could not be loaded.", "attention");
        renderTesters([]);
        setTesterControls(false, false);
        return;
      }
      var testers = Array.isArray(payload.testers) ? payload.testers : [];
      renderTesters(testers);
      setTesterState("Connected", "Cloudflare Access is ready for individual grants and revocation.", "passed");
      setTesterControls(true, false);
    } catch (error) {
      setTesterState("Unavailable", "The protected tester list could not be reached.", "attention");
      renderTesters([]);
      setTesterControls(false, false);
    }
  }

  async function addTester(event) {
    event.preventDefault();
    if (!testersConnected) return;
    var email = $("tester-email").value.trim().toLowerCase();
    if (!email || !$("tester-email").checkValidity()) {
      $("tester-email").reportValidity();
      return;
    }
    setTesterControls(true, true);
    try {
      var response = await fetch(testersEndpoint, {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email: email})
      });
      var payload = await readJson(response);
      if (!response.ok) throw new Error(payload.message || "Access could not be granted.");
      renderTesters(Array.isArray(payload.testers) ? payload.testers : []);
      $("tester-email").value = "";
      showToast("Website access granted to " + email + ".");
    } catch (error) {
      showToast(error.message || "Access could not be granted.");
    } finally {
      setTesterControls(testersConnected, false);
    }
  }

  async function revokeTester(email) {
    if (!testersConnected || !window.confirm("Revoke website access for " + email + "?")) return;
    setTesterControls(true, true);
    try {
      var response = await fetch(testersEndpoint + "?email=" + encodeURIComponent(email), {
        method: "DELETE",
        cache: "no-store",
        credentials: "same-origin"
      });
      var payload = await readJson(response);
      if (!response.ok) throw new Error(payload.message || "Access could not be revoked.");
      renderTesters(Array.isArray(payload.testers) ? payload.testers : []);
      showToast("Website access revoked for " + email + ".");
    } catch (error) {
      showToast(error.message || "Access could not be revoked.");
    } finally {
      setTesterControls(testersConnected, false);
    }
  }

  async function refreshStatus() {
    $("health-value").textContent = "Checking…";
    $("release-state").textContent = "Checking";
    var healthPassed = false;
    var manifestPassed = false;

    try {
      var healthResponse = await fetch("../health", {cache: "no-store"});
      var health = await healthResponse.json();
      healthPassed = healthResponse.ok && health.status === "ok";
      $("health-value").textContent = healthPassed ? "Healthy" : "Attention needed";
      $("health-detail").textContent = healthPassed ? "Browser-local learner storage" : "Health response was unexpected";
    } catch (error) {
      $("health-value").textContent = "Unavailable";
      $("health-detail").textContent = "Could not reach the production health route";
    }

    try {
      var manifestResponse = await fetch("../release-manifest.json", {cache: "no-store"});
      var manifest = await manifestResponse.json();
      manifestPassed = manifestResponse.ok && Array.isArray(manifest.files) && manifest.files.length === 10;
      $("release-value").textContent = manifestPassed ? "Allowlisted" : "Review build";
      $("release-detail").textContent = manifestPassed ? manifest.files.length + " public assets; no learner state" : "Manifest did not match the protected release";
    } catch (error) {
      $("release-value").textContent = "Unavailable";
      $("release-detail").textContent = "Could not read the release manifest";
    }

    setCheck("health", healthPassed);
    setCheck("manifest", manifestPassed);
    var passed = healthPassed && manifestPassed;
    $("release-state").textContent = passed ? "Automated checks passed" : "Needs review";
    $("release-state").classList.toggle("passed", passed);
  }

  function renderAnnouncement() {
    var change = $("announcement-change").value.trim() || "[What changed]";
    var impact = $("announcement-impact").value.trim() || "[What testers should try]";
    $("announcement-preview").textContent = "Dungeon update\n\nWhat changed\n" + change + "\n\nWhat to try\n" + impact + "\n\nPlease post one structured report in Dungeon Feedback if anything is unclear or broken.";
  }

  $("refresh-status").addEventListener("click", refreshStatus);
  $("refresh-testers").addEventListener("click", loadTesters);
  $("tester-form").addEventListener("submit", addTester);
  $("copy-feedback").addEventListener("click", function () {
    copyText($("feedback-template").innerText.trim(), "Feedback template copied.");
  });
  $("announcement-change").addEventListener("input", renderAnnouncement);
  $("announcement-impact").addEventListener("input", renderAnnouncement);
  $("copy-announcement").addEventListener("click", function () {
    copyText($("announcement-preview").innerText.trim(), "Announcement draft copied.");
  });

  renderAnnouncement();
  refreshStatus();
  loadTesters();
}());
