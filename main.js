(() => {
  const INQUIRY_EMAIL = "dk8805@naver.com";
  const SUBJECT = "[광파워텍] 기술·견적 문의";

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

  const showToast = (msg, tone = "ok") => {
    if (!toast) return;
    toast.hidden = false;
    toast.dataset.tone = tone;
    toast.innerHTML = msg;
    toast.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const buildBody = (data) =>
    [
      "[광파워텍 기술·견적 문의]",
      `업체명: ${data.get("company") || ""}`,
      `담당자: ${data.get("name") || ""}`,
      `연락처: ${data.get("phone") || ""}`,
      `회신메일: ${data.get("email") || ""}`,
      `제품군: ${data.get("type") || ""}`,
      `모델/용량: ${data.get("model") || ""}`,
      `수량: ${data.get("qty") || ""}`,
      `내용: ${data.get("message") || ""}`,
    ].join("\n");

  const openGmail = (body) => {
    const url =
      "https://mail.google.com/mail/?view=cm&fs=1&tf=1" +
      `&to=${encodeURIComponent(INQUIRY_EMAIL)}` +
      `&su=${encodeURIComponent(SUBJECT)}` +
      `&body=${encodeURIComponent(body)}`;
    window.open(url, "_blank", "noopener");
  };

  const openNaver = async (body) => {
    try {
      await navigator.clipboard.writeText(`${SUBJECT}\n\n${body}`);
    } catch (_) {
      /* clipboard may be denied */
    }
    // Naver write URL reliably accepts recipient; body is pasted by user if needed
    const url = `https://mail.naver.com/write?to=${encodeURIComponent(INQUIRY_EMAIL)}`;
    window.open(url, "_blank", "noopener");
  };

  const sendVia = async (provider) => {
    if (!form) return;
    if (!form.checkValidity()) {
      form.reportValidity();
      showToast("필수 항목(업체명·연락처·회신 메일·제품군·개인정보 동의)을 확인해 주세요.", "warn");
      return;
    }

    const data = new FormData(form);
    const body = buildBody(data);

    if (provider === "gmail") {
      openGmail(body);
      showToast(
        `Gmail 작성창을 열었습니다. <strong>보내기</strong>만 누르면 <strong>${INQUIRY_EMAIL}</strong>로 전달됩니다.`,
        "ok"
      );
      return;
    }

    await openNaver(body);
    showToast(
      `네이버 메일 작성창을 열었습니다. 받는사람이 비어 있으면 <strong>${INQUIRY_EMAIL}</strong>을 입력하고, 본문은 <strong>Ctrl+V</strong>로 붙여넣은 뒤 보내기를 눌러 주세요.`,
      "ok"
    );
  };

  document.getElementById("send-naver")?.addEventListener("click", () => sendVia("naver"));
  document.getElementById("send-gmail")?.addEventListener("click", () => sendVia("gmail"));

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    sendVia("naver");
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
