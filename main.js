(() => {
  const INQUIRY_EMAIL = "dk8805@naver.com";
  // Web3Forms access key is designed to be used client-side (public).
  const WEB3FORMS_KEY = "026993fe-8503-4a2c-b4e0-530ef47a8bed";
  const WEB3FORMS_URL = "https://api.web3forms.com/submit";

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const header = document.querySelector(".header");
  const btn = document.querySelector(".menu-btn");
  const nav = document.getElementById("nav");

  const onScroll = () => header?.classList.toggle("is-solid", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (btn && nav) {
    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      header?.classList.add("is-solid");
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      })
    );
  }

  const typeSelect = document.getElementById("product-type");
  document.querySelectorAll(".band[data-product]").forEach((el) => {
    el.addEventListener("click", () => {
      const product = el.getAttribute("data-product");
      if (typeSelect && product) typeSelect.value = product;
    });
  });

  const form = document.getElementById("inquiry-form");
  const toast = document.getElementById("form-toast");
  const submitBtn = document.getElementById("submit-btn");

  const showToast = (msg, tone = "ok") => {
    if (!toast) return;
    toast.hidden = false;
    toast.dataset.tone = tone;
    toast.innerHTML = msg;
    toast.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const buildMessage = (data) =>
    [
      "[광파워텍 홈페이지 기술·견적 문의]",
      `업체명: ${data.get("company") || ""}`,
      `담당자: ${data.get("name") || ""}`,
      `연락처: ${data.get("phone") || ""}`,
      `회신메일: ${data.get("email") || ""}`,
      `제품군: ${data.get("type") || ""}`,
      `모델/용량: ${data.get("model") || ""}`,
      `수량: ${data.get("qty") || ""}`,
      `내용: ${data.get("message") || ""}`,
      `개인정보동의: ${data.get("privacy") || ""}`,
      `유입경로: ${location.href}`,
    ].join("\n");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      showToast("필수 항목(업체명·연락처·회신 메일·제품군·개인정보 동의)을 확인해 주세요.", "warn");
      return;
    }

    const data = new FormData(form);
    const payload = {
      access_key: WEB3FORMS_KEY,
      subject: `[광파워텍] 견적 문의 — ${data.get("company") || ""} / ${data.get("type") || ""}`,
      from_name: String(data.get("company") || "광파워텍 홈페이지"),
      email: String(data.get("email") || ""),
      replyto: String(data.get("email") || ""),
      message: buildMessage(data),
      company: String(data.get("company") || ""),
      name: String(data.get("name") || ""),
      phone: String(data.get("phone") || ""),
      type: String(data.get("type") || ""),
      model: String(data.get("model") || ""),
      qty: String(data.get("qty") || ""),
      privacy: String(data.get("privacy") || ""),
      botcheck: "",
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "전송 중…";
    }
    showToast("문의 내용을 전송하고 있습니다…", "pending");

    let delivered = false;
    let errMsg = "";
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(WEB3FORMS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const result = await res.json().catch(() => ({}));
      delivered = result.success === true || String(result.success) === "true";
      errMsg = String(result.message || "");
    } catch (_) {
      delivered = false;
    }

    if (delivered) {
      form.reset();
      showToast(
        `문의가 접수되었습니다. <strong>${INQUIRY_EMAIL}</strong>으로 전달되며, 영업일 기준 회신드립니다.`,
        "ok"
      );
    } else {
      showToast(
        `전송에 실패했습니다${errMsg ? ` (${errMsg})` : ""}. <a href="mailto:${INQUIRY_EMAIL}">${INQUIRY_EMAIL}</a> 또는 <a href="tel:0319998301">031-999-8301</a>로 연락 부탁드립니다.`,
        "warn"
      );
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "문의 보내기";
    }
  });

  const bands = document.querySelectorAll(".band");
  if (bands.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    bands.forEach((el, i) => {
      el.style.transitionDelay = `${i * 60}ms`;
      io.observe(el);
    });
  } else {
    bands.forEach((el) => el.classList.add("is-in"));
  }
})();
