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

  const openGmailCompose = (data) => {
    const subject = encodeURIComponent("[광파워텍] 기술·견적 문의");
    const body = encodeURIComponent(buildLines(data).join("\n"));
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(INQUIRY_EMAIL)}&su=${subject}&body=${body}`;
    window.open(url, "_blank", "noopener");
  };

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
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

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "전송 중…";
    }
    showToast("문의 전송 중입니다…", "pending");

    try {
      const res = await fetch(SUBMIT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const raw = await res.text();
      let result = {};
      try {
        result = JSON.parse(raw);
      } catch (_) {
        result = { success: false, message: raw };
      }

      const msg = String(result.message || "");
      const ok = String(result.success) === "true" || result.success === true;

      if (ok) {
        form.reset();
        showToast(`문의가 <strong>${INQUIRY_EMAIL}</strong> 으로 전송되었습니다.`, "ok");
        return;
      }

      // Activation wall: open Gmail compose as immediate send path
      if (/activat|check your email/i.test(msg)) {
        openGmailCompose(data);
        showToast(
          `서버 활성화 대기 중입니다. <strong>Gmail 작성창</strong>을 열어 두었습니다 — 보내기만 누르면 <strong>${INQUIRY_EMAIL}</strong>로 전달됩니다.<br/><br/>앞으로 바로 전송하려면 네이버(<strong>${INQUIRY_EMAIL}</strong>) 스팸함에서 FormSubmit 메일의 <strong>Activate Form</strong>을 한 번만 눌러 주세요.`,
          "warn"
        );
        return;
      }

      openGmailCompose(data);
      showToast(
        `자동 전송에 실패해 Gmail 작성창으로 전환했습니다. 보내기를 눌러 <strong>${INQUIRY_EMAIL}</strong>로 전달해 주세요. 급하시면 <a href="tel:0319998301">031-999-8301</a>`,
        "warn"
      );
    } catch (_) {
      openGmailCompose(data);
      showToast(
        `네트워크 오류로 Gmail 작성창을 열었습니다. 보내기를 눌러 주세요. · <a href="tel:0319998301">031-999-8301</a>`,
        "warn"
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "문의 보내기";
      }
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
