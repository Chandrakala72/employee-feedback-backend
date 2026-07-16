function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildRatingRows(responses) {
  return responses
    .map(
      (item) => `
        <tr>
          <td style="padding:16px;border-bottom:1px solid #e5e7eb;vertical-align:top;">
            <div style="font-size:14px;font-weight:600;color:#111827;margin-bottom:6px;">
              ${escapeHtml(item.question || "")}
            </div>
          </td>
          <td style="padding:16px;border-bottom:1px solid #e5e7eb;text-align:center;vertical-align:top;">
            <div style="display:inline-block;min-width:40px;padding:6px 10px;background:#f3f4f6;border-radius:20px;font-size:14px;font-weight:600;color:#111827;">
              ${escapeHtml(item.rating ?? "-")}
            </div>
          </td>
        </tr>`
    )
    .join("");
}

function buildTextBlock(label, value) {
  return `
    <div style="margin-bottom:16px;">
      <div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:4px;">${label}</div>
      <div style="font-size:14px;color:#4b5563;line-height:1.5;white-space:pre-wrap;">${escapeHtml(value || "—")}</div>
    </div>`;
}

function buildFeedbackEmailHtml({ name, reviewerName, clientName, periodLabel, responses, goingWell, couldImprove }) {
  const responseRows = buildRatingRows(responses);

  return `
    <div style="background:#1f2937;color:#ffffff;padding:20px 30px;">
      <h2 style="margin:0;font-size:22px;font-weight:600;">New Feedback Submitted by Client</h2>
    </div>
    <div style="padding:24px 30px;">
      <table style="width:100%;margin-bottom:24px;">
        <tr>
          <td style="padding:4px 0;width:120px;color:#6b7280;font-size:14px;">Employee</td>
          <td style="padding:4px 0;font-weight:600;color:#111827;">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;width:120px;color:#6b7280;font-size:14px;">Reviewer</td>
          <td style="padding:4px 0;font-weight:600;color:#111827;">${escapeHtml(reviewerName || "—")}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;width:120px;color:#6b7280;font-size:14px;">Client</td>
          <td style="padding:4px 0;font-weight:600;color:#111827;">${escapeHtml(clientName || "—")}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;width:120px;color:#6b7280;font-size:14px;">Period</td>
          <td style="padding:4px 0;font-weight:600;color:#111827;">${escapeHtml(periodLabel || "—")}</td>
        </tr>
      </table>

      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="text-align:left;padding:14px 16px;font-size:13px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb;">Questions</th>
            <th style="width:120px;text-align:center;padding:14px 16px;font-size:13px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb;">Rating</th>
          </tr>
        </thead>
        <tbody>${responseRows}</tbody>
      </table>

      ${buildTextBlock("What's going well", goingWell)}
      ${buildTextBlock("What could improve", couldImprove)}
    </div>`;
}

module.exports = { escapeHtml, buildFeedbackEmailHtml };