(function () {
  "use strict";

  var toastTimer;

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
}());
