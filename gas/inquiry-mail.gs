/**
 * Google Apps Script — paste into https://script.google.com
 * Deploy > New deployment > Web app
 * - Execute as: Me
 * - Who has access: Anyone
 * Copy the Web App URL into Vercel env: GAS_WEBHOOK_URL
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const to = data.to || "dk8805@naver.com";
    const subject = data.subject || "[광파워텍] 홈페이지 문의";
    const body = data.text || "(내용 없음)";
    const replyTo = data.replyTo || "";

    const options = {
      to: to,
      subject: subject,
      body: body,
      name: "광파워텍 홈페이지",
    };
    if (replyTo) options.replyTo = replyTo;

    MailApp.sendEmail(options);

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, service: "k-power-tech inquiry mail" })
  ).setMimeType(ContentService.MimeType.JSON);
}
