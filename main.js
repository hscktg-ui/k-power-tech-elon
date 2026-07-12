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

  const isActivationMessage = (text = "") =>
    /activat|check your email|확인|활성화/i.test(String(text));

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
      source: "k-power-tech-elon.vercel.app",
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

      let result = {};
      try {
        result = await res.json();
      } catch (_) {
        result = {};
      }

      const msg = String(result.message || "");
      const ok = String(result.success) === "true" || result.success === true;

      if (ok) {
        form.reset();
        showToast(`문의가 ${INQUIRY_EMAIL} 으로 전송되었습니다. 확인 후 회신드리겠습니다.`, "ok");
        return;
      }

      if (isActivationMessage(msg) || !res.ok) {
        showToast(
          `최초 1회 활성화가 필요합니다. ${INQUIRY_EMAIL} 메일함(스팸 포함)에서 FormSubmit 메일의 Activate Form을 누른 뒤, 다시 「문의 보내기」를 눌러 주세요. 활성화 후에는 메일 앱 없이 바로 전송됩니다.`,
          "warn"
        );
        return;
      }

      showToast(msg || "전송에 실패했습니다. 잠시 후 다시 시도하거나 031-999-8301로 연락 주세요.", "warn");
    } catch (_) {
      showToast(
        `네트워크 오류로 전송되지 않았습니다. ${INQUIRY_EMAIL} 으로 직접 메일을 보내시거나 031-999-8301로 연락 주세요.`,
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
