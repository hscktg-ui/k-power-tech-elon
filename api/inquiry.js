module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return res.status(503).json({
      success: false,
      message: "WEB3FORMS_ACCESS_KEY is not configured",
    });
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

  try {
    const upstream = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: body._subject || "[광파워텍] 기술·견적 문의",
        from_name: body.company || "광파워텍 홈페이지",
        email: body.email || "noreply@k-power-tech.com",
        replyto: body.email || "",
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

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (_) {
      data = { success: false, message: text.slice(0, 300) };
    }

    const ok = data.success === true || String(data.success) === "true";
    return res.status(ok ? 200 : 502).json({
      success: ok,
      message: data.message || (ok ? "OK" : "Mail relay failed"),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Mail relay failed",
    });
  }
};
