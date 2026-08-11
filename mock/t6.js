(function () {
  "use strict";

  var COURSES = window.T6_COURSES || {};
  var COURSE_IDS = ["BRGSA", "IBM", "SCLM", "SPMS"];
  var STORAGE_KEY = "term6.revision.v2";
  var LEGACY_CLAIM_KEY = "term6.revision.v2.claimed-by";
  var BACKEND_ACTIVE = window.location.pathname.indexOf("/dungeon") === 0;
  var SESSION_ENDPOINT = "api/session";
  var PROGRESS_ENDPOINT = "api/progress";
  var STATUS_ORDER = {unseen: 0, needs: 1, developing: 2, strong: 3};
  var STATUS_LABEL = {unseen: "Not started", needs: "Needs practice", developing: "Developing", strong: "Strong"};
  var profile;
  var session = null;
  var selected = null;
  var confidence = null;
  var lastFinished = null;
  var scenarioMode = false;
  var toastTimer = null;
  var dashboardView = "overview";
  var selectedModule = 1;
  var inspectedConceptId = null;
  var learnerEmail = null;
  var backendReady = false;
  var serverRevision = 0;
  var localChangeSequence = 0;
  var saveChain = Promise.resolve();
  var DASHBOARD_VIEWS = ["overview", "concepts", "plan"];
  var HORIZON_PLANS = {
    today: {
      title: "A focused day, with recovery time",
      steps: ["Begin with a 15–20 minute broad diagnostic.", "Use 60–75 minutes for unfamiliar foundations, then take a 10–15 minute break.", "Spend 45–60 minutes comparing concepts you confuse, then take another short break.", "Use 45–60 minutes for cases and reasoning chains.", "Finish with a 30–45 minute mixed practice check and 20–30 minutes on open flags."],
      note: "Protect at least seven hours of sleep where possible. Same-day success is labelled current evidence, not delayed retention."
    },
    three: {
      title: "Three distinct retrieval days",
      steps: ["Day 0: diagnose, build short foundations, and repair misses on a different surface.", "Day 1: retrieve closed-book after a genuine gap, compare confusable ideas, and write short responses.", "Day 2: take a mixed generic practice check, classify errors, and revisit only unresolved causes.", "Exam day: briefly retrieve open flags and core distinctions."],
      note: "Do not import guessing, timing, or negative-marking rules that have not been published for this final."
    },
    seven: {
      title: "A seven-day evidence cycle",
      steps: ["Day 0: diagnose and retrieve foundations.", "Day 1: delayed retrieval and misconception repair.", "Day 2: weak concepts, one constructed response, and one case.", "Day 3: interleave useful contrasts and try a new case.", "Days 4–5: open flags, untouched coverage, and failed reasoning steps only.", "Day 6: whole-chain reasoning and a mixed practice check.", "Day 7: a brief refresh of core distinctions."],
      note: "Ten study sets remain available, but later practice should narrow instead of forcing every set."
    }
  };

  function $(id) { return document.getElementById(id); }
  function $all(selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function defaultProfile() {
    return {
      version: 2,
      selectedCourse: "BRGSA",
      conceptAttempts: {},
      completed: {},
      lastMock: {},
      active: null,
      totalAnswers: 0,
      blockSequence: 0,
      horizon: "today"
    };
  }

  function validProfile(candidate) {
    return candidate && candidate.version === 2 && COURSE_IDS.indexOf(candidate.selectedCourse) >= 0 &&
      candidate.conceptAttempts && candidate.completed && (!candidate.active || validSession(candidate.active));
  }

  function validSession(candidate) {
    return candidate && COURSES[candidate.courseId] && Array.isArray(candidate.queue) &&
      typeof candidate.index === "number" && Array.isArray(candidate.responses);
  }

  function profileStorageKey() {
    return learnerEmail ? STORAGE_KEY + "." + learnerEmail : STORAGE_KEY;
  }

  function syncMetaKey() {
    return learnerEmail ? STORAGE_KEY + ".sync." + learnerEmail : null;
  }

  function readSyncMeta() {
    var key = syncMetaKey();
    if (!key) return null;
    try { return JSON.parse(localStorage.getItem(key)); } catch (error) { return null; }
  }

  function writeSyncMeta(dirty) {
    var key = syncMetaKey();
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify({email:learnerEmail, serverRevision:serverRevision, dirty:Boolean(dirty)}));
    } catch (error) {}
  }

  function writeLocalProfile(value) {
    try { localStorage.setItem(profileStorageKey(), JSON.stringify(value)); } catch (error) {}
  }

  function loadProfile() {
    try {
      var raw = localStorage.getItem(profileStorageKey());
      if (!raw && learnerEmail) {
        var claimedBy = localStorage.getItem(LEGACY_CLAIM_KEY);
        var legacy = localStorage.getItem(STORAGE_KEY);
        if (legacy && (!claimedBy || claimedBy === learnerEmail)) {
          raw = legacy;
          localStorage.setItem(LEGACY_CLAIM_KEY, learnerEmail);
        }
      }
      var parsed = JSON.parse(raw);
      if (!validProfile(parsed)) return defaultProfile();
      if (parsed.active && parsed.active.kind === "mock") {
        parsed.active.kind = "practice-shape";
        parsed.active.mode = "learning";
        parsed.active.shape = "mixed";
        parsed.active.title = "Mixed-format practice";
        parsed.active.kicker = "Learning mode · feedback after each answer";
      }
      return parsed;
    } catch (error) {
      return defaultProfile();
    }
  }

  function setSyncStatus(copy) {
    var node = $("sync-status");
    if (node) node.textContent = copy;
  }

  function queueBackendSave(snapshot) {
    if (!backendReady || scenarioMode) return;
    var sequence = ++localChangeSequence;
    writeSyncMeta(true);
    setSyncStatus("Saving…");
    saveChain = saveChain.catch(function () {}).then(async function () {
      var response = await fetch(PROGRESS_ENDPOINT, {
        method: "PUT",
        credentials: "same-origin",
        cache: "no-store",
        keepalive: true,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({state:snapshot})
      });
      var payload = {};
      try { payload = await response.json(); } catch (error) {}
      if (!response.ok) throw new Error(payload.message || "Progress could not be saved online.");
      serverRevision = Number(payload.revision || serverRevision);
      if (sequence === localChangeSequence) {
        writeSyncMeta(false);
        setSyncStatus("Saved online");
      }
    }).catch(function () {
      setSyncStatus("Saved on this device");
    });
  }

  function saveProfile() {
    if (scenarioMode) return;
    writeLocalProfile(profile);
    queueBackendSave(clone(profile));
  }

  async function loadBackendProfile() {
    var sessionResponse = await fetch(SESSION_ENDPOINT, {cache:"no-store", credentials:"same-origin"});
    if (!sessionResponse.ok) {
      window.location.replace("./");
      return defaultProfile();
    }
    var identity = await sessionResponse.json();
    learnerEmail = identity.email;
    backendReady = true;
    $("account-controls").hidden = false;

    var localProfile = loadProfile();
    try {
      var progressResponse = await fetch(PROGRESS_ENDPOINT, {cache:"no-store", credentials:"same-origin"});
      if (!progressResponse.ok) throw new Error("Progress could not be loaded.");
      var remote = await progressResponse.json();
      serverRevision = Number(remote.revision || 0);
      var meta = readSyncMeta();
      var localIsUnsynced = meta && meta.email === learnerEmail && meta.dirty === true && Number(meta.serverRevision || 0) === serverRevision;

      if (remote.state && validProfile(remote.state) && !localIsUnsynced) {
        writeLocalProfile(remote.state);
        writeSyncMeta(false);
        setSyncStatus("Saved online");
        return remote.state;
      }

      profile = localProfile;
      writeLocalProfile(localProfile);
      queueBackendSave(clone(localProfile));
      await saveChain;
      return localProfile;
    } catch (error) {
      setSyncStatus("Saved on this device");
      return localProfile;
    }
  }

  function showScreen(id) {
    $all(".screen").forEach(function (screen) { screen.classList.toggle("active", screen.id === id); });
    window.scrollTo(0, 0);
  }

  function getCourse(courseId) { return COURSES[courseId]; }
  function getConcept(courseId, conceptId) {
    return getCourse(courseId).concepts.filter(function (concept) { return concept.id === conceptId; })[0] || null;
  }
  function getQuestion(courseId, questionId) { return getCourse(courseId).questions[questionId] || null; }
  function getStudySet(courseId, setId) {
    return getCourse(courseId).runs.filter(function (item) { return item.id === Number(setId); })[0] || null;
  }

  function attemptsFor(courseId, conceptId) {
    var courseAttempts = profile.conceptAttempts[courseId] || {};
    return courseAttempts[conceptId] || [];
  }

  function attemptType(attempt) {
    if (attempt.type) return attempt.type;
    if (attempt.perspective === "apply") return "mcq-apply";
    if (attempt.perspective === "connect") return "mcq-connect";
    return "legacy-mcq";
  }

  function attemptBlock(attempt) {
    return attempt.blockId || "legacy-history";
  }

  function unresolvedAttempt(attempts, predicate, resolver) {
    for (var index = attempts.length - 1; index >= 0; index -= 1) {
      if (!predicate(attempts[index])) continue;
      return !attempts.slice(index + 1).some(function (later) { return resolver(later, attempts[index]); });
    }
    return false;
  }

  function confidenceWasDiagnostic(attempt) {
    return ["low", "medium", "high"].indexOf(attempt.confidence) >= 0 && attempt.confidencePrompted !== false && attempt.scored !== false;
  }

  function confidentErrorRemainsOpen(attempts) {
    for (var index = attempts.length - 1; index >= 0; index -= 1) {
      var error = attempts[index];
      if (error.scored === false || error.correct || error.confidence !== "high") continue;
      var repairs = attempts.slice(index + 1).filter(function (later) {
        return later.scored !== false && later.correct && (later.variantFamily || later.questionId) !== (error.variantFamily || error.questionId);
      });
      if (unique(repairs.map(function (attempt) { return attempt.variantFamily || attempt.questionId; })).length < 2 || unique(repairs.map(attemptBlock)).length < 2) return true;
    }
    return false;
  }

  function recurringMisconception(attempts) {
    var wrong = attempts.filter(function (attempt) { return attempt.scored !== false && !attempt.correct && attempt.misconception; });
    return unique(wrong.map(function (attempt) { return attempt.misconception; })).filter(function (tag) {
      var events = wrong.filter(function (attempt) { return attempt.misconception === tag; });
      return unique(events.map(function (attempt) { return attempt.variantFamily || attempt.questionId; })).length >= 2 || unique(events.map(attemptBlock)).length >= 2;
    })[0] || null;
  }

  function evidenceFromAttempts(attempts, now) {
    now = now || Date.now();
    var scored = attempts.filter(function (attempt) { return attempt.scored !== false; });
    var constructed = attempts.filter(function (attempt) { return attempt.scored === false && attempt.type === "short-answer"; });
    var correct = scored.filter(function (attempt) { return attempt.correct; });
    var latest = scored[scored.length - 1] || null;
    var recent = scored.slice(-3);
    var wrongRecent = recent.filter(function (attempt) { return !attempt.correct; }).length;
    var correctTypes = unique(correct.map(attemptType));
    var correctBlocks = unique(correct.map(attemptBlock).filter(function (block) { return block !== "legacy-history"; }));
    var bossStepEvidence = scored.some(function (attempt) { return attempt.boss && !attempt.hintUsed && (attempt.bossStepsPassed > 0 || (attempt.bossStepsPassed === undefined && attempt.correct)); });
    var wholeChainSuccess = scored.some(function (attempt) { return attempt.boss && !attempt.hintUsed && (attempt.wholeItemCorrect === true || (attempt.wholeItemCorrect === undefined && attempt.correct)); });
    var transferCorrect = correct.some(function (attempt) {
      return attempt.transfer || attempt.boss || attempt.type === "case-cloze" || ["apply", "connect", "evaluate", "synthesis"].indexOf(attempt.perspective) >= 0;
    });
    var integrativeEvidence = transferCorrect || bossStepEvidence;
    var openConfidentError = confidentErrorRemainsOpen(scored);
    var openUnderconfidentCorrect = unresolvedAttempt(scored, function (attempt) {
      return attempt.correct && attempt.confidence === "low";
    }, function (later, event) {
      return later.correct && (later.variantFamily || later.questionId) !== (event.variantFamily || event.questionId);
    });
    var recurringError = recurringMisconception(scored);
    var openBossFailure = unresolvedAttempt(scored, function (attempt) {
      return attempt.boss && (attempt.bossStepsFailed > 0 || (attempt.bossStepsFailed === undefined && !attempt.correct));
    }, function (later) { return later.boss && later.correct && !later.hintUsed; });
    var status = "developing";
    if (!attempts.length) status = "unseen";
    else if (scored.length && (!correct.length || wrongRecent >= 2 || openConfidentError || recurringError || openBossFailure)) status = "needs";
    else if (scored.length >= 5 && correct.length >= 4 && correctTypes.length >= 3 && correctBlocks.length >= 2 && integrativeEvidence && !openUnderconfidentCorrect && latest && latest.correct) status = "strong";

    var firstCorrectAt = correct.length ? correct[0].at : 0;
    var delayedCorrect = correct.some(function (attempt) { return firstCorrectAt && attempt.at - firstCorrectAt >= 20 * 60 * 60 * 1000; });
    var lastCorrectAt = correct.length ? correct[correct.length - 1].at : 0;
    var refreshDue = !!lastCorrectAt && now - lastCorrectAt > 4 * 24 * 60 * 60 * 1000;
    var confidenceAttempts = scored.filter(confidenceWasDiagnostic);
    var highAttempts = confidenceAttempts.filter(function (attempt) { return attempt.confidence === "high"; });
    var lowCorrect = confidenceAttempts.filter(function (attempt) { return attempt.confidence === "low" && attempt.correct; }).length;
    var highAccuracy = highAttempts.length ? highAttempts.filter(function (attempt) { return attempt.correct; }).length / highAttempts.length : null;
    var confidenceBlocks = unique(confidenceAttempts.map(attemptBlock));
    var confidenceTypes = unique(confidenceAttempts.map(attemptType));
    var enoughConfidenceEvidence = confidenceAttempts.length >= 20 && confidenceBlocks.length >= 3 && confidenceTypes.length >= 2;
    var confidenceLabel = "Not enough diagnostic confidence evidence yet (" + confidenceAttempts.length + " of 20 checks)";
    if (openConfidentError) confidenceLabel = "One confident mistake needs two independent checks";
    else if (enoughConfidenceEvidence && lowCorrect >= Math.ceil(confidenceAttempts.filter(function (attempt) { return attempt.confidence === "low"; }).length / 2)) confidenceLabel = "Your confidence is still catching up to demonstrated results";
    else if (enoughConfidenceEvidence && (highAccuracy === null || highAccuracy >= .75)) confidenceLabel = "Your confidence broadly matches your demonstrated results";

    var reasons = [];
    if (status === "unseen") reasons.push("No scored attempt yet.");
    else {
      reasons.push(correct.length + " of " + scored.length + " scored attempts correct.");
      if (constructed.length) reasons.push(constructed.length + " constructed response" + (constructed.length === 1 ? "" : "s") + " self-reviewed; these do not receive automatic correctness credit.");
      reasons.push(correctTypes.length + " distinct question type" + (correctTypes.length === 1 ? "" : "s") + " passed (3 required)." );
      reasons.push(correctBlocks.length + " of 2 required practice blocks passed.");
      reasons.push(integrativeEvidence ? "Applied evidence is present from a new case or reasoning step." : "A new case or successful reasoning step is still needed.");
      if (bossStepEvidence && !wholeChainSuccess) reasons.push("A boss step supports this concept; the whole reasoning chain remains open.");
      else if (wholeChainSuccess) reasons.push("An unassisted whole reasoning chain is complete.");
      if (openConfidentError) reasons.push("One ‘could explain’ mistake needs two independent repairs before it closes.");
      else if (openUnderconfidentCorrect) reasons.push("A correct guessing/not-sure answer needs one independent new-family confirmation.");
      else if (recurringError) reasons.push("The same misconception returned across independent evidence: " + recurringError + ".");
      else if (openBossFailure) reasons.push("A failed reasoning step still needs a later whole-chain check.");
      else if (status === "strong" && refreshDue) reasons.push("Strong evidence is more than four days old; a short refresh is due.");
      else if (status === "strong") reasons.push(delayedCorrect ? "Recalled again after a gap of at least 20 hours." : "Strong current evidence; a later retest will check retention.");
      else if (latest && !latest.correct) reasons.push("The latest answer was wrong; one miss does not erase earlier evidence.");
    }
    return {
      status: status,
      attempts: scored.length,
      correct: correct.length,
      constructed: constructed.length,
      correctTypes: correctTypes.length,
      correctBlocks: correctBlocks.length,
      bossStepEvidence: bossStepEvidence,
      wholeChainSuccess: wholeChainSuccess,
      transferCorrect: transferCorrect,
      integrativeEvidence: integrativeEvidence,
      openConfidentError: openConfidentError,
      openUnderconfidentCorrect: openUnderconfidentCorrect,
      recurringMisconception: recurringError,
      openBossFailure: openBossFailure,
      delayedCorrect: delayedCorrect,
      refreshDue: refreshDue,
      confidenceCount: confidenceAttempts.length,
      confidenceLabel: confidenceLabel,
      reasons: reasons,
      latestAt: latest ? latest.at : 0
    };
  }

  function conceptEvidence(courseId, conceptId) {
    return evidenceFromAttempts(attemptsFor(courseId, conceptId));
  }

  function conceptStatus(courseId, conceptId) {
    return conceptEvidence(courseId, conceptId).status;
  }

  function courseStats(courseId) {
    var counts = {strong: 0, developing: 0, needs: 0, unseen: 0};
    getCourse(courseId).concepts.forEach(function (concept) { counts[conceptStatus(courseId, concept.id)] += 1; });
    counts.total = getCourse(courseId).concepts.length;
    counts.weighted = Math.round((counts.strong + counts.developing * .5) / counts.total * 100);
    return counts;
  }

  function overallStats() {
    return COURSE_IDS.reduce(function (total, courseId) {
      var stats = courseStats(courseId);
      total.strong += stats.strong;
      total.developing += stats.developing;
      total.needs += stats.needs;
      total.unseen += stats.unseen;
      total.total += stats.total;
      return total;
    }, {strong: 0, developing: 0, needs: 0, unseen: 0, total: 0});
  }

  function overallConfidenceSummary() {
    var seen = {};
    var attempts = [];
    COURSE_IDS.forEach(function (courseId) {
      getCourse(courseId).concepts.forEach(function (concept) {
        attemptsFor(courseId, concept.id).forEach(function (attempt) {
          var key = courseId + "|" + attempt.questionId + "|" + attemptBlock(attempt) + "|" + attempt.at;
          if (!seen[key]) { seen[key] = true; attempts.push(attempt); }
        });
      });
    });
    var diagnostic = attempts.filter(confidenceWasDiagnostic);
    var blocks = unique(diagnostic.map(attemptBlock));
    var types = unique(diagnostic.map(attemptType));
    if (diagnostic.length < 20 || blocks.length < 3 || types.length < 2) return "Confidence is sampled on diagnostic questions. An overall summary needs 20 checks across three study blocks and two formats; " + diagnostic.length + " are available.";
    var high = diagnostic.filter(function (attempt) { return attempt.confidence === "high"; });
    var highWrong = high.filter(function (attempt) { return !attempt.correct; }).length;
    var low = diagnostic.filter(function (attempt) { return attempt.confidence === "low"; });
    var lowCorrect = low.filter(function (attempt) { return attempt.correct; }).length;
    if (highWrong) return "Across diagnostic checks, " + highWrong + " of " + high.length + " ‘could explain’ answers were wrong. Those concepts receive contrastive repair; this is not a learner label.";
    if (lowCorrect >= 2) return lowCorrect + " of " + low.length + " guessing/not-sure answers were correct. New-family checks will test whether that knowledge is reliable.";
    return "Diagnostic confidence and scored results are broadly aligned so far. Counts remain visible and no personality or permanent trait is inferred.";
  }

  function questionSurfaces(courseId, conceptId) {
    var surfaces = Object.keys(getCourse(courseId).questions).map(function (id) { return getCourse(courseId).questions[id]; })
      .filter(function (question) {
        return question.conceptId === conceptId || (question.supportingConceptIds || []).indexOf(conceptId) >= 0;
      });
    var activeSurfaces = surfaces.filter(function (question) { return !question.optionShapeRisk; });
    return activeSurfaces.length ? activeSurfaces : surfaces;
  }

  function questionLastAttemptAt(courseId, questionId) {
    var question = getQuestion(courseId, questionId);
    if (!question) return 0;
    var conceptIds = [question.conceptId].concat(question.supportingConceptIds || []);
    var attempts = conceptIds.reduce(function (all, conceptId) {
      return all.concat(attemptsFor(courseId, conceptId).filter(function (attempt) { return attempt.questionId === questionId; }));
    }, []);
    attempts.sort(function (a, b) { return a.at - b.at; });
    return attempts.length ? attempts[attempts.length - 1].at : 0;
  }

  function chooseQuestion(courseId, conceptId, avoidId, queuedIds) {
    var attempts = attemptsFor(courseId, conceptId);
    var usedTypes = attempts.map(attemptType);
    var usedFamilies = attempts.map(function (attempt) { return attempt.variantFamily || attempt.questionId; });
    var surfaces = questionSurfaces(courseId, conceptId).filter(function (question) {
      return question.id !== avoidId && queuedIds.indexOf(question.id) < 0;
    });
    if (!surfaces.length) surfaces = questionSurfaces(courseId, conceptId).filter(function (question) { return question.id !== avoidId; });
    if (!surfaces.length) return null;
    surfaces.sort(function (a, b) {
      var aFamilyNew = usedFamilies.indexOf(a.variantFamily || a.id) < 0 ? 0 : 1;
      var bFamilyNew = usedFamilies.indexOf(b.variantFamily || b.id) < 0 ? 0 : 1;
      var aTypeNew = usedTypes.indexOf(a.type || "mcq") < 0 ? 0 : 1;
      var bTypeNew = usedTypes.indexOf(b.type || "mcq") < 0 ? 0 : 1;
      return aFamilyNew - bFamilyNew || aTypeNew - bTypeNew || questionLastAttemptAt(courseId, a.id) - questionLastAttemptAt(courseId, b.id);
    });
    return surfaces[0];
  }

  function recordAttempt(courseId, question, outcome, confidenceValue, item, blockId) {
    var evaluation = typeof outcome === "boolean" ? {correct: outcome, partial: outcome ? 1 : 0, conceptResults: {}} : outcome;
    var conceptIds = unique([question.conceptId].concat(question.supportingConceptIds || []));
    profile.conceptAttempts[courseId] = profile.conceptAttempts[courseId] || {};
    conceptIds.forEach(function (conceptId) {
      var attempts = profile.conceptAttempts[courseId][conceptId] || [];
      var hasConceptResult = Object.prototype.hasOwnProperty.call(evaluation.conceptResults || {}, conceptId);
      var conceptCorrect = hasConceptResult ? evaluation.conceptResults[conceptId] : evaluation.correct;
      var relevantBossSteps = [];
      if (question.boss && Array.isArray(evaluation.partResults)) question.steps.forEach(function (step, index) {
        if ((step.conceptIds || []).indexOf(conceptId) >= 0) relevantBossSteps.push(evaluation.partResults[index]);
      });
      var scored = evaluation.scored !== false;
      attempts.push({
        questionId: question.id,
        variantFamily: question.variantFamily || question.id,
        perspective: question.perspective || "explain",
        type: question.type || "mcq",
        skills: question.skills || [],
        difficulty: question.difficulty || 2,
        boss: !!question.boss,
        scored: scored,
        correct: scored ? !!conceptCorrect : null,
        wholeItemCorrect: scored ? !!evaluation.correct : null,
        partial: evaluation.partial || 0,
        confidence: confidenceValue || null,
        confidencePrompted: item && typeof item.askConfidence === "boolean" ? item.askConfidence : ["low", "medium", "high", "skipped"].indexOf(confidenceValue) >= 0,
        confidenceSkipped: confidenceValue === "skipped",
        misconception: evaluation.misconception || null,
        hintUsed: !!evaluation.hintUsed,
        assistanceUsed: !!evaluation.assistanceUsed,
        revealedSteps: !!evaluation.revealedSteps,
        bossStepsPassed: relevantBossSteps.filter(Boolean).length,
        bossStepsFailed: relevantBossSteps.filter(function (result) { return !result; }).length,
        bossStepsTotal: relevantBossSteps.length,
        constructedScore: evaluation.constructedScore === undefined ? null : evaluation.constructedScore,
        constructedTotal: evaluation.constructedTotal === undefined ? null : evaluation.constructedTotal,
        transfer: question.boss || question.type === "case-cloze" || ["apply", "connect", "evaluate", "synthesis"].indexOf(question.perspective) >= 0,
        isReattempt: !!(item && item.isReattempt),
        blockId: blockId || (session && session.blockId) || null,
        at: item && item.at ? item.at : Date.now()
      });
      profile.conceptAttempts[courseId][conceptId] = attempts.slice(-60);
    });
    profile.totalAnswers += 1;
  }

  function renderDashboard(options) {
    options = options || {};
    var overall = overallStats();
    $("header-progress").textContent = overall.strong + " of " + overall.total;
    $("header-progress-fill").style.width = (overall.total ? overall.strong / overall.total * 100 : 0) + "%";
    $("overall-strong").textContent = String(overall.strong);
    $("overall-developing").textContent = String(overall.developing);
    $("overall-needs").textContent = String(overall.needs);
    $("overall-unseen").textContent = String(overall.unseen);
    $("calibration-summary").textContent = overallConfidenceSummary();
    renderCourseCards();
    renderSelectedSubject();
    renderRecommendation();
    setDashboardView(dashboardView);
  }

  function setDashboardView(view, options) {
    options = options || {};
    if (DASHBOARD_VIEWS.indexOf(view) < 0) view = "overview";
    dashboardView = view;
    $("dashboard-screen").setAttribute("data-view", view);
    DASHBOARD_VIEWS.forEach(function (name) {
      var active = name === view;
      var tab = $("tab-" + name);
      var panel = $("panel-" + name);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panel.hidden = !active;
    });
    if (options.focusPanel) $("panel-" + view).focus({preventScroll: true});
  }

  function bindStageTabs() {
    var tabs = $all(".stage-tabs [role='tab']");
    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () { setDashboardView(tab.dataset.view); });
      tab.addEventListener("keydown", function (event) {
        var nextIndex = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        if (nextIndex === null) return;
        event.preventDefault();
        setDashboardView(tabs[nextIndex].dataset.view);
        tabs[nextIndex].focus();
      });
    });
  }

  function renderCourseCards() {
    var grid = $("course-grid");
    grid.innerHTML = "";
    COURSE_IDS.forEach(function (courseId) {
      var course = getCourse(courseId);
      var stats = courseStats(courseId);
      var button = document.createElement("button");
      button.type = "button";
      button.className = "course-card" + (profile.selectedCourse === courseId ? " selected" : "");
      button.setAttribute("aria-pressed", String(profile.selectedCourse === courseId));
      button.setAttribute("aria-label", course.title + ". " + stats.strong + " of " + stats.total + " concepts strong. Open subject dashboard.");
      var targetCopy = stats.strong === stats.total ? "Complete" : (stats.total - stats.strong) + " left";
      button.innerHTML = "<span class='course-code'>" + escapeHtml(course.shortTitle) + "</span>" +
        "<span class='course-name'>" + escapeHtml(course.title) + "</span>" +
        "<span class='course-bottom'><b>" + stats.strong + " / " + stats.total + " strong</b><small>" + escapeHtml(targetCopy) + "</small>" +
        "<span class='mini-track' aria-hidden='true'><i style='width:" + stats.weighted + "%'></i></span></span>";
      button.addEventListener("click", function () {
        profile.selectedCourse = courseId;
        selectedModule = 1;
        inspectedConceptId = null;
        saveProfile();
        renderDashboard();
        var selectedCard = document.querySelector(".course-card.selected");
        if (selectedCard) selectedCard.focus({preventScroll: true});
      });
      grid.appendChild(button);
    });
  }

  function renderSelectedSubject() {
    var courseId = profile.selectedCourse;
    var course = getCourse(courseId);
    var stats = courseStats(courseId);
    $("selected-course-code").textContent = course.shortTitle;
    $("subject-finish-title").textContent = course.shortTitle + " finish line";
    $("subject-title").textContent = course.title;
    $("subject-description").textContent = course.description;
    $("concepts-course-label").textContent = course.shortTitle + " · Concept evidence";
    $("sets-title").textContent = course.shortTitle + " · Ten available study sets";
    $("subject-strong").textContent = stats.strong + " of " + stats.total + " strong";
    $("subject-progress-fill").style.width = stats.weighted + "%";
    $("subject-progress-copy").textContent = subjectProgressCopy(stats);
    $("practice-priority").textContent = stats.needs ? "Practise " + stats.needs + " concepts that need work" : stats.developing ? "Build stronger evidence" : stats.unseen ? "Start the next new concepts" : "Refresh strong concepts";
    renderTrend(courseId);
    renderConceptMap(courseId);
    renderSetList(courseId);
    renderHorizonPlan(profile.horizon || "today");
  }

  function subjectProgressCopy(stats) {
    if (stats.strong === stats.total) return "Every core concept has broad current evidence. Use a generic practice check and later retrieval to keep it fresh.";
    if (stats.needs) return stats.needs + " need practice; these appear first when you practise this subject.";
    if (stats.developing) return stats.developing + " are developing; open one to see exactly which evidence is still missing.";
    return "Choose any concept or start with the first short study set.";
  }

  function courseTrend(courseId) {
    var course = getCourse(courseId);
    var allAttempts = course.concepts.reduce(function (values, concept) {
      return values.concat(attemptsFor(courseId, concept.id));
    }, []);
    var blocks = {};
    allAttempts.forEach(function (attempt) {
      var id = attemptBlock(attempt);
      blocks[id] = blocks[id] || {id: id, at: attempt.at};
      blocks[id].at = Math.max(blocks[id].at, attempt.at);
    });
    var ordered = Object.keys(blocks).map(function (id) { return blocks[id]; }).sort(function (a, b) { return a.at - b.at; });
    return ordered.map(function (block) {
      var total = course.concepts.reduce(function (sum, concept) {
        var past = attemptsFor(courseId, concept.id).filter(function (attempt) { return attempt.at <= block.at; });
        var status = evidenceFromAttempts(past, block.at).status;
        return sum + (status === "strong" ? 1 : status === "developing" ? .5 : 0);
      }, 0);
      return {at: block.at, value: Math.round(total / course.concepts.length * 100)};
    }).slice(-12);
  }

  function renderTrend(courseId) {
    var points = courseTrend(courseId);
    var current = courseStats(courseId).weighted;
    $("trend-current").textContent = current + "%";
    var svg = $("progress-trend");
    var width = 760, height = 220, left = 28, right = 18, top = 22, bottom = 30;
    var chartWidth = width - left - right, chartHeight = height - top - bottom;
    var grid = [0, 25, 50, 75, 100].map(function (value) {
      var y = top + chartHeight - value / 100 * chartHeight;
      return "<line x1='" + left + "' y1='" + y + "' x2='" + (width - right) + "' y2='" + y + "' class='trend-grid'/><text x='2' y='" + (y + 4) + "' class='trend-label'>" + value + "</text>";
    }).join("");
    if (!points.length) {
      svg.innerHTML = grid + "<path class='trend-empty' d='M" + left + " " + (top + chartHeight) + " H" + (width - right) + "'/><text x='" + (width / 2) + "' y='" + (height / 2) + "' text-anchor='middle' class='trend-empty-copy'>Your first practice block will start the line</text>";
      $("trend-description").textContent = "No practice block is recorded yet. The line will reflect demonstrated evidence, not raw effort.";
      return;
    }
    var plotted = points.map(function (point, index) {
      var x = points.length === 1 ? left + chartWidth : left + index / (points.length - 1) * chartWidth;
      var y = top + chartHeight - point.value / 100 * chartHeight;
      return {x:x, y:y, value:point.value};
    });
    var line = plotted.map(function (point, index) { return (index ? "L" : "M") + point.x.toFixed(1) + " " + point.y.toFixed(1); }).join(" ");
    var area = line + " L" + plotted[plotted.length - 1].x.toFixed(1) + " " + (top + chartHeight) + " L" + plotted[0].x.toFixed(1) + " " + (top + chartHeight) + " Z";
    var dots = plotted.map(function (point, index) {
      return "<circle cx='" + point.x + "' cy='" + point.y + "' r='6'><title>Practice block " + (index + 1) + ": " + point.value + "% evidence</title></circle>";
    }).join("");
    svg.innerHTML = grid + "<path class='trend-area' d='" + area + "'/><path class='trend-line' d='" + line + "'/>" + dots + "<text x='" + left + "' y='" + (height - 6) + "' class='trend-axis-copy'>First block</text><text x='" + (width - right) + "' y='" + (height - 6) + "' text-anchor='end' class='trend-axis-copy'>Latest</text>";
    var direction = points.length > 1 && points[points.length - 1].value < points[points.length - 2].value ? "The latest block revealed a dip, so the recommendation will revisit the affected concept." : "Correct evidence moves the line; misses can create an honest plateau or dip.";
    $("trend-description").textContent = points.length + " practice block" + (points.length === 1 ? "" : "s") + " shown. " + direction;
  }

  function renderConceptMap(courseId) {
    var course = getCourse(courseId);
    var map = $("concept-map");
    map.innerHTML = "";
    selectedModule = Math.max(1, Math.min(8, selectedModule));
    $("module-position").textContent = "Module " + selectedModule + " of 8";
    $("module-browser-title").textContent = course.modules[selectedModule - 1];
    $("previous-module").disabled = selectedModule === 1;
    $("next-module").disabled = selectedModule === 8;
    course.concepts.filter(function (concept) { return concept.module === selectedModule; }).forEach(function (concept) {
      var evidence = conceptEvidence(courseId, concept.id);
      var button = document.createElement("button");
      button.type = "button";
      button.className = "concept-node " + evidence.status + (inspectedConceptId === concept.id ? " selected" : "");
      button.setAttribute("aria-pressed", String(inspectedConceptId === concept.id));
      button.setAttribute("aria-label", concept.name + ". " + STATUS_LABEL[evidence.status] + ". Inspect the evidence.");
      button.innerHTML = "<b>" + escapeHtml(concept.name) + "</b><span>" + STATUS_LABEL[evidence.status] + "</span><small>" + escapeHtml(evidence.reasons[0]) + "</small>";
      button.addEventListener("click", function () { showConceptInspector(courseId, concept.id); });
      map.appendChild(button);
    });
    if (inspectedConceptId && getConcept(courseId, inspectedConceptId) && getConcept(courseId, inspectedConceptId).module === selectedModule) showConceptInspector(courseId, inspectedConceptId, true);
    else $("concept-inspector").hidden = true;
  }

  function showConceptInspector(courseId, conceptId, skipMapRefresh) {
    var concept = getConcept(courseId, conceptId);
    if (!concept) return;
    inspectedConceptId = conceptId;
    var evidence = conceptEvidence(courseId, conceptId);
    var surfaces = questionSurfaces(courseId, conceptId);
    var summaryQuestion = surfaces.filter(function (question) { return question.explanation; })[0];
    $("inspector-status").className = "status-pill " + evidence.status;
    $("inspector-status").textContent = STATUS_LABEL[evidence.status];
    $("inspector-title").textContent = concept.name;
    $("inspector-summary").textContent = concept.summary || (summaryQuestion ? summaryQuestion.explanation : "Practice this concept to build visible evidence.");
    $("inspector-evidence").innerHTML = evidence.reasons.map(function (reason) { return "<li>" + escapeHtml(reason) + "</li>"; }).join("");
    $("inspector-confidence").textContent = evidence.openConfidentError ? evidence.confidenceLabel : evidence.confidenceCount ? evidence.confidenceCount + " diagnostic confidence check" + (evidence.confidenceCount === 1 ? "" : "s") + " on this concept; no stable trait is inferred." : "No diagnostic confidence check for this concept yet.";
    $("concept-inspector").hidden = false;
    if (!skipMapRefresh) renderConceptMap(courseId);
  }

  function renderSetList(courseId) {
    var course = getCourse(courseId);
    var holder = $("set-list");
    holder.innerHTML = "";
    course.runs.forEach(function (definition) {
      var records = profile.completed[courseId] || {};
      var record = records[String(definition.id)];
      var active = profile.active && profile.active.courseId === courseId && profile.active.setId === definition.id;
      var state = active ? "Resume" : record ? "Best " + record.best + "%" : definition.mock ? "Available now" : "Start";
      var button = document.createElement("button");
      button.type = "button";
      button.className = "set-card" + (record ? " complete" : "") + (definition.mock ? " mock" : "");
      button.setAttribute("aria-label", (definition.mock ? "Flexible practice check" : "Study set " + definition.id) + ": " + definition.title + ". " + state);
      button.innerHTML = "<span class='set-number'>" + (definition.mock ? "P" : definition.id) + "</span><span><b>" + escapeHtml(definition.title) + "</b>" +
        "<small>" + (definition.questionCount || definition.questionIds.length) + " questions · ~" + definition.minutes + " min</small></span><span class='set-state'>" + state + "</span>";
      button.addEventListener("click", function () { if (definition.mock) openPracticeSetup(courseId); else startStudySet(courseId, definition.id); });
      holder.appendChild(button);
    });
  }

  function renderHorizonPlan(key) {
    var plan = HORIZON_PLANS[key] || HORIZON_PLANS.today;
    $all(".horizon-choice").forEach(function (button) {
      var selectedChoice = button.dataset.horizon === key;
      button.classList.toggle("selected", selectedChoice);
      button.setAttribute("aria-pressed", String(selectedChoice));
    });
    $("horizon-plan").innerHTML = "<h3>" + escapeHtml(plan.title) + "</h3><ol>" + plan.steps.map(function (step) { return "<li>" + escapeHtml(step) + "</li>"; }).join("") + "</ol><p class='rest-note'>" + escapeHtml(plan.note) + "</p>";
  }

  function recommendation(courseId) {
    var course = getCourse(courseId);
    if (profile.active && profile.active.courseId === courseId) {
      return {kind: "resume", title: "Resume where you stopped", copy: profile.active.title + " is saved at question " + (profile.active.index + 1) + ".", minutes: "Saved", questions: (profile.active.queue.length - profile.active.index) + " left"};
    }
    var concepts = course.concepts.slice();
    var needs = concepts.filter(function (concept) { return conceptStatus(courseId, concept.id) === "needs"; });
    var developing = concepts.filter(function (concept) { return conceptStatus(courseId, concept.id) === "developing"; });
    var unseen = concepts.filter(function (concept) { return conceptStatus(courseId, concept.id) === "unseen"; });
    if (needs.length) {
      needs.sort(function (a, b) { return conceptPriority(courseId, b).score - conceptPriority(courseId, a).score; });
      return {kind:"priority",title:"Practise the concepts that need work first",copy:"Start with " + needs[0].name + " because " + conceptPriority(courseId, needs[0]).reason + ". The set uses a different question family before repeating wording.",minutes:"~10 minutes",questions:"Up to 8 questions"};
    }
    if (developing.length) {
      developing.sort(function (a, b) { return conceptPriority(courseId, b).score - conceptPriority(courseId, a).score; });
      return {kind:"priority",title:"Build the missing evidence",copy:"Start with " + developing[0].name + " because " + conceptPriority(courseId, developing[0]).reason + ".",minutes:"~12 minutes",questions:"Up to 8 questions"};
    }
    if (unseen.length) {
      var firstModule = unseen[0].module;
      return {kind:"set",setId:firstModule,title:"Start the next part of the subject",copy:"Study Module " + firstModule + ": " + course.modules[firstModule - 1] + ". It is a short set and updates the map immediately.",minutes:"~7 minutes",questions:getStudySet(courseId, firstModule).questionIds.length + " questions"};
    }
    return {kind:"mock",title:"All core concepts have strong current evidence",copy:"Choose a generic practice shape to check whether the subject still holds together. It is not a prediction of the final paper.",minutes:"8–24 minutes",questions:"Choose the mix"};
  }

  function renderRecommendation() {
    var courseId = profile.selectedCourse;
    var rec = recommendation(courseId);
    $("next-step-title").textContent = rec.title;
    $("next-step-copy").textContent = rec.copy;
    $("next-step-meta").innerHTML = "<span>" + escapeHtml(rec.minutes) + "</span><span>" + escapeHtml(rec.questions) + "</span>";
    $("start-recommended").innerHTML = recommendationActionLabel(rec) + " <span aria-hidden='true'>→</span>";
  }

  function recommendationActionLabel(rec) {
    if (rec.kind === "resume") return "Resume saved practice";
    if (rec.kind === "set") return "Start this study set";
    if (rec.kind === "mock") return "Choose a practice check";
    return "Practise these concepts";
  }

  function executeRecommendation() {
    var rec = recommendation(profile.selectedCourse);
    if (rec.kind === "resume") return resumeActive();
    if (rec.kind === "set") return startStudySet(profile.selectedCourse, rec.setId);
    if (rec.kind === "mock") return openPracticeSetup(profile.selectedCourse);
    startPriorityPractice(profile.selectedCourse);
  }

  function selectQuestionsFromPool(courseId, poolIds, count, requiredIds) {
    var selectedIds = [];
    var required = (requiredIds || []).slice().sort(function (a, b) {
      return questionLastAttemptAt(courseId, a) - questionLastAttemptAt(courseId, b);
    });
    required.slice(0, Math.min(required.length, count)).forEach(function (id) {
      if (selectedIds.indexOf(id) < 0) selectedIds.push(id);
    });
    var candidates = unique(poolIds).filter(function (id) {
      var question = getQuestion(courseId, id);
      return question && selectedIds.indexOf(id) < 0 && (!(requiredIds || []).length || !question.boss);
    });
    while (selectedIds.length < count && candidates.length) {
      var usedTypes = selectedIds.map(function (id) { return getQuestion(courseId, id).type || "mcq"; });
      var usedConcepts = selectedIds.reduce(function (values, id) {
        var question = getQuestion(courseId, id);
        return values.concat([question.conceptId].concat(question.supportingConceptIds || []));
      }, []);
      candidates.sort(function (aId, bId) {
        var a = getQuestion(courseId, aId), b = getQuestion(courseId, bId);
        var aNew = questionLastAttemptAt(courseId, aId) ? 1 : 0;
        var bNew = questionLastAttemptAt(courseId, bId) ? 1 : 0;
        var aTypeUsed = usedTypes.indexOf(a.type || "mcq") >= 0 ? 1 : 0;
        var bTypeUsed = usedTypes.indexOf(b.type || "mcq") >= 0 ? 1 : 0;
        var aConceptUsed = usedConcepts.indexOf(a.conceptId) >= 0 ? 1 : 0;
        var bConceptUsed = usedConcepts.indexOf(b.conceptId) >= 0 ? 1 : 0;
        return aNew - bNew || aTypeUsed - bTypeUsed || aConceptUsed - bConceptUsed || questionLastAttemptAt(courseId, aId) - questionLastAttemptAt(courseId, bId) || stableQuestionOrder(aId) - stableQuestionOrder(bId);
      });
      selectedIds.push(candidates.shift());
    }
    var bossIds = selectedIds.filter(function (id) { return getQuestion(courseId, id).boss; });
    var constructedIds = selectedIds.filter(function (id) { return getQuestion(courseId, id).type === "short-answer"; });
    return selectedIds.filter(function (id) { return bossIds.indexOf(id) < 0 && constructedIds.indexOf(id) < 0; }).concat(constructedIds, bossIds);
  }

  function stableQuestionOrder(value) {
    return String(value).split("").reduce(function (total, character) { return ((total * 33) + character.charCodeAt(0)) >>> 0; }, 11);
  }

  function questionIdsForSet(courseId, definition) {
    if (!definition.questionPoolIds) return definition.questionIds.slice();
    var count = definition.questionCount || definition.questionIds.length;
    var required = [];
    if (definition.bossIds && definition.bossIds.length) {
      var quota = definition.bossQuota || 1;
      required = definition.bossIds.slice().sort(function (a, b) {
        return questionLastAttemptAt(courseId, a) - questionLastAttemptAt(courseId, b);
      }).slice(0, quota);
    }
    return selectQuestionsFromPool(courseId, definition.questionPoolIds, count, required);
  }

  function createSession(courseId, details, questionIds) {
    var initialStatuses = {};
    getCourse(courseId).concepts.forEach(function (concept) { initialStatuses[concept.id] = conceptStatus(courseId, concept.id); });
    return {
      courseId: courseId,
      kind: details.kind,
      mode: details.mode || "learning",
      shape: details.shape || null,
      setId: details.setId || null,
      conceptId: details.conceptId || null,
      title: details.title,
      kicker: details.kicker,
      queue: questionIds.map(function (id) { return {id: id, initial: true, isReattempt: false, origin: null}; }),
      baseCount: questionIds.length,
      index: 0,
      answered: false,
      selected: null,
      confidence: null,
      subjectiveStage: null,
      rubricSelection: [],
      responses: [],
      initialStatuses: initialStatuses,
      blockId: "block-" + Date.now().toString(36) + "-" + String(profile.blockSequence = (profile.blockSequence || 0) + 1),
      startedAt: Date.now()
    };
  }

  function openPracticeSetup(courseId) {
    var dialog = $("practice-setup-dialog");
    dialog.dataset.courseId = courseId || profile.selectedCourse;
    dialog.showModal();
  }

  function practiceShapeQuestionIds(courseId, shape) {
    var questions = Object.keys(getCourse(courseId).questions).map(function (id) { return getQuestion(courseId, id); })
      .filter(function (question) { return !question.optionShapeRisk; });
    var pool = questions;
    var required = [];
    var count = 12;
    if (shape === "recognition") {
      pool = questions.filter(function (question) { return question.type === "mcq" || question.type === "cloze"; });
    } else if (shape === "application") {
      pool = questions.filter(function (question) { return question.type === "case-cloze" || question.type === "match" || question.type === "boss" || question.perspective === "apply"; });
      required = pool.filter(function (question) { return question.boss; }).sort(function (a, b) { return questionLastAttemptAt(courseId, a.id) - questionLastAttemptAt(courseId, b.id); }).slice(0, 2).map(function (question) { return question.id; });
      count = 10;
    } else if (shape === "generation") {
      pool = questions.filter(function (question) { return question.type === "short-answer" || question.type === "cloze" || question.type === "case-cloze"; });
      required = pool.filter(function (question) { return question.type === "short-answer"; }).sort(function (a, b) { return questionLastAttemptAt(courseId, a.id) - questionLastAttemptAt(courseId, b.id); }).slice(0, 4).map(function (question) { return question.id; });
      count = 8;
    } else {
      ["mcq", "cloze", "case-cloze", "match", "short-answer", "boss"].forEach(function (type) {
        var candidate = questions.filter(function (question) { return question.type === type; }).sort(function (a, b) { return questionLastAttemptAt(courseId, a.id) - questionLastAttemptAt(courseId, b.id); })[0];
        if (candidate) required.push(candidate.id);
      });
    }
    return selectQuestionsFromPool(courseId, pool.map(function (question) { return question.id; }), Math.min(count, pool.length), required);
  }

  function startPracticeShape(courseId, shape, mode) {
    var labels = {mixed:"Mixed-format practice", recognition:"Recognition practice", application:"Case and application practice", generation:"Explain in your own words"};
    var ids = practiceShapeQuestionIds(courseId, shape);
    if (!ids.length) return;
    profile.selectedCourse = courseId;
    session = createSession(courseId, {kind: mode === "simulation" ? "practice-check" : "practice-shape", mode:mode, shape:shape, title:labels[shape] || labels.mixed, kicker:mode === "simulation" ? "Generic practice check · feedback at the end" : "Learning mode · feedback after each answer"}, ids);
    profile.active = clone(session);
    saveProfile();
    beginPractice();
  }

  function startStudySet(courseId, setId) {
    var definition = getStudySet(courseId, setId);
    if (!definition) return;
    if (definition.mock) return openPracticeSetup(courseId);
    profile.selectedCourse = courseId;
    if (profile.active && profile.active.courseId === courseId && profile.active.setId === Number(setId)) {
      session = clone(profile.active);
    } else {
      session = createSession(courseId, {kind: "set", setId: definition.id, title: definition.title, kicker: "Study set " + definition.id + " of 10"}, questionIdsForSet(courseId, definition));
      profile.active = clone(session);
      saveProfile();
    }
    beginPractice();
  }

  function startConceptPractice(courseId, conceptId) {
    var concept = getConcept(courseId, conceptId);
    var surfaceIds = questionSurfaces(courseId, conceptId).map(function (question) { return question.id; });
    var ids = selectQuestionsFromPool(courseId, surfaceIds, Math.min(5, surfaceIds.length), []);
    if (!ids.length) return;
    profile.selectedCourse = courseId;
    session = createSession(courseId, {kind:"concept", conceptId:conceptId, title:concept.name, kicker:"Focused concept practice"}, ids);
    profile.active = clone(session);
    saveProfile();
    beginPractice();
  }

  function conceptPriority(courseId, concept) {
    var evidence = conceptEvidence(courseId, concept.id);
    var score = evidence.status === "needs" ? 100 : evidence.status === "developing" ? 60 : evidence.status === "unseen" ? 45 : evidence.refreshDue ? 30 : 0;
    if (evidence.openConfidentError) score += 35;
    if (evidence.openUnderconfidentCorrect) score += 12;
    if (evidence.recurringMisconception) score += 30;
    if (evidence.attempts && !evidence.delayedCorrect) score += 18;
    if (evidence.attempts && !evidence.integrativeEvidence) score += 15;
    if (evidence.openBossFailure) score += 12;
    var attempts = attemptsFor(courseId, concept.id);
    if (attempts.slice(-3).length >= 3 && attempts.slice(-3).every(function (attempt) { return attemptBlock(attempt) === attemptBlock(attempts[attempts.length - 1]); })) score -= 12;
    var reason = evidence.openConfidentError ? "a confident error needs two independent repairs" : evidence.openUnderconfidentCorrect ? "a correct but uncertain answer needs a new-family confirmation" : evidence.recurringMisconception ? "the same misconception returned" : evidence.status === "needs" ? "recent errors are still open" : evidence.attempts && !evidence.delayedCorrect ? "it has not yet been retrieved after a genuine delay" : evidence.attempts && !evidence.integrativeEvidence ? "it still needs a new case or reasoning step" : evidence.status === "unseen" ? "it has no diagnostic evidence yet" : evidence.refreshDue ? "its last success is due for refresh" : "it has the least recent independent evidence";
    return {score:score, reason:reason};
  }

  function startPriorityPractice(courseId) {
    var course = getCourse(courseId);
    profile.selectedCourse = courseId;
    var concepts = course.concepts.slice().sort(function (a, b) {
      var priorityDifference = conceptPriority(courseId, b).score - conceptPriority(courseId, a).score;
      if (priorityDifference) return priorityDifference;
      var aAttempts = attemptsFor(courseId, a.id);
      var bAttempts = attemptsFor(courseId, b.id);
      var aTime = aAttempts.length ? aAttempts[aAttempts.length - 1].at : 0;
      var bTime = bAttempts.length ? bAttempts[bAttempts.length - 1].at : 0;
      return aTime - bTime;
    });
    var targets = concepts.slice(0, 8);
    var ids = targets.map(function (concept) { return chooseQuestion(courseId, concept.id, null, []) || questionSurfaces(courseId, concept.id)[0]; })
      .filter(Boolean).map(function (question) { return question.id; });
    var firstPriority = targets.length ? conceptPriority(courseId, targets[0]) : null;
    session = createSession(courseId, {kind:"priority", title:"Focused practice", kicker:firstPriority ? "Starts here because " + firstPriority.reason : "Based on your concept evidence"}, ids);
    profile.active = clone(session);
    saveProfile();
    beginPractice();
  }

  function resumeActive() {
    if (!profile.active) return;
    session = clone(profile.active);
    if (!session.blockId) {
      session.blockId = "block-" + Date.now().toString(36) + "-" + String(profile.blockSequence = (profile.blockSequence || 0) + 1);
      profile.active = clone(session);
      saveProfile();
    }
    profile.selectedCourse = session.courseId;
    beginPractice();
  }

  function beginPractice() {
    selected = session.selected;
    confidence = session.confidence || null;
    renderPracticeShell();
    renderQuestion();
    showScreen("practice-screen");
  }

  function currentItem() { return session.queue[session.index]; }
  function currentQuestion() { return getQuestion(session.courseId, currentItem().id); }

  function shouldAskConfidence(question, item) {
    if (typeof item.askConfidence === "boolean") return item.askConfidence;
    var attempts = attemptsFor(session.courseId, question.conceptId).filter(function (attempt) { return attempt.scored !== false; });
    var latest = attempts[attempts.length - 1];
    var usedFamilies = attempts.map(function (attempt) { return attempt.variantFamily || attempt.questionId; });
    var newFamily = usedFamilies.indexOf(question.variantFamily || question.id) < 0;
    var highValue = question.boss || question.type === "short-answer" || ["confident-error", "misconception-repair", "low-confidence-correct", "uncertain-error"].indexOf(item.reason) >= 0;
    var delayed = latest && Date.now() - latest.at >= 20 * 60 * 60 * 1000;
    var firstDiagnostic = !attempts.length;
    var sampledTransfer = newFamily && stableQuestionOrder(question.id + session.blockId) % 100 < 30;
    item.askConfidence = !!(highValue || delayed || firstDiagnostic || sampledTransfer);
    return item.askConfidence;
  }

  function confidenceReady() {
    return !shouldAskConfidence(currentQuestion(), currentItem()) || !!confidence;
  }

  function renderPracticeShell() {
    $("practice-kicker").textContent = session.kicker;
    $("practice-title").textContent = getCourse(session.courseId).shortTitle + " · " + session.title;
    renderTopicList();
    updatePracticeProgress();
  }

  function renderTopicList() {
    var holder = $("topic-list");
    holder.innerHTML = "";
    var conceptIds = unique(session.queue.reduce(function (values, item) {
      var question = getQuestion(session.courseId, item.id);
      return values.concat([question.conceptId].concat(question.supportingConceptIds || []));
    }, []));
    var answeredIds = unique(session.responses.reduce(function (values, response) { return values.concat(response.conceptIds || [response.conceptId]); }, []));
    var currentConceptId = session.index < session.queue.length ? currentQuestion().conceptId : null;
    conceptIds.forEach(function (conceptId) {
      var concept = getConcept(session.courseId, conceptId);
      var li = document.createElement("li");
      li.textContent = concept ? concept.name : getQuestion(session.courseId, session.queue.filter(function (item) { return getQuestion(session.courseId, item.id).conceptId === conceptId; })[0].id).node;
      if (conceptId === currentConceptId) li.className = "active";
      else if (answeredIds.indexOf(conceptId) >= 0) li.className = "done";
      holder.appendChild(li);
    });
  }

  function renderQuestion() {
    if (!session || session.index >= session.queue.length) return finishSession();
    var item = currentItem();
    var question = currentQuestion();
    shouldAskConfidence(question, item);
    selected = session.answered ? session.selected : (session.selected === undefined ? null : session.selected);
    confidence = session.answered ? (session.confidence || (session.responses.length && session.responses[session.responses.length - 1].confidence) || null) : (session.confidence || null);
    $("question-card").classList.remove("is-correct", "is-wrong");
    $("question-pattern").textContent = item.isReattempt ? "Re-attempt · new perspective" : question.pattern;
    $("question-count").textContent = "Question " + (session.index + 1) + " of " + session.queue.length;
    $("question-node").textContent = question.node;
    var status = conceptStatus(session.courseId, question.conceptId);
    $("question-status").className = "status-pill " + status;
    $("question-status").textContent = STATUS_LABEL[status];
    $("question-title").textContent = question.stem;
    $("source-ref").textContent = unique(question.sourceIds || [question.source]).join(" + ") + " · supplied Term 6 course pack";
    $("case-block").hidden = !question.caselet;
    $("caselet").textContent = question.caselet || "";
    $("prompt-flow").classList.toggle("has-case", !!question.caselet);
    $("task-kicker").textContent = question.caselet ? "Then decide" : "Your task";
    $("feedback").className = "feedback";
    $("feedback").innerHTML = "";
    $("commit-answer").hidden = false;
    $("commit-answer").textContent = question.type === "short-answer" && session.mode === "simulation" ? "Save response" : question.type === "short-answer" && session.subjectiveStage === "rubric" ? "Compare with exemplar" : question.type === "short-answer" ? "Review with rubric" : "Check answer";
    $("commit-answer").disabled = !hasCompleteResponse(question) || !confidenceReady() || session.answered;
    $("next-question").hidden = true;
    renderResponseControl(question);
    renderConfidenceControl();
    if (session.answered && session.responses.length) renderResolved(question, session.responses[session.responses.length - 1]);
    renderTopicList();
    updatePracticeProgress();
  }

  function hasCompleteResponse(question) {
    if (question.type === "short-answer") return session.subjectiveStage === "rubric" ? true : typeof selected === "string" && selected.trim().length >= 20;
    if (question.type === "mcq" || !question.type) return typeof selected === "number";
    var count = question.type === "boss" ? question.steps.length : question.type === "match" ? question.rows.length : question.blanks.length;
    return Array.isArray(selected) && selected.length === count && selected.every(function (value) { return typeof value === "number" && value >= 0; });
  }

  function updateCommitState() {
    if (!session || session.answered) return;
    $("commit-answer").disabled = !hasCompleteResponse(currentQuestion()) || !confidenceReady();
    renderConfidenceControl();
  }

  function renderResponseControl(question) {
    if (question.type === "short-answer") return renderShortAnswer(question);
    if (question.type === "cloze" || question.type === "case-cloze") return renderCloze(question);
    if (question.type === "match") return renderMatch(question);
    if (question.type === "boss") return renderBoss(question);
    renderOptions(question);
  }

  function prepareResponseHolder(className) {
    var holder = $("options");
    holder.innerHTML = "";
    holder.className = "options " + className;
    holder.removeAttribute("role");
    holder.removeAttribute("aria-label");
    return holder;
  }

  function renderOptions(question) {
    var holder = prepareResponseHolder("mcq-options");
    holder.setAttribute("role", "radiogroup");
    holder.setAttribute("aria-label", "Answer options");
    question.options.forEach(function (copy, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "option";
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(selected === index));
      button.tabIndex = selected === index || (selected === null && index === 0) ? 0 : -1;
      button.disabled = !!session.answered;
      button.innerHTML = "<span class='option-key'>" + String.fromCharCode(65 + index) + "</span><span>" + escapeHtml(copy) + "</span>";
      if (session.answered && session.mode !== "simulation") {
        if (index === question.answer) button.classList.add("correct");
        if (selected === index && selected !== question.answer) button.classList.add("wrong");
      }
      button.addEventListener("click", function () { selectOption(index); });
      holder.appendChild(button);
    });
    $("question-help").textContent = "Keyboard: 1–" + question.options.length + " or arrow keys to choose";
  }

  function selectOption(index) {
    if (!session || session.answered) return;
    selected = index;
    session.selected = index;
    $all(".option").forEach(function (button, optionIndex) {
      button.setAttribute("aria-checked", String(optionIndex === index));
      button.tabIndex = optionIndex === index ? 0 : -1;
    });
    session.selected = selected;
    updateCommitState();
  }

  function renderSelectOptions(select, options, value) {
    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choose…";
    placeholder.disabled = true;
    placeholder.selected = typeof value !== "number";
    select.appendChild(placeholder);
    options.forEach(function (copy, index) {
      var option = document.createElement("option");
      option.value = String(index);
      option.textContent = copy;
      option.selected = value === index;
      select.appendChild(option);
    });
  }

  function selectResponsePart(partIndex, value) {
    if (!Array.isArray(selected)) selected = [];
    selected[partIndex] = Number(value);
    session.selected = selected.slice();
    updateCommitState();
  }

  function renderShortAnswer(question) {
    var holder = prepareResponseHolder("short-answer-options");
    var label = document.createElement("label");
    label.className = "short-answer-label";
    label.innerHTML = "<span>Your response</span><small>Write before opening the rubric. Your wording is not graded by an opaque model.</small>";
    var textarea = document.createElement("textarea");
    textarea.setAttribute("aria-label", "Your constructed response");
    textarea.placeholder = "State the governing idea, the decision, and the causal reason…";
    textarea.value = typeof selected === "string" ? selected : "";
    textarea.disabled = !!session.answered || session.subjectiveStage === "rubric";
    textarea.addEventListener("input", function () {
      selected = textarea.value;
      session.selected = selected;
      updateCommitState();
    });
    label.appendChild(textarea);
    holder.appendChild(label);
    if (session.mode !== "simulation" && (session.subjectiveStage === "rubric" || session.answered)) {
      var rubric = document.createElement("fieldset");
      rubric.className = "rubric-check";
      rubric.id = "subjective-rubric";
      rubric.innerHTML = "<legend>Check your response against the rubric</legend><p>Select only what your answer already contained. The exemplar appears after this step.</p>";
      (question.rubric || []).forEach(function (criterion, index) {
        var criterionLabel = document.createElement("label");
        var input = document.createElement("input");
        input.type = "checkbox";
        input.checked = (session.rubricSelection || []).indexOf(index) >= 0;
        input.disabled = !!session.answered;
        input.addEventListener("change", function () {
          var values = session.rubricSelection || [];
          if (input.checked && values.indexOf(index) < 0) values.push(index);
          if (!input.checked) values = values.filter(function (value) { return value !== index; });
          session.rubricSelection = values;
        });
        var copy = document.createElement("span");
        copy.innerHTML = "<b>" + escapeHtml(criterion.label) + "</b><small>" + escapeHtml(criterion.description) + "</small>";
        criterionLabel.appendChild(input);
        criterionLabel.appendChild(copy);
        rubric.appendChild(criterionLabel);
      });
      holder.appendChild(rubric);
    }
    $("question-help").textContent = session.mode === "simulation" ? "Write at least a short recommendation. The rubric and exemplar appear at the end" : session.subjectiveStage === "rubric" ? "Self-check against the visible criteria, then compare with the exemplar" : "Write at least a short recommendation before reviewing the rubric";
  }

  function renderCloze(question) {
    var holder = prepareResponseHolder("cloze-options");
    var sentence = document.createElement("div");
    sentence.className = "cloze-sentence";
    (question.template || []).forEach(function (copy, index) {
      sentence.appendChild(document.createTextNode(copy));
      if (!question.blanks[index]) return;
      var label = document.createElement("label");
      label.className = "inline-blank";
      var hidden = document.createElement("span");
      hidden.className = "sr-only";
      hidden.textContent = question.blanks[index].label + ": ";
      var select = document.createElement("select");
      select.disabled = !!session.answered;
      select.setAttribute("aria-label", question.blanks[index].label);
      renderSelectOptions(select, question.blanks[index].options, Array.isArray(selected) ? selected[index] : null);
      if (session.answered && session.mode !== "simulation") select.classList.add(Array.isArray(selected) && selected[index] === question.blanks[index].answer ? "correct" : "wrong");
      select.addEventListener("change", function () { selectResponsePart(index, select.value); });
      label.appendChild(hidden);
      label.appendChild(select);
      sentence.appendChild(label);
    });
    holder.appendChild(sentence);
    $("question-help").textContent = "Choose every blank before checking";
  }

  function renderMatch(question) {
    var holder = prepareResponseHolder("match-options");
    var intro = document.createElement("p");
    intro.className = "format-note";
    intro.textContent = "Each answer is used once. Keyboard users can complete every row with the select controls.";
    holder.appendChild(intro);
    question.rows.forEach(function (row, index) {
      var label = document.createElement("label");
      label.className = "match-row";
      var prompt = document.createElement("span");
      prompt.textContent = row.label;
      var select = document.createElement("select");
      select.disabled = !!session.answered;
      select.setAttribute("aria-label", "Match for " + row.label);
      renderSelectOptions(select, question.choices, Array.isArray(selected) ? selected[index] : null);
      if (session.answered && session.mode !== "simulation") select.classList.add(Array.isArray(selected) && selected[index] === row.answer ? "correct" : "wrong");
      select.addEventListener("change", function () { selectResponsePart(index, select.value); });
      label.appendChild(prompt);
      label.appendChild(select);
      holder.appendChild(label);
    });
    $("question-help").textContent = "Complete all matching rows before checking";
  }

  function renderBoss(question) {
    var holder = prepareResponseHolder("boss-options");
    question.steps.forEach(function (step, index) {
      var label = document.createElement("label");
      label.className = "boss-step";
      var heading = document.createElement("b");
      heading.textContent = step.label;
      var prompt = document.createElement("span");
      prompt.textContent = step.prompt;
      var select = document.createElement("select");
      select.disabled = !!session.answered;
      select.setAttribute("aria-label", step.label + ". " + step.prompt);
      renderSelectOptions(select, step.options, Array.isArray(selected) ? selected[index] : null);
      if (session.answered && session.mode !== "simulation") select.classList.add(Array.isArray(selected) && selected[index] === step.answer ? "correct" : "wrong");
      select.addEventListener("change", function () { selectResponsePart(index, select.value); });
      label.appendChild(heading);
      label.appendChild(prompt);
      label.appendChild(select);
      holder.appendChild(label);
    });
    $("question-help").textContent = "Complete all three reasoning steps before checking";
  }

  function renderConfidenceControl() {
    var show = shouldAskConfidence(currentQuestion(), currentItem()) && (session.answered || hasCompleteResponse(currentQuestion())) && session.subjectiveStage !== "rubric";
    $("confidence-check").hidden = !show;
    $all("input[name='confidence']").forEach(function (input) {
      input.checked = confidence === input.value;
      input.disabled = !!session.answered;
    });
    $("skip-confidence").disabled = !!session.answered;
    $("skip-confidence").setAttribute("aria-pressed", String(confidence === "skipped"));
    $("confidence-check").classList.toggle("resolved", !!session.answered);
    if (show && !session.answered && $("question-help").textContent.indexOf("confidence description") < 0) $("question-help").textContent += ". Then choose the confidence description or skip it";
  }

  function setConfidence(value) {
    if (!session || session.answered) return;
    confidence = value;
    session.confidence = value;
    updateCommitState();
  }

  function evaluateResponse(question) {
    if (question.type === "mcq" || !question.type) {
      var mcqCorrect = selected === question.answer;
      return {correct: mcqCorrect, partial: mcqCorrect ? 1 : 0, partResults: [mcqCorrect], conceptResults: {}, misconception: mcqCorrect ? null : (question.misconceptions || [])[selected] || "wrong-option"};
    }
    var parts = question.type === "boss" ? question.steps : question.type === "match" ? question.rows : question.blanks;
    var partResults = parts.map(function (part, index) { return selected[index] === part.answer; });
    var correctCount = partResults.filter(Boolean).length;
    var conceptResults = {};
    unique([question.conceptId].concat(question.supportingConceptIds || [])).forEach(function (conceptId) {
      var relevant = [];
      if (question.type === "boss") question.steps.forEach(function (step, index) { if ((step.conceptIds || []).indexOf(conceptId) >= 0) relevant.push(partResults[index]); });
      else if (question.type === "match") question.rows.forEach(function (row, index) { if (row.conceptId === conceptId) relevant.push(partResults[index]); });
      else relevant = partResults.slice();
      conceptResults[conceptId] = relevant.length ? relevant.every(Boolean) : partResults.every(Boolean);
    });
    return {
      correct: partResults.every(Boolean),
      partial: correctCount / Math.max(1, partResults.length),
      partResults: partResults,
      conceptResults: conceptResults,
      misconception: partResults.every(Boolean) ? null : (question.misconceptions || [])[partResults.indexOf(false)] || "broken-reasoning-step"
    };
  }

  function ensureReattempt(question, reason) {
    var responsesForConcept = session.responses.filter(function (response) { return response.conceptId === question.conceptId; }).length;
    if (responsesForConcept >= 4) return false;
    var laterIndex = -1;
    for (var index = session.index + 1; index < session.queue.length; index += 1) {
      var laterQuestion = getQuestion(session.courseId, session.queue[index].id);
      if (laterQuestion.conceptId === question.conceptId && laterQuestion.id !== question.id && (laterQuestion.variantFamily || laterQuestion.id) !== (question.variantFamily || question.id)) { laterIndex = index; break; }
    }
    var item;
    if (laterIndex >= 0) {
      item = session.queue.splice(laterIndex, 1)[0];
    } else {
      var queuedIds = session.queue.slice(session.index + 1).map(function (entry) { return entry.id; });
      var alternative = questionSurfaces(session.courseId, question.conceptId).filter(function (candidate) {
        return candidate.id !== question.id && queuedIds.indexOf(candidate.id) < 0 && (candidate.variantFamily || candidate.id) !== (question.variantFamily || question.id);
      }).sort(function (a, b) {
        var aFit = reason === "confident-error" ? (["diagnose", "apply"].indexOf(a.perspective) >= 0 ? 0 : 1) : reason === "uncertain-error" ? (a.difficulty <= 3 ? 0 : 1) : reason === "low-confidence-correct" ? (a.type === "case-cloze" || a.boss ? 0 : 1) : 0;
        var bFit = reason === "confident-error" ? (["diagnose", "apply"].indexOf(b.perspective) >= 0 ? 0 : 1) : reason === "uncertain-error" ? (b.difficulty <= 3 ? 0 : 1) : reason === "low-confidence-correct" ? (b.type === "case-cloze" || b.boss ? 0 : 1) : 0;
        return aFit - bFit || questionLastAttemptAt(session.courseId, a.id) - questionLastAttemptAt(session.courseId, b.id);
      })[0];
      if (!alternative) return false;
      item = {id: alternative.id, initial: false, isReattempt: true, origin: question.id};
    }
    item.isReattempt = true;
    item.origin = question.id;
    item.reason = reason;
    var insertAt = Math.min(session.queue.length, session.index + 3);
    session.queue.splice(insertAt, 0, item);
    return true;
  }

  function beginSubjectiveReview() {
    if (!session || session.answered || currentQuestion().type !== "short-answer" || !hasCompleteResponse(currentQuestion()) || !confidenceReady()) return;
    session.subjectiveStage = "rubric";
    session.selected = selected;
    session.confidence = confidence;
    session.rubricSelection = session.rubricSelection || [];
    profile.active = clone(session);
    saveProfile();
    renderQuestion();
    var rubric = $("subjective-rubric");
    if (rubric) rubric.focus({preventScroll:true});
  }

  function finalizeSubjectiveAnswer(options) {
    options = options || {};
    var item = currentItem();
    var question = currentQuestion();
    var before = conceptStatus(session.courseId, question.conceptId);
    var selectedCriteria = options.deferRubric ? [] : (session.rubricSelection || []).slice();
    var evaluation = {scored:false, correct:null, partial:0, conceptResults:{}, constructedScore:selectedCriteria.length, constructedTotal:(question.rubric || []).length};
    if (session.mode !== "simulation") recordAttempt(session.courseId, question, evaluation, confidence, item, session.blockId);
    var after = conceptStatus(session.courseId, question.conceptId);
    var response = {
      id: question.id,
      conceptId: question.conceptId,
      conceptIds: unique([question.conceptId].concat(question.supportingConceptIds || [])),
      node: question.node,
      source: unique(question.sourceIds || [question.source]).join(" + "),
      selected: selected,
      confidence: confidence,
      confidencePrompted: !!item.askConfidence,
      correct: null,
      scored: false,
      subjective: true,
      rubricSelection: selectedCriteria,
      rubricScore: selectedCriteria.length,
      rubricTotal: (question.rubric || []).length,
      rubricDeferred: !!options.deferRubric,
      evaluation: evaluation,
      isReattempt: !!item.isReattempt,
      initial: !!item.initial,
      perspective: question.perspective || "generate",
      statusBefore: before,
      statusAfter: after,
      explanation: question.explanation,
      link: question.link
    };
    session.answered = true;
    session.selected = selected;
    session.confidence = confidence;
    session.responses.push(response);
    profile.active = clone(session);
    saveProfile();
    renderResolved(question, response);
    renderTopicList();
    updatePracticeProgress();
    $("next-question").focus({preventScroll:true});
  }

  function commitAnswer() {
    if (!session || session.answered || !hasCompleteResponse(currentQuestion()) || !confidenceReady()) return;
    if (currentQuestion().type === "short-answer" && session.mode === "simulation") return finalizeSubjectiveAnswer({deferRubric:true});
    if (currentQuestion().type === "short-answer" && session.subjectiveStage !== "rubric") return beginSubjectiveReview();
    if (currentQuestion().type === "short-answer") return finalizeSubjectiveAnswer();
    var item = currentItem();
    var question = currentQuestion();
    var evaluation = evaluateResponse(question);
    var correct = evaluation.correct;
    var before = conceptStatus(session.courseId, question.conceptId);
    if (session.mode !== "simulation") recordAttempt(session.courseId, question, evaluation, confidence, item, session.blockId);
    var after = conceptStatus(session.courseId, question.conceptId);
    var afterEvidence = conceptEvidence(session.courseId, question.conceptId);
    var scheduled = false;
    if (session.mode !== "simulation" && !correct) scheduled = ensureReattempt(question, confidence === "high" ? "confident-error" : confidence === "low" ? "uncertain-error" : "missed");
    else if (session.mode !== "simulation" && after !== "strong" && (confidence === "low" || afterEvidence.correct < 3)) scheduled = ensureReattempt(question, confidence === "low" ? "low-confidence-correct" : "developing");

    var response = {
      id: question.id,
      conceptId: question.conceptId,
      conceptIds: unique([question.conceptId].concat(question.supportingConceptIds || [])),
      node: question.node,
      source: unique(question.sourceIds || [question.source]).join(" + "),
      selected: selected,
      confidence: confidence,
      confidencePrompted: !!item.askConfidence,
      correct: correct,
      scored: true,
      partial: evaluation.partial,
      partResults: evaluation.partResults,
      conceptResults: evaluation.conceptResults,
      misconception: evaluation.misconception,
      isReattempt: !!item.isReattempt,
      initial: !!item.initial,
      perspective: question.perspective || "explain",
      statusBefore: before,
      statusAfter: after,
      scheduled: scheduled,
      explanation: question.explanation,
      link: question.link
    };
    session.answered = true;
    session.selected = Array.isArray(selected) ? selected.slice() : selected;
    session.confidence = confidence;
    session.responses.push(response);
    profile.active = clone(session);
    saveProfile();
    renderResolved(question, response);
    renderTopicList();
    updatePracticeProgress();
    $("next-question").focus({preventScroll: true});
  }

  function correctAnswerKey(question) {
    if (question.type === "mcq" || !question.type) return [question.options[question.answer]];
    if (question.type === "match") return question.rows.map(function (row) { return row.label + " → " + question.choices[row.answer]; });
    if (question.type === "boss") return question.steps.map(function (step) { return step.label + ": " + step.options[step.answer]; });
    if (question.type === "short-answer") return [question.exemplar];
    return question.blanks.map(function (blank) { return blank.label + ": " + blank.options[blank.answer]; });
  }

  function selectedAnswerCopy(question, response) {
    if (question.type === "mcq" || !question.type) return question.options[response.selected] || "the selected option";
    var failedIndex = (response.partResults || []).indexOf(false);
    if (failedIndex < 0) return "the selected response";
    if (question.type === "boss") return question.steps[failedIndex].options[response.selected[failedIndex]];
    if (question.type === "match") return question.choices[response.selected[failedIndex]];
    return question.blanks[failedIndex].options[response.selected[failedIndex]];
  }

  function contrastiveFeedback(question, response) {
    return "Your choice treated “" + selectedAnswerCopy(question, response) + "” as the deciding rule. Here the governing distinction is: " + question.explanation + " Look for this cue next time: " + question.link;
  }

  function bossStepFeedback(question, response) {
    if (!question.boss || response.correct || !Array.isArray(response.partResults)) return "";
    var passed = response.partResults.map(function (result, index) { return result ? question.steps[index].label.replace(/ ·.*/, "") : null; }).filter(Boolean);
    var failedIndex = response.partResults.indexOf(false);
    var failed = question.steps[failedIndex];
    return (passed.length ? passed.join(" and ") + " still count as evidence. " : "") + "The chain first breaks at " + failed.label.replace(/ ·.*/, "") + ": " + failed.prompt;
  }

  function renderDeferred(question, response) {
    var feedback = $("feedback");
    feedback.className = "feedback visible deferred";
    feedback.innerHTML = "<span class='feedback-label'>Answer saved</span><p>Correctness and explanations are held until the end of this generic practice check.</p>";
    $("commit-answer").hidden = true;
    $("next-question").hidden = false;
    $("next-question").innerHTML = session.index + 1 >= session.queue.length ? "Finish and review <span aria-hidden='true'>→</span>" : "Next question <span aria-hidden='true'>→</span>";
  }

  function renderSubjectiveResolved(question, response) {
    var selectedCriteria = response.rubricSelection || [];
    var criteria = (question.rubric || []).map(function (criterion, index) {
      return "<li><b>" + (selectedCriteria.indexOf(index) >= 0 ? "Included: " : "Still missing: ") + escapeHtml(criterion.label) + "</b> — " + escapeHtml(criterion.description) + "</li>";
    }).join("");
    var feedback = $("feedback");
    feedback.className = "feedback visible reviewed";
    feedback.innerHTML = "<span class='feedback-label'>Self-review recorded: " + response.rubricScore + " of " + response.rubricTotal + " criteria</span><p>This is a transparent self-check, not an automatic grade.</p><ul>" + criteria + "</ul><p class='bridge'><b>Grounded exemplar:</b> " + escapeHtml(question.exemplar) + "</p><p class='return-note'>This constructed response is recorded as practice, but it cannot create Strong evidence without independent checking.</p>";
    $("commit-answer").hidden = true;
    $("next-question").hidden = false;
    $("next-question").innerHTML = session.index + 1 >= session.queue.length ? "Finish this set <span aria-hidden='true'>→</span>" : "Continue <span aria-hidden='true'>→</span>";
  }

  function renderResolved(question, response) {
    selected = Array.isArray(response.selected) ? response.selected.slice() : response.selected;
    confidence = response.confidence || null;
    renderResponseControl(question);
    renderConfidenceControl();
    $("question-status").className = "status-pill " + response.statusAfter;
    $("question-status").textContent = STATUS_LABEL[response.statusAfter];
    if (session.mode === "simulation") return renderDeferred(question, response);
    if (response.subjective) return renderSubjectiveResolved(question, response);
    var feedback = $("feedback");
    feedback.className = "feedback visible" + (response.correct ? "" : " wrong");
    var partCount = response.partResults ? response.partResults.length : 1;
    var partCorrect = response.partResults ? response.partResults.filter(Boolean).length : (response.correct ? 1 : 0);
    var label = response.correct ? "Correct" : (partCorrect ? partCorrect + " of " + partCount + " reasoning parts correct" : "Not yet — this idea will return");
    var returnCopy;
    var evidence = conceptEvidence(session.courseId, question.conceptId);
    if (response.statusAfter === "strong") returnCopy = evidence.delayedCorrect ? "Strong evidence: varied formats, more than one block, applied work, and a later retest are present." : "Strong current evidence: varied formats, more than one block, and applied work are present. A later retest will check retention.";
    else if (!response.correct && response.confidence === "high") returnCopy = "This ‘could explain’ error will return in a different family. It closes only after two independent repairs; difficulty is not increased as punishment.";
    else if (response.correct && response.confidence === "low") returnCopy = "The answer was right. One new-family check will test the distinction again before relying on it.";
    else if (response.scheduled && response.correct) returnCopy = "Good progress. Another question of a different type is placed later in this set.";
    else if (response.scheduled) returnCopy = "A different question on the same idea is placed later in this set—not immediately after this one.";
    else returnCopy = evidence.reasons.filter(function (reason) { return /needed|required|retest|block|type/i.test(reason); })[0] || "This remains in the next practice block for this subject.";
    var answerKey = correctAnswerKey(question);
    var explanationCopy = !response.correct && response.confidence === "high" ? contrastiveFeedback(question, response) : !response.correct && response.confidence === "low" ? "Start from this connection: " + question.link + " The governing distinction is: " + question.explanation : question.explanation;
    var bossCopy = bossStepFeedback(question, response);
    feedback.innerHTML = "<span class='feedback-label'>" + escapeHtml(label) + "</span><p>" + escapeHtml(explanationCopy) + "</p>" +
      (bossCopy ? "<p><b>What remains valid:</b> " + escapeHtml(bossCopy) + "</p>" : "") +
      "<p class='bridge'><b>Why it connects:</b> " + escapeHtml(question.link) + "</p>" +
      (!response.correct ? "<details class='answer-key'><summary>Show the complete answer</summary><ul>" + answerKey.map(function (answer) { return "<li>" + escapeHtml(answer) + "</li>"; }).join("") + "</ul></details>" : "") +
      "<p class='return-note'>" + escapeHtml(returnCopy) + "</p>";
    $("commit-answer").hidden = true;
    $("next-question").hidden = false;
    $("next-question").innerHTML = session.index + 1 >= session.queue.length ? "Finish this set <span aria-hidden='true'>→</span>" : "Continue <span aria-hidden='true'>→</span>";
  }

  function nextQuestion() {
    if (!session || !session.answered) return;
    session.index += 1;
    session.answered = false;
    session.selected = null;
    session.confidence = null;
    session.subjectiveStage = null;
    session.rubricSelection = [];
    selected = null;
    confidence = null;
    if (session.index >= session.queue.length) return finishSession();
    profile.active = clone(session);
    saveProfile();
    renderQuestion();
    (currentQuestion().caselet ? $("case-block") : $("question-title")).focus({preventScroll: true});
  }

  function updatePracticeProgress() {
    if (!session) return;
    var answered = session.responses.length;
    var total = session.queue.length;
    $("practice-progress-text").textContent = Math.min(session.index + 1, total) + " of " + total;
    $("question-count").textContent = "Question " + Math.min(session.index + 1, total) + " of " + total;
    $("practice-progress-fill").style.width = (total ? answered / total * 100 : 0) + "%";
    $("due-count").textContent = String(session.queue.slice(session.index + 1).filter(function (item) { return item.isReattempt; }).length);
  }

  function finishSession() {
    if (!session) return;
    if (session.mode === "simulation") session.responses.forEach(function (response, responseIndex) {
      if (response.evidenceRecorded) return;
      var question = getQuestion(session.courseId, response.id);
      var item = session.queue.filter(function (entry) { return entry.id === response.id; })[0] || {id:response.id, initial:response.initial, isReattempt:response.isReattempt};
      var evaluation = response.evaluation || {scored:response.scored !== false, correct:response.correct, partial:response.partial || 0, partResults:response.partResults || [], conceptResults:response.conceptResults || {}, misconception:response.misconception || null, constructedScore:response.rubricScore, constructedTotal:response.rubricTotal};
      recordAttempt(session.courseId, question, evaluation, response.confidence, item, session.blockId);
      response.evidenceRecorded = true;
      response.statusAfter = conceptStatus(session.courseId, response.conceptId);
    });
    var completedSession = clone(session);
    var initialResponses = completedSession.responses.filter(function (response) { return response.initial; });
    var scoredInitial = initialResponses.filter(function (response) { return response.scored !== false; });
    var initialCorrect = scoredInitial.filter(function (response) { return response.correct; }).length;
    var percent = Math.round(initialCorrect / Math.max(1, scoredInitial.length) * 100);
    if (completedSession.setId) {
      profile.completed[completedSession.courseId] = profile.completed[completedSession.courseId] || {};
      var record = profile.completed[completedSession.courseId][String(completedSession.setId)] || {attempts: 0, best: 0};
      record.attempts += 1;
      record.last = percent;
      record.best = Math.max(record.best, percent);
      profile.completed[completedSession.courseId][String(completedSession.setId)] = record;
    }
    if (completedSession.kind === "practice-check") profile.lastMock[completedSession.courseId] = {percent: percent, shape:completedSession.shape, generic:true, at:new Date().toISOString()};
    profile.active = null;
    saveProfile();
    lastFinished = completedSession;
    renderDashboard();
    renderResults(completedSession, percent);
    showScreen("results-screen");
  }

  function renderResults(completedSession, percent) {
    var initialResponses = completedSession.responses.filter(function (response) { return response.initial; });
    var scoredInitial = initialResponses.filter(function (response) { return response.scored !== false; });
    var constructed = initialResponses.filter(function (response) { return response.subjective; });
    var initialCorrect = scoredInitial.filter(function (response) { return response.correct; }).length;
    var initialMissed = scoredInitial.filter(function (response) { return !response.correct; }).length;
    var reattempts = completedSession.responses.filter(function (response) { return response.isReattempt && response.correct; }).length;
    var touched = unique(completedSession.responses.reduce(function (values, response) { return values.concat(response.conceptIds || [response.conceptId]); }, []));
    var improved = touched.filter(function (conceptId) {
      return STATUS_ORDER[conceptStatus(completedSession.courseId, conceptId)] > STATUS_ORDER[completedSession.initialStatuses[conceptId]];
    }).length;

    $("results-kicker").textContent = completedSession.kind === "practice-check" ? "Generic practice check complete" : completedSession.kind === "practice-shape" ? "Learning practice complete" : "Study set complete";
    $("results-title").textContent = percent >= 75 ? "Good work. Your next step is clear." : percent >= 50 ? "Useful progress. Keep building it." : "This showed exactly what to practise next.";
    $("results-copy").textContent = constructed.length ? "Scored questions updated your evidence. Constructed responses were stored as transparent self-review only, not automatic correctness." : "The dashboard has updated. Missed and developing concepts now appear ahead of new material when you continue this subject.";
    $("result-score").textContent = percent + "%";
    $("score-caption").textContent = scoredInitial.length + " scored question" + (scoredInitial.length === 1 ? "" : "s");
    $("result-correct").textContent = String(initialCorrect);
    $("result-missed").textContent = String(initialMissed);
    $("result-third-label").textContent = constructed.length ? (completedSession.mode === "simulation" ? "Written responses" : "Responses self-reviewed") : "Re-attempts passed";
    $("result-reattempts").textContent = String(constructed.length || reattempts);
    $("result-improved").textContent = String(improved);
    $("score-ring").style.borderColor = percent >= 75 ? "#5da77e" : percent >= 50 ? "#d6953d" : "#c65e54";

    var review = $("result-review");
    review.innerHTML = "";
    touched.forEach(function (conceptId) {
      var concept = getConcept(completedSession.courseId, conceptId);
      var response = completedSession.responses.filter(function (item) { return (item.conceptIds || [item.conceptId]).indexOf(conceptId) >= 0; }).slice(-1)[0];
      var status = conceptStatus(completedSession.courseId, conceptId);
      var evidence = conceptEvidence(completedSession.courseId, conceptId);
      var confidenceCopy = evidence.openConfidentError ? evidence.confidenceLabel : evidence.confidenceCount ? evidence.confidenceCount + " diagnostic confidence check" + (evidence.confidenceCount === 1 ? "" : "s") + " recorded" : "No confidence inference from this concept";
      var article = document.createElement("article");
      article.className = "review-item " + status;
      article.innerHTML = "<small>" + STATUS_LABEL[status] + " · " + escapeHtml(response.source) + "</small><b>" + escapeHtml(concept ? concept.name : response.node) + "</b><p>" + escapeHtml(evidence.reasons[evidence.reasons.length - 1] || response.link) + "</p><span>" + escapeHtml(confidenceCopy) + "</span>";
      review.appendChild(article);
    });
    if (!touched.length) review.innerHTML = "<p>No concept response was recorded.</p>";
    renderAnswerReview(completedSession);
    $("result-primary").innerHTML = recommendationActionLabel(recommendation(completedSession.courseId)) + " <span aria-hidden='true'>→</span>";
    $("result-primary").onclick = function () { executeRecommendation(); };
    $("repeat-set").textContent = completedSession.kind === "practice-check" || completedSession.kind === "practice-shape" ? "Repeat this practice" : "Repeat this set";
    $("repeat-set").onclick = repeatFinished;
  }

  function selectedAnswerList(question, response) {
    if (response.subjective) return [response.selected];
    if (question.type === "mcq" || !question.type) return [question.options[response.selected] || "No answer recorded"];
    if (question.type === "match") return question.rows.map(function (row, index) { return row.label + " → " + question.choices[response.selected[index]]; });
    if (question.type === "boss") return question.steps.map(function (step, index) { return step.label + ": " + step.options[response.selected[index]]; });
    return question.blanks.map(function (blank, index) { return blank.label + ": " + blank.options[response.selected[index]]; });
  }

  function renderAnswerReview(completedSession) {
    var section = $("answer-review-section");
    var holder = $("answer-review");
    if (completedSession.mode !== "simulation") {
      section.hidden = true;
      holder.innerHTML = "";
      return;
    }
    section.hidden = false;
    holder.innerHTML = "";
    completedSession.responses.filter(function (response) { return response.initial; }).forEach(function (response, index) {
      var question = getQuestion(completedSession.courseId, response.id);
      var article = document.createElement("article");
      article.className = response.subjective ? "reviewed" : response.correct ? "correct" : "wrong";
      var chosen = selectedAnswerList(question, response);
      var correct = correctAnswerKey(question);
      var rubric = response.subjective ? "<p><b>Rubric</b></p><ul>" + (question.rubric || []).map(function (criterion) { return "<li><b>" + escapeHtml(criterion.label) + ":</b> " + escapeHtml(criterion.description) + "</li>"; }).join("") + "</ul>" : "";
      article.innerHTML = "<h3>" + (index + 1) + ". " + escapeHtml(question.stem) + "</h3>" +
        (response.subjective ? "<p><b>Your response:</b> " + escapeHtml(response.selected) + "</p><p>" + (response.rubricDeferred ? "This response was held for comparison at the end and was not automatically graded." : "<b>Self-review:</b> " + response.rubricScore + " of " + response.rubricTotal + " criteria selected. This is not an automatic grade.") + "</p>" : "<p><b>Result:</b> " + (response.correct ? "Correct" : "Needs repair") + "</p>") +
        "<details" + (response.subjective ? " open" : "") + "><summary>Compare the response and explanation</summary><p><b>Your answer</b></p><ul>" + chosen.map(function (copy) { return "<li>" + escapeHtml(copy) + "</li>"; }).join("") + "</ul><p><b>Grounded answer</b></p><ul>" + correct.map(function (copy) { return "<li>" + escapeHtml(copy) + "</li>"; }).join("") + "</ul>" + rubric + "<p>" + escapeHtml(question.explanation) + "</p></details>";
      holder.appendChild(article);
    });
  }

  function repeatFinished() {
    if (!lastFinished) return goDashboard();
    if (lastFinished.setId) return startStudySet(lastFinished.courseId, lastFinished.setId);
    if (lastFinished.kind === "concept") return startConceptPractice(lastFinished.courseId, lastFinished.conceptId);
    if (lastFinished.kind === "practice-check" || lastFinished.kind === "practice-shape") return startPracticeShape(lastFinished.courseId, lastFinished.shape || "mixed", lastFinished.mode || "learning");
    startPriorityPractice(lastFinished.courseId);
  }

  function goDashboard() {
    session = null;
    selected = null;
    confidence = null;
    dashboardView = "overview";
    renderDashboard();
    showScreen("dashboard-screen");
  }

  function leavePractice() {
    if (session) {
      profile.active = clone(session);
      saveProfile();
    }
    goDashboard();
  }

  function confirmReset() {
    try { localStorage.removeItem(profileStorageKey()); } catch (error) {}
    profile = defaultProfile();
    session = null;
    lastFinished = null;
    dashboardView = "overview";
    saveProfile();
    $("reset-dialog").close();
    renderDashboard();
    showScreen("dashboard-screen");
    toast("Your Term 6 progress was reset.");
  }

  async function signOut() {
    if (!BACKEND_ACTIVE) return;
    setSyncStatus("Signing out…");
    try { await saveChain; } catch (error) {}
    try {
      await fetch(SESSION_ENDPOINT, {
        method:"DELETE",
        credentials:"same-origin",
        cache:"no-store"
      });
    } catch (error) {}
    window.location.replace("./");
  }

  function toast(copy) {
    var node = $("toast");
    node.textContent = copy;
    node.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { node.classList.remove("show"); }, 2200);
  }

  function seedScenarioProgress() {
    var now = Date.now();
    COURSE_IDS.forEach(function (courseId, courseIndex) {
      getCourse(courseId).concepts.forEach(function (concept, index) {
        var surfaces = questionSurfaces(courseId, concept.id);
        if (!surfaces.length) return;
        var mode = (index + courseIndex) % 4;
        var byType = function (type) { return surfaces.filter(function (question) { return question.type === type; })[0]; };
        var picks = unique([byType("mcq"), byType("cloze"), byType("case-cloze"), byType("match"), byType("boss")].filter(Boolean));
        if (mode === 0 && picks.length >= 5) {
          picks.slice(0, 3).forEach(function (question, pickIndex) { recordAttempt(courseId, question, true, pickIndex ? "medium" : "low", {at:now - (28 - pickIndex) * 60 * 60 * 1000}, "scenario-early-" + courseId); });
          recordAttempt(courseId, picks[3], false, "low", {at:now - 3 * 60 * 60 * 1000}, "scenario-late-" + courseId);
          recordAttempt(courseId, picks[4], true, "high", {at:now - 60 * 60 * 1000}, "scenario-late-" + courseId);
        } else if (mode === 1) {
          recordAttempt(courseId, picks[0], true, "low", {at:now - 2 * 60 * 60 * 1000}, "scenario-building-" + courseId);
          recordAttempt(courseId, picks[Math.min(1, picks.length - 1)], true, "medium", {at:now - 60 * 60 * 1000}, "scenario-building-" + courseId);
        } else if (mode === 2) {
          recordAttempt(courseId, picks[0], true, "medium", {at:now - 3 * 60 * 60 * 1000}, "scenario-needs-" + courseId);
          recordAttempt(courseId, picks[Math.min(1, picks.length - 1)], false, "high", {at:now - 2 * 60 * 60 * 1000}, "scenario-needs-" + courseId);
          recordAttempt(courseId, picks[Math.min(2, picks.length - 1)], false, "medium", {at:now - 60 * 60 * 1000}, "scenario-needs-" + courseId);
        }
      });
    });
  }

  function demoSelection(question, shouldBeCorrect) {
    if (question.type === "short-answer") return "I would name the governing idea, make a recommendation from the case evidence, and explain the causal reason behind that decision.";
    if (question.type === "mcq" || !question.type) return shouldBeCorrect ? question.answer : (question.answer + 1) % question.options.length;
    var parts = question.type === "boss" ? question.steps : question.type === "match" ? question.rows : question.blanks;
    return parts.map(function (part, index) {
      if (shouldBeCorrect || index > 0) return part.answer;
      var options = question.type === "match" ? question.choices : part.options;
      return (part.answer + 1) % options.length;
    });
  }

  function openQuestionScenario(courseId, question, resolved) {
    session = createSession(courseId, {kind:"concept",conceptId:question.conceptId,title:question.node,kicker:question.pattern}, [question.id]);
    profile.selectedCourse = courseId;
    profile.active = clone(session);
    beginPractice();
    if (resolved) {
      selected = demoSelection(question, false);
      session.selected = Array.isArray(selected) ? selected.slice() : selected;
      setConfidence("high");
      commitAnswer();
      if (question.type === "short-answer" && session.subjectiveStage === "rubric") {
        session.rubricSelection = [0, 1];
        commitAnswer();
      }
    }
  }

  function openRoutineQuestionScenario() {
    var question = Object.keys(getCourse("BRGSA").questions).map(function (id) { return getQuestion("BRGSA", id); }).filter(function (item) { return item.type === "mcq"; })[0];
    session = createSession("BRGSA", {kind:"concept",conceptId:question.conceptId,title:question.node,kicker:"Routine retrieval"}, [question.id]);
    session.queue[0].askConfidence = false;
    profile.selectedCourse = "BRGSA";
    profile.active = clone(session);
    beginPractice();
  }

  function renderSimulationResultsScenario() {
    var courseId = "IBM";
    var ids = practiceShapeQuestionIds(courseId, "mixed");
    session = createSession(courseId, {kind:"practice-check",mode:"simulation",shape:"mixed",title:"Mixed-format practice",kicker:"Generic practice check · feedback at the end"}, ids);
    profile.selectedCourse = courseId;
    session.queue.forEach(function (item, index) {
      var question = getQuestion(courseId, item.id);
      var before = conceptStatus(courseId, question.conceptId);
      var confidenceValue = index % 3 === 0 ? (index % 2 ? "high" : "low") : null;
      item.askConfidence = !!confidenceValue;
      if (question.type === "short-answer") {
        var subjectiveEvaluation = {scored:false,correct:null,partial:0,conceptResults:{},constructedScore:2,constructedTotal:question.rubric.length};
        session.responses.push({id:question.id,conceptId:question.conceptId,conceptIds:[question.conceptId],node:question.node,source:question.source,selected:"A concise recommendation that names the framework, applies it to the case, and gives the causal reason.",confidence:confidenceValue,confidencePrompted:!!confidenceValue,correct:null,scored:false,subjective:true,rubricSelection:[0,2],rubricScore:2,rubricTotal:question.rubric.length,evaluation:subjectiveEvaluation,isReattempt:false,initial:true,perspective:question.perspective,statusBefore:before,statusAfter:before,explanation:question.explanation,link:question.link});
        return;
      }
      selected = demoSelection(question, index % 3 !== 1);
      var evaluation = evaluateResponse(question);
      session.responses.push({id:question.id,conceptId:question.conceptId,conceptIds:unique([question.conceptId].concat(question.supportingConceptIds || [])),node:question.node,source:unique(question.sourceIds || [question.source]).join(" + "),selected:Array.isArray(selected) ? selected.slice() : selected,confidence:confidenceValue,confidencePrompted:!!confidenceValue,correct:evaluation.correct,scored:true,partial:evaluation.partial,partResults:evaluation.partResults,conceptResults:evaluation.conceptResults,misconception:evaluation.misconception,isReattempt:false,initial:true,perspective:question.perspective,statusBefore:before,statusAfter:before,explanation:question.explanation,link:question.link});
    });
    session.index = session.queue.length;
    finishSession();
  }

  function applyScenario(name) {
    scenarioMode = true;
    profile = defaultProfile();
    document.body.setAttribute("data-scenario", name);
    if (name === "dashboard-progress") {
      seedScenarioProgress();
      renderDashboard();
      return showScreen("dashboard-screen");
    }
    if (name === "dashboard-concepts" || name === "dashboard-plan") {
      seedScenarioProgress();
      dashboardView = name === "dashboard-concepts" ? "concepts" : "plan";
      renderDashboard();
      return showScreen("dashboard-screen");
    }
    if (name === "practice-setup") {
      dashboardView = "plan";
      renderDashboard();
      showScreen("dashboard-screen");
      return openPracticeSetup("BRGSA");
    }
    if (name === "simulation-results") return renderSimulationResultsScenario();
    if (name === "question") return startStudySet("SPMS", 1);
    if (name === "question-routine") return openRoutineQuestionScenario();
    if (name === "question-mcq") return openQuestionScenario("BRGSA", Object.keys(getCourse("BRGSA").questions).map(function (id) { return getQuestion("BRGSA", id); }).filter(function (question) { return question.type === "mcq"; })[0], false);
    if (name === "question-cloze") return openQuestionScenario("IBM", Object.keys(getCourse("IBM").questions).map(function (id) { return getQuestion("IBM", id); }).filter(function (question) { return question.type === "case-cloze"; })[0], false);
    if (name === "question-match") return openQuestionScenario("SCLM", Object.keys(getCourse("SCLM").questions).map(function (id) { return getQuestion("SCLM", id); }).filter(function (question) { return question.type === "match"; })[0], false);
    if (name === "question-boss") return openQuestionScenario("SPMS", Object.keys(getCourse("SPMS").questions).map(function (id) { return getQuestion("SPMS", id); }).filter(function (question) { return question.type === "boss"; })[0], false);
    if (name === "question-boss-review") return openQuestionScenario("SPMS", Object.keys(getCourse("SPMS").questions).map(function (id) { return getQuestion("SPMS", id); }).filter(function (question) { return question.type === "boss"; })[0], true);
    if (name === "question-short-answer") return openQuestionScenario("BRGSA", Object.keys(getCourse("BRGSA").questions).map(function (id) { return getQuestion("BRGSA", id); }).filter(function (question) { return question.type === "short-answer"; })[0], false);
    if (name === "question-short-answer-review") return openQuestionScenario("BRGSA", Object.keys(getCourse("BRGSA").questions).map(function (id) { return getQuestion("BRGSA", id); }).filter(function (question) { return question.type === "short-answer"; })[0], true);
    if (name === "feedback") {
      startStudySet("SCLM", 3);
      var question = currentQuestion();
      selected = demoSelection(question, false);
      session.selected = Array.isArray(selected) ? selected.slice() : selected;
      setConfidence("high");
      return commitAnswer();
    }
    if (name === "priority") {
      var course = getCourse("IBM");
      recordAttempt("IBM", questionSurfaces("IBM", course.concepts[0].id)[0], false, "high", {at:Date.now() - 1000}, "priority-seed");
      recordAttempt("IBM", questionSurfaces("IBM", course.concepts[1].id)[0], true, "low", {at:Date.now()}, "priority-seed");
      return startPriorityPractice("IBM");
    }
    if (name === "results") {
      profile.selectedCourse = "IBM";
      session = createSession("IBM", {kind:"set",setId:1,title:getStudySet("IBM",1).title,kicker:"Study set 1 of 10"}, getStudySet("IBM",1).questionIds);
      session.queue.forEach(function (item, index) {
        var question = getQuestion("IBM", item.id);
        var correct = index !== 1;
        var before = conceptStatus("IBM", question.conceptId);
        recordAttempt("IBM", question, correct, correct ? "medium" : "high", {at:Date.now() + index}, session.blockId);
        session.responses.push({id:question.id,conceptId:question.conceptId,node:question.node,source:question.source,correct:correct,confidence:correct ? "medium" : "high",isReattempt:false,initial:true,perspective:question.perspective,statusBefore:before,statusAfter:conceptStatus("IBM",question.conceptId),link:question.link});
      });
      session.index = session.queue.length;
      return finishSession();
    }
    renderDashboard();
    showScreen("dashboard-screen");
  }

  function bindEvents() {
    bindStageTabs();
    $("brand-home").addEventListener("click", goDashboard);
    $("start-recommended").addEventListener("click", executeRecommendation);
    $("start-selected-mock").addEventListener("click", function () { openPracticeSetup(profile.selectedCourse); });
    $("practice-priority").addEventListener("click", function () { startPriorityPractice(profile.selectedCourse); });
    $("start-course").addEventListener("click", function () { startStudySet(profile.selectedCourse, 1); });
    $("previous-module").addEventListener("click", function () { selectedModule -= 1; inspectedConceptId = null; renderConceptMap(profile.selectedCourse); });
    $("next-module").addEventListener("click", function () { selectedModule += 1; inspectedConceptId = null; renderConceptMap(profile.selectedCourse); });
    $("practice-inspected").addEventListener("click", function () { if (inspectedConceptId) startConceptPractice(profile.selectedCourse, inspectedConceptId); });
    $("leave-practice").addEventListener("click", leavePractice);
    $("commit-answer").addEventListener("click", commitAnswer);
    $("next-question").addEventListener("click", nextQuestion);
    $("results-home").addEventListener("click", goDashboard);
    $("reset-progress").addEventListener("click", function () { $("reset-dialog").showModal(); });
    $("cancel-reset").addEventListener("click", function () { $("reset-dialog").close(); });
    $("confirm-reset").addEventListener("click", confirmReset);
    $("sign-out").addEventListener("click", signOut);
    $("skip-confidence").addEventListener("click", function () { setConfidence("skipped"); renderConfidenceControl(); });
    $all(".horizon-choice").forEach(function (button) {
      button.addEventListener("click", function () {
        profile.horizon = button.dataset.horizon;
        saveProfile();
        renderHorizonPlan(profile.horizon);
      });
    });
    $("close-practice-setup").addEventListener("click", function (event) { event.preventDefault(); $("practice-setup-dialog").close(); });
    $("begin-practice-shape").addEventListener("click", function (event) {
      event.preventDefault();
      var dialog = $("practice-setup-dialog");
      var modeInput = document.querySelector("input[name='practice-mode']:checked");
      var shapeInput = document.querySelector("input[name='practice-shape']:checked");
      var courseId = dialog.dataset.courseId || profile.selectedCourse;
      dialog.close();
      startPracticeShape(courseId, shapeInput ? shapeInput.value : "mixed", modeInput ? modeInput.value : "learning");
    });
    $all("input[name='confidence']").forEach(function (input) {
      input.addEventListener("change", function () { if (input.checked) { setConfidence(input.value); renderConfidenceControl(); } });
    });
    document.addEventListener("keydown", function (event) {
      if (!session || !$("practice-screen").classList.contains("active")) return;
      if (event.target && /^(SELECT|INPUT|TEXTAREA)$/.test(event.target.tagName)) return;
      if (event.target && event.target.tagName === "BUTTON" && (!event.target.classList.contains("option") || event.key === "Enter")) return;
      var question = currentQuestion();
      var isMcq = !question.type || question.type === "mcq";
      if (!session.answered && isMcq && /^(ArrowRight|ArrowDown|ArrowLeft|ArrowUp)$/.test(event.key)) {
        event.preventDefault();
        var direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
        var optionCount = question.options.length;
        var currentIndex = selected === null ? (direction > 0 ? -1 : 0) : selected;
        var arrowIndex = (currentIndex + direction + optionCount) % optionCount;
        selectOption(arrowIndex);
        $all(".option")[arrowIndex].focus();
      } else if (!session.answered && isMcq && /^[1-4]$/.test(event.key)) {
        var index = Number(event.key) - 1;
        if (index < question.options.length) selectOption(index);
      } else if (event.key === "Enter" && !session.answered && hasCompleteResponse(question) && confidenceReady()) {
        event.preventDefault();
        commitAnswer();
      } else if (event.key === "Enter" && session.answered) {
        event.preventDefault();
        nextQuestion();
      }
    });
  }

  function unique(values) { return values.filter(function (value, index) { return values.indexOf(value) === index; }); }
  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (character) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[character];
    });
  }

  async function init() {
    if (COURSE_IDS.some(function (courseId) { return !COURSES[courseId] || !COURSES[courseId].questions || !COURSES[courseId].concepts; })) {
      document.body.innerHTML = "<main><h1>Term 6 content failed to load.</h1><p>Please restart the local server and refresh.</p></main>";
      return;
    }
    var scenario = new URLSearchParams(window.location.search).get("scenario");
    document.body.setAttribute("aria-busy", "true");
    profile = BACKEND_ACTIVE && !scenario ? await loadBackendProfile() : loadProfile();
    bindEvents();
    if (scenario) applyScenario(scenario);
    else if (profile.active) {
      resumeActive();
    } else {
      renderDashboard();
      showScreen("dashboard-screen");
    }
    document.body.removeAttribute("aria-busy");
  }

  init().catch(function () {
    document.body.removeAttribute("aria-busy");
    profile = loadProfile();
    bindEvents();
    renderDashboard();
    showScreen("dashboard-screen");
    setSyncStatus("Saved on this device");
  });
})();
