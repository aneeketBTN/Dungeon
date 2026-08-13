(function () {
  "use strict";

  var COURSES = window.T6_COURSES || {};
  var COURSE_IDS = ["BRGSA", "IBM", "SCLM", "SPMS"];

  /* The Batch 1 timetable, from docs/briefs/T6_EXAM_PATTERN.md.
   *
   * Two papers a day, back to back, and the gap between the first and last is
   * about 28 hours — so the order you revise in is a real constraint, not a
   * preference. `seat` is the sitting order across both days and is what the
   * default sort uses: whatever you sit first is what you can least afford to
   * leave until the end. */
  var EXAM_SCHEDULE = {
    SPMS:  {seat: 1, day: "Sat 22 Aug", short: "Aug 22", full: "Saturday 22 August", start: "09:00", end: "11:00", marks: 75,  negative: true,  note: "35 MCQs + 20 multi-select"},
    BRGSA: {seat: 2, day: "Sat 22 Aug", short: "Aug 22", full: "Saturday 22 August", start: "13:00", end: "15:00", marks: 80,  negative: false, note: "20 MCQs + 4 cases + 2 written"},
    IBM:   {seat: 3, day: "Sun 23 Aug", short: "Aug 23", full: "Sunday 23 August",   start: "09:00", end: "11:00", marks: 100, negative: false, note: "10 written answers on a released caselet"},
    SCLM:  {seat: 4, day: "Sun 23 Aug", short: "Aug 23", full: "Sunday 23 August",   start: "13:00", end: "15:00", marks: 80,  negative: false, note: "50 MCQs + 6 numericals + 3 matches"}
  };

  var EXAM_ORDER = COURSE_IDS.slice().sort(function (a, b) {
    return (EXAM_SCHEDULE[a] || {}).seat - (EXAM_SCHEDULE[b] || {}).seat;
  });

  var SORT_MODES = {
    exam: {label: "Exam order", hint: "The order you sit them."},
    hardest: {label: "Hardest for you", hint: "Least evidence first, using your own attempts."}
  };

  /* Sort is presentation only — it never changes what is scheduled inside a
   * subject, so switching it cannot alter anyone's practice or evidence. */
  function orderedCourseIds(mode) {
    if (mode !== "hardest") return EXAM_ORDER.slice();
    return EXAM_ORDER.slice().sort(function (a, b) {
      var left = courseStats(a);
      var right = courseStats(b);
      // Weakest first. Ties fall back to the sitting order, so the list is stable
      // before any practice exists rather than alphabetical by accident.
      if (left.weighted !== right.weighted) return left.weighted - right.weighted;
      return EXAM_SCHEDULE[a].seat - EXAM_SCHEDULE[b].seat;
    });
  }
  var STORAGE_KEY = "term6.revision.v2";
  var LEGACY_CLAIM_KEY = "term6.revision.v2.claimed-by";
  var BACKEND_ACTIVE = window.location.pathname.indexOf("/dungeon") === 0;
  var SESSION_ENDPOINT = "api/session";
  var PROGRESS_ENDPOINT = "api/progress";
  var COMMUNITY_ENDPOINT = "api/community";
  var STATUS_ORDER = {unseen: 0, needs: 1, developing: 2, strong: 3};
  var STATUS_LABEL = {unseen: "Not started", needs: "Needs practice", developing: "Developing", strong: "Strong"};
  var profile;
  var session = null;
  var selected = null;
  var confidence = null;
  var lastFinished = null;
  var scenarioMode = false;
  var toastTimer = null;
  var learnerEmail = null;
  var backendReady = false;
  var serverRevision = 0;
  var localChangeSequence = 0;
  var saveChain = Promise.resolve();
  var communityState = {joined:true, inviteOpenedAt:null, reminderAt:null};
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

  var PRACTICE_SHAPES = [
    {id: "mixed", label: "Mixed formats", hint: "Recognition, cases, writing, and reasoning", runTitle: "Mixed-format practice"},
    {id: "recognition", label: "Recognition", hint: "Multiple choice and precise recall", runTitle: "Recognition practice"},
    {id: "application", label: "Cases and application", hint: "Decisions, matching, and reasoning chains", runTitle: "Case and application practice"},
    {id: "generation", label: "In your own words", hint: "Short answers with a visible rubric", runTitle: "Explain in your own words"}
  ];
  var PRACTICE_FOCUS = [
    {id: "all", label: "Anything", hint: "Every concept in this subject", summary: "anything in the subject"},
    {id: "weak", label: "What needs work", hint: "Open misses and missing evidence first", summary: "concepts that need work"},
    {id: "new", label: "New ground", hint: "Concepts you have not started", summary: "concepts you have not started"}
  ];
  var PRACTICE_LENGTHS = [
    {id: "quick", label: "Quick", target: 6},
    {id: "standard", label: "Standard", target: 12},
    {id: "deep", label: "Deep", target: 18}
  ];
  var PRACTICE_MODES = [
    {id: "learning", label: "After each answer", hint: "Explanation and repair straight away"},
    {id: "simulation", label: "Held to the end", hint: "Answers and rubrics wait for the review"}
  ];
  var DEFAULT_BUILDER = {shape: "mixed", focus: "all", length: "standard", mode: "learning"};

  function $(id) { return document.getElementById(id); }
  function $all(selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function defaultProfile() {
    return {
      version: 2,
      // The first paper sat, not the first alphabetically. A learner opening this
      // for the first time should land on the subject with the least time left.
      selectedCourse: EXAM_ORDER[0],
      subjectSort: "exam",
      conceptAttempts: {},
      /* What the examiner exposed, kept apart from conceptAttempts on purpose — see
         recordExamMisses. */
      examMisses: {},
      /* One record per submitted paper, so a second sitting of the same set can be
         compared against the first. Summary only — no responses, no question text —
         because the useful question is "did this move" and storing the paper back
         would make a saved profile a copy of the bank. */
      examAttempts: {},
      completed: {},
      lastMock: {},
      active: null,
      totalAnswers: 0,
      blockSequence: 0,
      horizon: "today",
      /* Which keypad the bag opens on, and whether it is out. Both read defensively
         everywhere they are used, so a profile saved before they existed needs no
         migration. It starts put away: a first-time learner should meet the page, not
         a panel sitting on top of it. */
      bagCalculator: "basic",
      bagOpen: false,
      builder: clone(DEFAULT_BUILDER),
      primerState: {},
      lessonsRead: {}
    };
  }

  function optionById(options, id) {
    return options.filter(function (option) { return option.id === id; })[0] || null;
  }

  function validBuilder(candidate) {
    return Boolean(candidate) && Boolean(optionById(PRACTICE_SHAPES, candidate.shape)) &&
      Boolean(optionById(PRACTICE_FOCUS, candidate.focus)) && Boolean(optionById(PRACTICE_LENGTHS, candidate.length)) &&
      Boolean(optionById(PRACTICE_MODES, candidate.mode));
  }

  function validProfile(candidate) {
    return candidate && candidate.version === 2 && COURSE_IDS.indexOf(candidate.selectedCourse) >= 0 &&
      candidate.conceptAttempts && candidate.completed && (!candidate.active || validSession(candidate.active));
  }

  function validSession(candidate) {
    return candidate && COURSES[candidate.courseId] && Array.isArray(candidate.queue) &&
      typeof candidate.index === "number" && Array.isArray(candidate.responses);
  }

  function normalizeProfileShape(candidate) {
    candidate.primerState = candidate.primerState && typeof candidate.primerState === "object" ? candidate.primerState : {};
    /* Added after version 2 shipped, so it is normalised rather than validated: an
       existing saved profile has no examMisses and must not be thrown away for it. */
    candidate.examMisses = candidate.examMisses && typeof candidate.examMisses === "object" ? candidate.examMisses : {};
    candidate.examAttempts = candidate.examAttempts && typeof candidate.examAttempts === "object" ? candidate.examAttempts : {};
    if (!validBuilder(candidate.builder)) candidate.builder = clone(DEFAULT_BUILDER);
    if (candidate.active) {
      candidate.active.baseCount = candidate.active.baseCount || candidate.active.queue.filter(function (item) {
        var question = getQuestion(candidate.active.courseId, item.id);
        return question && question.type !== "primer";
      }).length;
      candidate.active.supportCount = candidate.active.queue.length - candidate.active.baseCount;
    }
    return candidate;
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
      return normalizeProfileShape(parsed);
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
    communityState = identity.community || {joined:false, inviteOpenedAt:null, reminderAt:null};
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
        remote.state = normalizeProfileShape(remote.state);
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

  /* The examiner's screens. Which product you are in is derived from the screen on
     show rather than stored, so the header switch can never drift out of step with
     the page behind it — including on the routes that were written long before the
     switch existed. */
  var EXAM_SCREENS = {"exam-home-screen": true, "exam-screen": true};

  function showScreen(id) {
    $all(".screen").forEach(function (screen) { screen.classList.toggle("active", screen.id === id); });
    markMode(EXAM_SCREENS[id] ? "exam" : "learn");
    syncModeSwitchVisibility();
    /* After markMode, not before: the header reports the side you are on, and the
       screen's own render runs before this and would compute it from the side you
       were on a moment ago. */
    renderHeaderStats();
    /* Each floating offer lives inside its own screen, so changing screens hides it —
       but the body class outlived it, and anything positioned around the bar (the bag)
       went on making room for a bar that was not there. Cleared on every change; the
       observer on the newly shown screen puts it back if its own hero is out of view,
       which after a scroll reset it never is. */
    document.body.classList.remove("has-resume-bar");
    window.scrollTo(0, 0);
    if (id === "dashboard-screen") window.requestAnimationFrame(renderMasteryRadar);
  }

  function getCourse(courseId) { return COURSES[courseId]; }
  function getConcept(courseId, conceptId) {
    return getCourse(courseId).concepts.filter(function (concept) { return concept.id === conceptId; })[0] || null;
  }
  /* ------------------------------------------------------------------
   * Teaching layer
   *
   * A lesson is the surface that makes 0→80 possible: one lecture, taught once,
   * before anything about that lecture is scored. The scheduling invariant is
   * enforced in layeredQueue — a scored question citing lecture L cannot appear
   * before L's lesson has been delivered — so a cold learner never meets a
   * graded item in vocabulary nobody introduced.
   *
   * Lesson queue items encode their lecture and concept in the id
   * ("lesson:<lectureId>|<conceptId>") because the live session is cloned into
   * profile.active and must survive save/resume as plain JSON.
   * ---------------------------------------------------------------- */
  var LESSONS = window.T6_LESSONS || {};

  function lessonFor(lectureId) { return LESSONS[lectureId] || null; }

  function lessonsReadMap() {
    if (!profile.lessonsRead || typeof profile.lessonsRead !== "object") profile.lessonsRead = {};
    return profile.lessonsRead;
  }

  function lessonIsRead(lectureId) { return !!lessonsReadMap()[lectureId]; }

  function markLessonRead(lectureId) {
    if (!lectureId) return;
    lessonsReadMap()[lectureId] = Date.now();
    saveProfile();
  }

  function lectureIdsFor(question) {
    if (!question) return [];
    return unique((question.sourceIds && question.sourceIds.length ? question.sourceIds : [question.source]) || [])
      .filter(Boolean);
  }

  // Lessons a question depends on that the learner has not been taught yet.
  function pendingLessonsFor(question) {
    return lectureIdsFor(question).filter(function (lectureId) {
      return lessonFor(lectureId) && !lessonIsRead(lectureId);
    });
  }

  function lessonItemId(lectureId, conceptId) { return "lesson:" + lectureId + "|" + conceptId; }

  function parseLessonItemId(questionId) {
    if (String(questionId).indexOf("lesson:") !== 0) return null;
    var body = String(questionId).slice("lesson:".length).split("|");
    return {lectureId: body[0], conceptId: body[1] || null};
  }

  /* A lesson is presented as a synthetic question so the existing session
   * machinery — topic list, progress, save/resume — keeps working unchanged.
   * It is never scored and never creates evidence. */
  function lessonQuestion(courseId, questionId) {
    var parsed = parseLessonItemId(questionId);
    if (!parsed) return null;
    var data = lessonFor(parsed.lectureId);
    if (!data) return null;
    return {
      id: questionId,
      courseId: courseId,
      conceptId: parsed.conceptId,
      supportingConceptIds: [],
      module: data.module,
      source: data.lectureId,
      sourceIds: [data.lectureId],
      node: data.title,
      pattern: "Lesson",
      perspective: "learn",
      type: "lesson",
      skills: ["recognise"],
      difficulty: 0,
      variantFamily: data.lectureId + "_lesson",
      boss: false,
      lessonOnly: true,
      lesson: data,
      caselet: null,
      stem: data.objective,
      explanation: data.objective,
      link: data.connects || "",
      misconceptions: []
    };
  }

  function getQuestion(courseId, questionId) {
    if (String(questionId).indexOf("lesson:") === 0) return lessonQuestion(courseId, questionId);
    return getCourse(courseId).questions[questionId] || null;
  }
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
        return !question.primerOnly && (question.conceptId === conceptId || (question.supportingConceptIds || []).indexOf(conceptId) >= 0);
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
      updatePrimerFromChallenge(courseId, conceptId, question, scored ? !!conceptCorrect : null);
    });
    profile.totalAnswers += 1;
  }

  function primerStateFor(courseId, conceptId) {
    profile.primerState = profile.primerState || {};
    profile.primerState[courseId] = profile.primerState[courseId] || {};
    profile.primerState[courseId][conceptId] = profile.primerState[courseId][conceptId] || {
      support: 1,
      easyStreak: 0,
      shown: 0,
      correct: 0,
      wrong: 0,
      lastAt: 0
    };
    return profile.primerState[courseId][conceptId];
  }

  function primerQuestionFor(courseId, conceptId) {
    return getQuestion(courseId, conceptId + "_primer");
  }

  function primerSupportLevel(courseId, conceptId) {
    var state = primerStateFor(courseId, conceptId);
    var attempts = attemptsFor(courseId, conceptId).filter(function (attempt) { return attempt.scored !== false; });
    var recent = attempts.slice(-2);
    if (conceptStatus(courseId, conceptId) === "strong" || state.easyStreak >= 2 || (recent.length === 2 && recent.every(function (attempt) { return attempt.correct && attempt.difficulty >= 3; }))) return 0;
    if (!attempts.length) return Math.max(1, Math.min(3, state.support || 1));
    var misses = recent.filter(function (attempt) { return !attempt.correct; }).length;
    if (misses === 2) return 3;
    if (misses === 1 || conceptStatus(courseId, conceptId) === "needs") return Math.max(2, Math.min(3, state.support || 1));
    return Math.max(0, Math.min(3, state.support || 0));
  }

  function recordPrimerAttempt(courseId, question, correct) {
    var state = primerStateFor(courseId, question.conceptId);
    state.shown += 1;
    state.lastAt = Date.now();
    if (correct) {
      state.correct += 1;
      state.easyStreak += 1;
      state.support = Math.max(0, state.support - 1);
    } else {
      state.wrong += 1;
      state.easyStreak = 0;
      state.support = Math.min(3, Math.max(2, state.support + 1));
    }
  }

  function updatePrimerFromChallenge(courseId, conceptId, question, correct) {
    if (correct === null || question.primerOnly) return;
    var state = primerStateFor(courseId, conceptId);
    if (!correct) {
      state.easyStreak = 0;
      state.support = Math.min(3, Math.max(2, state.support + 1));
      return;
    }
    if ((question.difficulty || 2) >= 3) state.easyStreak += 1;
    state.support = state.easyStreak >= 2 ? 0 : Math.max(0, state.support - 1);
  }

  function renderDashboard(options) {
    options = options || {};
    var overall = overallStats();
    $("overall-strong").textContent = String(overall.strong);
    $("overall-developing").textContent = String(overall.developing);
    $("overall-needs").textContent = String(overall.needs);
    $("overall-unseen").textContent = String(overall.unseen);
    $("calibration-summary").textContent = overallConfidenceSummary();
    renderCourseCards();
    renderHeaderStats();
    renderMasteryRadar();
    renderSelectedSubject();
    renderRecommendation();
    /* After renderRecommendation, which decides the "next" line the learn face shows. */
    renderCoin("coin-home", "learn");
    renderPracticeBuilder();
    renderProgressStory();
    renderCommunityReminder();
    renderLessonIndex();
    renderConceptShelf();
    // The row is rebuilt above, so its scrollable width has just changed.
    updateRailScrollCue();
  }

  // Blocks are the honest unit of this line: one practice block moves it at most once, so repeating
  // the same questions inside a block cannot inflate it.
  function trendFromCourses(courseIds) {
    var blocks = {};
    var conceptTotal = 0;
    courseIds.forEach(function (courseId) {
      getCourse(courseId).concepts.forEach(function (concept) {
        conceptTotal += 1;
        attemptsFor(courseId, concept.id).forEach(function (attempt) {
          var id = attemptBlock(attempt);
          blocks[id] = blocks[id] || {id: id, at: attempt.at};
          blocks[id].at = Math.max(blocks[id].at, attempt.at);
        });
      });
    });
    var ordered = Object.keys(blocks).map(function (id) { return blocks[id]; })
      .sort(function (a, b) { return a.at - b.at; }).slice(-12);
    return ordered.map(function (block) {
      var total = 0;
      courseIds.forEach(function (courseId) {
        getCourse(courseId).concepts.forEach(function (concept) {
          var past = attemptsFor(courseId, concept.id).filter(function (attempt) { return attempt.at <= block.at; });
          var status = evidenceFromAttempts(past, block.at).status;
          total += status === "strong" ? 1 : status === "developing" ? .5 : 0;
        });
      });
      return {at: block.at, value: Math.round(total / Math.max(1, conceptTotal) * 100)};
    });
  }

  /* How many distinct practice blocks are on record. Counted directly rather than
     taken from trendFromCourses, which rebuilds the evidence model at every block in
     history to plot a line — real work for a number that is just "how many". */
  function practiceBlockCount() {
    var blocks = {};
    COURSE_IDS.forEach(function (courseId) {
      getCourse(courseId).concepts.forEach(function (concept) {
        attemptsFor(courseId, concept.id).forEach(function (attempt) { blocks[attemptBlock(attempt)] = true; });
      });
    });
    return Object.keys(blocks).length;
  }

  /* The header reports the side you are on.
   *
   * On the learning system it is progress and the work behind it. On the examiner
   * those numbers are the wrong ones twice over: mocks deliberately never touch your
   * evidence, so the percentage would sit there unmoved however many papers you sat,
   * and a block count belongs to a product you are not currently in. The examiner's
   * own two numbers are how many papers you have finished and what they averaged. */
  function renderHeaderStats() {
    var label = $("header-stat-label");
    if (currentMode() === "exam") {
      var attempts = [];
      Object.keys(profile.examAttempts || {}).forEach(function (courseId) {
        attempts = attempts.concat(profile.examAttempts[courseId] || []);
      });
      var average = attempts.length
        ? Math.round(attempts.reduce(function (sum, row) { return sum + examPercent(row); }, 0) / attempts.length)
        : null;
      if (label) label.textContent = "Mocks completed";
      $("header-trend-value").textContent = String(attempts.length);
      $("header-trend-note").textContent = average === null ? "No score yet" : "Average score " + average + "%";
      return;
    }
    var overall = overallStats();
    var current = Math.round((overall.strong + overall.developing * .5) / Math.max(1, overall.total) * 100);
    if (label) label.textContent = "Term 6 progress";
    $("header-trend-value").textContent = current + "%";
    var blocks = practiceBlockCount();
    $("header-trend-note").textContent = blocks + " block" + (blocks === 1 ? "" : "s") + " practised";
  }

  /* The route to the goal.
   *
   * This replaced a retrospective sparkline. At zero the sparkline drew an empty
   * dashed line and said nothing was recorded — a chart whose only message to a
   * learner starting out was that they had nothing. The same space now shows the
   * whole distance: where the goal is, where they stand on the way to it, and
   * what is left. The climb is visible before the first answer.
   *
   * The goal is deliberately evidence, not marks: every concept in the subject at
   * Strong. It is reachable by practising, which a predicted score is not, and it
   * keeps the standing rule intact — this moves with demonstrated evidence and
   * never with time spent, and it forecasts nothing about the paper. */
  function goalRouteMarkup(percent, width, height, pad) {
    var t = Math.max(0, Math.min(100, Number(percent) || 0)) / 100;
    var x0 = pad, y0 = height - pad, x1 = width - pad, y1 = pad + 4;
    var cx = x0 + (x1 - x0) * t;
    var cy = y0 + (y1 - y0) * t;
    var parts = [];
    // The whole route, always drawn, so the distance is legible at any progress.
    parts.push("<path d='M" + x0 + " " + y0 + " L" + x1 + " " + y1 + "' class='route-full'/>");
    // Ground covered, as a filled wedge rather than a line, so it reads as gain.
    if (t > 0) {
      parts.push("<path d='M" + x0 + " " + y0 + " L" + cx + " " + cy + " L" + cx + " " + y0 + " Z' class='route-gained'/>");
      parts.push("<path d='M" + x0 + " " + y0 + " L" + cx + " " + cy + "' class='route-done'/>");
    }
    parts.push("<circle cx='" + x1 + "' cy='" + y1 + "' r='5' class='route-goal'/>");
    parts.push("<circle cx='" + cx.toFixed(1) + "' cy='" + cy.toFixed(1) + "' r='4.5' class='route-here'/>");
    // The host <svg> already carries the viewBox, so return shapes only — wrapping
    // these in another <svg> would nest one inside the other.
    return parts.join("");
  }

  function goalMessage(course, stats) {
    var remaining = stats.total - stats.strong;
    if (!remaining) return "Every concept in " + course.shortTitle + " is Strong. This subject is as far as the evidence goes.";
    if (!stats.strong && !stats.developing) {
      return remaining + " concepts stand between here and a complete " + course.shortTitle + ". One short block starts the climb.";
    }
    if (!stats.strong) {
      return stats.developing + " concepts are already building. " + remaining + " still need enough evidence to reach Strong.";
    }
    return stats.strong + " of " + stats.total + " are Strong" +
      (stats.developing ? ", " + stats.developing + " are close behind" : "") +
      ". " + remaining + " to go.";
  }

  function renderMomentum(courseId) {
    var course = getCourse(courseId);
    var stats = courseStats(courseId);
    var points = courseTrend(courseId);
    var delta = points.length > 1 ? points[points.length - 1].value - points[points.length - 2].value : null;
    $("momentum-scope").textContent = course.shortTitle;
    $("momentum-value").textContent = stats.strong + " / " + stats.total;
    var deltaNode = $("momentum-delta");
    deltaNode.className = "momentum-delta " + (delta === null ? "flat" : delta > 0 ? "up" : delta < 0 ? "down" : "flat");
    /* The chip carries movement when there is movement to report, and the target
     * when there is not — so the card is never reduced to announcing an absence. */
    deltaNode.textContent = delta === null
      ? (stats.strong === stats.total ? "complete" : (stats.total - stats.strong) + " to go")
      : delta > 0 ? "+" + delta + " this block" : delta < 0 ? delta + " this block" : "held level";
    $("hero-trend").innerHTML = goalRouteMarkup(stats.weighted, 320, 88, 6);
    drawOnce($("hero-trend"));
    $("momentum-message").textContent = goalMessage(course, stats);
  }


  function progressStory() {
    var seen = {};
    var blocks = {};
    var story = {answers: 0, blocks: 0, touched: 0, subjects: 0, latest: 0};
    COURSE_IDS.forEach(function (courseId) {
      var subjectTouched = false;
      getCourse(courseId).concepts.forEach(function (concept) {
        var attempts = attemptsFor(courseId, concept.id);
        if (attempts.length) { story.touched += 1; subjectTouched = true; }
        attempts.forEach(function (attempt) {
          blocks[attemptBlock(attempt)] = true;
          if (attempt.at > story.latest) story.latest = attempt.at;
          // One question can carry several concepts; count the answer once.
          var key = courseId + "|" + attempt.questionId + "|" + attemptBlock(attempt) + "|" + attempt.at;
          if (seen[key]) return;
          seen[key] = true;
          story.answers += 1;
        });
      });
      if (subjectTouched) story.subjects += 1;
    });
    story.blocks = Object.keys(blocks).length;
    return story;
  }

  function relativeDay(timestamp) {
    if (!timestamp) return "not yet";
    var hours = Math.floor((Date.now() - timestamp) / 3600000);
    if (hours < 1) return "within the hour";
    if (hours < 24) return hours + (hours === 1 ? " hour ago" : " hours ago");
    var days = Math.floor(hours / 24);
    return days === 1 ? "yesterday" : days + " days ago";
  }

  /* What you have done, in one line.
   *
   * This was four bordered stat cards — answers, blocks, concepts touched, subjects
   * started — sitting above four more bordered stat cards for the concept states.
   * Eight boxes of numbers before the learner reached anything they could act on.
   * The same four facts read as a sentence, and the boxes below now carry the only
   * numbers that describe evidence rather than effort. Still strictly factual: no
   * praise, and activity is never presented as progress. */
  function renderProgressStory() {
    var story = progressStory();
    var overall = overallStats();
    if (!story.answers) {
      $("story-stats").textContent = "Nothing is recorded yet. Your first short block fills in every number here.";
      return;
    }
    $("story-stats").textContent = story.answers + " answer" + (story.answers === 1 ? "" : "s") +
      " across " + story.blocks + " practice block" + (story.blocks === 1 ? "" : "s") + ". " +
      story.touched + " of " + overall.total + " concepts have evidence, in " +
      story.subjects + " of " + COURSE_IDS.length + " subjects. Last answer " + relativeDay(story.latest) + ".";
  }

  /* Reading a theme colour from script.
   *
   * Canvas takes no stylesheet, so the radar has to fetch its own ink — and the
   * obvious way does not work. getComputedStyle().getPropertyValue("--blue") returns
   * the *declared* text, which for a themed token is the literal string
   * "light-dark(#176b78, #58c3d5)"; custom properties resolve at use, not at
   * declaration. Assigning the token to a real property and reading that back is
   * what forces the resolution, so a hidden probe carries the whole palette across.
   *
   * Read at paint time, never cached: the theme can change between two paints and a
   * stale value leaves the chart drawn in the theme the learner just left. */
  var colorProbe = null;
  function themeColor(expression) {
    if (!colorProbe) {
      colorProbe = document.createElement("span");
      colorProbe.setAttribute("aria-hidden", "true");
      colorProbe.style.cssText = "position:absolute;width:0;height:0;visibility:hidden;pointer-events:none";
      document.body.appendChild(colorProbe);
    }
    colorProbe.style.color = "";
    colorProbe.style.color = expression;
    return window.getComputedStyle(colorProbe).color;
  }

  /* The score ring sits on the results hero, which is the deep panel in both themes,
     so its three bands are the meaning colours at dark-surface luminance rather than
     the reading-surface ones. Set as an inline style because the band is computed,
     not a class the stylesheet could match. */
  var SCORE_BAND_INK = {high: "var(--green-on-deep)", mid: "var(--saffron)", low: "var(--red-on-deep)"};
  function paintScoreRing() {
    var ring = $("score-ring");
    if (!ring) return;
    ring.style.borderColor = themeColor(SCORE_BAND_INK[ring.dataset.band] || "var(--deep-rule)");
  }

  /* Everything the theme switch cannot reach through CSS. */
  function repaintThemedCanvas() {
    if ($("mastery-radar")) renderMasteryRadar();
    if ($("results-screen") && $("results-screen").classList.contains("active")) paintScoreRing();
  }

  /* The polygon grows out of the centre on first paint. Progress is held here
     rather than passed down, because the paint is re-entered once per frame and the
     axis values must not be recomputed with it — walking all 64 concepts 45 times in
     three quarters of a second is the difference between a smooth grow and a stutter.
     A repaint frame reuses the cached axes and skips the DOM writes entirely. */
  var radarProgress = 1;
  var radarAxes = null;
  var radarGrown = false;

  function growRadar() {
    if (radarGrown || prefersReducedMotion() || !window.requestAnimationFrame) { radarProgress = 1; return; }
    radarGrown = true;
    var started = null;
    var DURATION = 760;
    radarProgress = 0;
    window.requestAnimationFrame(function step(now) {
      if (started === null) started = now;
      var t = Math.min(1, (now - started) / DURATION);
      /* Cubic ease-out: leaves the centre quickly, settles onto the value. */
      radarProgress = 1 - Math.pow(1 - t, 3);
      renderMasteryRadar(true);
      if (t < 1) window.requestAnimationFrame(step);
    });
  }

  function renderMasteryRadar(isFrame) {
    var canvas = $("mastery-radar");
    if (!canvas) return;
    if (isFrame && radarAxes) { paintRadar(canvas, radarAxes, true); return; }
    var connections = 0;
    var conceptCount = 0;
    var axes = COURSE_IDS.map(function (courseId) {
      return {label:getCourse(courseId).shortTitle, value:courseStats(courseId).weighted};
    });
    COURSE_IDS.forEach(function (courseId) {
      getCourse(courseId).concepts.forEach(function (concept) {
        conceptCount += 1;
        if (conceptEvidence(courseId, concept.id).integrativeEvidence) connections += 1;
      });
    });
    axes.push({label:"Connections", value:Math.round(connections / Math.max(1, conceptCount) * 100)});
    radarAxes = axes;
    paintRadar(canvas, axes, false);
  }

  function paintRadar(canvas, axes, isFrame) {
    var size = Math.max(240, Math.min(340, canvas.clientWidth || 320));
    var ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(size * ratio);
    canvas.height = Math.round(size * ratio);
    canvas.style.height = size + "px";
    var context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, size, size);
    var center = size / 2;
    /* Pulled in from .34 to leave room for the vertex labels below. Five unlabelled
     * spokes meant the only way to tell which point was which was to read the value
     * list beside the chart and infer the order — a shape you had to decode. */
    var radius = size * .30;
    function point(index, scale) {
      var angle = -Math.PI / 2 + index * Math.PI * 2 / axes.length;
      return {x:center + Math.cos(angle) * radius * scale, y:center + Math.sin(angle) * radius * scale};
    }
    function polygon(scale, fill, stroke, width) {
      context.beginPath();
      axes.forEach(function (_, index) {
        var vertex = point(index, scale);
        if (!index) context.moveTo(vertex.x, vertex.y); else context.lineTo(vertex.x, vertex.y);
      });
      context.closePath();
      if (fill) { context.fillStyle = fill; context.fill(); }
      context.strokeStyle = stroke;
      context.lineWidth = width;
      context.stroke();
    }
    var gridInk = themeColor("var(--line)");
    var spokeInk = themeColor("var(--grey-soft)");
    var plotInk = themeColor("var(--blue)");
    [1,.75,.5,.25].forEach(function (scale) { polygon(scale, null, gridInk, 1); });
    axes.forEach(function (_, index) {
      var vertex = point(index, 1);
      context.beginPath();
      context.moveTo(center, center);
      context.lineTo(vertex.x, vertex.y);
      context.strokeStyle = spokeInk;
      context.lineWidth = 1;
      context.stroke();
    });
    context.beginPath();
    axes.forEach(function (axis, index) {
      var vertex = point(index, Math.max(.02, axis.value / 100) * radarProgress);
      if (!index) context.moveTo(vertex.x, vertex.y); else context.lineTo(vertex.x, vertex.y);
    });
    context.closePath();
    context.fillStyle = themeColor("var(--blue-glow)");
    context.fill();
    context.strokeStyle = plotInk;
    context.lineWidth = 3;
    context.stroke();
    axes.forEach(function (axis, index) {
      var vertex = point(index, Math.max(.02, axis.value / 100) * radarProgress);
      context.beginPath();
      context.arc(vertex.x, vertex.y, 4, 0, Math.PI * 2);
      context.fillStyle = plotInk;
      context.fill();
    });

    /* Name every vertex on the chart itself.
     *
     * Inline rather than on hover: hover does not exist on a touch screen, and the
     * fifth axis is the one most likely to be misread — four subjects plus
     * "Connections" reads as five subjects until something says otherwise.
     *
     * Only the name is drawn, not the value. The list beside the canvas already
     * carries the numbers, and repeating them here would put the same fact in two
     * places on one screen. */
    context.font = "800 11px Inter, ui-sans-serif, system-ui, sans-serif";
    context.textBaseline = "middle";
    context.fillStyle = themeColor("var(--ink-soft)");
    var labelPad = 4;
    axes.forEach(function (axis, index) {
      var angle = -Math.PI / 2 + index * Math.PI * 2 / axes.length;
      var anchor = {x: center + Math.cos(angle) * (radius + 11), y: center + Math.sin(angle) * (radius + 11)};
      // Push the text away from the spoke it belongs to, so a label never sits on
      // top of the polygon it is naming.
      var horizontal = Math.cos(angle);
      var align = Math.abs(horizontal) < .3 ? "center" : horizontal > 0 ? "left" : "right";
      context.textAlign = align;
      /* Clamp into the canvas. "Connections" is nearly twice the width of a subject
       * acronym and sits on an outer vertex, so at the narrow sizes this canvas is
       * allowed to take it would otherwise be cut off at the edge. */
      var width = context.measureText(axis.label).width;
      var left = align === "left" ? anchor.x : align === "right" ? anchor.x - width : anchor.x - width / 2;
      var shift = left < labelPad ? labelPad - left
        : left + width > size - labelPad ? size - labelPad - (left + width) : 0;
      context.fillText(axis.label, anchor.x + shift, anchor.y);
    });

    if (isFrame) return;
    $("mastery-values").innerHTML = axes.map(function (axis) {
      return "<li><span>" + escapeHtml(axis.label) + "</span><b>" + axis.value + "%</b></li>";
    }).join("");
    /* A canvas is opaque to assistive technology, and `role="img"` without a name
     * announces as an unlabelled image. Name it, say plainly that it has five axes
     * and that the fifth is not a subject, and point at the list that carries the
     * values — rather than reciting the numbers here and making a screen reader
     * hear them twice. */
    canvas.setAttribute("aria-label", "Radar chart with five axes: " +
      axes.map(function (axis) { return axis.label; }).join(", ") +
      ". Connections is not a subject. The value for each is listed beside the chart.");
    $("mastery-radar-copy").textContent = "Subject values reflect Strong and Developing evidence. Connections shows concepts already used in a case, link, or reasoning step.";
  }

  function renderCommunityReminder() {
    var reminder = $("community-reminder");
    if (!reminder) return;
    reminder.hidden = !BACKEND_ACTIVE || !!communityState.joined;
    if (reminder.hidden) return;
    $("community-reminder-title").textContent = communityState.reminderAt ? "Aneeket bumped this reminder" : "Join the tester group to keep testing";
    $("community-reminder-copy").textContent = "Open the WhatsApp invite, join the group, and share feedback during testing. Testers who do not join and participate will be removed from the cohort.";
    $("community-joined").disabled = !communityState.inviteOpenedAt;
    $("community-joined").textContent = communityState.inviteOpenedAt ? "I joined the group" : "Open the invite first";
  }

  /* ------------------------------------------------------------------
   * Read-through mode.
   *
   * A lesson normally reaches a learner only because layeredQueue() puts it
   * ahead of a scored question citing its lecture. That is the right default —
   * teaching arrives just before it is tested — but it has two consequences
   * this panel exists to answer.
   *
   * For the learner: there was no way to read the material as a course, only to
   * meet it one lesson at a time inside practice.
   *
   * For whoever is authoring: a lesson for a lecture no question cites is never
   * delivered to anyone, and nothing in the app said so. IBM module 1 was
   * authored in full before that was noticed; 8 of its 10 lessons are
   * unreachable in practice. This panel labels each lesson with whether
   * practice can actually deliver it, and lists cited lectures that have no
   * lesson yet, which is the authoring queue.
   *
   * Reading here is deliberately NOT recorded. profile.lessonsRead drives the
   * teach-before-test gate, so writing to it here would let someone skim the
   * index and silently disable the gate for every lesson they skimmed.
   * ------------------------------------------------------------------ */
  /* Which lectures can practice actually reach?
   *
   * Not simply "cited by any question in the bank". An optionShapeRisk question
   * is excluded from every scheduling path, so a lecture cited only by one of
   * those is unreachable and its lesson is never delivered. For BRGSA that is
   * the difference between 44 and 33 — eleven lessons this panel would
   * otherwise report as live. Primers are kept, because teachFirst() runs on
   * the primer too and a primer really does pull its lecture's lesson in. */
  function citedLectureIds(courseId) {
    var course = getCourse(courseId);
    var cited = {};
    if (!course) return cited;
    Object.keys(course.questions).forEach(function (id) {
      var question = course.questions[id];
      if (question.optionShapeRisk) return;
      lectureIdsFor(question).forEach(function (lectureId) { cited[lectureId] = true; });
    });
    return cited;
  }

  function lessonStatusFor(lectureId, cited) {
    if (!LESSONS[lectureId]) return {key: "missing", label: "No lesson yet"};
    if (cited[lectureId]) return {key: "live", label: "Taught in practice"};
    return {key: "readonly", label: "Read-only — no question cites this"};
  }

  function appendLessonBody(container, data) {
    function block(tag, className, text) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      container.appendChild(node);
      return node;
    }

    if (data.objective) block("p", "lesson-read-objective", "After this you can: " + data.objective);
    (data.explainer || []).forEach(function (paragraph) { block("p", null, paragraph); });

    if (data.worked) {
      block("h5", "lesson-read-label", "Worked through");
      var worked = block("div", "lesson-read-worked");
      [["Situation", data.worked.setup], ["Move", data.worked.move], ["Why", data.worked.because]]
        .forEach(function (pair) {
          if (!pair[1]) return;
          var line = document.createElement("p");
          var name = document.createElement("b");
          name.textContent = pair[0] + ". ";
          line.appendChild(name);
          line.appendChild(document.createTextNode(pair[1]));
          worked.appendChild(line);
        });
    }

    if ((data.glossary || []).length) {
      block("h5", "lesson-read-label", "Words this lecture introduces");
      var list = document.createElement("dl");
      list.className = "lesson-read-glossary";
      data.glossary.forEach(function (entry) {
        var term = document.createElement("dt");
        term.textContent = entry.term;
        var plain = document.createElement("dd");
        plain.textContent = entry.plain;
        list.appendChild(term);
        list.appendChild(plain);
      });
      container.appendChild(list);
    }

    if (data.connects) block("p", "lesson-read-connects", data.connects);
  }

  /* The concept shelf.
   *
   * Everything a learner needs per concept used to be split across two places: the
   * shelf listed every concept with Practise and Lesson, while a separate module
   * browser paged through the same concepts eight at a time and opened an inspector
   * panel holding the one thing the shelf lacked — the evidence still missing.
   * Two lists of the same 16 concepts, and the reason to act on one of them was
   * only in the list that could not act.
   *
   * The shelf is now the only concept list. The evidence, the summary, and the
   * confidence note moved onto the row they describe, behind the concept's own
   * name, so inspecting a concept is not a place you navigate to.
   *
   * It does not re-render lesson prose — Lesson jumps to the existing lesson row
   * and opens it, so there is one copy of that content, not two that can drift. */
  function openLessonFor(lectureId) {
    // The lesson index lives in a disclosure, so open it before scrolling —
    // otherwise the scroll and focus below land inside a collapsed element.
    revealDisclosure("lessons-disclosure");
    var row = document.querySelector('.lesson-row[data-lecture="' + lectureId + '"]');
    if (!row) return;
    if (row.tagName === "DETAILS") row.open = true;
    row.scrollIntoView({block: "center", behavior: "smooth"});
    var head = row.querySelector(".lesson-row-head");
    if (head && head.focus) head.focus({preventScroll: true});
  }

  function renderConceptShelf() {
    var host = $("concept-shelf-list");
    if (!host) return;
    host.textContent = "";
    var courseId = profile.selectedCourse;
    var course = getCourse(courseId);
    var label = $("concept-shelf-label");
    if (label) label.textContent = (course.shortTitle || courseId) + " · " + (course.concepts || []).length + " concepts";

    var byModule = {};
    (course.concepts || []).forEach(function (concept) {
      (byModule[concept.module] = byModule[concept.module] || []).push(concept);
    });

    Object.keys(byModule).sort(function (a, b) { return Number(a) - Number(b); }).forEach(function (moduleKey) {
      var group = document.createElement("div");
      group.className = "shelf-group";
      var heading = document.createElement("p");
      heading.className = "shelf-module";
      heading.textContent = "Module " + moduleKey;
      group.appendChild(heading);

      byModule[moduleKey].forEach(function (concept) {
        var evidence = conceptEvidence(courseId, concept.id);
        var status = evidence.status;
        var row = document.createElement("div");
        row.className = "shelf-row";

        /* The name is the disclosure control. Toggling with an explicit `hidden`
         * sibling rather than <details> is deliberate: the row is a grid whose
         * state and actions must stay visible while the evidence is collapsed,
         * and a closed <details> hides every non-summary child in the UA layer
         * where author CSS cannot reliably reach it (the LAW-36 shape). */
        var bodyId = "shelf-evidence-" + courseId + "-" + concept.id;
        var name = document.createElement("button");
        name.type = "button";
        name.className = "shelf-name";
        name.setAttribute("aria-expanded", "false");
        name.setAttribute("aria-controls", bodyId);
        name.innerHTML = "<i class='dot " + status + "' aria-hidden='true'></i><b>" + escapeHtml(concept.name) + "</b>" +
          "<span class='shelf-why' aria-hidden='true'>Why</span>";
        row.appendChild(name);

        var state = document.createElement("span");
        state.className = "shelf-state " + status;
        state.textContent = STATUS_LABEL[status] || status;
        row.appendChild(state);

        var actions = document.createElement("span");
        actions.className = "shelf-actions";

        var practise = document.createElement("button");
        practise.type = "button";
        practise.className = "button compact primary";
        practise.textContent = "Practise";
        practise.setAttribute("aria-label", "Practise " + concept.name + " on its own");
        practise.addEventListener("click", function () { startConceptPractice(courseId, concept.id); });
        actions.appendChild(practise);

        // Only offer a lesson where one actually exists; a dead button that
        // explains nothing is worse than no button.
        var lectureId = concept.source;
        if (lectureId && LESSONS[lectureId]) {
          var lesson = document.createElement("button");
          lesson.type = "button";
          lesson.className = "button compact quiet";
          lesson.textContent = "Lesson";
          lesson.setAttribute("aria-label", "Read the lesson for " + concept.name + ", unscored");
          lesson.addEventListener("click", function () { openLessonFor(lectureId); });
          actions.appendChild(lesson);
        }

        row.appendChild(actions);

        // The evidence that used to live in the separate inspector panel: what the
        // concept is, what is still missing before Strong, and what the sampled
        // confidence checks do and do not say.
        var body = document.createElement("div");
        body.className = "shelf-body";
        body.id = bodyId;
        body.hidden = true;

        var surfaces = questionSurfaces(courseId, concept.id);
        var explained = surfaces.filter(function (question) { return question.explanation; })[0];
        var summaryLine = document.createElement("p");
        summaryLine.className = "shelf-summary";
        summaryLine.textContent = concept.summary || (explained ? explained.explanation : "Practise this concept to build visible evidence.");
        body.appendChild(summaryLine);

        var reasons = document.createElement("ul");
        reasons.className = "shelf-evidence";
        reasons.innerHTML = evidence.reasons.map(function (reason) {
          return "<li>" + escapeHtml(reason) + "</li>";
        }).join("");
        body.appendChild(reasons);

        var confidence = document.createElement("p");
        confidence.className = "shelf-confidence";
        confidence.textContent = evidence.openConfidentError ? evidence.confidenceLabel
          : evidence.confidenceCount ? evidence.confidenceCount + " diagnostic confidence check" +
            (evidence.confidenceCount === 1 ? "" : "s") + " on this concept; no stable trait is inferred."
          : "No diagnostic confidence check for this concept yet.";
        body.appendChild(confidence);

        name.addEventListener("click", function () {
          var open = body.hidden;
          body.hidden = !open;
          name.setAttribute("aria-expanded", String(open));
        });

        row.appendChild(body);
        group.appendChild(row);
      });
      host.appendChild(group);
    });
  }

  function renderLessonIndex() {
    var host = $("lesson-index");
    var summary = $("lesson-coverage");
    if (!host || !summary) return;
    host.textContent = "";
    summary.textContent = "";

    var courseId = profile.selectedCourse;
    var course = getCourse(courseId);
    var label = $("lessons-course-label");
    if (label) label.textContent = (course ? course.shortTitle || course.id : courseId) + " · Teaching layer";

    var cited = citedLectureIds(courseId);
    // Every lecture this subject knows about: one with a lesson, one a question cites, or both.
    var lectureIds = unique(Object.keys(LESSONS)
      .filter(function (id) { return LESSONS[id].courseId === courseId; })
      .concat(Object.keys(cited).filter(function (id) { return id.indexOf(courseId) === 0; })));

    if (!lectureIds.length) {
      summary.textContent = "No lessons have been authored for this subject yet.";
      return;
    }

    var counts = {live: 0, readonly: 0, missing: 0};
    lectureIds.forEach(function (id) { counts[lessonStatusFor(id, cited).key] += 1; });

    [
      counts.live + " taught in practice",
      counts.readonly ? counts.readonly + " readable here only" : null,
      counts.missing ? counts.missing + " still to write" : null
    ].filter(Boolean).forEach(function (text, index) {
      var chip = document.createElement("span");
      chip.className = "lesson-coverage-chip" + (index === 0 ? " primary" : "");
      chip.textContent = text;
      summary.appendChild(chip);
    });

    // Group by module, using the lesson's own module when we have one and the
    // lecture id when we do not.
    var modules = {};
    lectureIds.forEach(function (id) {
      var lesson = LESSONS[id];
      var match = /-M(\d+)-/.exec(id);
      var moduleNumber = lesson ? lesson.module : (match ? Number(match[1]) : 0);
      modules[moduleNumber] = modules[moduleNumber] || [];
      modules[moduleNumber].push(id);
    });

    Object.keys(modules).map(Number).sort(function (a, b) { return a - b; }).forEach(function (moduleNumber) {
      var group = document.createElement("section");
      group.className = "lesson-module";

      var heading = document.createElement("h4");
      heading.textContent = "Module " + moduleNumber;
      group.appendChild(heading);

      modules[moduleNumber]
        .sort(function (a, b) {
          var left = LESSONS[a], right = LESSONS[b];
          if (left && right) return left.order - right.order;
          return a < b ? -1 : 1;
        })
        .forEach(function (lectureId) {
          var data = LESSONS[lectureId];
          var status = lessonStatusFor(lectureId, cited);

          var row = document.createElement(data ? "details" : "div");
          row.className = "lesson-row " + status.key;
          // Lets the concept shelf open this exact lesson rather than reprinting it.
          row.setAttribute("data-lecture", lectureId);

          var head = document.createElement(data ? "summary" : "div");
          head.className = "lesson-row-head";

          var title = document.createElement("span");
          title.className = "lesson-row-title";
          title.textContent = data ? data.title : lectureId;
          head.appendChild(title);

          var pill = document.createElement("span");
          pill.className = "lesson-row-pill " + status.key;
          pill.textContent = status.label;
          head.appendChild(pill);

          var source = document.createElement("small");
          source.className = "lesson-row-source";
          source.textContent = lectureId;
          head.appendChild(source);

          row.appendChild(head);

          if (data) {
            var body = document.createElement("div");
            body.className = "lesson-row-body";
            appendLessonBody(body, data);
            row.appendChild(body);
          }

          group.appendChild(row);
        });

      host.appendChild(group);
    });
  }

  /* Opens a disclosure and brings its contents into view.
   *
   * The four staged tabs are gone, so nothing on this page is mutually exclusive
   * any more; sending a learner somewhere is now only ever "open this, then scroll
   * to it". LAW-42 applies — the scroll has to wait a frame so a screen swap's own
   * reset does not outlive it. */
  function revealDisclosure(id) {
    var host = $(id);
    if (!host) return null;
    if (host.tagName === "DETAILS") host.open = true;
    return host;
  }

  /* The header's subject control, kept in step with the rail rather than competing
     with it: both read and write the same `profile.selectedCourse`, and this one is
     rebuilt from the same ordering, so whichever you use the other agrees. */
  function renderHeaderSubject() {
    var select = $("header-subject");
    if (!select) return;
    var order = orderedCourseIds(profile.subjectSort === "hardest" ? "hardest" : "exam");
    /* The code alone. The strong-count belongs to the rail, which shows all four at
       once and can be compared; repeating it here bought a number you cannot compare
       against anything and cost the width that keeps this control on a 320px phone. */
    select.innerHTML = order.map(function (courseId) {
      return "<option value='" + escapeHtml(courseId) + "'" +
        (profile.selectedCourse === courseId ? " selected" : "") + ">" +
        escapeHtml(getCourse(courseId).shortTitle) + "</option>";
    }).join("");
  }

  function renderCourseCards() {
    renderHeaderSubject();
    var grid = $("course-grid");
    grid.innerHTML = "";
    var mode = profile.subjectSort === "hardest" ? "hardest" : "exam";
    var sortControl = $("subject-sort");
    if (sortControl) {
      sortControl.value = mode;
      /* The hint is an on-demand tooltip now, not body copy. Writing it as
       * textContent replaced the icon glyph with a sentence, which then wrapped
       * and spilled out of the rail. Set the description, keep the glyph. */
      var hintNode = $("subject-sort-hint");
      if (hintNode) {
        var hint = SORT_MODES[mode].hint + " " + (mode === "exam"
          ? "Both papers on a day run back to back, so the subject you sit first is the one you can least afford to leave until the end."
          : "Subjects with the least evidence come first, using your own attempts.");
        hintNode.setAttribute("data-tip", hint);
        hintNode.setAttribute("aria-label", hint);
      }
    }
    var order = orderedCourseIds(mode);
    var previousDay = null;
    order.forEach(function (courseId) {
      var course = getCourse(courseId);
      var stats = courseStats(courseId);
      var exam = EXAM_SCHEDULE[courseId] || {};
      var button = document.createElement("button");
      button.type = "button";
      button.className = "course-card" + (profile.selectedCourse === courseId ? " selected" : "");
      /* In exam order the cards read as a timetable, so mark where the day turns
       * over. In any other order that boundary is meaningless and would mislead. */
      if (mode === "exam" && exam.day && exam.day !== previousDay) button.classList.add("day-start");
      previousDay = exam.day;
      button.setAttribute("aria-pressed", String(profile.selectedCourse === courseId));
      /* The visible card compresses the timetable to "Aug 22 · 09:00" and puts the
       * rest on a tooltip, which is mouse-only — so the button's own label carries
       * the full sitting details for anyone reading by keyboard or screen reader.
       * (This previously prefixed "Sat " onto a day that already began "Sat".) */
      button.setAttribute("aria-label", course.shortTitle + ", " + course.title + ". " +
        (exam.full ? exam.full + ", " + exam.start + " to " + exam.end + ", " + exam.marks + " marks" +
          (exam.negative ? ", negative marking in Section B" : "") + ". " : "") +
        stats.strong + " of " + stats.total + " concepts strong. Open subject dashboard.");
      /* The card carries four facts and nothing else: which subject, when it is
       * sat, how far along you are, and whether it punishes a wrong answer.
       *
       * The acronym leads because it is what a learner calls the subject; the
       * full name sits under it in lighter weight, so a clipped title reads as
       * secondary detail rather than as a sentence cut off mid-word. Date and
       * time collapse to one meta line, with the full slot on hover and focus —
       * two lines of timetable per card was more than the rail needed to say.
       *
       * Progress is a single pill whose fill *is* the bar, so the count, the
       * remaining work, and the visual are one element instead of three. */
      var slot = exam.full ? exam.full + ", " + exam.start + "–" + exam.end + ", " + exam.marks + " marks" : "";
      var pillCopy = stats.strong + "/" + stats.total + " Strong";
      button.innerHTML =
        "<span class='course-head'>" +
          "<b class='course-code'>" + escapeHtml(course.shortTitle) + "</b>" +
          (exam.negative ? "<em class='course-flag' data-tip='Negative marking in Section B: −1 per wrong answer'>−1</em>" : "") +
          (exam.short ? "<span class='course-meta' data-tip='" + escapeHtml(slot) + "'>" + escapeHtml(exam.short) + " · " + escapeHtml(exam.start) + "</span>" : "") +
        "</span>" +
        "<span class='course-name'>" + escapeHtml(course.title) + "</span>" +
        "<span class='course-pill'><i class='pill-fill' aria-hidden='true' style='width:" + stats.weighted + "%'></i>" +
          "<span class='pill-label'>" + escapeHtml(pillCopy) + "</span></span>";
      button.addEventListener("click", function () {
        profile.selectedCourse = courseId;
        saveProfile();
        renderDashboard();
        var selectedCard = document.querySelector(".course-card.selected");
        if (selectedCard) selectedCard.focus({preventScroll: true});
      });
      grid.appendChild(button);
    });
  }

  /* The subject row's edge fade.
   *
   * Below 700px the four cards become a swipe row, and a scroller with nothing at its
   * edge reads as a layout that has been cut off rather than one that continues. The
   * fade is drawn only on the side that actually has more to reach, and disappears at
   * each end — an affordance that stays on when there is nothing left to scroll to is
   * just decoration that lies. */
  function updateRailScrollCue() {
    var scroller = $("course-grid");
    var wrap = $("rail-scroll");
    if (!scroller || !wrap) return;
    // clientWidth and scrollWidth are equal when the row is not scrollable at all,
    // which is every desktop width — so this reports "none" and paints nothing.
    var slack = scroller.scrollWidth - scroller.clientWidth;
    if (slack <= 1) return wrap.setAttribute("data-scroll", "none");
    var atStart = scroller.scrollLeft <= 1;
    var atEnd = scroller.scrollLeft >= slack - 1;
    wrap.setAttribute("data-scroll", atStart ? "start" : atEnd ? "end" : "middle");
  }

  /* The recommended action, re-offered after it scrolls away.
   *
   * The dashboard runs to roughly 6,700px on a phone, so a learner who reaches the
   * concept list has to scroll the whole way back to act on the recommendation. This
   * is deliberately not a second recommendation: the copy is read from the hero and
   * the click is delegated to it, so there is exactly one place that decides what the
   * next step is (LAW-04, LAW-18 — the scope is named). */
  function bindFloatingOffer(barId, heroId, goId, fill) {
    var bar = $(barId);
    var hero = $(heroId);
    if (!bar || !hero || !window.IntersectionObserver) return;
    $(goId).addEventListener("click", function () { hero.click(); });
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var away = !entry.isIntersecting;
        bar.hidden = !away;
        document.body.classList.toggle("has-resume-bar", away);
        if (away) fill(hero);
      });
    }, {threshold: 0}).observe(hero);
  }

  function bindResumeBar() {
    bindFloatingOffer("resume-bar", "start-recommended", "resume-bar-go", function (hero) {
      $("resume-bar-scope").textContent = $("selected-course-code").textContent;
      /* The button's label, not the hero heading. The heading is a sentence
       * ("Practise the concepts that need work first") and truncated to an
       * ellipsis in this width; the button already says the same thing as an
       * action in four words, and it is the thing this bar clicks. */
      $("resume-bar-title").textContent = hero.textContent.replace(/\s*→\s*$/, "").trim();
    });
    /* The examiner's own. Its page is twelve set buttons long, so the recommendation
       scrolls away just as surely. The scope is the paper and set rather than the
       subject code alone, because on this side "SPMS" is not enough to know what you
       are about to sit for two hours. */
    bindFloatingOffer("exam-resume-bar", "exam-pick-start", "exam-resume-go", function (hero) {
      var pick = recommendedMock();
      $("exam-resume-scope").textContent = pick ? pick.paper.courseId + " · " + examSetLabel(pick.set.set) : "Mock";
      $("exam-resume-title").textContent = hero.textContent.replace(/\s*→\s*$/, "").trim();
    });
  }

  // A route's label and its one-line description are set together, so the two can
  // never disagree about what the button will do (LAW-04).
  function setRouteCopy(id, label, note) {
    var route = $(id);
    if (!route) return;
    route.querySelector("b").textContent = label;
    route.querySelector("small").textContent = note;
  }

  function renderSelectedSubject() {
    var courseId = profile.selectedCourse;
    var course = getCourse(courseId);
    var stats = courseStats(courseId);
    $("selected-course-code").textContent = course.shortTitle;
    // Not the title: the selected card, the hero eyebrow, and the goal column all
    // already name this subject. Only the description is new information here.
    $("subject-description").textContent = course.description;
    $("sets-title").textContent = course.shortTitle + " · Ten available study sets";
    setRouteCopy("practice-priority",
      stats.needs ? "Practise " + stats.needs + " concepts that need work"
        : stats.developing ? "Build stronger evidence"
        : stats.unseen ? "Start the next new concepts" : "Refresh strong concepts",
      subjectProgressCopy(stats));
    renderMomentum(courseId);
    renderTrend(courseId);
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
    return trendFromCourses([courseId]);
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
      /* The empty state animates too. It used to return before this, which meant the
         one chart a new learner actually sees was the one that never moved. */
      drawOnce(svg);
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
    drawOnce(svg);
    var direction = points.length > 1 && points[points.length - 1].value < points[points.length - 2].value ? "The latest block revealed a dip, so the recommendation will revisit the affected concept." : "Correct evidence moves the line; misses can create an honest plateau or dip.";
    $("trend-description").textContent = points.length + " practice block" + (points.length === 1 ? "" : "s") + " shown. " + direction;
  }

  /* renderConceptMap() and showConceptInspector() were deleted here.
   *
   * They drew a second copy of the same concept list — eight at a time behind a
   * module stepper — and an inspector panel that was the only place the missing
   * evidence appeared. renderConceptShelf() now carries both on the row itself. */

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
    return {kind:"mock",title:"All core concepts have strong current evidence",copy:"Build your own check below to see whether the subject still holds together. It is practice, not a prediction of the final paper.",minutes:"8–24 minutes",questions:"Choose the mix"};
  }

  function renderRecommendation() {
    var courseId = profile.selectedCourse;
    var rec = recommendation(courseId);
    $("next-step-title").textContent = rec.title;
    $("next-step-copy").textContent = rec.copy;
    $("next-step-meta").innerHTML = "<span>" + escapeHtml(rec.minutes) + "</span><span>" + escapeHtml(rec.questions) + "</span>";
    $("start-recommended").innerHTML = recommendationActionLabel(rec) + " <span aria-hidden='true'>→</span>";

    /* Withdraw whichever way in the hero is already offering. The recommendation
     * runs the same function as one of these routes in three of its four states,
     * so without this the page shows the identical action twice — once as the one
     * call to action and again in the list of alternatives to it. */
    var duplicated = rec.kind === "priority" ? "priority"
      : rec.kind === "mock" ? "mock"
      : rec.kind === "set" && rec.setId === 1 ? "course" : null;
    $all("#route-list .route").forEach(function (route) {
      route.hidden = route.dataset.route === duplicated;
    });
    /* The mock-repair route exists only when a mock has actually cost marks. Offering
       it empty would be a control that cannot change the run, which the setup rule
       forbids. */
    var misses = examMissList(profile.selectedCourse);
    var repairRoute = $("practice-exam-repair");
    if (repairRoute) {
      repairRoute.hidden = misses.length === 0;
      if (misses.length) {
        $("exam-repair-route-note").textContent = misses.length + " concept" +
          (misses.length === 1 ? "" : "s") + " you lost marks on under exam conditions" +
          (misses[0].concept ? ", starting with " + misses[0].concept.name : "") + ".";
      }
    }
  }

  function recommendationActionLabel(rec) {
    if (rec.kind === "resume") return "Resume saved practice";
    if (rec.kind === "set") return "Start this study set";
    if (rec.kind === "mock") return "Mix your own practice";
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

  function layeredQueue(courseId, questionIds, mode) {
    var queue = [];
    var introduced = [];
    var taughtHere = [];
    var previousConceptId = null;
    questionIds.forEach(function (id) {
      var question = getQuestion(courseId, id);
      if (!question) return;
      var conceptIds = [question.conceptId];

      /* Teach before testing. Any surface citing a lecture the learner has never
       * been taught gets that lecture's lesson placed ahead of it. This is the
       * invariant the whole 0→80 path rests on.
       *
       * It applies to the primer on its own terms, not by inheritance from the
       * question it precedes. A primer is a separate authored surface with its
       * own sourceIds, and they routinely differ: `brgsa_m1_demand_primer` cites
       * M01-L01 while the `survey_bias` it introduces cites M01-L05. Gating only
       * on the scored question let that primer run five steps ahead of its own
       * lesson — the original defect in miniature. */
      function teachFirst(surface, conceptId) {
        if (mode === "simulation") return;
        pendingLessonsFor(surface).forEach(function (lectureId) {
          if (taughtHere.indexOf(lectureId) >= 0) return;
          queue.push({
            id: lessonItemId(lectureId, conceptId),
            initial: false,
            isReattempt: false,
            origin: null,
            lesson: true,
            lectureId: lectureId,
            previousConceptId: previousConceptId
          });
          taughtHere.push(lectureId);
        });
      }

      teachFirst(question, question.conceptId);

      if (mode !== "simulation") conceptIds.forEach(function (conceptId) {
        if (introduced.indexOf(conceptId) >= 0 || primerSupportLevel(courseId, conceptId) <= 0) return;
        var primer = primerQuestionFor(courseId, conceptId);
        if (!primer) return;
        teachFirst(primer, conceptId);
        queue.push({
          id: primer.id,
          initial: false,
          isReattempt: false,
          origin: null,
          primer: true,
          primerLevel: primerSupportLevel(courseId, conceptId),
          previousConceptId: previousConceptId
        });
        introduced.push(conceptId);
        previousConceptId = conceptId;
      });
      queue.push({id:id, initial:true, isReattempt:false, origin:null});
      if (introduced.indexOf(question.conceptId) < 0) introduced.push(question.conceptId);
      previousConceptId = question.conceptId;
    });
    return queue;
  }

  function createSession(courseId, details, questionIds) {
    var initialStatuses = {};
    getCourse(courseId).concepts.forEach(function (concept) { initialStatuses[concept.id] = conceptStatus(courseId, concept.id); });
    var queue = layeredQueue(courseId, questionIds, details.mode || "learning");
    return {
      courseId: courseId,
      kind: details.kind,
      mode: details.mode || "learning",
      shape: details.shape || null,
      focus: details.focus || null,
      length: details.length || null,
      setId: details.setId || null,
      conceptId: details.conceptId || null,
      title: details.title,
      kicker: details.kicker,
      queue: queue,
      baseCount: questionIds.length,
      supportCount: queue.length - questionIds.length,
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

  /* The builder is reached from exactly one control.
   *
   * It previously had three doors — a disclosure summary, a "Mix your own practice"
   * button one section further down, and the hero call to action whenever the
   * recommendation happened to be a mock. All three landed here, so the same
   * feature was advertised three times on one screen. "Build your own practice" in
   * the Ways in list is now the only one, and the hero withdraws its duplicate
   * (see renderRecommendation). */
  function setBuilderOpen(open) {
    var builder = $("practice-builder");
    var toggle = $("builder-toggle");
    if (!builder || !toggle) return;
    builder.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  }

  function openPracticeSetup(courseId) {
    if (courseId && courseId !== profile.selectedCourse) {
      profile.selectedCourse = courseId;
      saveProfile();
      renderDashboard();
    }
    // showScreen resets the scroll position, and with smooth scrolling that animation would
    // outlive and override the jump to the builder (LAW-42).
    if (!$("dashboard-screen").classList.contains("active")) showScreen("dashboard-screen");
    setBuilderOpen(true);
    var builder = $("practice-builder");
    if (!builder) return;
    builder.focus({preventScroll: true});
    window.requestAnimationFrame(function () { builder.scrollIntoView({block: "center", behavior: "smooth"}); });
  }

  function conceptStatusMap(courseId) {
    var statuses = {};
    getCourse(courseId).concepts.forEach(function (concept) { statuses[concept.id] = conceptStatus(courseId, concept.id); });
    return statuses;
  }

  function shapeMatches(shape, question) {
    if (shape === "recognition") return question.type === "mcq" || question.type === "cloze" || question.type === "msq";
    if (shape === "application") return question.type === "case-cloze" || question.type === "match" || question.type === "boss" || question.type === "numeric" || question.perspective === "apply";
    if (shape === "generation") return question.type === "short-answer" || question.type === "cloze" || question.type === "case-cloze";
    return true;
  }

  function focusMatches(focus, question, statuses) {
    if (focus === "weak") {
      return [question.conceptId].concat(question.supportingConceptIds || []).some(function (conceptId) {
        return statuses[conceptId] === "needs" || statuses[conceptId] === "developing";
      });
    }
    if (focus === "new") return statuses[question.conceptId] === "unseen";
    return true;
  }

  function practiceCandidates(courseId, shape, focus, statuses) {
    statuses = statuses || conceptStatusMap(courseId);
    var course = getCourse(courseId);
    return Object.keys(course.questions).map(function (id) { return course.questions[id]; })
      .filter(function (question) {
        return !question.optionShapeRisk && !question.primerOnly &&
          shapeMatches(shape, question) && focusMatches(focus, question, statuses);
      });
  }

  function practiceAnchors(courseId, shape, pool) {
    function oldestFirst(questions, limit) {
      return questions.slice().sort(function (a, b) {
        return questionLastAttemptAt(courseId, a.id) - questionLastAttemptAt(courseId, b.id);
      }).slice(0, limit).map(function (question) { return question.id; });
    }
    if (shape === "application") return oldestFirst(pool.filter(function (question) { return question.boss; }), 2);
    if (shape === "generation") return oldestFirst(pool.filter(function (question) { return question.type === "short-answer"; }), 4);
    if (shape !== "mixed") return [];
    var anchors = [];
    ["mcq", "cloze", "case-cloze", "match", "short-answer", "boss"].forEach(function (type) {
      var candidate = oldestFirst(pool.filter(function (question) { return question.type === type; }), 1)[0];
      if (candidate) anchors.push(candidate);
    });
    return anchors;
  }

  function lengthTarget(id) {
    return (optionById(PRACTICE_LENGTHS, id) || PRACTICE_LENGTHS[1]).target;
  }

  function estimateMinutes(count) {
    return Math.max(3, Math.round(count * 1.25));
  }

  function practicePlan(courseId, settings, statuses) {
    var pool = practiceCandidates(courseId, settings.shape, settings.focus, statuses);
    var target = Math.min(lengthTarget(settings.length), pool.length);
    var anchors = practiceAnchors(courseId, settings.shape, pool).slice(0, target);
    var ids = target ? selectQuestionsFromPool(courseId, pool.map(function (question) { return question.id; }), target, anchors) : [];
    return {ids: ids, poolSize: pool.length, count: ids.length};
  }

  function practiceShapeQuestionIds(courseId, shape) {
    return practicePlan(courseId, {shape: shape, focus: "all", length: "standard"}).ids;
  }

  function builderSettings() {
    if (!validBuilder(profile.builder)) profile.builder = clone(DEFAULT_BUILDER);
    return profile.builder;
  }

  function renderChipGroup(holderId, options, selectedId, describe, onSelect) {
    var holder = $(holderId);
    holder.innerHTML = "";
    options.forEach(function (option) {
      var state = describe(option);
      var chosen = option.id === selectedId;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "chip-option" + (chosen ? " selected" : "");
      button.disabled = !state.available && !chosen;
      button.setAttribute("aria-pressed", String(chosen));
      button.innerHTML = "<b>" + escapeHtml(state.label || option.label) + "</b><small>" + escapeHtml(state.note) + "</small>";
      button.addEventListener("click", function () { if (!button.disabled && !chosen) onSelect(option.id); });
      holder.appendChild(button);
    });
  }

  // LAW-01: a builder choice must change the run. Unavailable combinations are disabled with the
  // reason, and a length that cannot add questions collapses to the shorter one that matches it.
  function renderPracticeBuilder() {
    var courseId = profile.selectedCourse;
    var settings = builderSettings();
    var statuses = conceptStatusMap(courseId);
    function poolSize(shape, focus) { return practiceCandidates(courseId, shape, focus, statuses).length; }

    // A narrowing choice that selects the whole pool is not a real choice, so it collapses to
    // "Anything" instead of pretending to filter.
    var wholePool = poolSize(settings.shape, "all");
    if (settings.focus !== "all" && poolSize(settings.shape, settings.focus) >= wholePool) settings.focus = "all";
    if (!poolSize(settings.shape, settings.focus)) settings.focus = "all";
    if (!poolSize(settings.shape, settings.focus)) settings.shape = "mixed";
    var available = poolSize(settings.shape, settings.focus);
    function achievable(lengthId) { return Math.min(lengthTarget(lengthId), available); }
    PRACTICE_LENGTHS.forEach(function (option) {
      if (option.target >= lengthTarget(settings.length)) return;
      if (achievable(option.id) === achievable(settings.length)) settings.length = option.id;
    });

    renderChipGroup("builder-shape", PRACTICE_SHAPES, settings.shape, function (option) {
      var size = poolSize(option.id, settings.focus);
      return {available: size > 0, note: size ? option.hint : "None of these are left for the concepts you chose"};
    }, function (id) { settings.shape = id; commitBuilderChange(); });

    renderChipGroup("builder-focus", PRACTICE_FOCUS, settings.focus, function (option) {
      var size = poolSize(settings.shape, option.id);
      var whole = poolSize(settings.shape, "all");
      if (option.id === "all") return {available: size > 0, note: size ? option.hint + " · " + size + " to draw from" : "No question matches this combination"};
      if (!size) return {available: false, note: option.id === "weak" ? "Nothing in this subject needs work yet" : "No untouched concept is left here"};
      if (size >= whole) return {available: false, note: option.id === "weak" ? "Every concept here needs work, so this is the same as anything" : "Nothing is started yet, so this is the same as anything"};
      return {available: true, note: option.hint + " · " + size + " to draw from"};
    }, function (id) { settings.focus = id; commitBuilderChange(); });

    renderChipGroup("builder-length", PRACTICE_LENGTHS, settings.length, function (option) {
      var count = achievable(option.id);
      var duplicateOf = PRACTICE_LENGTHS.filter(function (other) {
        return other.target < option.target && achievable(other.id) === count;
      })[0];
      return {
        available: count > 0 && !duplicateOf,
        note: !count ? "No questions available"
          : duplicateOf ? "Only " + count + " here, the same run as " + duplicateOf.label.toLowerCase()
          : count + " questions · about " + estimateMinutes(count) + " min"
      };
    }, function (id) { settings.length = id; commitBuilderChange(); });

    renderChipGroup("builder-mode", PRACTICE_MODES, settings.mode, function (option) {
      return {available: true, note: option.hint};
    }, function (id) { settings.mode = id; commitBuilderChange(); });

    var count = achievable(settings.length);
    $("builder-start").disabled = !count;
    $("builder-summary").textContent = !count
      ? "No question matches this combination yet. Change one choice above."
      : count + " question" + (count === 1 ? "" : "s") + " from " + getCourse(courseId).shortTitle + " · " +
        optionById(PRACTICE_SHAPES, settings.shape).label.toLowerCase() + " · " +
        optionById(PRACTICE_FOCUS, settings.focus).summary + " · explanations " +
        optionById(PRACTICE_MODES, settings.mode).label.toLowerCase() + " · about " + estimateMinutes(count) + " minutes.";
  }

  function commitBuilderChange() {
    saveProfile();
    renderPracticeBuilder();
  }

  function startBuiltPractice(override) {
    var courseId = profile.selectedCourse;
    var settings = validBuilder(override) ? override : builderSettings();
    var plan = practicePlan(courseId, settings);
    if (!plan.ids.length) return toast("No question matches that combination yet.");
    var shape = optionById(PRACTICE_SHAPES, settings.shape);
    var focus = optionById(PRACTICE_FOCUS, settings.focus);
    var simulation = settings.mode === "simulation";
    session = createSession(courseId, {
      kind: simulation ? "practice-check" : "practice-shape",
      mode: settings.mode,
      shape: settings.shape,
      focus: settings.focus,
      length: settings.length,
      title: shape.runTitle + (settings.focus === "all" ? "" : " · " + focus.summary),
      kicker: (simulation ? "Explanations held to the end" : "Explanations after each answer") + " · " + plan.count + " questions"
    }, plan.ids);
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
    if (question.type === "primer") return false;
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
    if (question && question.type === "lesson") return renderLesson(question, item);
    shouldAskConfidence(question, item);
    selected = session.answered ? session.selected : (session.selected === undefined ? null : session.selected);
    confidence = session.answered ? (session.confidence || (session.responses.length && session.responses[session.responses.length - 1].confidence) || null) : (session.confidence || null);
    var isPrimer = question.type === "primer";
    $("question-card").classList.remove("is-correct", "is-wrong", "is-primer", "is-lesson");
    $("question-card").classList.toggle("is-primer", isPrimer);
    // Leaving a lesson: restore the question layout the lesson surface hid.
    $("lesson-panel").hidden = true;
    $("task-prompt").hidden = false;
    renderGlossaryBlock(question);
    $("question-pattern").textContent = isPrimer ? "Adaptive primer" : item.isReattempt ? "Re-attempt · new perspective" : question.pattern;
    $("question-count").textContent = isPrimer ? "Primer before the next challenge" : "Question " + challengePosition() + " of " + session.baseCount;
    $("question-node").textContent = question.node;
    var status = conceptStatus(session.courseId, question.conceptId);
    $("question-status").className = "status-pill " + status;
    $("question-status").textContent = STATUS_LABEL[status];
    $("question-title").textContent = question.stem;
    $("source-ref").textContent = unique(question.sourceIds || [question.source]).join(" + ") + " · supplied Term 6 course pack";
    $("case-block").hidden = isPrimer || !question.caselet;
    $("caselet").textContent = question.caselet || "";
    $("prompt-flow").classList.toggle("has-case", !isPrimer && !!question.caselet);
    renderPrimerPanel(question, item);
    $("task-kicker").textContent = question.caselet ? "Then decide" : "Your task";
    $("feedback").className = "feedback";
    $("feedback").innerHTML = "";
    $("commit-answer").hidden = false;
    $("commit-answer").textContent = isPrimer ? "Check primer" : question.type === "short-answer" && session.mode === "simulation" ? "Save response" : question.type === "short-answer" && session.subjectiveStage === "rubric" ? "Compare with exemplar" : question.type === "short-answer" ? "Review with rubric" : "Check answer";
    $("commit-answer").disabled = !hasCompleteResponse(question) || !confidenceReady() || session.answered;
    $("next-question").hidden = true;
    renderResponseControl(question);
    renderConfidenceControl();
    if (session.answered && session.responses.length) renderResolved(question, session.responses[session.responses.length - 1]);
    renderTopicList();
    updatePracticeProgress();
  }

  // Lessons and primers are support, not challenges, so neither advances the
  // "Question N of M" count the learner is pacing themselves against.
  function challengePosition() {
    return session.queue.slice(0, session.index + 1).filter(function (item) {
      var question = getQuestion(session.courseId, item.id);
      return question && question.type !== "primer" && question.type !== "lesson";
    }).length;
  }

  /* The lesson surface. It teaches and then gets out of the way: no options, no
   * confidence prompt, no correctness, and no evidence. Reading it is not an
   * achievement to be scored — it is the precondition for the questions that
   * follow being answerable at all. */
  function renderLesson(question, item) {
    var data = question.lesson;
    var card = $("question-card");
    card.classList.remove("is-correct", "is-wrong", "is-primer");
    card.classList.add("is-lesson");
    $("question-pattern").textContent = "Lesson";
    $("question-node").textContent = data.title;
    $("question-status").className = "status-pill lesson";
    $("question-status").textContent = "Teaching first";
    $("source-ref").textContent = data.lectureId + " · supplied Term 6 course pack";

    $("lesson-panel").hidden = false;
    $("primer-panel").hidden = true;
    $("case-block").hidden = true;
    $("glossary-block").hidden = true;
    $("task-prompt").hidden = true;
    $("options").innerHTML = "";
    $("confidence-check").hidden = true;
    $("feedback").className = "feedback";
    $("feedback").innerHTML = "";
    $("prompt-flow").classList.remove("has-case");

    $("lesson-kicker").textContent = "Module " + data.module + " · lesson " + data.order +
      (item && item.previousConceptId ? " · builds on what you just did" : "");
    $("lesson-heading").textContent = data.title;
    $("lesson-objective").innerHTML = "<b>After this you can:</b> " + escapeHtml(data.objective);
    $("lesson-body").innerHTML = (data.explainer || []).map(function (paragraph) {
      return "<p>" + escapeHtml(paragraph) + "</p>";
    }).join("");

    var worked = data.worked;
    $("lesson-worked").innerHTML = worked
      ? "<p class='worked-head'>Worked through</p>" +
        "<p><b>Situation.</b> " + escapeHtml(worked.setup) + "</p>" +
        "<p><b>Move.</b> " + escapeHtml(worked.move) + "</p>" +
        "<p><b>Why.</b> " + escapeHtml(worked.because) + "</p>"
      : "";

    $("lesson-glossary").innerHTML = (data.glossary || []).length
      ? "<p class='glossary-head'>Words this lecture introduces</p><dl>" + (data.glossary || []).map(function (entry) {
          return "<dt>" + escapeHtml(entry.term) + "</dt><dd>" + escapeHtml(entry.plain) + "</dd>";
        }).join("") + "</dl>"
      : "";

    $("lesson-connects").textContent = data.connects || "";

    $("commit-answer").hidden = true;
    $("next-question").hidden = false;
    $("next-question").innerHTML = "I have read this <span aria-hidden='true'>→</span>";
    $("question-help").textContent = "Nothing here is scored. The questions after it use these words.";

    // Reading is recorded immediately: the learner has been shown the material,
    // and the queue must not re-teach it on resume.
    markLessonRead(data.lectureId);
    session.answered = true;

    renderTopicList();
    updatePracticeProgress();
    $("lesson-heading").focus({preventScroll: true});
  }

  /* On a scored question, the lecture's glossary stays one disclosure away. A
   * learner who met "MDE" once should not have to abandon the question to
   * recover what it meant. */
  function renderGlossaryBlock(question) {
    var block = $("glossary-block");
    var terms = [];
    lectureIdsFor(question).forEach(function (lectureId) {
      var data = lessonFor(lectureId);
      if (data) terms = terms.concat(data.glossary || []);
    });
    if (!terms.length) {
      block.hidden = true;
      return;
    }
    block.hidden = false;
    $("glossary-summary").textContent = "Terms used here (" + terms.length + ")";
    $("glossary-list").innerHTML = terms.map(function (entry) {
      return "<dt>" + escapeHtml(entry.term) + "</dt><dd>" + escapeHtml(entry.plain) + "</dd>";
    }).join("");
  }

  function renderPrimerPanel(question, item) {
    var panel = $("primer-panel");
    var visible = question.type === "primer";
    panel.hidden = !visible;
    if (!visible) return;
    var level = Math.max(1, Math.min(3, item.primerLevel || 1));
    $("primer-level").textContent = level === 1 ? "Layer 1 · minimum to carry" : level === 2 ? "Primer returning · use it" : "Primer strengthened · repair the mix-up";
    var parts = ["<p><b>Know this:</b> " + escapeHtml(question.primerFact) + "</p>"];
    if (item.previousConceptId) {
      var previous = getConcept(session.courseId, item.previousConceptId);
      if (previous) parts.unshift("<p class='primer-carry'><b>Carry forward:</b> " + escapeHtml(previous.name) + ". Now add " + escapeHtml(question.node) + ".</p>");
    }
    if (level >= 2) parts.push("<p><b>Use it like this:</b> " + escapeHtml(question.primerApplication) + "</p>");
    if (level >= 3) parts.push("<p><b>Do not confuse it with:</b> " + escapeHtml(question.primerMisconception) + "</p>");
    parts.push("<p class='primer-connection'><b>Connection to keep:</b> " + escapeHtml(question.primerConnection) + "</p>");
    $("primer-content").innerHTML = parts.join("");
  }

  function hasCompleteResponse(question) {
    if (question.type === "short-answer") return session.subjectiveStage === "rubric" ? true : typeof selected === "string" && selected.trim().length >= 20;
    if (question.type === "mcq" || question.type === "primer" || !question.type) return typeof selected === "number";
    /* MSQ: any selection is a complete response. Selecting nothing is not — under
     * the paper's marking a blank scores zero either way, but committing an empty
     * answer is almost always a mis-click rather than a decision. */
    if (question.type === "msq") return Array.isArray(selected) && selected.length > 0;
    if (question.type === "numeric") return parseNumericEntry(selected) !== null;
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
    if (question.type === "msq") return renderMultiOptions(question);
    if (question.type === "numeric") return renderNumeric(question);
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

  /* Multiple-select, for SPMS Section B.
   *
   * The paper marks this section +1 for each right answer and -1 for each wrong
   * one, with the net floored at zero per question. Two consequences the surface
   * has to make visible, because they invert the habit a single-answer bank
   * builds: selecting every option is strictly bad, and selecting only what you
   * are confident of is rational. The learner is never told how many are correct
   * — that is the skill being tested. */
  function msqSelection() {
    return Array.isArray(selected) ? selected : [];
  }

  function renderMultiOptions(question) {
    var holder = prepareResponseHolder("msq-options");
    holder.setAttribute("role", "group");
    holder.setAttribute("aria-label", "Select every correct answer");
    var chosen = msqSelection();
    var answers = question.answers || [];
    question.options.forEach(function (copy, index) {
      var picked = chosen.indexOf(index) >= 0;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "option option-multi";
      button.setAttribute("role", "checkbox");
      button.setAttribute("aria-checked", String(picked));
      button.disabled = !!session.answered;
      button.innerHTML = "<span class='option-box' aria-hidden='true'></span><span>" + escapeHtml(copy) + "</span>";
      if (session.answered && session.mode !== "simulation") {
        var isAnswer = answers.indexOf(index) >= 0;
        if (isAnswer) button.classList.add("correct");
        if (picked && !isAnswer) button.classList.add("wrong");
        if (!picked && isAnswer) button.classList.add("missed");
      }
      button.addEventListener("click", function () { toggleOption(index); });
      holder.appendChild(button);
    });
    $("question-help").textContent = "Select every correct answer. Each right one scores +1, each wrong one −1, and the question cannot go below zero — so choose only what you are sure of.";
  }

  function toggleOption(index) {
    if (!session || session.answered) return;
    var chosen = msqSelection().slice();
    var at = chosen.indexOf(index);
    if (at >= 0) chosen.splice(at, 1); else chosen.push(index);
    chosen.sort(function (a, b) { return a - b; });
    selected = chosen;
    session.selected = chosen;
    $all(".option-multi").forEach(function (button, optionIndex) {
      button.setAttribute("aria-checked", String(chosen.indexOf(optionIndex) >= 0));
    });
    updateCommitState();
    saveProfile();
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

  // A native select popup is sized by the operating system, so prose-length options overflow the
  // card and run off screen. Anything beyond a short phrase becomes wrapping choice cards instead.
  var LONG_OPTION_CHARS = 60;
  var liftedLabel = null;
  var matchLabels = [];
  var matchAnswerRows = [];
  var choiceGroupSeq = 0;

  function hasLongOptions(options) {
    return (options || []).some(function (copy) { return String(copy).length > LONG_OPTION_CHARS; });
  }

  function renderChoiceGroup(container, options, partIndex, groupLabel, correctAnswer) {
    var group = document.createElement("div");
    group.className = "choice-group";
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", groupLabel);
    var name = "choice-" + (choiceGroupSeq += 1);
    (options || []).forEach(function (copy, index) {
      var choice = document.createElement("label");
      var input = document.createElement("input");
      var key = document.createElement("span");
      var text = document.createElement("span");
      var chosen = Array.isArray(selected) && selected[partIndex] === index;
      choice.className = "choice";
      input.type = "radio";
      input.name = name;
      input.value = String(index);
      input.checked = chosen;
      input.disabled = !!session.answered;
      key.className = "option-key";
      key.textContent = String.fromCharCode(65 + index);
      text.textContent = copy;
      if (session.answered && session.mode !== "simulation") {
        if (index === correctAnswer) choice.classList.add("correct");
        if (chosen && index !== correctAnswer) choice.classList.add("wrong");
      }
      input.addEventListener("change", function () {
        if (!input.checked) return;
        selectResponsePart(partIndex, index);
        var slot = $all(".blank-slot")[partIndex];
        if (slot) slot.classList.add("filled");
      });
      choice.appendChild(input);
      choice.appendChild(key);
      choice.appendChild(text);
      group.appendChild(choice);
    });
    container.appendChild(group);
    return group;
  }

  // Inverted match board. Statements sit side by side, each with a slot underneath, and the unused
  // labels wait in a tray docked to the bottom of the board. The part index is still the row, so
  // stored responses, grading, and the answer review keep the row-first shape.
  function renderMatchBoard(question, labels, holder) {
    liftedLabel = null;
    var board = document.createElement("div");
    var columns = document.createElement("div");
    var tray = document.createElement("div");
    var trayLabel = document.createElement("p");
    var trayItems = document.createElement("div");
    board.className = "match-board";
    columns.className = "match-columns";
    // One row, one column per statement: the comparison is the task, so they must be side by side.
    // The count lives on the board so the tray can share the same column track as the
    // statements above it — a tablet then sits directly under the slot it can fill,
    // and every tablet is the same width instead of sized by its own text.
    board.style.setProperty("--statement-count", String(question.choices.length));
    tray.className = "match-tray";
    trayLabel.className = "tray-label";
    trayItems.className = "tray-items";
    tray.appendChild(trayLabel);
    tray.appendChild(trayItems);

    question.choices.forEach(function (statement, choiceIndex) {
      var column = document.createElement("div");
      var index = document.createElement("span");
      var text = document.createElement("p");
      var slot = document.createElement("button");
      column.className = "match-column";
      // Statements are numbered and labels are lettered, so the task reads as
      // "put a letter under each number" instead of four equally weighted blocks
      // with no stated order to work through them.
      index.className = "statement-index";
      index.setAttribute("aria-hidden", "true");
      index.textContent = String(choiceIndex + 1);
      text.className = "match-statement";
      text.textContent = statement;
      slot.type = "button";
      slot.className = "match-slot";
      slot.dataset.choiceIndex = String(choiceIndex);
      slot.disabled = !!session.answered;
      slot.addEventListener("click", function () { dropOnSlot(choiceIndex); });
      slot.addEventListener("dragover", function (event) { if (liftedLabel !== null) event.preventDefault(); });
      slot.addEventListener("drop", function (event) { event.preventDefault(); dropOnSlot(choiceIndex); });
      column.appendChild(index);
      column.appendChild(text);
      column.appendChild(slot);
      columns.appendChild(column);
    });

    board.appendChild(columns);
    board.appendChild(tray);
    holder.appendChild(board);
    matchLabels = labels;
    matchAnswerRows = question.choices.map(function (_, choiceIndex) {
      var correctRow = null;
      question.rows.forEach(function (row, rowIndex) { if (row.answer === choiceIndex) correctRow = rowIndex; });
      return correctRow;
    });
    syncMatchBoard();
  }

  function labelTablet(rowIndex, inSlot) {
    var tablet = document.createElement(inSlot ? "span" : "button");
    var key = document.createElement("span");
    var text = document.createElement("span");
    tablet.className = "label-tablet" + (liftedLabel === rowIndex ? " lifted" : "");
    key.className = "option-key";
    key.textContent = String.fromCharCode(65 + rowIndex);
    text.textContent = matchLabels[rowIndex];
    tablet.appendChild(key);
    tablet.appendChild(text);
    if (inSlot) return tablet;
    tablet.type = "button";
    tablet.dataset.rowIndex = String(rowIndex);
    tablet.disabled = !!session.answered;
    tablet.setAttribute("aria-pressed", String(liftedLabel === rowIndex));
    tablet.setAttribute("aria-label", matchLabels[rowIndex] + ". Choose this label, then choose the statement it belongs to.");
    if (!session.answered) tablet.draggable = true;
    tablet.addEventListener("click", function () {
      liftedLabel = liftedLabel === rowIndex ? null : rowIndex;
      syncMatchBoard();
    });
    tablet.addEventListener("dragstart", function (event) {
      liftedLabel = rowIndex;
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
      syncMatchBoard();
    });
    tablet.addEventListener("dragend", function () { syncMatchBoard(); });
    return tablet;
  }

  function dropOnSlot(choiceIndex) {
    if (session.answered) return;
    var occupant = selected.indexOf(choiceIndex);
    if (liftedLabel === null) {
      // An empty slot with nothing in hand does nothing; a full one returns its label to the tray.
      if (occupant >= 0) { selected[occupant] = null; commitMatchSelection(); }
      return;
    }
    if (occupant >= 0 && occupant !== liftedLabel) selected[occupant] = null;
    selected[liftedLabel] = choiceIndex;
    liftedLabel = null;
    commitMatchSelection();
  }

  function commitMatchSelection() {
    session.selected = selected.slice();
    syncMatchBoard();
    updateCommitState();
  }

  function syncMatchBoard() {
    var trayItems = document.querySelector(".match-tray .tray-items");
    var trayLabel = document.querySelector(".match-tray .tray-label");
    if (!trayItems) return;
    var resolved = session.answered && session.mode !== "simulation";
    $all(".match-slot").forEach(function (slot) {
      var choiceIndex = Number(slot.dataset.choiceIndex);
      var holderRow = selected.indexOf(choiceIndex);
      var correctRow = matchAnswerRows[choiceIndex];
      slot.innerHTML = "";
      slot.className = "match-slot" + (holderRow >= 0 ? " filled" : "") + (liftedLabel !== null && !session.answered ? " ready" : "");
      if (holderRow >= 0) {
        slot.appendChild(labelTablet(holderRow, true));
        slot.setAttribute("aria-label", "Holds " + matchLabels[holderRow] + ". Choose again to take it back.");
      } else {
        var empty = document.createElement("span");
        empty.className = "slot-empty";
        empty.textContent = liftedLabel !== null && !session.answered ? "Place " + String.fromCharCode(65 + liftedLabel) + " here" : "No label yet";
        slot.appendChild(empty);
        slot.setAttribute("aria-label", liftedLabel !== null ? "Empty. Place " + matchLabels[liftedLabel] + " here." : "Empty slot. Choose a label first.");
      }
      if (resolved) {
        slot.classList.add(holderRow === correctRow ? "correct" : "wrong");
        if (holderRow !== correctRow) {
          var truth = document.createElement("small");
          truth.className = "slot-truth";
          truth.textContent = "Belongs to " + matchLabels[correctRow];
          slot.appendChild(truth);
        }
      }
    });
    // Rebuilding the tray destroys the button a keyboard user just activated, so put focus back on
    // the same label if it is still there.
    var focusedRow = document.activeElement && document.activeElement.parentNode === trayItems
      ? document.activeElement.dataset.rowIndex : null;
    trayItems.innerHTML = "";
    var unused = matchLabels.map(function (_, rowIndex) { return rowIndex; })
      .filter(function (rowIndex) { return selected[rowIndex] === null || selected[rowIndex] === undefined; });
    unused.forEach(function (rowIndex) { trayItems.appendChild(labelTablet(rowIndex, false)); });
    if (focusedRow !== null) {
      var restored = trayItems.querySelector("[data-row-index='" + focusedRow + "']");
      if (restored) restored.focus();
    }
    trayLabel.textContent = session.answered ? (unused.length ? "Never placed" : "Every label was placed")
      : unused.length ? "Labels to place · " + unused.length + " left"
      : "Every label is placed";
  }

  function renderChoiceField(holder, label, options, partIndex, correctAnswer) {
    var field = document.createElement("div");
    var legend = document.createElement("p");
    field.className = "choice-field";
    legend.className = "choice-legend";
    legend.textContent = label;
    field.appendChild(legend);
    renderChoiceGroup(field, options, partIndex, label, correctAnswer);
    holder.appendChild(field);
    return field;
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

  /* Numeric entry, for SCLM Section B.
   *
   * The paper is explicit: enter the requested final numerical answer, marks are
   * awarded for the final answer within a stated grading tolerance, and no marks
   * are given for working. So this surface takes a number and grades it against a
   * tolerance — no options to eliminate, no partial credit for method. A learner
   * who reaches the right approach and fumbles the arithmetic scores zero here,
   * exactly as they would in the hall, which is the point of practising it.
   *
   * Tolerance is per question because the quantities differ in kind: a reorder
   * point in units rounds differently from a cost in rupees or a z-value. */
  function parseNumericEntry(value) {
    // Accept what a learner actually types off a calculator: 1,240 · ₹1240 · 1240.5
    var cleaned = String(value == null ? "" : value).replace(/[₹,\s]/g, "");
    if (!cleaned || !/^-?\d*\.?\d+$/.test(cleaned)) return null;
    var parsed = Number(cleaned);
    return isFinite(parsed) ? parsed : null;
  }

  function renderNumeric(question) {
    var holder = prepareResponseHolder("numeric-entry");
    var label = document.createElement("label");
    label.className = "numeric-label";
    label.innerHTML = "<span>" + escapeHtml(question.prompt || "Your answer") + "</span>" +
      "<small>Enter the final figure only. Working is not marked, here or in the paper.</small>";
    var row = document.createElement("span");
    row.className = "numeric-row";
    var input = document.createElement("input");
    input.type = "text";
    input.inputMode = "decimal";
    input.autocomplete = "off";
    input.setAttribute("aria-label", question.prompt || "Your numerical answer");
    input.value = typeof selected === "string" ? selected : "";
    input.disabled = !!session.answered;
    input.addEventListener("input", function () {
      selected = input.value;
      session.selected = selected;
      updateCommitState();
    });
    row.appendChild(input);
    if (question.unit) {
      var unit = document.createElement("b");
      unit.className = "numeric-unit";
      unit.textContent = question.unit;
      row.appendChild(unit);
    }
    label.appendChild(row);
    holder.appendChild(label);
    $("question-help").textContent = question.tolerance
      ? "Marked on the final figure, within ±" + question.tolerance + (question.unit ? " " + question.unit : "") + ". A scientific calculator is allowed in this paper."
      : "Marked on the final figure only.";
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
    var blanks = question.blanks || [];
    var longForm = blanks.some(function (blank) { return hasLongOptions(blank.options); });
    var sentence = document.createElement("div");
    sentence.className = "cloze-sentence";
    (question.template || []).forEach(function (copy, index) {
      sentence.appendChild(document.createTextNode(copy));
      var blank = blanks[index];
      if (!blank) return;

      if (longForm) {
        // The sentence keeps its shape; the choosing happens in readable cards below it.
        var slot = document.createElement("span");
        slot.className = "blank-slot";
        slot.textContent = blank.label;
        if (Array.isArray(selected) && typeof selected[index] === "number") slot.classList.add("filled");
        sentence.appendChild(slot);
        return;
      }

      var label = document.createElement("label");
      label.className = "inline-blank";
      var hidden = document.createElement("span");
      hidden.className = "sr-only";
      hidden.textContent = blank.label + ": ";
      var select = document.createElement("select");
      select.disabled = !!session.answered;
      select.setAttribute("aria-label", blank.label);
      renderSelectOptions(select, blank.options, Array.isArray(selected) ? selected[index] : null);
      if (session.answered && session.mode !== "simulation") select.classList.add(Array.isArray(selected) && selected[index] === blank.answer ? "correct" : "wrong");
      select.addEventListener("change", function () { selectResponsePart(index, select.value); });
      label.appendChild(hidden);
      label.appendChild(select);
      sentence.appendChild(label);
    });
    holder.appendChild(sentence);

    if (longForm) {
      blanks.forEach(function (blank, index) {
        renderChoiceField(holder, blank.label, blank.options, index, blank.answer);
      });
    }
    $("question-help").textContent = blanks.length > 1
      ? "Choose every blank before checking"
      : "Choose an answer before checking";
  }

  function renderMatch(question) {
    var labels = question.rows.map(function (row) { return row.label; });
    var longChoices = hasLongOptions(question.choices);
    var longLabels = hasLongOptions(labels);
    // When the answer cards carry the substance, listing all of them under every row makes the
    // learner reread the same paragraphs once per row. Show each statement once instead and let
    // them name the short label it belongs to.
    var inverted = longChoices && !longLabels;
    var holder = prepareResponseHolder("match-options" + (inverted ? " match-invert" : ""));
    var intro = document.createElement("p");
    intro.className = "format-note";
    intro.textContent = inverted
      ? "Each label is used once. Name the one that each statement belongs to."
      : longChoices
        ? "Each answer is used once. Choose one card per row."
        : "Each answer is used once. Keyboard users can complete every row with the select controls.";
    holder.appendChild(intro);
    if (inverted) {
      if (!Array.isArray(selected) || selected.length !== question.rows.length) {
        selected = question.rows.map(function () { return null; });
        session.selected = selected.slice();
      }
      intro.textContent = "Place one label under each statement. Choose a label then a statement, or drag it across.";
      renderMatchBoard(question, labels, holder);
      $("question-help").textContent = "Every statement needs a label before checking";
      return;
    }
    if (longChoices) {
      question.rows.forEach(function (row, index) {
        renderChoiceField(holder, row.label, question.choices, index, row.answer);
      });
      $("question-help").textContent = "Complete all matching rows before checking";
      return;
    }
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
      if (hasLongOptions(step.options)) {
        var field = document.createElement("div");
        field.className = "boss-step";
        var stepHeading = document.createElement("b");
        stepHeading.textContent = step.label;
        var stepPrompt = document.createElement("span");
        stepPrompt.textContent = step.prompt;
        field.appendChild(stepHeading);
        field.appendChild(stepPrompt);
        renderChoiceGroup(field, step.options, index, step.label + ". " + step.prompt, step.answer);
        holder.appendChild(field);
        return;
      }
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

  // The diagnosis for a wrong response lives on the option the learner actually
  // chose, so it must be looked up by selected option index within the failing
  // part — not by the part index, which for a single-blank cloze is always 0 and
  // would report the same diagnosis whichever wrong option was picked.
  function partDiagnoses(question, partIndex) {
    if (question.type === "boss") return (question.steps[partIndex] || {}).diagnoses;
    if (question.type === "match") return (question.rows[partIndex] || {}).diagnoses;
    if (question.type === "cloze" || question.type === "case-cloze") return (question.blanks[partIndex] || {}).diagnoses;
    return question.diagnoses;
  }

  function diagnosisFor(question, response) {
    if (!question || !response || response.correct) return null;
    if (question.type === "mcq" || question.type === "primer" || !question.type) {
      return (question.diagnoses || [])[response.selected] || null;
    }
    /* MSQ indexes diagnoses by option, but `selected` is the set the learner
     * picked and `partResults` tracks the answer indices — neither lines up with
     * the generic part logic below. Explain the first wrongly selected option:
     * over-selection is what the negative marking punishes, so that is the
     * choice worth naming. If they only under-selected there is no wrong pick to
     * diagnose, and the missed-answer marking already carries the lesson. */
    if (question.type === "msq") {
      var answers = question.answers || [];
      var wrongPick = (response.selected || []).filter(function (index) { return answers.indexOf(index) < 0; })[0];
      if (wrongPick === undefined) return null;
      return (question.diagnoses || [])[wrongPick] || null;
    }
    /* A numeric answer has no option to diagnose, so the diagnosis comes from the
     * figure itself: a value matching a known wrong method gets that method named.
     * Anything else falls back to the question's general miss, if one is authored. */
    if (question.type === "numeric") {
      var entry = response.numericEntry || {};
      if (entry.trap) return entry.trap;
      return question.missDiagnosis || null;
    }
    var failedIndex = (response.partResults || []).indexOf(false);
    if (failedIndex < 0) return null;
    var chosen = (response.selected || [])[failedIndex];
    return (partDiagnoses(question, failedIndex) || [])[chosen] || null;
  }

  function evaluateResponse(question) {
    if (question.type === "mcq" || question.type === "primer" || !question.type) {
      var mcqCorrect = selected === question.answer;
      var mcqDiagnosis = mcqCorrect ? null : (question.diagnoses || [])[selected];
      return {correct: mcqCorrect, partial: mcqCorrect ? 1 : 0, partResults: [mcqCorrect], conceptResults: {}, misconception: mcqCorrect ? null : (mcqDiagnosis ? mcqDiagnosis.tag : (question.misconceptions || [])[selected] || "wrong-option")};
    }
    if (question.type === "numeric") {
      /* All or nothing, within the tolerance, because that is the paper's rule:
       * marks for the final answer only, none for working. The diagnosis is
       * chosen by *how* the figure is wrong — a near miss is a rounding problem,
       * a value matching a known wrong method is a method problem, and those need
       * different corrections. `nearMisses` lets an author name the specific
       * wrong figure a common mistake produces. */
      var given = parseNumericEntry(selected);
      var target = Number(question.answer);
      var tolerance = Number(question.tolerance || 0);
      var numericCorrect = given !== null && Math.abs(given - target) <= tolerance;
      var trap = null;
      if (!numericCorrect && given !== null) {
        (question.nearMisses || []).some(function (entry) {
          if (Math.abs(given - Number(entry.value)) <= Number(entry.tolerance || tolerance)) { trap = entry; return true; }
          return false;
        });
      }
      return {
        correct: numericCorrect,
        partial: numericCorrect ? 1 : 0,
        partResults: [numericCorrect],
        conceptResults: {},
        numericEntry: {given: given, target: target, tolerance: tolerance, unit: question.unit || "", trap: trap},
        misconception: numericCorrect ? null : (trap ? trap.tag : given === null ? "no-figure-entered" : "wrong-figure")
      };
    }
    if (question.type === "msq") {
      /* Scored exactly as the paper scores it: +1 per correct option selected,
       * -1 per wrong option selected, floored at zero for the question. Mastery
       * evidence is stricter than marks — `correct` requires the exact set, so a
       * part-marked answer never reads as understanding on the dashboard. */
      var answers = question.answers || [];
      var picked = msqSelection();
      var hits = picked.filter(function (index) { return answers.indexOf(index) >= 0; });
      var misses = picked.filter(function (index) { return answers.indexOf(index) < 0; });
      var awarded = Math.max(0, hits.length - misses.length);
      var exact = hits.length === answers.length && misses.length === 0;
      var firstWrong = misses.length ? misses[0] : null;
      var msqDiagnosis = firstWrong === null ? null : (question.diagnoses || [])[firstWrong];
      return {
        correct: exact,
        partial: answers.length ? awarded / answers.length : 0,
        partResults: answers.map(function (index) { return picked.indexOf(index) >= 0; }),
        conceptResults: {},
        msqMarks: {awarded: awarded, available: answers.length, hits: hits.length, misses: misses.length},
        misconception: exact ? null : (msqDiagnosis ? msqDiagnosis.tag : (misses.length ? "over-selected" : "under-selected"))
      };
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
    var failedPart = partResults.indexOf(false);
    var partDiagnosis = failedPart < 0 ? null : (partDiagnoses(question, failedPart) || [])[selected[failedPart]];
    return {
      correct: partResults.every(Boolean),
      partial: correctCount / Math.max(1, partResults.length),
      partResults: partResults,
      conceptResults: conceptResults,
      misconception: partResults.every(Boolean) ? null : (partDiagnosis ? partDiagnosis.tag : (question.misconceptions || [])[failedPart] || "broken-reasoning-step")
    };
  }

  function ensureReattempt(question, reason) {
    var responsesForConcept = session.responses.filter(function (response) { return response.conceptId === question.conceptId; }).length;
    if (responsesForConcept >= 4) return false;
    var laterIndex = -1;
    for (var index = session.index + 1; index < session.queue.length; index += 1) {
      // A lesson carries the concept id of the question it precedes, so without
      // this guard the re-attempt scheduler treats teaching as a re-attemptable
      // surface and drags it out of position — which is how a sample-size case
      // ended up scheduled ahead of the sample-size lesson.
      if (session.queue[index].lesson) continue;
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

    /* Bringing a question forward must not overtake its own teaching. Any lesson
     * the re-attempt depends on is placed immediately ahead of it, and removed
     * from wherever it was queued later so it is not delivered twice. */
    var reattemptQuestion = getQuestion(session.courseId, item.id);
    pendingLessonsFor(reattemptQuestion).forEach(function (lectureId) {
      for (var scan = session.queue.length - 1; scan > session.index; scan -= 1) {
        if (session.queue[scan].lesson && session.queue[scan].lectureId === lectureId) {
          session.queue.splice(scan, 1);
          if (scan < insertAt) insertAt -= 1;
        }
      }
      session.queue.splice(insertAt, 0, {
        id: lessonItemId(lectureId, reattemptQuestion.conceptId),
        initial: false,
        isReattempt: false,
        origin: null,
        lesson: true,
        lectureId: lectureId,
        previousConceptId: question.conceptId
      });
      insertAt += 1;
    });

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
    if (question.type === "primer") recordPrimerAttempt(session.courseId, question, correct);
    else if (session.mode !== "simulation") recordAttempt(session.courseId, question, evaluation, confidence, item, session.blockId);
    var after = conceptStatus(session.courseId, question.conceptId);
    var afterEvidence = conceptEvidence(session.courseId, question.conceptId);
    var scheduled = false;
    if (question.type !== "primer" && session.mode !== "simulation" && !correct) scheduled = ensureReattempt(question, confidence === "high" ? "confident-error" : confidence === "low" ? "uncertain-error" : "missed");
    else if (question.type !== "primer" && session.mode !== "simulation" && after !== "strong" && (confidence === "low" || afterEvidence.correct < 3)) scheduled = ensureReattempt(question, confidence === "low" ? "low-confidence-correct" : "developing");

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
      scored: question.type !== "primer",
      primer: question.type === "primer",
      primerLevel: item.primerLevel || null,
      partial: evaluation.partial,
      partResults: evaluation.partResults,
      conceptResults: evaluation.conceptResults,
      msqMarks: evaluation.msqMarks || null,
      numericEntry: evaluation.numericEntry || null,
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
    if (question.type === "mcq" || question.type === "primer" || !question.type) return [question.options[question.answer]];
    if (question.type === "msq") return (question.answers || []).map(function (index) { return question.options[index]; });
    if (question.type === "numeric") return [String(question.answer) + (question.unit ? " " + question.unit : "")];
    if (question.type === "match") return question.rows.map(function (row) { return row.label + " → " + question.choices[row.answer]; });
    if (question.type === "boss") return question.steps.map(function (step) { return step.label + ": " + step.options[step.answer]; });
    if (question.type === "short-answer") return [question.exemplar];
    return question.blanks.map(function (blank) { return blank.label + ": " + blank.options[blank.answer]; });
  }

  // Superseded by the per-option diagnosis in `diagnosisFor`, which names the
  // specific belief a chosen option encodes rather than quoting the option back.

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
    if (response.primer) return renderPrimerResolved(question, response);
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
    var diagnosis = diagnosisFor(question, response);
    var bossCopy = bossStepFeedback(question, response);

    // A wrong answer is explained in the order a learner needs it: what this
    // choice assumed, then what actually governs the case, then the full answer,
    // then the wider connection. The complete answer is no longer collapsed —
    // hiding it behind a disclosure was the gap that made this panel feel like a
    // verdict without a reason.
    var body;
    if (response.correct) {
      body = "<p>" + escapeHtml(question.explanation) + "</p>";
    } else if (diagnosis) {
      // For a repair cloze the correct option is the governing principle itself, so
      // the answer key already states it. Printing both says the same sentence twice.
      var governingIsInAnswer = answerKey.join(" ").indexOf(String(question.explanation).trim()) >= 0;
      body =
        "<div class='diagnosis'>" +
          "<p class='diagnosis-head'>" + escapeHtml(diagnosis.label) + "</p>" +
          "<p>" + escapeHtml(diagnosis.why) + "</p>" +
          (diagnosis.cue ? "<p class='diagnosis-cue'><b>Catch it earlier:</b> " + escapeHtml(diagnosis.cue) + "</p>" : "") +
        "</div>" +
        (governingIsInAnswer ? "" : "<p class='governing'><b>What governs this question:</b> " + escapeHtml(question.explanation) + "</p>");
    } else {
      body = "<p>" + escapeHtml(question.explanation) + "</p>";
    }

    /* Multiple-select is the one format where "wrong" is not the whole story: the
     * paper part-marks it, so a learner who took two of three and left the trap
     * alone did better than one who selected everything. Showing the marks makes
     * the negative marking concrete instead of abstract advice. */
    /* Numeric feedback states the figure entered against the accepted band, so a
     * near miss is legible as a near miss rather than a flat "wrong". */
    var numeric = response.numericEntry;
    var numericCopy = "";
    if (numeric) {
      var unitCopy = numeric.unit ? " " + numeric.unit : "";
      numericCopy = response.correct
        ? "You entered " + numeric.given + unitCopy + ". Accepted: " + numeric.target + unitCopy +
          (numeric.tolerance ? " ± " + numeric.tolerance : "") + "."
        : (numeric.given === null ? "No figure was read from your answer." : "You entered " + numeric.given + unitCopy + ".") +
          " The answer is " + numeric.target + unitCopy +
          (numeric.tolerance ? ", accepted within ± " + numeric.tolerance : "") +
          ". This section marks the final figure only, so there is no part credit for method.";
    }

    var marks = response.msqMarks;
    var marksCopy = marks
      ? marks.awarded + " of " + marks.available + (marks.available === 1 ? " mark" : " marks") +
        " — " + marks.hits + " right" + (marks.misses ? ", " + marks.misses + " wrong at −1 each" : ", nothing wrongly selected") +
        (marks.misses && marks.hits - marks.misses < 0 ? ". The paper floors a question at zero, so this cannot go negative." : "")
      : "";

    feedback.innerHTML = "<span class='feedback-label'>" + escapeHtml(label) + "</span>" +
      (marksCopy ? "<p class='msq-marks'>" + escapeHtml(marksCopy) + "</p>" : "") +
      (numericCopy ? "<p class='numeric-verdict'>" + escapeHtml(numericCopy) + "</p>" : "") + body +
      (bossCopy ? "<p class='still-valid'><b>What remains valid:</b> " + escapeHtml(bossCopy) + "</p>" : "") +
      (!response.correct ? "<div class='answer-key'><p class='answer-key-head'>The complete answer</p><ul>" + answerKey.map(function (answer) { return "<li>" + escapeHtml(answer) + "</li>"; }).join("") + "</ul></div>" : "") +
      "<p class='bridge'><b>Why it connects:</b> " + escapeHtml(question.link) + "</p>" +
      "<p class='return-note'>" + escapeHtml(returnCopy) + "</p>";
    $("commit-answer").hidden = true;
    $("next-question").hidden = false;
    $("next-question").innerHTML = session.index + 1 >= session.queue.length ? "Finish this set <span aria-hidden='true'>→</span>" : "Continue <span aria-hidden='true'>→</span>";
  }

  function renderPrimerResolved(question, response) {
    var feedback = $("feedback");
    feedback.className = "feedback visible" + (response.correct ? " primer-pass" : " wrong");
    feedback.innerHTML = response.correct
      ? "<span class='feedback-label'>Primer ready to use</span><p>Good. The next question will ask you to use this idea, not repeat the definition.</p>"
      : "<span class='feedback-label'>Primer strengthened</span><p>Keep the precise principle active: " + escapeHtml(question.primerFact) + "</p><p class='bridge'><b>Connection:</b> " + escapeHtml(question.primerConnection) + "</p>";
    $("commit-answer").hidden = true;
    $("next-question").hidden = false;
    $("next-question").innerHTML = "Use it in the next challenge <span aria-hidden='true'>→</span>";
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
    // renderLesson moves focus to its own heading, so do not pull it back to a
    // question title the lesson surface has hidden.
    var next = currentQuestion();
    if (next && next.type !== "lesson") (next.caselet ? $("case-block") : $("question-title")).focus({preventScroll: true});
  }

  function updatePracticeProgress() {
    if (!session) return;
    // Lessons never produce a response, so they are counted as steps completed
    // once passed; otherwise the progress bar could never reach the end.
    var passedLessons = session.queue.slice(0, session.index).filter(function (item) { return item.lesson; }).length;
    var answered = session.responses.length + passedLessons;
    var total = session.queue.length;
    var question = session.index < total ? currentQuestion() : null;
    $("practice-progress-text").textContent = Math.min(answered, total) + " of " + total + " steps";
    $("question-count").textContent = question && question.type === "lesson" ? "Lesson before the first question on it"
      : question && question.type === "primer" ? "Primer before the next challenge"
      : "Question " + Math.min(challengePosition(), session.baseCount) + " of " + session.baseCount;
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
    var evidenceResponses = completedSession.responses.filter(function (response) { return !response.primer; });
    var touched = unique(evidenceResponses.reduce(function (values, response) { return values.concat(response.conceptIds || [response.conceptId]); }, []));
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
    /* The band is stored on the element so the ring can be repainted when the theme
       changes without recomputing the whole results screen. */
    $("score-ring").dataset.band = percent >= 75 ? "high" : percent >= 50 ? "mid" : "low";
    paintScoreRing();

    var review = $("result-review");
    review.innerHTML = "";
    touched.forEach(function (conceptId) {
      var concept = getConcept(completedSession.courseId, conceptId);
      var response = evidenceResponses.filter(function (item) { return (item.conceptIds || [item.conceptId]).indexOf(conceptId) >= 0; }).slice(-1)[0];
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
    if (question.type === "mcq" || question.type === "primer" || !question.type) return [question.options[response.selected] || "No answer recorded"];
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
    if (lastFinished.kind === "practice-check" || lastFinished.kind === "practice-shape") {
      profile.selectedCourse = lastFinished.courseId;
      return startBuiltPractice({
        shape: lastFinished.shape || "mixed",
        focus: lastFinished.focus || "all",
        length: lastFinished.length || "standard",
        mode: lastFinished.mode || "learning"
      });
    }
    startPriorityPractice(lastFinished.courseId);
  }

  function goDashboard() {
    if (leavingLivePaperRefused()) return;
    session = null;
    selected = null;
    confidence = null;
    /* The brand button is in the header, so this is also the way home from the
       examiner — which makes it a crossing, and it should look like one. */
    crossProducts("learn", function () { renderDashboard(); showScreen("dashboard-screen"); });
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

  async function markCommunityOpened() {
    if (!BACKEND_ACTIVE || communityState.joined) return;
    $("community-joined").disabled = true;
    $("community-joined").textContent = "Recording invite click…";
    try {
      var response = await fetch(COMMUNITY_ENDPOINT, {
        method:"PATCH",
        credentials:"same-origin",
        cache:"no-store",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({action:"opened"})
      });
      var payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "The invite click could not be recorded.");
      communityState = payload.community;
      renderCommunityReminder();
    } catch (error) {
      $("community-joined").textContent = "Open the invite again";
      toast(error.message || "The invite click could not be recorded.");
    }
  }

  async function acknowledgeCommunity() {
    if (!BACKEND_ACTIVE || communityState.joined || !communityState.inviteOpenedAt) return;
    $("community-joined").disabled = true;
    $("community-joined").textContent = "Saving…";
    try {
      var response = await fetch(COMMUNITY_ENDPOINT, {
        method:"PATCH",
        credentials:"same-origin",
        cache:"no-store",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({action:"acknowledge"})
      });
      var payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "The acknowledgement could not be saved.");
      communityState = payload.community;
      renderCommunityReminder();
      toast("WhatsApp group acknowledgement saved.");
    } catch (error) {
      renderCommunityReminder();
      toast(error.message || "The acknowledgement could not be saved.");
    }
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
    if (question.type === "mcq" || question.type === "primer" || !question.type) return shouldBeCorrect ? question.answer : (question.answer + 1) % question.options.length;
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
    /* These two scenarios used to select a tab. Nothing is mutually exclusive on the
     * homepage any more, so they open the matching block and scroll to it instead —
     * the same destination, reached the way a learner now reaches it. */
    if (name === "dashboard-concepts" || name === "dashboard-plan") {
      seedScenarioProgress();
      renderDashboard();
      showScreen("dashboard-screen");
      var target = name === "dashboard-concepts" ? $("concept-shelf-title") : revealDisclosure("plan-disclosure");
      if (target) window.requestAnimationFrame(function () { target.scrollIntoView({block: "start", behavior: "smooth"}); });
      return;
    }
    if (name === "practice-setup") {
      seedScenarioProgress();
      renderDashboard();
      showScreen("dashboard-screen");
      return openPracticeSetup("BRGSA");
    }
    if (name === "simulation-results") return renderSimulationResultsScenario();
    if (name === "question") return startStudySet("SPMS", 1);
    if (name === "question-primer" || name === "question-primer-recovery") {
      var primerTarget = getQuestion("SPMS", getStudySet("SPMS", 1).questionIds[0]);
      var primerConcept = getConcept("SPMS", primerTarget.conceptId);
      profile.primerState.SPMS = {};
      profile.primerState.SPMS[primerConcept.id] = {support:3,easyStreak:0,shown:1,correct:0,wrong:1,lastAt:Date.now() - 1000};
      startStudySet("SPMS", 1);
      if (currentQuestion().type === "primer") {
        session.queue[0].primerLevel = 3;
        renderQuestion();
      }
      if (name === "question-primer-recovery") {
        var primerQuestion = currentQuestion();
        selected = (primerQuestion.answer + 1) % primerQuestion.options.length;
        session.selected = selected;
        commitAnswer();
      }
      return;
    }
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

  /* Each chart draws itself once. A line that re-traces on every answer would be
     the same tax the entrance cascade avoids, and the second tracing says nothing
     the first did not. */
  function drawOnce(node) {
    if (!node || node.dataset.drawn) return;
    node.dataset.drawn = "1";
    drawPaths(node);
  }

  /* ==========================================================================
   * Dungeon, the examiner
   * ==========================================================================
   *
   * A second product sharing one bank. The learning system's whole job is to order
   * questions so you can succeed at them — lecture before test, weak concepts first,
   * feedback after every answer. This one deliberately does none of that, because
   * what it is for is the opposite: meeting the paper cold, at length, on a clock.
   *
   * The paper shapes below are docs/briefs/T6_EXAM_PATTERN.md, which is the authority
   * for structure and outranks anything else in the repo. Nothing here is invented:
   * sections, counts, per-question marks, duration, negative marking, and calculator
   * rules are all from that file. Where the bank cannot fill a section, the brief
   * says so in the learner's own terms rather than padding with the wrong format —
   * an MSQ section quietly filled with MCQs would train the wrong instinct on the
   * only negatively marked section in the whole term, which is precisely backwards.
   */
  var EXAM_MINUTES = 120;
  var EXAM_PAPERS = {
    SPMS: {
      title: "Software Product Management for Startups",
      sat: "22 August, 09:00–11:00",
      total: 75,
      calculator: null,
      sections: [
        {id: "A", label: "Section A", type: "mcq", count: 35, marks: 1,
         rule: "One correct option. One mark each. No negative marking."},
        {id: "B", label: "Section B", type: "msq", count: 20, marks: 2, negative: true,
         rule: "Multiple correct options. +1 for each right option, −1 for each wrong one, and a question cannot score below zero. Choosing every option is strictly worse than choosing only the ones you are sure of."}
      ]
    },
    BRGSA: {
      title: "Business Research and Growth Systems Architecture",
      sat: "22 August, 13:00–15:00",
      total: 80,
      calculator: "basic",
      sections: [
        {id: "A", label: "Section A", type: "mcq", count: 20, marks: 2,
         rule: "One correct option. Two marks each. No negative marking."},
        {id: "B", label: "Section B", type: "case-cloze", count: 4, marks: 5,
         rule: "A short scenario, then a task. Address every part of the task directly."},
        {id: "C", label: "Section C", type: "short-answer", count: 2, marks: 10,
         rule: "A complete structured response. Marked here by your own review against the rubric after you submit."}
      ]
    },
    SCLM: {
      title: "Supply Chain & Logistics Management",
      sat: "23 August, 13:00–15:00",
      total: 80,
      calculator: "scientific",
      sections: [
        {id: "A", label: "Section A", type: "mcq", count: 50, marks: 1,
         rule: "One correct option. One mark each. No negative marking."},
        {id: "B", label: "Section B", type: "numeric", count: 6, marks: 4,
         rule: "Enter the final figure only. Marks are for the answer inside the stated tolerance; no marks are given for working."},
        {id: "C", label: "Section C", type: "match", count: 3, marks: 2,
         rule: "Match every pair. Two marks each."}
      ]
    },
    IBM: {
      title: "Inclusive Business Model",
      sat: "23 August, 09:00–11:00",
      total: 100,
      calculator: null,
      sections: [
        {id: "A", label: "Section A", type: "short-answer", count: 10, marks: 10,
         rule: "Ten written answers, every one of them on the caselet released two days before the exam."}
      ],
      /* IBM cannot be mocked honestly and it is important to say why rather than to
         ship a paper that pretends otherwise. Its real paper is ten written answers
         on a case nobody has seen yet; a mock built from bank questions would be a
         different exam wearing its name. */
      caveat: "This paper is ten written answers on a caselet released two days beforehand. A mock cannot reproduce that, because the case is the paper. What is offered here is timed writing practice against the frameworks, not a rehearsal of the real questions."
    }
  };

  /* Deterministic shuffle. The spread has to be random — that is the point, and
     ordering by concept or module would rebuild the teaching sequence the exam does
     not have — but it also has to survive a reload mid-paper, so it is seeded from
     the attempt rather than from Math.random(). */
  function examShuffle(items, seed) {
    var out = items.slice();
    var state = seed >>> 0 || 1;
    for (var i = out.length - 1; i > 0; i--) {
      state = (state * 1664525 + 1013904223) >>> 0;
      var j = state % (i + 1);
      var swap = out[i]; out[i] = out[j]; out[j] = swap;
    }
    return out;
  }

  function examPool(courseId, type) {
    var course = getCourse(courseId);
    var pool = [];
    Object.keys(course.questions).forEach(function (key) {
      var group = course.questions[key];
      (Array.isArray(group) ? group : [group]).forEach(function (question) {
        var questionType = question.type || "mcq";
        /* Primers teach. They have no place on a paper. */
        if (questionType === "primer") return;
        if (questionType === type) pool.push(question);
      });
    });
    return pool;
  }

  /* Spread repeated stems apart.
   *
   * The bank generates about three surfaces per concept from a handful of templates,
   * so a section needing most of its pool necessarily repeats stems: SCLM Section A
   * wants 50 MCQs, the pool holds 52, and between them they carry 22 distinct stems —
   * one of which covers 16 questions. Selection cannot fix that. It is a bank-content
   * gap and is recorded as one.
   *
   * It is worse than a repeated task line, too: measured on SCLM Section A, sixteen
   * of the fifty questions carry a character-identical caselet *and* stem — the
   * generator's filler prompt, "A student understands the definition but needs to
   * explain why the idea changes the next decision" — and differ only in their
   * options. Those sixteen are genuinely different items, but they present with
   * nothing to tell them apart.
   *
   * What selection can fix is the clustering. A candidate who meets the same sentence
   * three times in a row reads it as a broken paper; the same three spread across
   * forty questions reads as a familiar phrasing, which is what it actually is. So the
   * draw is round-robined across groups of identical *visible prompt* — caselet and
   * stem together, since that is what the candidate reads — largest group first,
   * leaving the order within each group exactly as the seed shuffled it. */
  function spreadByStem(questions) {
    var groups = [];
    var index = {};
    questions.forEach(function (question) {
      var key = String(question.caselet || "") + "|" + String(question.stem || question.prompt || question.id);
      if (!(key in index)) { index[key] = groups.length; groups.push([]); }
      groups[index[key]].push(question);
    });
    if (groups.length < 2) return questions;
    groups.sort(function (a, b) { return b.length - a.length; });
    var out = [];
    for (var i = 0; out.length < questions.length; i++) {
      /* eslint-disable-next-line no-loop-func */
      groups.forEach(function (group) { if (group[i]) out.push(group[i]); });
    }
    return out;
  }

  /* Builds the paper, and reports honestly on what it could not fill. */
  function buildExamPaper(courseId, seed) {
    var spec = EXAM_PAPERS[courseId];
    if (!spec) return null;
    var questions = [];
    var shortfalls = [];
    spec.sections.forEach(function (section) {
      var pool = examShuffle(examPool(courseId, section.type), seed + section.id.charCodeAt(0));
      var taken = pool.slice(0, section.count);
      if (taken.length < section.count) {
        shortfalls.push({section: section.id, want: section.count, have: taken.length, type: section.type});
      }
      taken = spreadByStem(taken);
      taken.forEach(function (question) {
        questions.push({question: question, section: section.id, marks: section.marks});
      });
    });
    return {courseId: courseId, spec: spec, questions: questions, shortfalls: shortfalls,
      /* The paper's own marks, not the bank's: a section short of items is worth
         less, and saying it scored out of the full paper would be a lie. */
      available: questions.reduce(function (sum, item) { return sum + item.marks; }, 0)};
  }

  /* ---- exam runtime ------------------------------------------------------- */

  var exam = null;          /* the live attempt, or null outside the examiner */
  var examTicker = null;

  var EXAM_STATES = [
    {id: "answered", label: "Answered"},
    {id: "not-answered", label: "Not answered"},
    {id: "not-visited", label: "Not visited"},
    {id: "marked", label: "Marked for review"},
    {id: "answered-marked", label: "Answered and marked (still scored)"}
  ];

  function examStateOf(index) {
    var item = exam.items[index];
    var answered = examHasResponse(item);
    if (item.marked) return answered ? "answered-marked" : "marked";
    if (answered) return "answered";
    return item.visited ? "not-answered" : "not-visited";
  }

  function examHasResponse(item) {
    if (item.response === null || item.response === undefined) return false;
    if (Array.isArray(item.response)) return item.response.length > 0;
    if (typeof item.response === "string") return item.response.trim() !== "";
    if (typeof item.response === "object") return Object.keys(item.response).length > 0;
    return true;
  }

  /* ---- mock sets ----------------------------------------------------------------
   *
   * One paper per subject was a rehearsal you could memorise. Three are three
   * genuinely different draws from the same bank under the same rules, which is what
   * "sit another one" has to mean if the second sitting is to measure anything.
   *
   * The seed is derived from the subject and the set number, never from the clock:
   * a paper has to survive a refresh halfway through, so Set 2 of SCLM must be the
   * same 59 questions in the same order tomorrow as it is now.
   */
  var EXAM_SET_COUNT = 3;

  function examSeed(courseId, setIndex) {
    var base = 2166136261;
    for (var i = 0; i < courseId.length; i++) {
      base = (base ^ courseId.charCodeAt(i)) >>> 0;
      base = (base * 16777619) >>> 0;
    }
    return (base + (setIndex + 1) * 2654435761) >>> 0;
  }

  function openExaminer(courseId, setIndex) {
    var set = typeof setIndex === "number" ? setIndex : 0;
    var paper = buildExamPaper(courseId, examSeed(courseId, set));
    if (!paper) return;
    exam = {
      paper: paper,
      courseId: courseId,
      setIndex: set,
      items: paper.questions.map(function (entry, index) {
        return {index: index, section: entry.section, marks: entry.marks, question: entry.question,
          response: null, marked: false, visited: false,
          /* Telemetry, captured while the paper runs because none of it can be
             reconstructed afterwards. `seconds` is time with the question actually on
             screen; `visits` counts returns to it; `changes` counts how often the
             answer moved; `firstResponse` is what they put down before any second
             thoughts, which is the only way to tell a corrected slip from a coin flip.
             All of it lives on the attempt and none of it reaches conceptAttempts. */
          seconds: 0, visits: 0, changes: 0, firstResponse: null, firstResponseSeconds: null};
      }),
      current: 0,
      section: paper.spec.sections[0].id,
      remaining: EXAM_MINUTES * 60,
      started: false,
      submitted: false
    };
    showScreen("exam-screen");
    renderExamBrief();
  }

  function renderExamBrief() {
    var spec = exam.paper.spec;
    $("exam-brief").hidden = false;
    $("exam-runner").hidden = true;
    $("exam-result").hidden = true;
    $("exam-paper-title").textContent = spec.title;
    $("exam-brief-lede").textContent = spec.caveat ||
      "Sat " + spec.sat + ". Once the clock starts nothing is explained until you submit, and the questions arrive in the paper's order rather than a teaching order.";
    var sat = examAttemptsFor(exam.courseId, exam.setIndex);
    $("exam-facts").innerHTML =
      "<div><dt>Paper</dt><dd>" + examSetLabel(exam.setIndex) +
        (sat.length ? " · sat " + sat.length + "×" : " · not sat") + "</dd></div>" +
      "<div><dt>Duration</dt><dd>" + EXAM_MINUTES + " minutes</dd></div>" +
      "<div><dt>Total marks</dt><dd>" + spec.total + "</dd></div>" +
      "<div><dt>Questions</dt><dd>" + spec.sections.reduce(function (n, s) { return n + s.count; }, 0) + "</dd></div>" +
      "<div><dt>Calculator</dt><dd>" + (spec.calculator === "scientific" ? "Scientific" : spec.calculator === "basic" ? "Normal" : "Not allowed") + "</dd></div>";
    $("exam-rules").innerHTML = spec.sections.map(function (section) {
      return "<div class='exam-rule'><b>" + escapeHtml(section.label) + " · " + section.count +
        " × " + section.marks + " mark" + (section.marks === 1 ? "" : "s") + "</b>" +
        "<p>" + escapeHtml(section.rule) + "</p></div>";
    }).join("");
    var shortfalls = exam.paper.shortfalls;
    var note = $("exam-shortfall");
    note.hidden = shortfalls.length === 0;
    if (shortfalls.length) {
      /* Said plainly, and before the clock starts. A learner is entitled to know that
         a section is short before they decide to spend two hours on it. */
      note.textContent = "This mock is not full length yet. " + shortfalls.map(function (s) {
        return "Section " + s.section + " asks for " + s.want + " " + s.type + " questions and the bank has " + s.have;
      }).join("; ") + ". You will be scored out of what is actually here, not out of " + spec.total + ".";
    }
    $("exam-begin").textContent = "Start the clock · " + EXAM_MINUTES + " minutes";
  }

  function beginExam() {
    exam.started = true;
    syncModeSwitchVisibility();
    $("exam-brief").hidden = true;
    $("exam-runner").hidden = false;
    exam.items[0].visited = true;
    renderExamSections();
    renderExamQuestion();
    startExamClock();
    $("exam-question").focus({preventScroll: true});
  }

  function startExamClock() {
    window.clearInterval(examTicker);
    examTicker = window.setInterval(function () {
      if (!exam || exam.submitted) return;
      exam.remaining -= 1;
      exam.items[exam.current].seconds += 1;
      renderExamClock();
      /* The clock is the exam. When it runs out the paper is taken, answered or not. */
      if (exam.remaining <= 0) submitExam(true);
    }, 1000);
  }

  function formatClock(totalSeconds) {
    var s = Math.max(0, totalSeconds);
    var m = Math.floor(s / 60);
    return m + ":" + String(s % 60).padStart(2, "0");
  }

  function renderExamClock() {
    var left = $("exam-time-left");
    left.textContent = formatClock(exam.remaining);
    /* Under five minutes the clock stops being furniture. */
    left.classList.toggle("urgent", exam.remaining <= 300);
    $("exam-time-question").textContent = "On this question " + formatClock(exam.items[exam.current].seconds);
  }

  function renderExamSections() {
    $("exam-sections").innerHTML = exam.paper.spec.sections.map(function (section) {
      var count = exam.items.filter(function (i) { return i.section === section.id; }).length;
      if (!count) return "";
      return "<button type='button' role='tab' class='exam-section-tab" +
        (section.id === exam.section ? " active" : "") + "' data-section='" + section.id +
        "' aria-selected='" + (section.id === exam.section) + "'>" +
        escapeHtml(section.label) + "<small>" + count + " × " + section.marks + "</small></button>";
    }).join("");
    $all(".exam-section-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        var first = exam.items.filter(function (i) { return i.section === tab.dataset.section; })[0];
        if (first) goExamQuestion(first.index);
      });
    });
  }

  function renderExamPalette() {
    var sectionItems = exam.items.filter(function (i) { return i.section === exam.section; });
    /* Counted over the section the palette is showing, not the whole paper. They
       disagreed before — the legend said "42 not visited" above a grid of 35 — which
       makes the one number a candidate uses to decide where to spend the next ten
       minutes quietly wrong. */
    var counts = {};
    EXAM_STATES.forEach(function (state) { counts[state.id] = 0; });
    sectionItems.forEach(function (item) { counts[examStateOf(item.index)] += 1; });
    $("exam-legend").innerHTML = EXAM_STATES.map(function (state) {
      return "<li><i class='exam-chip " + state.id + "'>" + counts[state.id] + "</i><span>" + escapeHtml(state.label) + "</span></li>";
    }).join("");
    $("exam-palette").innerHTML = sectionItems.map(function (item) {
      var withinSection = sectionItems.indexOf(item) + 1;
      return "<button type='button' class='exam-chip " + examStateOf(item.index) +
        (item.index === exam.current ? " current" : "") + "' data-index='" + item.index +
        "' aria-label='Question " + withinSection + ", " + examStateOf(item.index).replace("-", " ") + "'>" +
        withinSection + "</button>";
    }).join("");
    $all("#exam-palette .exam-chip").forEach(function (chip) {
      chip.addEventListener("click", function () { goExamQuestion(Number(chip.dataset.index)); });
    });
  }

  function goExamQuestion(index) {
    if (index < 0 || index >= exam.items.length) return;
    exam.current = index;
    exam.section = exam.items[index].section;
    if (!exam.items[index].visited) exam.items[index].visited = true;
    exam.items[index].visits += 1;
    renderExamSections();
    renderExamQuestion();
    $("exam-question").focus({preventScroll: true});
  }

  function renderExamQuestion() {
    var item = exam.items[exam.current];
    var question = item.question;
    var sectionItems = exam.items.filter(function (i) { return i.section === item.section; });
    $("exam-qnumber").textContent = "Section " + item.section + " · Question " + (sectionItems.indexOf(item) + 1) + " of " + sectionItems.length;
    $("exam-qmarks").textContent = item.marks + " mark" + (item.marks === 1 ? "" : "s");
    $("exam-question-body").innerHTML = examQuestionMarkup(question, item);
    bindExamResponse(item);
    renderExamPalette();
    renderExamClock();
    $("exam-prev").disabled = exam.current === 0;
    $("exam-next").textContent = exam.current === exam.items.length - 1 ? "Save" : "Save & next";
    var calculator = exam.paper.spec.calculator;
    $("exam-calc-toggle").hidden = !calculator;
  }

  function examQuestionMarkup(question, item) {
    var type = question.type || "mcq";
    var head = "";
    /* `caselet` is a string on some question families and null on others, and null is
       typeof "object" — so this checks the type rather than truthiness alone. */
    if (typeof question.caselet === "string" && question.caselet) {
      head += "<div class='exam-caselet'>" + escapeHtml(question.caselet) + "</div>";
    }
    head += "<h2 class='exam-stem'>" + escapeHtml(question.stem || question.prompt || "") + "</h2>";
    /* Numeric items carry the scenario in `stem` and the actual ask in `prompt`; only
       showing one of them loses either the context or the question. */
    if (question.prompt && question.stem && question.prompt !== question.stem) {
      head += "<p class='exam-prompt'>" + escapeHtml(question.prompt) + "</p>";
    }
    if (type === "mcq" || type === "case-cloze") {
      return head + "<div class='exam-options' role='radiogroup'>" + (question.options || []).map(function (option, index) {
        return "<button type='button' class='exam-option" + (item.response === index ? " chosen" : "") +
          "' role='radio' aria-checked='" + (item.response === index) + "' data-choice='" + index + "'>" +
          "<span class='option-key'>" + "ABCDEFGH"[index] + "</span><span>" + escapeHtml(option) + "</span></button>";
      }).join("") + "</div>";
    }
    if (type === "msq") {
      var chosen = Array.isArray(item.response) ? item.response : [];
      return head + "<p class='exam-msq-note'>More than one option is correct. +1 for each right option, −1 for each wrong one.</p>" +
        "<div class='exam-options'>" + (question.options || []).map(function (option, index) {
          return "<button type='button' class='exam-option multi" + (chosen.indexOf(index) >= 0 ? " chosen" : "") +
            "' role='checkbox' aria-checked='" + (chosen.indexOf(index) >= 0) + "' data-choice='" + index + "'>" +
            "<span class='option-box'></span><span>" + escapeHtml(option) + "</span></button>";
        }).join("") + "</div>";
    }
    if (type === "numeric") {
      return head + "<label class='exam-numeric'><span>Final answer" + (question.unit ? " (" + escapeHtml(question.unit) + ")" : "") + "</span>" +
        "<input id='exam-numeric-input' type='text' inputmode='decimal' autocomplete='off' value='" +
        escapeHtml(item.response === null ? "" : String(item.response)) + "'></label>" +
        "<p class='exam-hint'>Enter the figure only. No marks are given for working.</p>";
    }
    if (type === "match") {
      /* The bank's shape: `rows` are the prompts and each carries `answer`, an index
         into the shared `choices` list. There is nothing to shuffle — the choices are
         already one fixed list, which is how the paper presents them. */
      var rows = question.rows || [];
      var choices = question.choices || [];
      var picked = item.response && typeof item.response === "object" ? item.response : {};
      return head + "<div class='exam-match'>" + rows.map(function (row, index) {
        return "<div class='exam-match-row'><span>" + escapeHtml(row.label || "") + "</span>" +
          "<select data-pair='" + index + "' aria-label='Match for " + escapeHtml(row.label || "") + "'>" +
          "<option value=''>Choose</option>" +
          choices.map(function (choice, choiceIndex) {
            return "<option value='" + choiceIndex + "'" +
              (String(picked[index]) === String(choiceIndex) ? " selected" : "") + ">" +
              escapeHtml(choice) + "</option>";
          }).join("") + "</select></div>";
      }).join("") + "</div>";
    }
    /* short-answer and anything else written */
    return head + "<label class='exam-written'><span>Your answer</span>" +
      "<textarea id='exam-written-input' rows='12' placeholder='Write your full answer here.'>" +
      escapeHtml(item.response === null ? "" : String(item.response)) + "</textarea></label>" +
      "<p class='exam-hint'>Written answers are not machine-marked. After you submit you will review this against the rubric yourself.</p>";
  }

  /* Every response passes through here so the history is captured once, in one place.
     The first answer is kept separately from the final one: a learner who puts down B
     in nine seconds and leaves it is doing something different from one who puts down
     B, thinks, and moves to C — and only the first-answer record can tell them apart
     afterwards. */
  function recordExamResponse(item, value) {
    var had = examHasResponse(item);
    item.response = value;
    if (!had && examHasResponse(item)) {
      item.firstResponse = Array.isArray(value) ? value.slice() : value;
      item.firstResponseSeconds = item.seconds;
    } else if (had) {
      item.changes += 1;
    }
  }

  function bindExamResponse(item) {
    var type = item.question.type || "mcq";
    $all("#exam-question-body .exam-option").forEach(function (button) {
      button.addEventListener("click", function () {
        var choice = Number(button.dataset.choice);
        if (type === "msq") {
          var chosen = Array.isArray(item.response) ? item.response.slice() : [];
          var at = chosen.indexOf(choice);
          if (at >= 0) chosen.splice(at, 1); else chosen.push(choice);
          recordExamResponse(item, chosen);
        } else {
          recordExamResponse(item, choice);
        }
        renderExamQuestion();
      });
    });
    var numeric = $("exam-numeric-input");
    if (numeric) numeric.addEventListener("input", function () { recordExamResponse(item, numeric.value); renderExamPalette(); });
    var written = $("exam-written-input");
    if (written) written.addEventListener("input", function () { recordExamResponse(item, written.value); renderExamPalette(); });
    $all("#exam-question-body select[data-pair]").forEach(function (select) {
      select.addEventListener("change", function () {
        var picked = item.response && typeof item.response === "object" ? item.response : {};
        if (select.value === "") delete picked[select.dataset.pair];
        else picked[select.dataset.pair] = select.value;
        recordExamResponse(item, picked);
        renderExamPalette();
      });
    });
  }

  /* Scoring, by the paper's rules rather than the learning system's.
     The only subtle one is SPMS Section B: +1 per right option, −1 per wrong, and the
     floor is per question, not per paper — so a question cannot drag another one down. */
  function scoreExamItem(item) {
    var question = item.question;
    var type = question.type || "mcq";
    if (type === "msq") {
      var correct = question.answers || question.correct || [];
      var chosen = Array.isArray(item.response) ? item.response : [];
      var right = chosen.filter(function (c) { return correct.indexOf(c) >= 0; }).length;
      var wrong = chosen.length - right;
      /* Floored at zero per question so one question cannot drag another down, and
         capped at the question's own marks so a question carrying three correct
         options cannot pay out more than the two marks the paper says it is worth. */
      return {awarded: Math.min(item.marks, Math.max(0, right - wrong)), possible: item.marks, machine: true};
    }
    if (type === "mcq" || type === "case-cloze") {
      return {awarded: item.response === question.answer ? item.marks : 0, possible: item.marks, machine: true};
    }
    if (type === "numeric") {
      var value = parseFloat(String(item.response === null ? "" : item.response).replace(/[,₹\s]/g, ""));
      var target = Number(question.answer);
      var tolerance = Number(question.tolerance || 0);
      var hit = isFinite(value) && Math.abs(value - target) <= tolerance;
      return {awarded: hit ? item.marks : 0, possible: item.marks, machine: true};
    }
    if (type === "match") {
      /* Every row or nothing. The paper gives a match question two marks and says
         nothing about partial credit, and inventing a marking rule the examiner has
         not stated would teach a wrong expectation about the real paper. */
      var rows = question.rows || [];
      var picked = item.response && typeof item.response === "object" ? item.response : {};
      var hits = rows.filter(function (row, index) { return String(picked[index]) === String(row.answer); }).length;
      return {awarded: rows.length && hits === rows.length ? item.marks : 0, possible: item.marks, machine: true};
    }
    /* Written answers are not machine-marked, and a mock must not pretend otherwise.
       They are excluded from the machine total and reported separately for self-review. */
    return {awarded: 0, possible: item.marks, machine: false, written: true};
  }

  function submitExam(automatic) {
    if (!exam || exam.submitted) return;
    if (!automatic) {
      var unanswered = exam.items.filter(function (item) { return !examHasResponse(item); }).length;
      var confirmCopy = unanswered
        ? unanswered + " question" + (unanswered === 1 ? " is" : "s are") + " unanswered. Submit the paper anyway?"
        : "Submit the paper?";
      if (!window.confirm(confirmCopy)) return;
    }
    exam.submitted = true;
    window.clearInterval(examTicker);
    syncModeSwitchVisibility();
    renderExamResult(automatic);
  }

  /* What the paper exposed, carried back into the learning system.
   *
   * The two products share a bank, and this is the one place they should share a
   * signal: a concept you could not do under exam conditions is the best evidence
   * anywhere in the product about what to study next.
   *
   * It is stored apart from `conceptAttempts` deliberately, and that separation is
   * the whole design. A mock is unassisted, uncoached, against the clock, with no
   * lesson before it and no feedback during it — the exact opposite of the conditions
   * the evidence model is calibrated on. Writing mock answers into conceptAttempts
   * would let a bad afternoon rewrite a learner's mastery record, and a lucky guess
   * award Strong. So misses here **prioritise** and never **score**: they change the
   * order of what is offered, and nothing else. */
  function recordExamMisses(scores) {
    var courseId = exam.courseId;
    var store = profile.examMisses[courseId] || (profile.examMisses[courseId] = {});
    var stamped = new Date().toISOString();
    exam.items.forEach(function (item, index) {
      var score = scores[index];
      /* Written answers are not machine-marked, so nothing is known about them yet. */
      if (!score.machine) return;
      if (score.awarded === score.possible) return;
      var conceptId = item.question.conceptId;
      if (!conceptId) return;
      var entry = store[conceptId] || (store[conceptId] = {missed: 0, skipped: 0, at: null});
      if (examHasResponse(item)) entry.missed += 1; else entry.skipped += 1;
      entry.at = stamped;
    });
    saveProfile();
  }

  /* One sitting's worth of repair.
   *
   * A randomised trial exposed the problem this fixes: a learner who does badly enough
   * to expose eleven concepts got a run that started at 28 items and grew to 63 as
   * wrong answers scheduled re-attempts, and was still unfinished 44 steps in. The
   * compounding ran exactly the wrong way — the worse the paper went, the longer the
   * repair — so the learner this exists for hit a wall straight after a two-hour mock.
   *
   * Four concepts is a sitting a tired person can finish, and finishing is what makes
   * them come back. The rest are not dropped; they stay queued, worst first, for the
   * next sitting. */
  var EXAM_REPAIR_SITTING = 4;

  /* The concepts a mock exposed, worst first. Skipped counts for less than answered
     and wrong: running out of time is not the same as not knowing it. Concepts already
     taken into a sitting drop behind the ones that have not been, so a second sitting
     picks up where the first stopped rather than repeating it. */
  function examMissList(courseId) {
    var store = (profile.examMisses && profile.examMisses[courseId]) || {};
    return Object.keys(store).map(function (conceptId) {
      var entry = store[conceptId];
      return {conceptId: conceptId, concept: getConcept(courseId, conceptId),
        weight: entry.missed * 2 + entry.skipped, missed: entry.missed, skipped: entry.skipped,
        repairedAt: entry.repairedAt || null};
    }).filter(function (row) { return row.concept && row.weight > 0; })
      .sort(function (a, b) {
        if (Boolean(a.repairedAt) !== Boolean(b.repairedAt)) return a.repairedAt ? 1 : -1;
        return b.weight - a.weight;
      });
  }

  /* One concept, several surfaces, taught first. This is what the depth list routes
     into: a learner who has just been told they can use an idea but cannot tell it
     from its neighbour wants that idea now, not a tour of all eight things they lost
     marks on. `layeredQueue` puts the lesson and primer in front either way. */
  function conceptRepairIds(courseId, conceptId, want) {
    var ids = [];
    for (var i = 0; i < (want || 3); i++) {
      var question = chooseQuestion(courseId, conceptId, null, ids);
      if (!question || ids.indexOf(question.id) >= 0) break;
      ids.push(question.id);
    }
    return ids;
  }

  function startExamRepair(courseId, conceptId) {
    profile.selectedCourse = courseId;
    var ids, details;
    if (conceptId) {
      ids = conceptRepairIds(courseId, conceptId, 3);
      var concept = getConcept(courseId, conceptId);
      details = {kind: "exam-repair", conceptId: conceptId,
        title: concept ? concept.name : "What the mock exposed",
        kicker: "Taught first, then tested again — from what the mock exposed"};
    } else {
      var pending = examMissList(courseId);
      /* Take from the concepts no sitting has covered yet. Once every one has been
         through, fall back to the full list — a second pass over the same misses is
         legitimate revision, not a bug. */
      var untouched = pending.filter(function (row) { return !row.repairedAt; });
      var source = untouched.length ? untouched : pending;
      var misses = source.slice(0, EXAM_REPAIR_SITTING);
      if (!misses.length) return;
      ids = misses.map(function (row) {
        return chooseQuestion(courseId, row.conceptId, null, []) || questionSurfaces(courseId, row.conceptId)[0];
      }).filter(Boolean).map(function (question) { return question.id; });
      /* Stamped as taken so the next sitting moves on. The miss itself is kept — it is
         still what the paper proved, and it still orders future practice. */
      var stamp = new Date().toISOString();
      var store = profile.examMisses[courseId] || {};
      misses.forEach(function (row) { if (store[row.conceptId]) store[row.conceptId].repairedAt = stamp; });
      var left = Math.max(0, untouched.length - misses.length);
      details = {kind: "exam-repair", title: "What the mock exposed",
        kicker: left
          ? misses.length + " concepts this sitting · " + left + " waiting for the next"
          : "The concepts you lost marks on, taught before they are tested again"};
    }
    if (!ids.length) return;
    session = createSession(courseId, details, ids);
    /* The same four steps every other run uses. Calling renderQuestion() and
       showScreen() directly skipped beginPractice(), which is what writes the session
       header — so the run started with the markup's placeholder "Title" still in it. */
    profile.active = clone(session);
    saveProfile();
    beginPractice();
  }

  /* ---- where knowledge breaks down --------------------------------------------
   *
   * A score says how many marks. It does not say what went wrong, and "revise
   * Demand validation" is not much better — a learner who can define an idea but
   * cannot use it needs something completely different from one who can use it but
   * confuses it with its neighbour.
   *
   * The bank already carries the metadata to tell those apart. Every question
   * declares the `skills` it exercises, and those sort into a ladder: recognising an
   * idea is not explaining it, explaining is not applying, applying is not telling it
   * from the idea next to it, and none of that is combining two. So for each concept
   * we find the highest rung answered correctly and the lowest rung answered wrongly.
   * The gap between them is the breakdown point, and it names the fix.
   */
  var SKILL_LADDER = [
    {id: "recognise", rung: 1, label: "recognise it"},
    {id: "explain", rung: 2, label: "explain it"},
    {id: "apply", rung: 3, label: "apply it"},
    {id: "compute", rung: 3, label: "compute with it"},
    {id: "distinguish", rung: 4, label: "tell it from its neighbours"},
    {id: "diagnose", rung: 4, label: "spot it going wrong"},
    {id: "evaluate", rung: 5, label: "judge it"},
    {id: "connect", rung: 5, label: "connect it to other ideas"},
    {id: "generate", rung: 5, label: "produce it yourself"}
  ];
  var RUNG_OF = {};
  SKILL_LADDER.forEach(function (entry) { RUNG_OF[entry.id] = entry; });

  function questionRung(question) {
    /* The hardest thing a question asks for is what it actually tests. */
    var best = null;
    (question.skills || []).forEach(function (skill) {
      var entry = RUNG_OF[skill];
      if (entry && (!best || entry.rung > best.rung)) best = entry;
    });
    return best || RUNG_OF.apply;
  }

  /* What each rung asks for, in a learner's words rather than the taxonomy's. */
  var RUNG_ASK = {
    1: "pick it out of a list",
    2: "say what it claims",
    3: "use it on a case",
    4: "tell it apart from a neighbouring idea",
    5: "hold it alongside another idea"
  };

  /* The diagnosis, stated so that it claims only what this paper actually observed.
   *
   * This is the part that is easy to get wrong and worth being careful about. The
   * scored bank asks for rung 3, 4, and 5 only — recognising and explaining are what
   * the *primers* do, and primers never appear on a paper. So a dashboard that says
   * "you can explain it but cannot apply it" after a mock would be inventing the
   * first half of that sentence: nothing on the paper tested explaining. What can be
   * said is the pair actually seen — the hardest thing that went right, and the
   * easiest thing that went wrong — and when only one of those exists, only that one
   * is said. `cleared` is 0 when nothing about the concept went right. */
  function breakdownCopy(cleared, failed, connectionOnly) {
    if (connectionOnly) {
      return {name: "Holds alone, not alongside",
        fix: "You answered this correctly on its own and lost it when it shared a question with another idea. The gap is combining, not the idea itself — work the questions that put two ideas together."};
    }
    if (!cleared) {
      return {name: "Nothing landed",
        fix: "Every question on this went wrong, including asking you to " + RUNG_ASK[failed] +
          ". Treat this as first contact and start from the lesson, not from more questions."};
    }
    if (cleared < failed) {
      return {name: "Stops at " + RUNG_ASK[cleared],
        fix: "You could " + RUNG_ASK[cleared] + " but not " + RUNG_ASK[failed] +
          ". That is the step to practise — going over the definition again will not move it."};
    }
    /* Right and wrong at the same level, or right above and wrong below. Unstable
       rather than absent, and it is a different fix: not new material, more reps. */
    return {name: "Unreliable at " + RUNG_ASK[failed],
      fix: "You managed to " + RUNG_ASK[cleared] + " on one question and lost it on another at the same level. " +
        "It is not missing, it is not dependable yet — repetition is what fixes this, not a new lesson."};
  }

  /* One attempt, fully analysed. Everything the dashboard shows comes from here. */
  function analyseExamAttempt(attempt) {
    var items = attempt.items;
    var scores = items.map(scoreExamItem);
    var machine = items.filter(function (_, i) { return scores[i].machine; });
    var durations = items.filter(function (i) { return i.seconds > 0; }).map(function (i) { return i.seconds; }).sort(function (a, b) { return a - b; });
    var median = durations.length ? durations[Math.floor(durations.length / 2)] : 0;

    /* Per-concept ladder positions. */
    var concepts = {};
    items.forEach(function (item, index) {
      var score = scores[index];
      if (!score.machine) return;
      var conceptId = item.question.conceptId;
      if (!conceptId) return;
      var entry = concepts[conceptId] || (concepts[conceptId] = {
        conceptId: conceptId, concept: getConcept(attempt.courseId, conceptId),
        highestRight: 0, lowestWrong: 99, right: 0, wrong: 0, skipped: 0,
        soloRight: 0, soloWrong: 0, integrativeRight: 0, integrativeWrong: 0, seconds: 0
      });
      var rung = questionRung(item.question).rung;
      var integrative = (item.question.supportingConceptIds || []).length > 0;
      entry.seconds += item.seconds;
      if (!examHasResponse(item)) { entry.skipped += 1; return; }
      if (score.awarded === score.possible) {
        entry.right += 1;
        if (rung > entry.highestRight) entry.highestRight = rung;
        if (integrative) entry.integrativeRight += 1; else entry.soloRight += 1;
      } else {
        entry.wrong += 1;
        if (rung < entry.lowestWrong) entry.lowestWrong = rung;
        if (integrative) entry.integrativeWrong += 1; else entry.soloWrong += 1;
      }
    });

    /* The breakdown is the pair actually observed: the easiest thing that went wrong,
       and the hardest thing that went right. Neither is inferred from the other. */
    var breakdowns = Object.keys(concepts).map(function (id) {
      var entry = concepts[id];
      if (!entry.concept || entry.lowestWrong === 99) return null;
      var failed = Math.min(5, Math.max(1, entry.lowestWrong));
      var cleared = entry.highestRight;
      /* Right on its own and wrong alongside another idea is a connection failure
         whatever the rungs say, and it is the one a score sheet never surfaces. */
      var connectionOnly = entry.soloRight > 0 && entry.integrativeWrong > 0 && entry.integrativeRight === 0;
      return {conceptId: id, concept: entry.concept, rung: connectionOnly ? 5 : failed,
        cleared: cleared, failed: failed,
        copy: breakdownCopy(cleared, failed, connectionOnly),
        right: entry.right, wrong: entry.wrong, skipped: entry.skipped, seconds: entry.seconds,
        connectionOnly: connectionOnly};
    }).filter(Boolean).sort(function (a, b) {
      /* Nothing-landed first, then the lowest step failed, then the most marks lost. */
      if (!a.cleared !== !b.cleared) return a.cleared ? 1 : -1;
      if (a.rung !== b.rung) return a.rung - b.rung;
      return b.wrong - a.wrong;
    });

    /* Pacing. */
    var spent = items.reduce(function (n, i) { return n + i.seconds; }, 0);
    var slowest = items.map(function (item, index) { return {item: item, score: scores[index]}; })
      .filter(function (row) { return row.item.seconds > 0; })
      .sort(function (a, b) { return b.item.seconds - a.item.seconds; }).slice(0, 3);
    var attempted = items.filter(examHasResponse).length;

    /* Guessing. A fast wrong answer that was never revisited is the signature; a
       question answered in under a third of this learner's own median time is fast
       *for them*, which is the only baseline that means anything. */
    var guessThreshold = Math.max(6, Math.round(median / 3));
    var guesses = items.filter(function (item, index) {
      return scores[index].machine && examHasResponse(item) &&
        scores[index].awarded < scores[index].possible &&
        item.seconds > 0 && item.seconds <= guessThreshold && item.changes === 0;
    });
    var changedMind = items.filter(function (item, index) {
      return scores[index].machine && item.changes > 0 && examHasResponse(item);
    });
    var changedToWrong = changedMind.filter(function (item) {
      var index = items.indexOf(item);
      var first = item.firstResponse;
      if (first === null) return false;
      var wouldHaveScored = scoreExamItem({question: item.question, marks: item.marks, response: first});
      return wouldHaveScored.awarded > scores[index].awarded;
    });

    return {
      attempt: attempt, scores: scores, concepts: concepts, breakdowns: breakdowns,
      median: median, spent: spent, remaining: attempt.remaining, attempted: attempted,
      total: items.length, slowest: slowest, guesses: guesses,
      changedMind: changedMind, changedToWrong: changedToWrong,
      machineAwarded: scores.filter(function (s) { return s.machine; }).reduce(function (n, s) { return n + s.awarded; }, 0),
      machinePossible: scores.filter(function (s) { return s.machine; }).reduce(function (n, s) { return n + s.possible; }, 0),
      negative: negativeMarkingAnalysis(items, scores)
    };
  }

  /* ---- two products, one switch --------------------------------------------------
   *
   * The learning system and the examiner are separate products that happen to share a
   * bank, and the switch has to feel like moving between two rooms rather than
   * toggling a setting — otherwise the examiner reads as a mode of the learning
   * system, which is the thing the whole design is trying not to be.
   *
   * The transition uses `document.startViewTransition`, which takes a snapshot of the
   * page before and after the change and animates between the two on the compositor.
   * Two things matter about using it correctly:
   *
   *   - The DOM change must happen *inside* the callback. Mutating before the call
   *     means the "old" snapshot is already the new state and nothing animates.
   *   - Where the API is missing, the swap still has to happen. The transition is
   *     decoration; the navigation is not.
   *
   * What the animation actually looks like — direction, duration, and what it becomes
   * for someone who has asked for less motion — is in the stylesheet, next to the
   * switch it belongs to.
   */

  /* Runs a navigation inside a view transition. Everything that crosses between the
     two products goes through here — the header switch, the dashboard's way in, and
     every way out of the examiner — so the move looks the same whichever door was
     used. Moves that stay on one side are left alone: within the examiner, going
     from the papers to a brief is an ordinary screen change, and animating it would
     say "you have gone somewhere else" when you have not. */
  var pendingMode = null;   /* the side a transition is on its way to, while it flies */

  function crossProducts(target, navigate) {
    if ((pendingMode || currentMode()) === target || !document.startViewTransition) {
      pendingMode = null;
      navigate();
      return;
    }
    /* The update callback runs a frame or two later, so for that gap the page still
       says "learn" while the learner has already asked for the examiner. Recording
       where we are heading keeps a second press during that gap from being read as a
       press for the side we are already on and silently dropped. */
    pendingMode = target;
    var transition = document.startViewTransition(function () { pendingMode = null; navigate(); });
    /* A transition can be skipped before it ever animates — a background tab, a
       window that is not compositing, or a second switch pressed during the first.
       That is a normal outcome and the navigation has still happened, but `ready`
       rejects, and an unhandled rejection would report a working app as broken.
       `updateCallbackDone` is deliberately left alone: if the navigation itself
       threw, that is a real fault and should still be loud. */
    if (transition && transition.ready) transition.ready.catch(function () {});
  }

  function currentMode() { return document.documentElement.getAttribute("data-mode") || "learn"; }

  /* Called by showScreen, never directly: which side you are on is a fact about the
     screen you are looking at, so the switch cannot disagree with the page. */
  function markMode(mode) {
    document.documentElement.setAttribute("data-mode", mode);
    $all("#mode-switch .mode-option").forEach(function (button) {
      button.setAttribute("aria-pressed", button.dataset.mode === mode ? "true" : "false");
    });
  }

  /* Every in-app way out of a running paper goes through here. Two hours is too much
     to lose to a mis-aimed press, and the browser's own beforeunload guard only covers
     leaving the page — not the brand button, which is in the header the whole time a
     paper is running. Returns true when the caller should stop. */
  function leavingLivePaperRefused() {
    if (!exam || exam.submitted) return false;
    if (!window.confirm("Leaving the examiner ends this attempt. Leave anyway?")) return true;
    window.clearInterval(examTicker);
    exam = null;
    syncModeSwitchVisibility();
    return false;
  }

  function switchMode(mode) {
    if ((pendingMode || currentMode()) === mode) return;
    if (mode === "learn" && leavingLivePaperRefused()) return;
    if (mode === "exam") { openExamHome(); return; }
    crossProducts("learn", function () { renderDashboard(); showScreen("dashboard-screen"); });
  }

  function bindModeSwitch() {
    if (!$("mode-switch")) return;
    $all("#mode-switch .mode-option").forEach(function (button) {
      button.addEventListener("click", function () { switchMode(button.dataset.mode); });
    });
    watchCoinForSwitch();
  }

  /* When the header switch is allowed to exist at all.
   *
   * Two rules, and they are different kinds of thing. It is *forbidden* on a paper
   * that is running: there it would be a one-press way to lose two hours, sitting in
   * the furniture beside an unrelated theme button. It is merely *unnecessary* while
   * the coin is on screen, because the coin is the same control at full size two
   * inches below it — so the header stays quiet at the top of a home page and the
   * switch takes over as the coin scrolls away.
   *
   * Each coin records its own visibility on itself, and only the one inside the
   * screen currently showing is consulted — the other lives in an inactive screen,
   * which is display:none and never intersects anything. A screen with no coin at all
   * (a lesson, a paper) therefore keeps the switch, which is the point of having it. */
  function activeCoin() {
    var screen = document.querySelector(".screen.active");
    return screen ? screen.querySelector(".coin") : null;
  }

  function syncModeSwitchVisibility() {
    var control = $("mode-switch");
    if (!control) return;
    var live = Boolean(exam && exam.started && !exam.submitted);
    control.hidden = live;
    var coin = activeCoin();
    /* Unset reads as visible: a home page renders its coin at the top, and assuming
       otherwise for the one frame before the observer first fires would flash the
       switch on and straight back off. */
    var covered = Boolean(coin) && coin.dataset.onScreen !== "0";
    document.body.classList.toggle("coin-in-view", !live && covered);
  }

  /* The handoff. The coin does not literally become the switch — nothing morphs a
     band into a pill across a scroll — but the switch arrives slightly wide and
     settles, which is what a collapse looks like, and it arrives exactly as the coin
     leaves, which is what sells it. */
  function watchCoinForSwitch() {
    if (!window.IntersectionObserver) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.dataset.onScreen = entry.isIntersecting ? "1" : "0";
      });
      syncModeSwitchVisibility();
    }, {threshold: 0});
    $all(".coin").forEach(function (node) { observer.observe(node); });
  }

  /* ---- the coin -------------------------------------------------------------------
   *
   * The two sides shown as one object split down the middle, first on both home pages.
   * Two lines each: the name, and the one thing waiting for you on that side.
   *
   * Where you are is carried by colour — the side you are on is filled in its own
   * colour, ink for the learning system and saffron for the examiner — so it is
   * answered at a glance rather than read. Colour is never the only signal though: the
   * side you are on is inert and carries `aria-current`, and the side you are not on is
   * the whole panel as a button with an arrow on it, which is what a screen reader and
   * a keyboard get. A half-page target should not require aiming at a link inside it.
   *
   * Both faces are built by the same function, so what differs between the dashboard's
   * render and the examiner's is only which half is standing.
   */
  var COIN = {learn: {name: "Learn"}, exam: {name: "Examiner"}};

  function coinNextLearn() {
    var rec = recommendation(profile.selectedCourse);
    return recommendationActionLabel(rec) + " · " + rec.minutes;
  }

  function coinNextExam() {
    var pick = recommendedMock();
    if (!pick) return "Four papers, three sets each";
    return pick.paper.courseId + " · " + examSetLabel(pick.set.set) + " · " + EXAM_MINUTES + " minutes";
  }

  function renderCoin(mountId, side) {
    var mount = $(mountId);
    if (!mount) return;
    var next = {learn: coinNextLearn, exam: coinNextExam};
    mount.innerHTML = ["learn", "exam"].map(function (which) {
      var here = which === side;
      var copy = COIN[which];
      var body =
        "<p class='coin-name'>" + escapeHtml(copy.name) +
        (here ? "" : " <span class='coin-go' aria-hidden='true'>→</span>") + "</p>" +
        "<p class='coin-next'><small>Next</small>" + escapeHtml(next[which]()) + "</p>";
      return here
        ? "<div class='coin-side coin-" + which + " is-here' aria-current='true'>" + body + "</div>"
        : "<button type='button' class='coin-side coin-" + which + " is-there' data-coin='" + which +
          "' aria-label='Go to " + escapeHtml(copy.name) + "'>" + body + "</button>";
    }).join("");
    $all("#" + mountId + " [data-coin]").forEach(function (button) {
      button.addEventListener("click", function () { switchMode(button.dataset.coin); });
    });
  }

  /* Which paper to sit next.
   *
   * The rule is per paper, not per set: a paper you have never met comes before a
   * second set of one you have, in the order the papers are actually sat, because a
   * candidate with three weeks left learns more from meeting all four once than from
   * three goes at the same one. Once every paper has been met it is the weakest
   * result, since that is where the marks are.
   *
   * IBM comes last among the papers you have not met. Its real paper is written
   * answers on a caselet nobody has seen, so what we can offer is timed writing
   * practice rather than a rehearsal — worth doing, not worth doing first. */
  function recommendedMock() {
    var papers = EXAM_ORDER.filter(function (courseId) { return EXAM_PAPERS[courseId]; })
      .map(function (courseId) {
        var spec = EXAM_PAPERS[courseId];
        var sets = [];
        for (var set = 0; set < EXAM_SET_COUNT; set++) {
          var history = examAttemptsFor(courseId, set);
          sets.push({
            set: set, sittings: history.length,
            best: history.reduce(function (top, row) { return !top || examPercent(row) > examPercent(top) ? row : top; }, null)
          });
        }
        var sat = sets.filter(function (row) { return row.sittings; });
        return {
          courseId: courseId, spec: spec, sets: sets, sittings: sat.length,
          /* A paper's standing is its best result, not its worst: the worst set says
             something about that set, the best says what the paper is worth to you
             now. Which *set* to sit is decided separately, below. */
          best: sat.reduce(function (top, row) {
            return top === null ? examPercent(row.best) : Math.max(top, examPercent(row.best));
          }, null),
          caveat: Boolean(spec.caveat)
        };
      });

    /* Within a paper, a set you have not seen beats one you have: same paper, same
       rules, but a set you have already sat is partly a memory test. */
    function nextSet(paper) {
      var fresh = paper.sets.filter(function (row) { return !row.sittings; })[0];
      if (fresh) return fresh;
      return paper.sets.slice().sort(function (a, b) { return examPercent(a.best) - examPercent(b.best); })[0];
    }
    function first(list) { return list.length ? {paper: list[0], set: nextSet(list[0]), reason: "unmet"} : null; }

    var unmet = first(papers.filter(function (p) { return !p.sittings && !p.caveat; }))
      || first(papers.filter(function (p) { return !p.sittings; }));
    if (unmet) return unmet;
    /* IBM stays out of the weakest-first race too. Its mock is marked by the
       candidate against a rubric, so its percentage is not the same kind of number
       as a machine-marked paper's — ranked together it would win "weakest" almost
       every time and quietly become the only thing ever recommended. */
    var met = papers.filter(function (p) { return p.sittings && !p.caveat; });
    if (!met.length) met = papers.filter(function (p) { return p.sittings; });
    if (!met.length) return null;
    met.sort(function (a, b) { return a.best - b.best; });
    return {paper: met[0], set: nextSet(met[0]), reason: "weakest"};
  }

  /* What a section cannot fill from the bank. Seed-independent, so it can be told
     before a paper is built — and told here as well as on the card, because the hero
     is where most people will start from and it must not be the one honest place
     that goes quiet. */
  function examShortfalls(courseId) {
    var spec = EXAM_PAPERS[courseId];
    return spec.sections.map(function (section) {
      var have = examPool(courseId, section.type).length;
      return have < section.count ? {section: section, have: have} : null;
    }).filter(Boolean);
  }

  function renderExamPick() {
    var pick = recommendedMock();
    var block = $("exam-pick");
    block.hidden = !pick;
    if (!pick) return;
    var paper = pick.paper;
    var row = pick.set;
    var questions = paper.spec.sections.reduce(function (n, s) { return n + s.count; }, 0);
    var short = examShortfalls(paper.courseId);
    $("exam-pick-title").textContent = paper.spec.title + " · " + examSetLabel(row.set);
    $("exam-pick-why").textContent = (pick.reason === "unmet"
      ? "You have not sat this one yet, and it is the next paper on your timetable you have not met. Meeting all four once tells you more than three goes at the same one."
      : "This is your weakest paper so far, at " + paper.best + "%. It is where the marks are.")
      + (short.length ? " Some sections are short of the real paper — it says which, and scores you out of what is there." : "");
    $("exam-pick-facts").innerHTML =
      "<span>" + escapeHtml(paper.spec.sat) + "</span>" +
      "<span>" + questions + " questions</span>" +
      "<span>" + EXAM_MINUTES + " minutes</span>" +
      "<span>" + paper.spec.total + " marks</span>" +
      (row.sittings ? "<span>" + row.sittings + " sitting" + (row.sittings === 1 ? "" : "s") + " on this set</span>" : "");
    $("exam-pick-start").textContent = row.sittings ? "Sit it again" : "Start this paper";
    $("exam-pick-start").onclick = function () { openExaminer(paper.courseId, row.set); };
  }

  /* ---- the bag ------------------------------------------------------------------
   *
   * A drawer holding the two things a learner wants mid-session and should not leave
   * the page for: a focus timer, and the handful of facts about how this app works
   * that change how much they get out of it.
   *
   * The timer is deliberately plain. It does not gamify, it does not nag, and it
   * writes nothing to the profile — a study aid that quietly became another thing to
   * keep a streak on would be working against the learner. It survives navigation
   * because it runs off a timestamp rather than a countdown variable, so switching
   * screens or opening a paper does not reset it. */
  var POMODORO = {focus: 25 * 60, break: 5 * 60};
  var pomodoro = {phase: "focus", remaining: POMODORO.focus, endsAt: null, running: false, completed: 0};
  var pomodoroTicker = null;

  function pomodoroSecondsLeft() {
    if (!pomodoro.running) return pomodoro.remaining;
    return Math.max(0, Math.round((pomodoro.endsAt - Date.now()) / 1000));
  }

  function renderPomodoro() {
    var left = pomodoroSecondsLeft();
    var mins = Math.floor(left / 60), secs = left % 60;
    var clock = mins + ":" + (secs < 10 ? "0" : "") + secs;
    var display = $("pomodoro-clock");
    if (!display) return;
    display.textContent = clock;
    $("pomodoro-phase").textContent = (pomodoro.phase === "focus" ? "Focus" : "Break") + " · " +
      (pomodoro.running ? "running" : left === (pomodoro.phase === "focus" ? POMODORO.focus : POMODORO.break) ? "not started" : "paused");
    $("pomodoro-toggle").textContent = pomodoro.running ? "Pause" : left < (pomodoro.phase === "focus" ? POMODORO.focus : POMODORO.break) ? "Resume" : "Start";
    $("pomodoro-skip").textContent = pomodoro.phase === "focus" ? "Skip to break" : "Back to focus";
    document.querySelector(".pomodoro").classList.toggle("is-break", pomodoro.phase === "break");
    $("pomodoro-count").textContent = pomodoro.completed
      ? pomodoro.completed + " focus block" + (pomodoro.completed === 1 ? "" : "s") + " finished today."
      : "No focus blocks finished yet.";
    /* The chip on the header button is the only part visible with the bag shut, so a
       learner can leave it closed and still know where they are. */
    var chip = $("bag-timer-chip");
    chip.hidden = !pomodoro.running;
    chip.textContent = clock;
  }

  function pomodoroTick() {
    if (!pomodoro.running) return;
    if (pomodoroSecondsLeft() > 0) { renderPomodoro(); return; }
    /* Phase over. Roll to the other one, stopped — a break you have to start is a
       break you noticed. */
    if (pomodoro.phase === "focus") { pomodoro.completed += 1; pomodoro.phase = "break"; pomodoro.remaining = POMODORO.break; }
    else { pomodoro.phase = "focus"; pomodoro.remaining = POMODORO.focus; }
    pomodoro.running = false;
    pomodoro.endsAt = null;
    window.clearInterval(pomodoroTicker);
    pomodoroTicker = null;
    renderPomodoro();
  }

  function setPomodoroRunning(running) {
    if (running) {
      pomodoro.endsAt = Date.now() + pomodoro.remaining * 1000;
      pomodoro.running = true;
      if (!pomodoroTicker) pomodoroTicker = window.setInterval(pomodoroTick, 1000);
    } else {
      pomodoro.remaining = pomodoroSecondsLeft();
      pomodoro.running = false;
      window.clearInterval(pomodoroTicker);
      pomodoroTicker = null;
    }
    renderPomodoro();
  }

  /* No scrim any more. A dimmed page said "deal with this first", which is the wrong
     thing to say about a timer and a calculator — both are for using *while* reading
     the thing behind them. */
  function setBagOpen(open, restoring) {
    $("bag-panel").hidden = !open;
    /* The launcher stands where the panel opens, so it steps aside while the panel is
       there — two bags in the same corner, one of them a button for opening the bag
       that is already open, is not a choice anyone needs. */
    $("bag-open").hidden = open;
    $("bag-open").setAttribute("aria-expanded", open ? "true" : "false");
    /* Where it was left is where it stays. A floating tool that shut itself every time
       you changed screens would have to be reopened once per lesson, which is most of
       the reason a floating tool is worth having. */
    if (profile.bagOpen !== open) {
      profile.bagOpen = open;
      saveProfile();
    }
    /* Focus moves only when a person pressed something. Restoring the bag on load
       must not steal focus from the page. */
    if (restoring) return;
    if (open) $("bag-panel").focus({preventScroll: true});
    else $("bag-open").focus({preventScroll: true});
  }

  /* The bag's calculator. Which keypad you are allowed is a fact about the paper, so
     both are here and the toggle is one press — and the choice sticks, because
     someone practising SCLM numericals wants the scientific pad every time, not once.
     Rebuilding the pad clears the buffer, which is why the toggle is a no-op when it
     is already on that mode: pressing "Normal" twice should not wipe a number. */
  function setBagCalculator(kind) {
    if (!$("bag-calculator")) return;
    if (profile.bagCalculator !== kind) {
      profile.bagCalculator = kind;
      saveProfile();
    } else if ($("bag-calculator").children.length) return;
    $all("#bag-calc-modes .calc-mode").forEach(function (button) {
      button.setAttribute("aria-pressed", button.dataset.calcMode === kind ? "true" : "false");
    });
    buildCalculator("bag-calculator", kind);
  }

  function bindBag() {
    if (!$("bag-open")) return;
    $("bag-panel").setAttribute("tabindex", "-1");
    $("bag-open").addEventListener("click", function () { setBagOpen($("bag-panel").hidden); });
    $("bag-close").addEventListener("click", function () { setBagOpen(false); });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !$("bag-panel").hidden) setBagOpen(false);
    });
    $all("#bag-calc-modes .calc-mode").forEach(function (button) {
      button.addEventListener("click", function () { setBagCalculator(button.dataset.calcMode); });
    });
    setBagCalculator(profile.bagCalculator === "scientific" ? "scientific" : "basic");
    if (profile.bagOpen) setBagOpen(true, true);
    $("pomodoro-toggle").addEventListener("click", function () { setPomodoroRunning(!pomodoro.running); });
    /* Clear `running` *before* setting the new duration. setPomodoroRunning(false)
       recomputes `remaining` from the live end-time, so leaving the timer marked as
       running here overwrote the phase's fresh duration with whatever was left on the
       old clock — skipping to a five-minute break showed 25:00. */
    $("pomodoro-reset").addEventListener("click", function () {
      pomodoro.running = false;
      pomodoro.remaining = pomodoro.phase === "focus" ? POMODORO.focus : POMODORO.break;
      setPomodoroRunning(false);
    });
    $("pomodoro-skip").addEventListener("click", function () {
      pomodoro.running = false;
      pomodoro.phase = pomodoro.phase === "focus" ? "break" : "focus";
      pomodoro.remaining = pomodoro.phase === "focus" ? POMODORO.focus : POMODORO.break;
      setPomodoroRunning(false);
    });
    renderPomodoro();
  }

  /* ---- product telemetry, shaped but not sent ------------------------------------
   *
   * Two different things get called telemetry and only one of them is here.
   *
   * Everything above this line is the learner's own analysis: it is computed on their
   * device, shown to them, saved in their profile, and goes nowhere. This block is the
   * other kind — what the owner would need to make the product better — and it is
   * deliberately built as far as it can honestly go and no further.
   *
   * It shapes events against `.agents/contracts/tester-event.schema.json` and puts
   * them in a bounded local buffer. It does not transmit. There is no endpoint in this
   * file, no fetch, and no queue that drains anywhere, because the things that must
   * exist before a single event may leave a tester's machine do not exist yet:
   * explicit consent for *this* scope, pseudonymous identity mapping, a retention and
   * deletion path, and owner activation. Those are tracked in `.agents/` and the
   * collection stays off until they land.
   *
   * So the flag defaults to off, and with it off nothing is computed or stored at all.
   * What this buys today is that the contract is executable and verified rather than
   * aspirational: the events are the real shape, from a real attempt, validated
   * against the real schema.
   */
  var TELEMETRY_FLAG = "t6.telemetry.local";
  var telemetryBuffer = [];

  function telemetryEnabled() {
    try { return window.localStorage.getItem(TELEMETRY_FLAG) === "on"; }
    catch (error) { return false; }
  }

  function band(value, bands) {
    for (var i = 0; i < bands.length; i++) if (value <= bands[i][0]) return bands[i][1];
    return bands[bands.length - 1][1];
  }

  function percentBand(percent) {
    return band(percent, [[19, "0-19"], [39, "20-39"], [59, "40-59"], [79, "60-79"], [100, "80-100"]]);
  }

  /* Bands, never exact values. The cohort is eight people: an exact mark on a named
     paper on a known date is close to an identifier, and a raw duration is a
     behavioural fingerprint. The product questions — is anyone finishing, is negative
     marking being handled, does the diagnosis get clicked — all survive banding. */
  function examTelemetryEvents(analysis, automatic) {
    var attempt = analysis.attempt;
    var courseId = attempt.courseId;
    var sittings = examAttemptsFor(courseId, attempt.setIndex || 0).length;
    var shortfall = attempt.paper.shortfalls.length > 0;
    var scorePercent = analysis.machinePossible
      ? Math.round(analysis.machineAwarded / analysis.machinePossible * 100) : 0;
    var attemptedPercent = analysis.total
      ? Math.round(analysis.attempted / analysis.total * 100) : 0;
    var guessPercent = analysis.total
      ? Math.round(analysis.guesses.length / analysis.total * 100) : 0;
    var budget = EXAM_MINUTES * 60;

    var base = {
      schema_version: "1.1",
      consent_scope: "tester-examiner-events-v1",
      synthetic: false,
      course_id: courseId,
      exam_set_index: attempt.setIndex || 0
    };

    var events = [{
      event_type: "exam_attempt_submitted",
      exam_sitting_number: Math.max(1, sittings),
      exam_paper_shortfall: shortfall,
      exam_outcome: automatic ? "auto-submitted" : "submitted",
      exam_score_band: analysis.machinePossible ? percentBand(scorePercent) : "not-scored",
      exam_attempted_band: percentBand(attemptedPercent),
      exam_pacing_band: attempt.remaining <= 0 ? "ran-out"
        : band(analysis.spent / budget * 100, [[50, "well-under"], [85, "under"], [100, "on-pace"], [1e9, "over"]]),
      exam_guess_band: guessPercent === 0 ? "none"
        : band(guessPercent, [[9, "under-10pct"], [25, "10-25pct"], [1e9, "over-25pct"]]),
      exam_wrong_ticks: analysis.negative ? analysis.negative.wrongTicks : 0,
      exam_changed_to_wrong: analysis.changedToWrong.length,
      exam_revisit_band: band(attempt.items.reduce(function (n, i) { return n + Math.max(0, i.visits - 1); }, 0),
        [[0, "none"], [analysis.total, "few"], [1e9, "many"]]),
      exam_breakdown_count: analysis.breakdowns.length
    }];

    /* One per concept that broke down. This is the signal that says which ideas the
       bank teaches badly rather than which learner studied badly — the same rung
       failing across many testers is a content defect, not eight coincidences. */
    analysis.breakdowns.forEach(function (row) {
      events.push({
        event_type: "exam_breakdown_identified",
        concept_ids: [row.conceptId],
        exam_breakdown_rung: row.rung,
        exam_breakdown_kind: row.connectionOnly ? "connection-only"
          : !row.cleared ? "nothing-landed"
          : row.cleared < row.failed ? "stops-below" : "unreliable"
      });
    });

    return events.map(function (event) {
      var merged = {};
      Object.keys(base).forEach(function (key) { merged[key] = base[key]; });
      Object.keys(event).forEach(function (key) { merged[key] = event[key]; });
      return merged;
    });
  }

  /* Buffered locally and bounded. No transmission path exists, by design. */
  function bufferExamTelemetry(analysis, automatic) {
    if (!telemetryEnabled()) return;
    try {
      examTelemetryEvents(analysis, automatic).forEach(function (event) { telemetryBuffer.push(event); });
      while (telemetryBuffer.length > 200) telemetryBuffer.shift();
      window.T6_TELEMETRY_BUFFER = telemetryBuffer;
    } catch (error) { /* telemetry must never break a paper */ }
  }

  /* ---- the examiner's front door ------------------------------------------------ */

  function examAttemptsFor(courseId, setIndex) {
    var log = (profile.examAttempts && profile.examAttempts[courseId]) || [];
    return typeof setIndex === "number"
      ? log.filter(function (row) { return row.setIndex === setIndex; })
      : log.slice();
  }

  /* Summary only. The paper is rebuildable from its seed, so storing responses would
     buy nothing and cost a learner's saved profile the size of the bank. */
  function recordExamAttempt(analysis, automatic) {
    var courseId = analysis.attempt.courseId;
    var log = profile.examAttempts[courseId] || (profile.examAttempts[courseId] = []);
    var rungs = {};
    analysis.breakdowns.forEach(function (row) { rungs[row.rung] = (rungs[row.rung] || 0) + 1; });
    log.push({
      setIndex: analysis.attempt.setIndex || 0,
      at: new Date().toISOString(),
      awarded: analysis.machineAwarded, possible: analysis.machinePossible,
      attempted: analysis.attempted, total: analysis.total,
      spent: analysis.spent, median: analysis.median,
      guesses: analysis.guesses.length,
      changedToWrong: analysis.changedToWrong.length,
      wrongTicks: analysis.negative ? analysis.negative.wrongTicks : 0,
      breakdowns: analysis.breakdowns.length, rungs: rungs,
      autoSubmitted: Boolean(automatic)
    });
    /* Two dozen papers is more than a term's worth; older ones stop being evidence. */
    while (log.length > 24) log.shift();
    saveProfile();
  }

  function examSetLabel(index) { return "Set " + (index + 1); }

  function examPercent(row) {
    return row.possible ? Math.round((row.awarded / row.possible) * 100) : 0;
  }

  /* Every route into the examiner goes through the same door, so arriving from the
     dashboard, from the switch, or from backing out of a brief all look alike. */
  function openExamHome() {
    crossProducts("exam", function () { renderExamHome(); showScreen("exam-home-screen"); });
  }

  function renderExamHome() {
    renderCoin("coin-exam", "exam");
    renderExamPick();
    renderExamRecord();
    $("exam-papers").innerHTML = EXAM_ORDER.filter(function (courseId) { return EXAM_PAPERS[courseId]; })
      .map(renderExamPaperCard).join("");
    $all("#exam-papers [data-exam-set]").forEach(function (button) {
      button.addEventListener("click", function () {
        openExaminer(button.dataset.examCourse, Number(button.dataset.examSet));
      });
    });
  }

  function renderExamPaperCard(courseId) {
    var spec = EXAM_PAPERS[courseId];
    var questions = spec.sections.reduce(function (n, s) { return n + s.count; }, 0);
    /* What this build can actually fill, computed from the pools rather than from a
       built paper: the shortfall does not depend on the seed, and a candidate is
       owed it before they commit two hours, not at the end. */
    var short = examShortfalls(courseId);
    var negative = spec.sections.some(function (s) { return s.negative; });

    var sets = "";
    for (var i = 0; i < EXAM_SET_COUNT; i++) {
      var history = examAttemptsFor(courseId, i);
      var best = history.reduce(function (top, row) {
        return !top || examPercent(row) > examPercent(top) ? row : top;
      }, null);
      var last = history[history.length - 1];
      sets += "<button type='button' class='exam-set' data-exam-set='" + i + "' data-exam-course='" +
        escapeHtml(courseId) + "'>" +
        "<b>" + examSetLabel(i) + "</b>" +
        (history.length
          ? "<span>" + examPercent(last) + "% last" + (history.length > 1 ? " · " + examPercent(best) + "% best" : "") + "</span>" +
            "<small>" + history.length + " sitting" + (history.length === 1 ? "" : "s") + "</small>"
          : "<span>Not sat</span><small>" + questions + " questions · " + EXAM_MINUTES + " minutes</small>") +
        "</button>";
    }

    return "<article class='exam-paper'>" +
      "<header><h2>" + escapeHtml(spec.title) + "</h2>" +
      "<p class='exam-paper-meta'>" + escapeHtml(spec.sat) + " · " + spec.total + " marks · " +
      questions + " questions · " +
      (spec.calculator === "scientific" ? "Scientific calculator" : spec.calculator === "basic" ? "Normal calculator" : "No calculator") +
      (negative ? " · Negative marking" : "") + "</p></header>" +
      "<ul class='exam-paper-sections'>" + spec.sections.map(function (section) {
        return "<li><b>" + escapeHtml(section.label) + "</b><span>" + section.count + " × " +
          section.marks + " mark" + (section.marks === 1 ? "" : "s") + "</span></li>";
      }).join("") + "</ul>" +
      /* The caveat and the shortfall are the two things that would be dishonest to
         put behind a click. IBM cannot be mocked at all; a section the bank cannot
         fill scores out of less than the real paper. Both are said before you sit. */
      (spec.caveat ? "<p class='exam-paper-caveat'>" + escapeHtml(spec.caveat) + "</p>" : "") +
      (short.length ? "<p class='exam-paper-short'>" + short.map(function (row) {
        return row.section.label + " has " + row.have + " of " + row.section.count + " questions in the bank";
      }).join("; ") + ". This mock scores out of what is actually here, not out of " + spec.total + ".</p>" : "") +
      "<div class='exam-sets'>" + sets + "</div></article>";
  }

  function renderExamRecord() {
    var all = [];
    Object.keys(profile.examAttempts || {}).forEach(function (courseId) {
      (profile.examAttempts[courseId] || []).forEach(function (row) {
        all.push({courseId: courseId, row: row});
      });
    });
    $("exam-record-block").hidden = all.length === 0;
    if (!all.length) return;
    var papers = all.length;
    var best = all.reduce(function (top, entry) {
      return !top || examPercent(entry.row) > examPercent(top.row) ? entry : top;
    }, null);
    var finished = all.filter(function (e) { return !e.row.autoSubmitted; }).length;
    var unfinished = all.filter(function (e) { return e.row.attempted < e.row.total; }).length;

    /* Improvement is only meaningful within one set — a better score on an easier
       draw is not progress. So it is measured on sets sat more than once. */
    var repeated = [];
    Object.keys(profile.examAttempts || {}).forEach(function (courseId) {
      var bySet = {};
      (profile.examAttempts[courseId] || []).forEach(function (row) {
        (bySet[row.setIndex] = bySet[row.setIndex] || []).push(row);
      });
      Object.keys(bySet).forEach(function (setIndex) {
        var rows = bySet[setIndex];
        if (rows.length > 1) repeated.push({first: rows[0], last: rows[rows.length - 1], courseId: courseId});
      });
    });
    var improved = repeated.filter(function (p) { return examPercent(p.last) > examPercent(p.first); }).length;

    $("exam-record").innerHTML = [
      {label: "Papers sat", value: String(papers), note: finished === papers ? "All submitted before time." : (papers - finished) + " ran out of clock."},
      {label: "Best", value: examPercent(best.row) + "%", note: (EXAM_PAPERS[best.courseId] ? EXAM_PAPERS[best.courseId].title.split(" ").slice(0, 2).join(" ") : best.courseId) + " · " + examSetLabel(best.row.setIndex)},
      {label: "Finished the paper", value: (papers - unfinished) + " of " + papers, note: unfinished ? "The rest had questions left blank at the end." : "Nothing left unattempted."},
      repeated.length
        ? {label: "Sets re-sat", value: improved + " of " + repeated.length, note: "improved on the second sitting of the same paper"}
        : {label: "Sets re-sat", value: "—", note: "Sitting one set twice is how you tell study from luck."}
    ].map(function (card) {
      return "<div class='insight-card'><small>" + escapeHtml(card.label) + "</small><b>" +
        escapeHtml(card.value) + "</b><span>" + escapeHtml(card.note) + "</span></div>";
    }).join("");

    $("exam-record-verdict").textContent = repeated.length
      ? (improved >= repeated.length / 2
        ? "You are scoring better on papers you have sat before. That is worth exactly as much as the studying you did between them — the second sitting of a set you remember is not a clean measurement."
        : "Re-sitting has not moved your score yet. A set you have already seen only measures what you did between the two sittings, so this is a question about the studying, not the paper.")
      : "Nothing here is a prediction of your real result. It is what these questions, under this clock, showed about what you can and cannot do yet.";
  }

  /* ---- the cost of a speculative tick ------------------------------------------
   *
   * SPMS Section B is the only negatively marked section in the term: +1 for each
   * right option, −1 for each wrong one, floored at zero per question. That floor is
   * the part learners get wrong in both directions — it makes a wild guess cheaper
   * than it feels, and a careful extra tick more expensive than it looks.
   *
   * With n options of which k are correct, a single tick chosen at random is right
   * with probability k/n, so its expected value is (k/n) − (1 − k/n) = 2k/n − 1.
   * On a four-option question with two correct answers that is exactly zero: ticking
   * at random is a coin flip that costs nothing and gains nothing. Every tick above
   * your actual confidence is only worth it when you believe you are better than
   * even on it — and the floor means a question you have already lost cannot lose
   * you more, which is why the *last* tick on a question you are failing is free.
   */
  function negativeMarkingAnalysis(items, scores) {
    var negatives = [];
    /* Every negatively marked item on the paper, answered or not. The cost analysis
       needs the answered ones; the *shape* analysis below needs all of them, because
       whether this paper rewards indiscriminate ticking is a property of the items
       themselves and not of what this candidate happened to do. */
    var shapes = [];
    items.forEach(function (item, index) {
      if ((item.question.type || "") !== "msq") return;
      var correct = item.question.answers || item.question.correct || [];
      var options = (item.question.options || []).length;
      shapes.push({options: options, correct: correct.length, marks: item.marks});
      var chosen = Array.isArray(item.response) ? item.response : [];
      if (!chosen.length) return;
      var right = chosen.filter(function (c) { return correct.indexOf(c) >= 0; }).length;
      var wrong = chosen.length - right;
      negatives.push({item: item, index: index, right: right, wrong: wrong,
        options: options, correct: correct.length,
        awarded: scores[index].awarded, possible: item.marks});
    });
    if (!shapes.length) return null;

    /* Does ticking every option score full marks? With k correct of n and the floor,
       ticking everything pays min(marks, max(0, k − (n − k))). When that equals the
       question's marks, the whole trade-off the section is built on disappears: a
       candidate who ticks blindly scores as well as one who knows the material.
       Measured, not assumed — and reported, because a mock that can be beaten this
       way must say so rather than let a candidate discover it and learn the habit. */
    var tickAllPerfect = shapes.filter(function (shape) {
      return Math.min(shape.marks, Math.max(0, shape.correct - (shape.options - shape.correct))) >= shape.marks;
    }).length;
    var exploitable = tickAllPerfect === shapes.length;

    if (!negatives.length) {
      return {questions: 0, wrongTicks: 0, lostToWrongTicks: 0,
        evPerRandomTick: Math.round((2 * shapes[0].correct / shapes[0].options - 1) * 100) / 100,
        options: shapes[0].options, correct: shapes[0].correct,
        totalItems: shapes.length, tickAllPerfect: tickAllPerfect, exploitable: exploitable};
    }
    var totalWrongTicks = negatives.reduce(function (n, row) { return n + row.wrong; }, 0);
    var lostToWrongTicks = negatives.reduce(function (n, row) {
      /* What the same question would have paid with the wrong ticks removed. */
      return n + (Math.min(row.possible, row.right) - row.awarded);
    }, 0);
    var sampleOptions = negatives[0].options || 4;
    var sampleCorrect = negatives[0].correct || 2;
    return {
      questions: negatives.length,
      wrongTicks: totalWrongTicks,
      lostToWrongTicks: lostToWrongTicks,
      evPerRandomTick: Math.round((2 * sampleCorrect / sampleOptions - 1) * 100) / 100,
      options: sampleOptions,
      correct: sampleCorrect,
      totalItems: shapes.length,
      tickAllPerfect: tickAllPerfect,
      exploitable: exploitable
    };
  }

  function renderExamResult(automatic) {
    $("exam-runner").hidden = true;
    $("exam-result").hidden = false;
    var scores = exam.items.map(scoreExamItem);
    recordExamMisses(scores);
    var machine = scores.filter(function (s) { return s.machine; });
    var written = scores.filter(function (s) { return !s.machine; });
    var awarded = machine.reduce(function (n, s) { return n + s.awarded; }, 0);
    var possible = machine.reduce(function (n, s) { return n + s.possible; }, 0);
    var writtenMarks = written.reduce(function (n, s) { return n + s.possible; }, 0);

    $("exam-result-title").textContent = automatic ? "Time ran out — paper taken as it stood" : "Your mock result";
    $("exam-result-lede").textContent = writtenMarks
      ? "Machine-marked sections only. " + writtenMarks + " marks of written work are yours to review against the rubric; nothing here scores them for you."
      : "Every section on this paper is machine-marked.";
    $("exam-score").innerHTML = "<b>" + awarded + "</b><span>of " + possible + " machine-marked marks</span>" +
      (possible ? "<small>" + Math.round(awarded / possible * 100) + "%</small>" : "");

    $("exam-section-breakdown").innerHTML = exam.paper.spec.sections.map(function (section) {
      var indexes = exam.items.map(function (item, i) { return item.section === section.id ? i : -1; }).filter(function (i) { return i >= 0; });
      if (!indexes.length) return "";
      var sectionScores = indexes.map(function (i) { return scores[i]; });
      var isWritten = sectionScores.some(function (s) { return !s.machine; });
      var got = sectionScores.reduce(function (n, s) { return n + s.awarded; }, 0);
      var out = sectionScores.reduce(function (n, s) { return n + s.possible; }, 0);
      var attempted = indexes.filter(function (i) { return examHasResponse(exam.items[i]); }).length;
      return "<div class='exam-section-score'><b>" + escapeHtml(section.label) + "</b>" +
        "<span>" + (isWritten ? "Self-review · " + out + " marks" : got + " / " + out) + "</span>" +
        "<small>" + attempted + " of " + indexes.length + " attempted</small></div>";
    }).join("");
    var analysis = analyseExamAttempt(exam);
    renderExamInsights(analysis);
    /* Recorded after the analysis so the stored row is the same numbers the learner
       was just shown, and before the comparison below reads the log. */
    recordExamAttempt(analysis, automatic);
    bufferExamTelemetry(analysis, automatic);
    renderExamProgress(analysis);

    /* The most useful thing on this screen is not the score. It is the list of things
       the paper just proved you cannot do yet, and a way straight into them. */
    var misses = examMissList(exam.courseId);
    var repair = $("exam-repair");
    repair.hidden = misses.length === 0;
    if (misses.length) {
      /* Say what the run actually contains. `startExamRepair` takes the worst eight, so
         a paper that exposed eleven concepts produces a run covering eight of them —
         and the first version of this sentence said all eleven were in it, which a
         trial caught by finding three that never appeared. The rest are genuinely
         prioritised for later runs, so that is what it now says. */
      var inRun = Math.min(misses.length, EXAM_REPAIR_SITTING);
      $("exam-repair-copy").textContent = "This paper cost you marks on " + misses.length +
        " concept" + (misses.length === 1 ? "" : "s") + ". " +
        (misses.length > inRun
          ? "One sitting takes the " + inRun + " that cost you most, each taught before it is tested again. The other " +
            (misses.length - inRun) + " are queued for the sittings after it — short enough to finish is the point."
          : "Each one is taught before it is tested again.");
      $("exam-repair-list").innerHTML = misses.slice(0, 6).map(function (row) {
        return "<li><b>" + escapeHtml(row.concept.name) + "</b><small>" +
          (row.missed ? row.missed + " answered wrong" : "") +
          (row.missed && row.skipped ? " · " : "") +
          (row.skipped ? row.skipped + " left blank" : "") + "</small></li>";
      }).join("");
    }
    $("exam-review-list").innerHTML = "";
  }

  function clockWords(seconds) {
    var s = Math.max(0, Math.round(seconds));
    if (s < 60) return s + "s";
    var m = Math.floor(s / 60);
    return m + "m " + (s % 60) + "s";
  }

  function signed(n, suffix) {
    return (n > 0 ? "+" : n < 0 ? "−" : "±") + Math.abs(n) + (suffix || "");
  }

  /* Same set, sat again. This is the only comparison in the product that is close to
     like-for-like, and even then it is not clean: the second sitting is against a
     paper you have seen. The verdict says so rather than congratulating a learner for
     remembering answers. */
  function renderExamProgress(analysis) {
    var courseId = analysis.attempt.courseId;
    var history = examAttemptsFor(courseId, analysis.attempt.setIndex || 0);
    var block = $("exam-progress-block");
    block.hidden = history.length < 2;
    if (history.length < 2) return;
    var now = history[history.length - 1];
    var before = history[history.length - 2];
    var deltaScore = examPercent(now) - examPercent(before);
    var deltaTime = Math.round((now.spent - before.spent) / 60);
    var deltaBlanks = (now.total - now.attempted) - (before.total - before.attempted);
    var deltaBroken = now.breakdowns - before.breakdowns;

    $("exam-progress-body").innerHTML = [
      {label: "Score", value: signed(deltaScore, "%"), note: examPercent(before) + "% → " + examPercent(now) + "%"},
      {label: "Time on the paper", value: signed(deltaTime, "m"), note: clockWords(before.spent) + " → " + clockWords(now.spent)},
      {label: "Left blank", value: signed(deltaBlanks), note: (before.total - before.attempted) + " → " + (now.total - now.attempted) + " questions"},
      {label: "Concepts breaking down", value: signed(deltaBroken), note: before.breakdowns + " → " + now.breakdowns + " on this paper"}
    ].map(function (card) {
      return "<div class='insight-card'><small>" + escapeHtml(card.label) + "</small><b>" +
        escapeHtml(card.value) + "</b><span>" + escapeHtml(card.note) + "</span></div>";
    }).join("");

    $("exam-progress-verdict").textContent = deltaScore > 0
      ? "Better than last time on the same paper. Some of that is study and some of it is recognition — you have seen these questions before, so treat the gain as an upper bound rather than a measurement."
      : deltaScore < 0
        ? "Lower than last time on a paper you have already seen, which is the one result that cannot be explained by an unlucky draw. Look at the pacing above before concluding anything about what you know."
        : "The same score on the same paper. Whatever you did between the two sittings has not reached these questions yet.";
  }

  function renderExamInsights(analysis) {
    var spec = analysis.attempt.paper.spec;

    /* Pacing. The useful comparison is not "how long did you take" but "how does that
       sit against the clock you will actually have". */
    var perQuestion = analysis.total ? analysis.spent / analysis.total : 0;
    var budget = analysis.total ? (EXAM_MINUTES * 60) / analysis.total : 0;
    $("exam-pacing").innerHTML = [
      {label: "Attempted", value: analysis.attempted + " of " + analysis.total,
       note: analysis.attempted === analysis.total ? "Nothing left blank." : (analysis.total - analysis.attempted) + " never answered."},
      {label: "Time used", value: clockWords(analysis.spent),
       note: analysis.remaining > 0 ? clockWords(analysis.remaining) + " left on the clock." : "The clock ran out."},
      {label: "Per question", value: clockWords(perQuestion),
       note: perQuestion > budget * 1.15 ? "Above the " + clockWords(budget) + " this paper allows each." :
             perQuestion < budget * 0.5 ? "Well under the " + clockWords(budget) + " available. Time was not your constraint." :
             "Comfortably inside the " + clockWords(budget) + " available."},
      {label: "Longest question", value: analysis.slowest.length ? clockWords(analysis.slowest[0].item.seconds) : "—",
       note: analysis.slowest.length ? (analysis.slowest[0].score.awarded === analysis.slowest[0].score.possible ? "And you got it right — time well spent." : "And it was still wrong. That is the one to have left and come back to.") : ""}
    ].map(function (card) {
      return "<div class='insight-card'><small>" + escapeHtml(card.label) + "</small><b>" +
        escapeHtml(card.value) + "</b><span>" + escapeHtml(card.note) + "</span></div>";
    }).join("");

    /* Where knowledge breaks down. */
    var depth = analysis.breakdowns.slice(0, 6);
    $("exam-depth-block").hidden = depth.length === 0;
    $("exam-depth-list").innerHTML = depth.map(function (row) {
      return "<li class='depth-row rung-" + row.rung + "'>" +
        "<div class='depth-head'><b>" + escapeHtml(row.concept.name) + "</b>" +
        "<span class='depth-tag'>" + escapeHtml(row.copy.name) + "</span></div>" +
        "<p>" + escapeHtml(row.copy.fix) + "</p>" +
        "<small>" + row.right + " right · " + row.wrong + " wrong" +
        (row.skipped ? " · " + row.skipped + " blank" : "") + " · " + clockWords(row.seconds) + " spent</small>" +
        /* The route back, per concept. The examiner diagnoses and the learning system
           teaches; this is the door between them, one idea at a time. */
        "<button type='button' class='button compact secondary depth-route' data-repair-concept='" +
        escapeHtml(row.conceptId) + "'>Teach me this again</button></li>";
    }).join("");
    $all("#exam-depth-list [data-repair-concept]").forEach(function (button) {
      button.addEventListener("click", function () {
        var courseId = analysis.attempt.courseId;
        var conceptId = button.dataset.repairConcept;
        /* Leaving the examiner properly on the way out: the attempt is finished with,
           and a stale `exam` would leave the next paper's clock running against it. */
        window.clearInterval(examTicker);
        exam = null;
        crossProducts("learn", function () { startExamRepair(courseId, conceptId); });
      });
    });

    /* Negative marking, where the paper has it. */
    var negative = analysis.negative;
    $("exam-negative-block").hidden = !negative;
    if (negative) {
      var ev = negative.evPerRandomTick;
      $("exam-negative-body").innerHTML =
        "<div class='insight-grid'>" +
        "<div class='insight-card'><small>Wrong ticks</small><b>" + negative.wrongTicks + "</b><span>across " + negative.questions + " answered question" + (negative.questions === 1 ? "" : "s") + "</span></div>" +
        "<div class='insight-card'><small>Marks they cost</small><b>" + negative.lostToWrongTicks + "</b><span>you would have scored this much more ticking only what you were sure of</span></div>" +
        "<div class='insight-card'><small>A random tick is worth</small><b>" + (ev > 0 ? "+" : "") + ev.toFixed(2) + "</b><span>on a " + negative.options + "-option question with " + negative.correct + " correct</span></div>" +
        "</div>" +
        "<p class='insight-verdict'>" + escapeHtml(
          ev === 0
            ? "On this paper's shape a random tick is an exact coin flip: it gains as much as it loses, so it is never the thing that decides your score. What decides it is ticking options you are better than even on, and leaving the rest. " +
              (negative.lostToWrongTicks > 0
                ? "You gave away " + negative.lostToWrongTicks + " mark" + (negative.lostToWrongTicks === 1 ? "" : "s") + " to ticks that were worse than a coin flip."
                : "You did not give anything away to speculative ticks. Keep doing that.")
            : ev > 0
              ? "On the items in this mock a random tick pays on average, because they carry more correct options than wrong ones. Do not take that to the real paper — see the warning below."
              : "A random tick loses on average here, so every uncertain tick is a real cost. Tick only what you can defend."
        ) + "</p>" +
        /* A mock that can be beaten by ticking everything has to say so. The habit is
           the harm: a candidate who finds this and does not know it is an artefact of
           the mock will carry it into a paper where it costs them the section. */
        (negative.exploitable
          ? "<div class='insight-warning'>" +
            "<p><b>A defect in this mock, not a strategy.</b> Every negatively marked question in this build carries " +
            negative.correct + " correct options out of " + negative.options + ", so ticking <em>all</em> of them scores full marks on all " +
            negative.totalItems + " — " + negative.correct + " right minus " + (negative.options - negative.correct) +
            " wrong, and the per-question floor absorbs the rest.</p>" +
            "<p>The real paper's rule is the opposite: choosing every option is strictly worse than choosing only what you are sure of. " +
            "These items are miscalibrated and it is recorded as a defect. Do not learn a ticking habit from this section.</p></div>"
          : "") +
        "<p class='insight-note'>One thing the floor gives you: a question cannot score below zero, so once a question is already lost, a further tick costs nothing. Being decisive on a question you are failing is free; being speculative on one you are winning is not.</p>";
    }

    /* Answer behaviour. */
    var behaviour = [];
    if (analysis.guesses.length) {
      behaviour.push("<div class='insight-card'><small>Fast and wrong</small><b>" + analysis.guesses.length +
        "</b><span>answered in under " + clockWords(Math.max(6, Math.round(analysis.median / 3))) +
        " and never revisited — your own median is " + clockWords(analysis.median) + "</span></div>");
    }
    if (analysis.changedMind.length) {
      behaviour.push("<div class='insight-card'><small>Changed your mind</small><b>" + analysis.changedMind.length +
        "</b><span>" + (analysis.changedToWrong.length
          ? analysis.changedToWrong.length + " of them moved from a right answer to a wrong one"
          : "and none of them moved away from a right answer") + "</span></div>");
    }
    $("exam-behaviour-block").hidden = behaviour.length === 0;
    if (behaviour.length) {
      $("exam-behaviour-body").innerHTML = "<div class='insight-grid'>" + behaviour.join("") + "</div>" +
        "<p class='insight-verdict'>" + escapeHtml(
          analysis.changedToWrong.length > analysis.changedMind.length / 2 && analysis.changedMind.length > 2
            ? "Your first instinct was better than your second more often than not on this paper. That is worth knowing before you sit the real one."
            : analysis.guesses.length > analysis.total * 0.15
              ? "A sixth of your answers went down fast and stayed wrong. Those are the ones to mark for review rather than commit to."
              : "Nothing alarming in how you committed to answers."
        ) + "</p>";
    }

    /* Written answers: vocabulary is computable, the rubric is self-review. */
    var written = analysis.attempt.items.filter(function (item) {
      return (item.question.type || "") === "short-answer" && examHasResponse(item);
    });
    $("exam-written-block").hidden = written.length === 0;
    if (written.length) {
      $("exam-written-body").innerHTML = written.map(function (item) {
        var text = String(item.response || "");
        var words = text.trim().split(/\s+/).filter(Boolean).length;
        var terms = lessonVocabulary(item.question);
        var used = terms.filter(function (term) { return new RegExp("\\b" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "s?\\b", "i").test(text); });
        var rubric = item.question.rubric || [];
        return "<article class='written-review'>" +
          "<b>" + escapeHtml(item.question.node || item.question.stem || "Written answer") + "</b>" +
          "<div class='insight-grid'>" +
            "<div class='insight-card'><small>Length</small><b>" + words + "</b><span>words, " + clockWords(item.seconds) + " spent</span></div>" +
            (terms.length ? "<div class='insight-card'><small>Course vocabulary</small><b>" + used.length + " of " + terms.length +
              "</b><span>" + (used.length ? escapeHtml(used.slice(0, 4).join(", ")) : "none of this lecture's terms appear") + "</span></div>" : "") +
            (rubric.length ? "<div class='insight-card'><small>Rubric points</small><b>" + rubric.length + "</b><span>to check your answer against below</span></div>" : "") +
          "</div>" +
          (rubric.length ? "<ul class='rubric-points'>" + rubric.map(function (point) {
            return "<li><b>" + escapeHtml(point.label) + "</b><span>" + escapeHtml(point.description) + "</span></li>";
          }).join("") + "</ul>" : "") +
          (terms.length && used.length < Math.ceil(terms.length / 2)
            ? "<p class='insight-verdict'>You answered in your own words rather than the course's. Examiners look for the framework's vocabulary, because it is the evidence you are using the framework and not describing it from outside.</p>"
            : "") +
          "</article>";
      }).join("");
    }
  }

  /* The terms the lecture behind a question actually introduced. */
  function lessonVocabulary(question) {
    var lessons = window.T6_LESSONS || {};
    var ids = question.sourceIds || (question.source ? [question.source] : []);
    var terms = [];
    ids.forEach(function (id) {
      var lesson = lessons[id];
      if (!lesson || !lesson.glossary) return;
      lesson.glossary.forEach(function (entry) {
        if (entry && entry.term && terms.indexOf(entry.term) < 0) terms.push(entry.term);
      });
    });
    return terms;
  }

  function renderExamReview() {
    var scores = exam.items.map(scoreExamItem);
    $("exam-review-list").innerHTML = "<div class='exam-review'>" + exam.items.map(function (item, index) {
      var score = scores[index];
      var state = !examHasResponse(item) ? "skipped" : score.machine ? (score.awarded === score.possible ? "right" : score.awarded > 0 ? "part" : "wrong") : "written";
      return "<article class='exam-review-item " + state + "'>" +
        "<small>Section " + item.section + " · " + (score.machine ? score.awarded + " of " + score.possible : "self-review") + "</small>" +
        "<b>" + escapeHtml(item.question.stem || item.question.prompt || "") + "</b>" +
        (item.question.explanation ? "<p>" + escapeHtml(item.question.explanation) + "</p>" : "") +
        "</article>";
    }).join("") + "</div>";
    $("exam-review").hidden = true;
  }

  function leaveExaminer() {
    window.clearInterval(examTicker);
    exam = null;
    crossProducts("learn", function () { renderDashboard(); showScreen("dashboard-screen"); });
  }

  /* The calculator the paper allows, and only that one. SPMS permits none, so the
     control is not rendered there at all rather than shown and disabled — offering a
     tool the real paper forbids would train a habit the exam then removes. */
  var CALC_KEYS = {
    basic: [["7","8","9","÷"],["4","5","6","×"],["1","2","3","−"],["0",".","=","+"],["C","⌫"]],
    scientific: [["√","x²","1/x","%"],["7","8","9","÷"],["4","5","6","×"],["1","2","3","−"],["0",".","=","+"],["C","⌫"]]
  };

  /* One calculator, mounted twice: the examiner hands you the keypad its paper allows,
     and the bag carries both so the same arithmetic is there while you practise. The
     buffer is per mount, so the two never share a running total. */
  function buildCalculator(mountId, kind) {
    var node = $(mountId);
    if (!node || !CALC_KEYS[kind]) return;
    node.innerHTML = "<output class='calc-display' aria-live='polite'>0</output>" +
      CALC_KEYS[kind].map(function (row) {
        return "<div class='calc-row'>" + row.map(function (key) {
          return "<button type='button' class='calc-key' data-key='" + escapeHtml(key) + "'>" + escapeHtml(key) + "</button>";
        }).join("") + "</div>";
      }).join("");
    var display = node.querySelector(".calc-display");
    var buffer = "";
    var show = function (value) { display.textContent = value === "" ? "0" : value; };
    $all("#" + mountId + " .calc-key").forEach(function (button) {
      button.addEventListener("click", function () {
        var key = button.dataset.key;
        try {
          if (key === "C") { buffer = ""; }
          else if (key === "⌫") { buffer = buffer.slice(0, -1); }
          else if (key === "=") {
            /* Arithmetic only: the expression is rebuilt from the digits and operators
               this keypad can produce, so nothing else can reach the evaluator. */
            var safe = buffer.replace(/÷/g, "/").replace(/×/g, "*").replace(/−/g, "-");
            if (!/^[0-9+\-*/.() ]*$/.test(safe)) throw new Error("bad");
            buffer = String(Math.round(Function("return (" + safe + ")")() * 1e10) / 1e10);
          }
          else if (key === "√") { buffer = String(Math.sqrt(parseFloat(buffer) || 0)); }
          else if (key === "x²") { buffer = String(Math.pow(parseFloat(buffer) || 0, 2)); }
          else if (key === "1/x") { buffer = String(1 / (parseFloat(buffer) || 1)); }
          else if (key === "%") { buffer = String((parseFloat(buffer) || 0) / 100); }
          else buffer += key;
        } catch (error) { buffer = ""; display.textContent = "Error"; return; }
        show(buffer);
      });
    });
  }

  function renderCalculator() {
    var kind = exam.paper.spec.calculator;
    if (kind) buildCalculator("exam-calculator", kind);
  }

  function bindExaminer() {
    var open = $("open-exam");
    /* The examiner opens on its own home, not on one subject's brief. It is a
       separate product and the learner's current subject is the learning system's
       state, not the examiner's. */
    if (open) open.addEventListener("click", openExamHome);
    /* Back from a brief returns to the papers, not out of the product entirely. */
    $("exam-leave-brief").addEventListener("click", function () {
      window.clearInterval(examTicker);
      exam = null;
      openExamHome();
    });
    $("exam-begin").addEventListener("click", function () { beginExam(); renderCalculator(); });
    $("exam-prev").addEventListener("click", function () { goExamQuestion(exam.current - 1); });
    $("exam-next").addEventListener("click", function () { goExamQuestion(Math.min(exam.current + 1, exam.items.length - 1)); });
    $("exam-clear").addEventListener("click", function () {
      /* Clearing is a change of answer like any other, and it goes through the same
         recorder — otherwise "answered, then wiped it" reads afterwards as a question
         that was never touched. */
      recordExamResponse(exam.items[exam.current], null);
      renderExamQuestion();
    });
    $("exam-mark").addEventListener("click", function () {
      exam.items[exam.current].marked = !exam.items[exam.current].marked;
      if (exam.items[exam.current].marked && exam.current < exam.items.length - 1) goExamQuestion(exam.current + 1);
      else renderExamQuestion();
    });
    $("exam-submit").addEventListener("click", function () { submitExam(false); });
    $("exam-result-home").addEventListener("click", leaveExaminer);
    $("exam-result-papers").addEventListener("click", function () {
      window.clearInterval(examTicker);
      exam = null;
      openExamHome();
    });
    $("exam-review").addEventListener("click", renderExamReview);
    /* The most-used crossing in the app: a paper has just told you what you lost, and
       this walks you out of the examiner and into the lesson. It should look like
       leaving the exam hall. */
    $("exam-repair-start").addEventListener("click", function () {
      var courseId = exam.courseId;
      window.clearInterval(examTicker);
      exam = null;
      crossProducts("learn", function () { startExamRepair(courseId); });
    });
    $("practice-exam-repair").addEventListener("click", function () { startExamRepair(profile.selectedCourse); });
    $("exam-calc-toggle").addEventListener("click", function () {
      var panel = $("exam-calculator");
      panel.hidden = !panel.hidden;
      $("exam-calc-toggle").setAttribute("aria-expanded", String(!panel.hidden));
    });
    /* Leaving mid-paper is a real risk of losing two hours, so it asks. */
    window.addEventListener("beforeunload", function (event) {
      if (exam && exam.started && !exam.submitted) { event.preventDefault(); event.returnValue = ""; }
    });
  }

  /* Entrance orchestration.
   *
   * Runs once, on first load. The dashboard re-renders on every answer and every
   * subject switch; replaying the cascade each time would charge a 400ms flourish
   * hundreds of times a session, which the motion language explicitly forbids for
   * anything seen often.
   *
   * The groups below are ordered the way the page is read — the four questions, top
   * to bottom. Items inside a group stagger against each other; groups do not
   * stagger against each other, because they are screens apart and each one waits
   * until it is actually scrolled to. */
  var REVEAL_GROUPS = [
    ".home-block > .block-heading",
    ".subject-rail",
    ".focus-panel",
    ".route-list > .route",
    ".set-block > *",
    ".evidence-pair > *",
    ".overall-stats > .stat",
    ".concept-shelf-list > .shelf-group",
    ".home-block > .disclosure"
  ];
  var STAGGER_MS = 55;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* Only what the learner can already see is animated.
   *
   * The first build of this revealed on scroll, which was wrong twice over. It left
   * everything below the fold sitting at opacity 0 waiting for an intersection, so a
   * fast scroll arrived at blank space; and any safety net generous enough to rescue
   * a stuck node also fired before the learner had scrolled to it, which cancelled
   * the effect it was protecting. Scroll reveal also fails the frequency-of-use rule
   * badly here — this is a dashboard opened many times a day, and animating a block
   * every time it is scrolled past turns a flourish into a toll.
   *
   * So: one cascade, on load, over the elements already in view. Everything further
   * down is never hidden and simply exists when the learner reaches it. There is
   * nothing to rescue, because nothing else was ever put at risk. */
  function setupReveals() {
    if (prefersReducedMotion()) return;
    var fold = window.innerHeight * 1.1;
    var order = [];
    REVEAL_GROUPS.forEach(function (selector) {
      $all(selector).forEach(function (node) {
        var top = node.getBoundingClientRect().top;
        if (top >= 0 && top < fold) order.push({node: node, top: top});
      });
    });
    /* Cascaded down the page rather than through the selector list, so the motion
       follows the reading order a learner's eye is already taking. */
    order.sort(function (a, b) { return a.top - b.top; });
    order.forEach(function (item, index) {
      var node = item.node;
      node.classList.add("reveal-pending");
      /* Capped: past about half a second the cascade stops reading as one motion and
         starts reading as the page being slow. */
      var delay = Math.min(index * STAGGER_MS, 440);
      window.setTimeout(function () {
        node.classList.remove("reveal-pending");
        node.classList.add("reveal-in");
        /* Dropped once played, so a later re-render of the same node does not
           inherit an animation that has already been paid for. */
        window.setTimeout(function () { node.classList.remove("reveal-in"); }, 600);
      }, delay);
    });
  }

  /* Line drawing for the three SVG charts. Each path is measured, told its own
     length through a custom property, and traced from its first point — which is
     also the end a learner starts reading from. Called after the markup is written,
     because getTotalLength() needs the path to be in the document. */
  function drawPaths(root) {
    if (!root || prefersReducedMotion()) return;
    /* Two ways to draw a line, because there are two kinds of line here.
     *
     * Solid data lines are traced with stroke-dasharray, the ordinary technique.
     * Dashed lines cannot be: .draw-in overwrites stroke-dasharray with the path's own
     * length, which would erase the dashes — and on `.route-full` those dashes are the
     * meaning, standing for the distance still to go. They are wiped instead, revealed
     * left to right with a clip, which leaves the dash pattern untouched.
     *
     * This matters more than it sounds: a learner opening the app for the first time
     * has no data at all, so *every* chart is in its empty state and every one of those
     * is a dashed placeholder. Excluding them meant the charts did not animate for
     * exactly the person seeing them for the first time. */
    var traced = root.querySelectorAll(".spark-line, .trend-line, .route-done");
    Array.prototype.forEach.call(traced, function (path) {
      if (!path.getTotalLength) return;
      var length = path.getTotalLength();
      if (!length) return;
      path.style.setProperty("--draw-length", length.toFixed(1));
      path.classList.add("draw-in");
    });
    Array.prototype.forEach.call(root.querySelectorAll(".route-full, .spark-empty, .trend-empty"), function (path) {
      path.classList.add("draw-wipe");
    });
    Array.prototype.forEach.call(root.querySelectorAll(".spark-area, .trend-area, .route-gained"), function (node) {
      node.classList.add("draw-fade");
    });
    Array.prototype.forEach.call(root.querySelectorAll(".spark-dot, .route-here, .route-goal, circle"), function (node) {
      node.classList.add("draw-pop");
    });
  }

  /* On-demand explanations.
   *
   * These were the browser's own `title` tooltip, which is why the "i" markers read
   * as dead: `title` waits about a second, never fires on keyboard focus, and never
   * fires on touch. One shared bubble replaces all seven of them — the two "i"
   * markers, the negative-marking flag, and the four exam-slot marks.
   *
   * The bubble is aria-hidden on purpose. Every trigger already carries this text,
   * either as its own aria-label or (for the marks inside a subject card) on the
   * card button's label, so announcing the bubble as well would read it twice. */
  var tipNode = null;
  var tipTimer = null;
  var tipTrigger = null;

  function tipTarget(node) {
    return node && node.closest ? node.closest("[data-tip]") : null;
  }

  function hideTip() {
    window.clearTimeout(tipTimer);
    if (tipTrigger) { tipTrigger.removeAttribute("data-tip-open"); tipTrigger = null; }
    if (tipNode) tipNode.removeAttribute("data-open");
  }

  function placeTip(trigger) {
    if (!tipNode) {
      tipNode = document.createElement("div");
      tipNode.className = "tip";
      tipNode.setAttribute("aria-hidden", "true");
      document.body.appendChild(tipNode);
    }
    tipNode.textContent = trigger.getAttribute("data-tip");
    /* Measure at the origin before placing: a bubble still sitting at its last
       position can be clamped by the wrong edge and report the wrong height. */
    tipNode.style.left = "0px";
    tipNode.style.top = "0px";
    var rect = trigger.getBoundingClientRect();
    var box = tipNode.getBoundingClientRect();
    var margin = 12;
    var gap = 9;
    /* Above by default, below when there is no room above. */
    var side = rect.top - box.height - gap >= margin ? "top" : "bottom";
    var top = side === "top" ? rect.top - box.height - gap : rect.bottom + gap;
    /* Clamped to the viewport. Both "i" markers sit near the right edge — the sort
       hint about 100px in, the goal legend about 145px — so a centred bubble would
       hang off the page at either one. */
    var wanted = rect.left + rect.width / 2 - box.width / 2;
    var left = Math.max(margin, Math.min(wanted, window.innerWidth - box.width - margin));
    tipNode.style.left = Math.round(left) + "px";
    tipNode.style.top = Math.round(top) + "px";
    tipNode.setAttribute("data-side", side);
    /* The arrow follows the trigger rather than the bubble, so a clamped bubble
       still points at the thing it is explaining. */
    var arrow = rect.left + rect.width / 2 - left;
    tipNode.style.setProperty("--tip-arrow", Math.round(Math.max(13, Math.min(arrow, box.width - 13))) + "px");
    tipNode.setAttribute("data-open", "");
    trigger.setAttribute("data-tip-open", "");
    tipTrigger = trigger;
  }

  function showTip(trigger, delay) {
    window.clearTimeout(tipTimer);
    if (!trigger.getAttribute("data-tip")) return;
    if (!delay) { placeTip(trigger); return; }
    tipTimer = window.setTimeout(function () { placeTip(trigger); }, delay);
  }

  function bindTips() {
    /* Delegated: most triggers are rendered after this runs, and the subject cards
       are rebuilt on every sort change and every answer. */
    document.addEventListener("pointerover", function (event) {
      if (event.pointerType === "touch") return;
      var trigger = tipTarget(event.target);
      if (trigger === tipTrigger) return;
      if (!trigger) { hideTip(); return; }
      /* 120ms — the "acknowledge" step in the motion language. Long enough not to
         flicker while the pointer crosses the row, short enough to feel answered. */
      showTip(trigger, 120);
    });
    /* Focus opens with no delay: a keyboard user has already committed to the
       element, and waiting there reads as the control being dead. */
    document.addEventListener("focusin", function (event) {
      var trigger = tipTarget(event.target);
      if (trigger) showTip(trigger, 0); else hideTip();
    });
    document.addEventListener("focusout", function (event) {
      if (tipTrigger && tipTrigger === tipTarget(event.target)) hideTip();
    });
    /* Touch: tap opens, tap elsewhere closes. `title` offered nothing here at all,
       which meant every explanation in the app was unreachable on a phone. */
    document.addEventListener("pointerdown", function (event) {
      if (event.pointerType !== "touch") return;
      var trigger = tipTarget(event.target);
      if (!trigger || trigger === tipTrigger) { hideTip(); return; }
      showTip(trigger, 0);
    }, true);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && tipTrigger) hideTip();
    });
    /* A fixed bubble does not travel with the page or survive a reflow. */
    window.addEventListener("scroll", hideTip, true);
    window.addEventListener("resize", hideTip);
  }

  /* The appearance control. Three states rather than two, so "follow my device"
     survives being pressed once. The sr-only span is the button's accessible name
     and reports the state; the tooltip says what pressing it will do next. */
  var THEME_COPY = {
    system: {state: "Appearance: following your device", tip: "Following your device's light or dark setting. Press to stay on light."},
    light: {state: "Appearance: light", tip: "Held on light. Press to stay on dark."},
    dark: {state: "Appearance: dark", tip: "Held on dark. Press to go back to following your device."}
  };

  function renderThemeToggle() {
    var button = $("theme-toggle");
    if (!button || !window.T6Theme) return;
    var copy = THEME_COPY[T6Theme.get()] || THEME_COPY.system;
    button.setAttribute("data-theme-mode", T6Theme.get());
    button.setAttribute("data-tip", copy.tip);
    var label = $("theme-toggle-state");
    if (label) label.textContent = copy.state;
  }

  function bindEvents() {
    bindResumeBar();
    bindTips();
    bindExaminer();
    bindBag();
    bindModeSwitch();
    renderThemeToggle();
    if (window.T6Theme) {
      $("theme-toggle").addEventListener("click", function () {
        T6Theme.set(T6Theme.next());
        hideTip();
      });
      /* Subscribed rather than called after the click, so the button cannot drift out
         of step with the theme it reports — the icon and the label follow whoever
         changed it, including the device switching over at sunset. Canvas is repainted
         from the same signal because it cannot inherit a CSS custom property. */
      T6Theme.onChange(function () {
        renderThemeToggle();
        repaintThemedCanvas();
      });
    }
    $("course-grid").addEventListener("scroll", updateRailScrollCue, {passive: true});
    window.addEventListener("resize", updateRailScrollCue);
    /* Changing subject from the header does exactly what the rail's card does, and
       then puts you on the dashboard: the control is visible from inside a lesson,
       and silently repointing the app underneath a screen that does not show the
       subject would be a change you could not see. */
    $("header-subject").addEventListener("change", function (event) {
      profile.selectedCourse = event.target.value;
      saveProfile();
      if (!$("dashboard-screen").classList.contains("active")) goDashboard();
      else renderDashboard();
    });
    $("subject-sort").addEventListener("change", function (event) {
      profile.subjectSort = event.target.value === "hardest" ? "hardest" : "exam";
      saveProfile();
      renderCourseCards();
    });
    $("brand-home").addEventListener("click", goDashboard);
    $("start-recommended").addEventListener("click", executeRecommendation);
    $("practice-priority").addEventListener("click", function () { startPriorityPractice(profile.selectedCourse); });
    $("start-course").addEventListener("click", function () { startStudySet(profile.selectedCourse, 1); });
    $("builder-toggle").addEventListener("click", function () {
      setBuilderOpen($("practice-builder").hidden);
      if (!$("practice-builder").hidden) $("practice-builder").focus({preventScroll: true});
    });
    $("leave-practice").addEventListener("click", leavePractice);
    $("commit-answer").addEventListener("click", commitAnswer);
    $("next-question").addEventListener("click", nextQuestion);
    $("results-home").addEventListener("click", goDashboard);
    $("reset-progress").addEventListener("click", function () { $("reset-dialog").showModal(); });
    $("cancel-reset").addEventListener("click", function () { $("reset-dialog").close(); });
    $("confirm-reset").addEventListener("click", confirmReset);
    $("sign-out").addEventListener("click", signOut);
    $("community-link").addEventListener("click", markCommunityOpened);
    $("community-joined").addEventListener("click", acknowledgeCommunity);
    $("skip-confidence").addEventListener("click", function () { setConfidence("skipped"); renderConfidenceControl(); });
    $all(".horizon-choice").forEach(function (button) {
      button.addEventListener("click", function () {
        profile.horizon = button.dataset.horizon;
        saveProfile();
        renderHorizonPlan(profile.horizon);
      });
    });
    $("builder-start").addEventListener("click", function () { startBuiltPractice(); });
    $all("input[name='confidence']").forEach(function (input) {
      input.addEventListener("change", function () { if (input.checked) { setConfidence(input.value); renderConfidenceControl(); } });
    });
    document.addEventListener("keydown", function (event) {
      if (!session || !$("practice-screen").classList.contains("active")) return;
      if (event.target && /^(SELECT|INPUT|TEXTAREA)$/.test(event.target.tagName)) return;
      if (event.target && event.target.tagName === "BUTTON" && (!event.target.classList.contains("option") || event.key === "Enter")) return;
      var question = currentQuestion();
      var isMcq = !question.type || question.type === "mcq" || question.type === "primer";
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
    window.addEventListener("resize", function () {
      if ($("dashboard-screen").classList.contains("active")) renderMasteryRadar();
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
    startEntrance();
  }

  /* Called after the first render, never again. Everything it does is optional
     decoration on a page that is already complete and readable, which is why it is
     the last thing to happen and why nothing above it waits on it. */
  function startEntrance() {
    if ($("dashboard-screen").classList.contains("active")) {
      setupReveals();
      growRadar();
    }
  }

  init().catch(function () {
    document.body.removeAttribute("aria-busy");
    profile = loadProfile();
    bindEvents();
    renderDashboard();
    showScreen("dashboard-screen");
    setSyncStatus("Saved on this device");
    startEntrance();
  });
})();
