(function () {
  "use strict";

  var toastTimer;
  var testersConnected = false;
  var testersEndpoint = "../admin/api/testers";
  var whatsappInvite = "https://chat.whatsapp.com/E9RThdcAzqFDTiWPUYcE3I";

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
    $("bump-unjoined").disabled = !connected || busy;
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

  function relativeTime(value) {
    if (!value) return null;
    var then = new Date(value).getTime();
    if (!then) return null;
    var minutes = Math.round((Date.now() - then) / 60000);
    if (minutes < 2) return "just now";
    if (minutes < 60) return minutes + " min ago";
    var hours = Math.round(minutes / 60);
    if (hours < 24) return hours === 1 ? "1 hour ago" : hours + " hours ago";
    var days = Math.round(hours / 24);
    return days === 1 ? "yesterday" : days + " days ago";
  }

  function chip(label, tone) {
    var node = document.createElement("span");
    node.className = tone ? "chip " + tone : "chip";
    node.textContent = label;
    return node;
  }

  function renderTesters(testers, security) {
    var list = $("tester-list");
    security = security && typeof security === "object" ? security : {};
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
      var identity = document.createElement("div");
      var address = document.createElement("span");
      var chips = document.createElement("div");
      var detail = document.createElement("small");
      var actions = document.createElement("div");
      var revoke = document.createElement("button");
      var status = security[email] || {};

      address.className = "tester-email";
      address.textContent = email;
      chips.className = "tester-chips";

      if (status.locked) chips.append(chip("Locked", "alert"));
      else if (status.activeSession) chips.append(chip("Signed in", "good"));
      // A tester who accepted an earlier version has agreed to something; only the current terms
      // are outstanding. Saying "Not agreed yet" for both reads as if they never signed anything.
      if (status.agreementAccepted) chips.append(chip("Agreed", "good"));
      else if (status.agreementEverAccepted) chips.append(chip("Older terms", "warn"));
      else chips.append(chip("Never agreed", "warn"));
      chips.append(chip(status.communityJoined ? "Group joined" : "Group missing", status.communityJoined ? "good" : "warn"));
      if (status.communityReminderAt && !status.communityJoined) chips.append(chip("Bumped", "alert"));
      if (status.hasProgress) chips.append(chip("Has progress", "good"));
      else chips.append(chip("Not started", "warn"));
      if (status.firstCountry) chips.append(chip(status.firstCountry));

      var seen = relativeTime(status.lastSeenAt || status.progressUpdatedAt);
      detail.className = status.locked ? "tester-security locked" : "tester-security";
      detail.textContent = status.locked
        ? "Locked after a country change. Clearing the lock keeps their progress."
        : (seen ? "Last active " + seen : "No activity recorded yet");

      actions.className = "tester-actions";
      if (!status.communityJoined) {
        var bump = document.createElement("button");
        bump.className = "button secondary";
        bump.type = "button";
        bump.textContent = "Bump";
        bump.setAttribute("aria-label", "Bump " + email + " to join the WhatsApp group and give feedback");
        bump.addEventListener("click", function () { bumpTester(email); });
        actions.append(bump);
      }
      if (status.locked) {
        var unlock = document.createElement("button");
        unlock.className = "button secondary";
        unlock.type = "button";
        unlock.textContent = "Clear lock";
        unlock.setAttribute("aria-label", "Clear the country lock for " + email);
        unlock.addEventListener("click", function () { unlockTester(email); });
        actions.append(unlock);
      }
      revoke.className = "button danger";
      revoke.type = "button";
      revoke.textContent = "Revoke";
      revoke.setAttribute("aria-label", "Revoke website access for " + email);
      revoke.addEventListener("click", function () { revokeTester(email); });
      actions.append(revoke);

      identity.className = "tester-identity";
      identity.append(address, chips, detail);
      item.append(identity, actions);
      list.appendChild(item);
    });
  }

  function renderParticipation(participation) {
    var list = $("participation-list");
    list.replaceChildren();
    if (!participation.length) {
      $("participation-state").textContent = "No activity yet";
      var empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "No tester has saved progress yet. This fills in once someone starts revising.";
      list.appendChild(empty);
      return;
    }
    $("participation-state").textContent = participation.length === 1 ? "1 active tester" : participation.length + " active testers";
    participation.forEach(function (row) {
      var item = document.createElement("li");
      var head = document.createElement("div");
      var name = document.createElement("span");
      var meta = document.createElement("small");
      var quiet = relativeTime(row.lastActivityAt);
      name.className = "signal-name";
      name.textContent = row.email;
      head.className = "signal-head";
      head.append(name);
      head.append(chip(row.attempts + (row.attempts === 1 ? " answer" : " answers"), row.attempts >= 20 ? "good" : "warn"));
      head.append(chip(row.conceptsTouched + " concepts"));
      meta.className = "signal-meta";
      meta.textContent = (quiet ? "Last answered " + quiet : "No answers recorded") +
        (row.accuracy === null ? "" : " · " + row.accuracy + "% first-attempt accuracy");
      item.append(head, meta);
      list.appendChild(item);
    });
  }

  function renderInsights(hardest, threshold) {
    var list = $("insight-list");
    list.replaceChildren();
    if (!hardest.length) {
      $("insight-state").textContent = "No data yet";
      var empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "No scored first attempts yet. This ranks concepts once testers start answering.";
      list.appendChild(empty);
      return;
    }
    var solid = hardest.filter(function (row) { return !row.lowSample; }).length;
    $("insight-state").textContent = solid ? solid + " above " + threshold + " attempts" : "Sample still small";
    hardest.forEach(function (row) {
      var item = document.createElement("li");
      var head = document.createElement("div");
      var name = document.createElement("span");
      var bar = document.createElement("div");
      var fill = document.createElement("i");
      var meta = document.createElement("small");
      name.className = "signal-name";
      name.textContent = row.course + " · " + row.concept;
      head.className = "signal-head";
      head.append(name);
      head.append(chip(row.accuracy + "%", row.accuracy < 50 ? "alert" : row.accuracy < 75 ? "warn" : "good"));
      if (row.lowSample) head.append(chip("low sample", "quiet"));
      bar.className = "signal-bar";
      fill.style.width = Math.max(row.accuracy, 2) + "%";
      bar.append(fill);
      meta.className = "signal-meta";
      meta.textContent = row.attempts + " first attempts · " + row.testers +
        (row.testers === 1 ? " tester" : " testers") + " · " + row.assistedRate + "% used a hint";
      item.append(head, bar, meta);
      list.appendChild(item);
    });
  }

  async function loadInsights() {
    try {
      var response = await fetch("../admin/api/insights", {cache: "no-store", credentials: "same-origin"});
      if (!response.ok) throw new Error("unavailable");
      var payload = await response.json();
      renderParticipation(Array.isArray(payload.participation) ? payload.participation : []);
      renderInsights(Array.isArray(payload.hardest) ? payload.hardest : [], payload.lowSampleThreshold || 10);
    } catch (error) {
      $("participation-state").textContent = "Unavailable";
      $("insight-state").textContent = "Unavailable";
      renderParticipation([]);
      renderInsights([], 10);
    }
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
      renderTesters(testers, payload.security);
      setTesterState("Connected", "Cloudflare Access is ready for individual grants and revocation.", "passed");
      setTesterControls(true, false);
    } catch (error) {
      setTesterState("Unavailable", "The protected tester list could not be reached.", "attention");
      renderTesters([]);
      setTesterControls(false, false);
    }
  }

  function parseEmails(raw) {
    return raw.split(/[\s,;]+/)
      .map(function (value) { return value.trim().toLowerCase(); })
      .filter(Boolean)
      .filter(function (value, index, all) { return all.indexOf(value) === index; });
  }

  function describeAddResult(payload) {
    var added = Array.isArray(payload.added) ? payload.added : [];
    var already = Array.isArray(payload.alreadyApproved) ? payload.alreadyApproved : [];
    var rejected = Array.isArray(payload.rejected) ? payload.rejected : [];
    var parts = [];
    if (added.length === 1) parts.push("Access granted to " + added[0] + ".");
    else if (added.length) parts.push(added.length + " testers added.");
    else parts.push("No new testers added.");
    if (already.length) parts.push(already.length + " already had access.");
    if (rejected.length) parts.push(rejected.length + " skipped: " + rejected.join(", ") + ".");
    return parts.join(" ");
  }

  async function addTester(event) {
    event.preventDefault();
    if (!testersConnected) return;
    var field = $("tester-email");
    var emails = parseEmails(field.value);
    if (!emails.length) {
      field.setCustomValidity("Enter at least one tester email.");
      field.reportValidity();
      field.setCustomValidity("");
      return;
    }
    if (emails.length > 25) {
      showToast("Add up to 25 testers at a time. That paste had " + emails.length + ".");
      return;
    }
    setTesterControls(true, true);
    try {
      var response = await fetch(testersEndpoint, {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({emails: emails})
      });
      var payload = await readJson(response);
      if (!response.ok) throw new Error(payload.message || "Access could not be granted.");
      renderTesters(Array.isArray(payload.testers) ? payload.testers : [], payload.security);
      field.value = "";
      updateParseHint();
      showToast(describeAddResult(payload));
    } catch (error) {
      showToast(error.message || "Access could not be granted.");
    } finally {
      setTesterControls(testersConnected, false);
    }
  }

  function updateParseHint() {
    var count = parseEmails($("tester-email").value).length;
    $("tester-parse-hint").textContent = count
      ? count + (count === 1 ? " email ready" : " emails ready") + (count > 25 ? " — over the 25 limit" : "")
      : "Up to 25 at a time.";
  }

  async function unlockTester(email) {
    if (!testersConnected) return;
    if (!window.confirm("Clear the country lock for " + email + "?\n\nThey keep their saved progress and can sign in again from where they are now.")) return;
    setTesterControls(true, true);
    try {
      var response = await fetch(testersEndpoint, {
        method: "PATCH",
        cache: "no-store",
        credentials: "same-origin",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email: email, action: "unlock"})
      });
      var payload = await readJson(response);
      if (!response.ok) throw new Error(payload.message || "The lock could not be cleared.");
      renderTesters(Array.isArray(payload.testers) ? payload.testers : [], payload.security);
      showToast("Lock cleared for " + email + ". Their progress is intact.");
    } catch (error) {
      showToast(error.message || "The lock could not be cleared.");
    } finally {
      setTesterControls(testersConnected, false);
    }
  }

  function communityReminderCopy(email) {
    return "Dungeon tester reminder" + (email ? " for " + email : "") +
      "\n\nPlease join the tester WhatsApp group and keep sharing feedback throughout testing. " +
      "Continued tester access depends on joining and participating; people who do not join or respond after reminders may be removed.\n\nJoin here: " + whatsappInvite;
  }

  async function bumpTester(email) {
    if (!testersConnected) return;
    setTesterControls(true, true);
    try {
      var response = await fetch(testersEndpoint, {
        method: "PATCH",
        cache: "no-store",
        credentials: "same-origin",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email: email, action: "bump"})
      });
      var payload = await readJson(response);
      if (!response.ok) throw new Error(payload.message || "The reminder could not be recorded.");
      renderTesters(Array.isArray(payload.testers) ? payload.testers : [], payload.security);
      await copyText(communityReminderCopy(email), "Reminder recorded and WhatsApp message copied for " + email + ".");
    } catch (error) {
      showToast(error.message || "The reminder could not be recorded.");
    } finally {
      setTesterControls(testersConnected, false);
    }
  }

  async function bumpUnjoined() {
    if (!testersConnected) return;
    setTesterControls(true, true);
    try {
      var response = await fetch(testersEndpoint, {
        method: "PATCH",
        cache: "no-store",
        credentials: "same-origin",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({action: "bump-unjoined"})
      });
      var payload = await readJson(response);
      if (!response.ok) throw new Error(payload.message || "The reminders could not be recorded.");
      var reminded = Array.isArray(payload.reminded) ? payload.reminded : [];
      renderTesters(Array.isArray(payload.testers) ? payload.testers : [], payload.security);
      if (!reminded.length) {
        showToast("Everyone currently approved has confirmed the group.");
      } else {
        await copyText(communityReminderCopy("the " + reminded.length + " missing tester" + (reminded.length === 1 ? "" : "s")),
          reminded.length + " in-app reminder" + (reminded.length === 1 ? "" : "s") + " recorded; group message copied.");
      }
    } catch (error) {
      showToast(error.message || "The reminders could not be recorded.");
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
      renderTesters(Array.isArray(payload.testers) ? payload.testers : [], payload.security);
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
      var productionAdmin = window.location.pathname.indexOf("/dungeon/admin") === 0;
      var healthResponse = await fetch(productionAdmin ? "health" : "../health", {cache: "no-store"});
      var health = await healthResponse.json();
      healthPassed = healthResponse.ok && health.status === "ok";
      $("health-value").textContent = healthPassed ? "Healthy" : "Attention needed";
      $("health-detail").textContent = healthPassed ? "Shared learner progress storage" : "Health response was unexpected";
    } catch (error) {
      $("health-value").textContent = "Unavailable";
      $("health-detail").textContent = "Could not reach the production health route";
    }

    try {
      var manifestResponse = await fetch(productionAdmin ? "release-manifest.json" : "../release-manifest.json", {cache: "no-store"});
      var manifest = await manifestResponse.json();
      manifestPassed = manifestResponse.ok && Array.isArray(manifest.files) && manifest.files.length === 13;
      $("release-value").textContent = manifestPassed ? "Allowlisted" : "Review build";
      $("release-detail").textContent = manifestPassed ? manifest.files.length + " private app assets; learner state stays in the database" : "Manifest did not match the protected release";
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
  $("refresh-testers").addEventListener("click", function () { loadTesters(); loadInsights(); });
  $("bump-unjoined").addEventListener("click", bumpUnjoined);
  $("tester-form").addEventListener("submit", addTester);
  $("tester-email").addEventListener("input", updateParseHint);
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
  if (new URLSearchParams(window.location.search).get("scenario") === "community") {
    renderTesters(["joined@example.com", "missing@example.com"], {
      "joined@example.com": {agreementAccepted:true, communityJoined:true, hasProgress:true, lastSeenAt:new Date().toISOString()},
      "missing@example.com": {agreementAccepted:true, communityJoined:false, communityReminderAt:new Date().toISOString(), hasProgress:false}
    });
    setTesterState("Connected", "Scenario: community participation controls.", "passed");
    setTesterControls(true, false);
    renderParticipation([]);
    renderInsights([], 10);
  } else {
    loadTesters();
    loadInsights();
  }
}());
