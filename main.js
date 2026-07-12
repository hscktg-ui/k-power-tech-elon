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
    toast.textContent = msg;
  };

  const isActivation = (text = "") =>
    /activat|check your email|confirm your email|활성화/i.test(String(text));

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

      const msg = String(result.message || raw || "");
      const ok = String(result.success) === "true" || result.success === true;

      if (ok) {
        form.reset();
        showToast(`문의가 ${INQUIRY_EMAIL} 으로 전송되었습니다. 확인 후 회신드리겠습니다.`, "ok");
        return;
      }

      if (isActivation(msg) || /just a moment|cloudflare/i.test(msg)) {
        showToast(
          `바로 전송을 위해 최초 1회 활성화가 필요합니다. ${INQUIRY_EMAIL} 메일함(스팸함 포함)에서 FormSubmit 메일의 「Activate Form」을 클릭한 다음, 이 화면에서 다시 「문의 보내기」를 눌러 주세요.`,
          "warn"
        );
        return;
      }

      showToast(
        msg.slice(0, 180) ||
          `전송에 실패했습니다. ${INQUIRY_EMAIL} 또는 031-999-8301로 연락 주세요.`,
        "warn"
      );
    } catch (_) {
      showToast(`네트워크 오류입니다. ${INQUIRY_EMAIL} / 031-999-8301 로 연락 주세요.`, "warn");
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
