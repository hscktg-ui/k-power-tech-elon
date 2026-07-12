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

  const buildBody = (data) =>
    [
      "[광파워텍 기술·견적 문의]",
      "",
      `업체명: ${data.get("company") || ""}`,
      `담당자: ${data.get("name") || ""}`,
      `연락처: ${data.get("phone") || ""}`,
      `회신메일: ${data.get("email") || ""}`,
      `제품군: ${data.get("type") || ""}`,
      `모델/용량: ${data.get("model") || ""}`,
      `수량: ${data.get("qty") || ""}`,
      "전압·상·납기·기타:",
      `${data.get("message") || ""}`,
      "",
      `개인정보 동의: ${data.get("privacy") || ""}`,
    ].join("\n");

  const buildMailto = (data) => {
    const subject = encodeURIComponent("[광파워텍] 기술·견적 문의");
    const body = encodeURIComponent(buildBody(data));
    return `mailto:${INQUIRY_EMAIL}?subject=${subject}&body=${body}`;
  };

  const showToast = (msg) => {
    if (!toast) return;
    toast.hidden = false;
    toast.textContent = msg;
  };

  // Direct to dk8805@naver.com via mail client — no FormSubmit activation page
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const mailto = buildMailto(data);
    const plain = buildBody(data);

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "메일 여는 중…";
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(plain);
      }
    } catch (_) {
      /* clipboard optional */
    }

    location.href = mailto;

    showToast(
      `메일 앱이 열리면 수신자(${INQUIRY_EMAIL})를 확인한 뒤 보내 주십시오. 문의 내용은 클립보드에도 복사되었습니다.`
    );

    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "문의 보내기";
      }
    }, 1500);
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
