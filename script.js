document.documentElement.classList.add("js");

const backgroundMusic = document.querySelector("#background-music");
const musicToggle = document.querySelector(".music-toggle");
const musicLabel = musicToggle.querySelector(".music-label");
const musicStatus = document.querySelector("#music-status");

function syncMusicControls() {
  const isPlaying = !backgroundMusic.paused;
  musicToggle.classList.toggle("is-playing", isPlaying);
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
  musicToggle.setAttribute("aria-label", isPlaying ? "暂停背景音乐" : "播放背景音乐");
  musicLabel.textContent = isPlaying ? "暂停音乐" : "播放爵士";
  musicStatus.textContent = isPlaying ? "背景音乐正在播放" : "背景音乐已暂停";
}

backgroundMusic.addEventListener("play", syncMusicControls);
backgroundMusic.addEventListener("pause", syncMusicControls);

function startAfterGesture(event) {
  document.removeEventListener("pointerdown", startAfterGesture);
  document.removeEventListener("keydown", startAfterGesture);
  if (event.target instanceof Element && event.target.closest(".music-toggle")) return;

  backgroundMusic.play().then(syncMusicControls).catch(() => {
    musicStatus.textContent = "背景音乐无法播放，请检查音频文件是否存在。";
  });
}

function attemptAutoplay() {
  backgroundMusic.play().then(syncMusicControls).catch(() => {
    musicStatus.textContent = "浏览器暂不允许自动播放，将在你首次操作页面后开始播放。";
    document.addEventListener("pointerdown", startAfterGesture);
    document.addEventListener("keydown", startAfterGesture);
  });
}

attemptAutoplay();

musicToggle.addEventListener("click", async () => {
  if (backgroundMusic.paused) {
    try {
      await backgroundMusic.play();
      syncMusicControls();
    } catch {
      musicStatus.textContent = "背景音乐无法播放，请检查音频文件是否存在。";
    }
    return;
  }

  backgroundMusic.pause();
});

backgroundMusic.addEventListener("error", () => {
  musicStatus.textContent = "背景音乐无法加载，请检查音频文件是否存在。";
});

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
  const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isExpanded));
  navToggle.setAttribute("aria-label", isExpanded ? "打开导航菜单" : "关闭导航菜单");
  navLinks.classList.toggle("open", !isExpanded);
});

navLinks.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "打开导航菜单");
    navLinks.classList.remove("open");
  }
});

const menuTabs = document.querySelectorAll(".menu-tab");
const menuCards = document.querySelectorAll(".menu-card");

menuTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const filter = tab.dataset.filter;
    menuTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    menuCards.forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.category !== filter;
    });
  });
});

const galleryItems = [...document.querySelectorAll(".gallery-item")];
const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
let activeImage = 0;

function showImage(index) {
  activeImage = (index + galleryItems.length) % galleryItems.length;
  const item = galleryItems[activeImage];
  lightboxImage.src = item.dataset.full;
  lightboxImage.alt = item.querySelector("img").alt;
}

galleryItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    showImage(index);
    lightbox.showModal();
  });
});

document.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
document.querySelector(".lightbox-prev").addEventListener("click", () => showImage(activeImage - 1));
document.querySelector(".lightbox-next").addEventListener("click", () => showImage(activeImage + 1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showImage(activeImage - 1);
  if (event.key === "ArrowRight") showImage(activeImage + 1);
});

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const dateInput = document.querySelector('input[name="date"]');
const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
dateInput.min = localToday;

const bookingForm = document.querySelector("#booking-form");
const formMessage = document.querySelector("#form-message");
const nameInput = bookingForm.elements.name;

nameInput.addEventListener("input", () => nameInput.setCustomValidity(""));

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formMessage.classList.remove("success", "error");

  nameInput.setCustomValidity(nameInput.value.trim().length < 2 ? "请输入至少两个有效字符。" : "");

  if (!bookingForm.reportValidity()) {
    formMessage.textContent = "请检查并填写正确的预约信息。";
    formMessage.classList.add("error");
    return;
  }

  const name = bookingForm.elements.name.value.trim();
  formMessage.textContent = `${name}，预约意向已记录。此页面为展示版，请致电门店确认座位。`;
  formMessage.classList.add("success");
  bookingForm.reset();
  dateInput.min = localToday;
});
