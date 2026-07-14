(() => {
  const INQUIRY_EMAIL = "dk8805@naver.com";
  const SUBMIT_URL = `https://formsubmit.co/ajax/${INQUIRY_EMAIL}`;

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

  const buildLines = (data) => [
    "[광파워텍 기술·견적 문의]",
    `업체명: ${data.get("company") || ""}`,
    `담당자: ${data.get("name") || ""}`,
    `연락처: ${data.get("phone") || ""}`,
    `회신메일: ${data.get("email") || ""}`,
    `제품군: ${data.get("type") || ""}`,
    `모델/용량: ${data.get("model") || ""}`,
    `수량: ${data.get("qty") || ""}`,
    `내용: ${data.get("message") || ""}`,
  ];

  /** Opens the user's mail app. Must run in the click handler (before long awaits). */
  const openMailClient = (data) => {
    const subject = encodeURIComponent("[광파워텍] 기술·견적 문의");
    const body = encodeURIComponent(buildLines(data).join("\n"));
    const a = document.createElement("a");
    a.href = `mailto:${INQUIRY_EMAIL}?subject=${subject}&body=${body}`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      showToast("필수 항목(업체명·연락처·회신 메일·제품군·개인정보 동의)을 확인해 주세요.", "warn");
      return;
    }

    const data = new FormData(form);
    const payload = {
      _subject: "[광파워텍] 기술·견적 문의",
      _template: "table",
      _captcha: "false",
      _replyto: String(data.get("email") || ""),
      company: String(data.get("company") || ""),
      name: String(data.get("name") || ""),
      phone: String(data.get("phone") || ""),
      email: String(data.get("email") || ""),
      type: String(data.get("type") || ""),
      model: String(data.get("model") || ""),
      qty: String(data.get("qty") || ""),
      message: String(data.get("message") || ""),
      privacy: String(data.get("privacy") || ""),
      source: location.origin,
    };

    // Immediate path — works even when FormSubmit is not activated
    openMailClient(data);
    showToast(
      `메일 앱 작성창을 열었습니다. <strong>보내기</strong>를 누르면 <strong>${INQUIRY_EMAIL}</strong>로 전달됩니다.<br/>앱이 안 열리면 <a href="mailto:${INQUIRY_EMAIL}">${INQUIRY_EMAIL}</a> · <a href="tel:0319998301">031-999-8301</a>`,
      "ok"
    );

    // Best-effort server relay (does not block UI)
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "처리 중…";
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    fetch(SUBMIT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
      .then((res) => res.text())
      .then((raw) => {
        let result = {};
        try {
          result = JSON.parse(raw);
        } catch (_) {
          result = {};
        }
        const ok = String(result.success) === "true" || result.success === true;
        if (ok) {
          form.reset();
          showToast(
            `문의가 <strong>${INQUIRY_EMAIL}</strong> 으로도 자동 전송되었습니다.`,
            "ok"
          );
        }
      })
      .catch(() => {
        /* mailto already opened — ignore relay errors */
      })
      .finally(() => {
        clearTimeout(timer);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "문의 보내기";
        }
      });
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
