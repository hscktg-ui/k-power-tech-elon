(() => {
  const INQUIRY_EMAIL = "dk8805@naver.com";

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
  const mailtoBtn = document.getElementById("mailto-btn");

  const params = new URLSearchParams(location.search);
  if (params.get("sent") === "1" || location.hash.includes("sent=1")) {
    if (toast) {
      toast.hidden = false;
      toast.textContent = "접수가 전송되었습니다. dk8805@naver.com 에서 확인합니다.";
    }
  }

  const buildMailto = () => {
    if (!form) return `mailto:${INQUIRY_EMAIL}`;
    const data = new FormData(form);
    const lines = [
      "[광파워텍 견적 문의]",
      "",
      `업체명: ${data.get("company") || ""}`,
      `담당자: ${data.get("name") || ""}`,
      `연락처: ${data.get("phone") || ""}`,
      `회신메일: ${data.get("email") || ""}`,
      `제품군: ${data.get("type") || ""}`,
      `모델/용량: ${data.get("model") || ""}`,
      "전압·상·수량·납기:",
      `${data.get("message") || ""}`,
    ];
    return `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent("[광파워텍] 견적 문의")}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  // Primary path: native POST → FormSubmit → dk8805@naver.com
  form?.addEventListener("submit", (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
      form.reportValidity();
      return;
    }
    const reply = form.querySelector("#replyto-field");
    const email = form.querySelector('input[name="email"]');
    if (reply && email) reply.value = email.value;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "전송 중…";
    }
  });

  mailtoBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!form?.checkValidity()) {
      form.reportValidity();
      return;
    }
    location.href = buildMailto();
    if (toast) {
      toast.hidden = false;
      toast.textContent = "메일 앱이 열리면 수신자를 dk8805@naver.com 으로 확인해 보내 주십시오.";
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
