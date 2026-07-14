/**
 * Contact form relay.
 * Prefer WEB3FORMS_ACCESS_KEY (easiest).
 * Optional fallback: GAS_WEBHOOK_URL (Google Apps Script web app).
 */
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch (_) {
      body = {};
    }
  }
  body = body || {};

  const required = ["company", "phone", "email", "type"];
  for (const key of required) {
    if (!String(body[key] || "").trim()) {
      return res.status(400).json({ success: false, message: `Missing field: ${key}` });
    }
  }

  const lines = [
    "[광파워텍 홈페이지 기술·견적 문의]",
    `업체명: ${body.company || ""}`,
    `담당자: ${body.name || ""}`,
    `연락처: ${body.phone || ""}`,
    `회신메일: ${body.email || ""}`,
    `제품군: ${body.type || ""}`,
    `모델/용량: ${body.model || ""}`,
    `수량: ${body.qty || ""}`,
    `내용: ${body.message || ""}`,
    `개인정보동의: ${body.privacy || ""}`,
    `유입경로: ${body.source || ""}`,
  ].join("\n");

  const subject = body._subject || `[광파워텍] 견적 문의 — ${body.company} / ${body.type}`;
  const web3Key = process.env.WEB3FORMS_ACCESS_KEY;
  const gasUrl = process.env.GAS_WEBHOOK_URL;

  if (!web3Key && !gasUrl) {
    return res.status(503).json({
      success: false,
      message: "Mail service is not configured",
      code: "NOT_CONFIGURED",
    });
  }

  try {
    if (web3Key) {
      const upstream = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: web3Key,
          subject,
          from_name: body.company || "광파워텍 홈페이지",
          email: body.email,
          replyto: body.email,
          message: lines,
          company: body.company || "",
          name: body.name || "",
          phone: body.phone || "",
          type: body.type || "",
          model: body.model || "",
          qty: body.qty || "",
          privacy: body.privacy || "",
          source: body.source || "www.k-power-tech.com",
        }),
      });
      const data = await upstream.json().catch(() => ({}));
      const ok = data.success === true || String(data.success) === "true";
      return res.status(ok ? 200 : 502).json({
        success: ok,
        message: data.message || (ok ? "OK" : "Web3Forms failed"),
        provider: "web3forms",
      });
    }

    const upstream = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        to: "dk8805@naver.com",
        text: lines,
        replyTo: body.email || "",
        company: body.company || "",
        type: body.type || "",
      }),
      redirect: "follow",
    });
    const text = await upstream.text();
    let data = {};
    try {
      data = JSON.parse(text);
    } catch (_) {
      data = { success: upstream.ok };
    }
    const ok = data.success === true || String(data.success) === "true" || upstream.ok;
    return res.status(ok ? 200 : 502).json({
      success: ok,
      message: data.message || (ok ? "OK" : "GAS webhook failed"),
      provider: "gas",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Mail relay failed",
    });
  }
};
