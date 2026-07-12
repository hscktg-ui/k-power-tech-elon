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

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const to = "dk8805@naver.com";

  try {
    const upstream = await fetch(`https://formsubmit.co/ajax/${to}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: "https://k-power-tech-elon.vercel.app",
        Referer: "https://k-power-tech-elon.vercel.app/",
      },
      body: JSON.stringify({
        _subject: body._subject || "[광파워텍] 기술·견적 문의",
        _template: "table",
        _captcha: "false",
        _replyto: body.email || body._replyto || "",
        company: body.company || "",
        name: body.name || "",
        phone: body.phone || "",
        email: body.email || "",
        type: body.type || "",
        model: body.model || "",
        qty: body.qty || "",
        message: body.message || "",
        privacy: body.privacy || "",
        source: "k-power-tech-elon.vercel.app",
      }),
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (_) {
      data = { success: false, message: text.slice(0, 300) };
    }

    // Normalize activation / success payloads for the front-end
    const msg = String(data.message || "");
    if (/activat|check your email/i.test(msg)) {
      return res.status(200).json({
        success: false,
        needsActivation: true,
        message: msg,
      });
    }

    return res.status(upstream.ok ? 200 : 502).json(data);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Upstream mail relay failed",
    });
  }
};
