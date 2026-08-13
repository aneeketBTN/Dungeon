(() => {
  const rows = Array.from(document.querySelectorAll("#concept-shelf-list .shelf-row"));
  const strongRows = rows.filter((row) => row.querySelector(".shelf-state")?.textContent.trim() === "Strong");
  const developingRows = rows.filter((row) => row.querySelector(".shelf-state")?.textContent.trim() === "Developing");
  const rapidRows = rows.filter((row) => /fast response.*kept its result.*did not count toward Strong evidence/i.test(row.textContent));
  return {
    scenario: document.body.dataset.scenario || null,
    strongCount: strongRows.length,
    developingCount: developingRows.length,
    rapidReasonCount: rapidRows.length,
    rapidConceptIds: rapidRows.map((row) => row.dataset.conceptId),
    ok: (document.body.dataset.scenario === "measurement-evidence" && strongRows.length >= 1 && developingRows.length >= 1 && rapidRows.length === 1) ||
      (document.body.dataset.scenario === "measurement-established-strong" && strongRows.length >= 1 && rapidRows.length === 2)
  };
})()
