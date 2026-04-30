document.addEventListener("DOMContentLoaded", async () => {
  const greetingText = document.getElementById("greetingText");
  const greetingLabelEl = document.getElementById("greetingLabel");
  const timeZoneLabelEl = document.getElementById("timeZoneLabel");
  const quoteLabelEl = document.getElementById("quoteLabel");
  const inputEl = document.getElementById("todoInput");
  const amButton = document.getElementById("amButton");
  const enButton = document.getElementById("enButton");
  const photoLinkEl = document.getElementById("photoLink");
  const timeEl = document.getElementById("time");
  const dateEl = document.getElementById("date");
  const quoteEl = document.getElementById("quote");
  const translationEl = document.getElementById("translation");
  const listEl = document.getElementById("todoList");

  let currentLanguage = localStorage.getItem("ethiopia-tab:language") === "en" ? "en" : "am";

  const copy = {
    am: {
      pageTitle: "ኢትዮጵያ ታብ",
      htmlLang: "am",
      greetingLabel: "",
      greetingPrefix: "ሰላም",
      namePrompt: "እባክዎ ስምዎን ያስገቡ:",
      guestName: "እንግዳ",
      todoPlaceholder: "የዛሬ ትኩረት",
      timeZoneLabel: "አዲስ አበባ GMT +03:00",
      quoteLabel: "ጥቅስ",
      photoAria: "የፎቶ ምንጭ",
      photoTitlePrefix: "ፎቶ",
      ethiopianCalendarLabel: "በኢትዮጵያ"
    },
    en: {
      pageTitle: "Ethiopia Tab",
      htmlLang: "en",
      greetingLabel: "",
      greetingPrefix: "Hello",
      namePrompt: "Please enter your name:",
      guestName: "Guest",
      todoPlaceholder: "Today's focus",
      timeZoneLabel: "Addis Ababa GMT +03:00",
      quoteLabel: "Quote",
      photoAria: "Photo source",
      photoTitlePrefix: "Photo",
      ethiopianCalendarLabel: "Ethio"
    }
  };

  const quotes = [
    { am: "ትዕግስት ወርቅ ነው።", en: "Patience is gold." },
    { am: "ትንሽ በትንሽ ታላቅ ይሆናል።", en: "Little by little becomes something great." },
    { am: "የታገሰ ይበረታል።", en: "The one who endures grows strong." },
    { am: "እውነት ይበልጣል።", en: "Truth rises above." },
    { am: "ስራ ከተማ ያበጃል።", en: "Work builds a city." }
  ];

  const storageKeys = {
    photo: "ethiopia-tab:last-photo",
    todos: "ethiopia-tab:todos",
    language: "ethiopia-tab:language",
    quote: "ethiopia-tab:last-quote"
  };

function getOrAskName() {
  let name = localStorage.getItem("ethiopia-tab:name");

  if (!name) {
    name = prompt(copy[currentLanguage].namePrompt);

    if (name && name.trim() !== "") {
      localStorage.setItem("ethiopia-tab:name", name.trim());
    } else {
      name = copy[currentLanguage].guestName;
    }
  }

  return name;
}

function updateGreeting() {
  const name = getOrAskName();
  greetingText.textContent = `${copy[currentLanguage].greetingPrefix} ${name}`;
}

  let backgrounds = [];
  let activeBackground = null;
  let activeQuoteIndex = Number.parseInt(localStorage.getItem(storageKeys.quote) || "-1", 10);

  // ✅ FETCH IMAGES FROM GITHUB
  async function fetchGitHubImages() {
    try {
      const res = await fetch("https://api.github.com/repos/omaxx101/Addis/contents/images");
      const data = await res.json();

      backgrounds = data
        .filter(file =>
          file.type === "file" &&
          /\.(jpg|jpeg|png|webp)$/i.test(file.name)
        )
        .map(file => ({
          url: file.download_url,
          title: formatTitle(file.name),
          source: file.html_url
        }));

    } catch (err) {
      console.error("GitHub fetch failed:", err);
    }
  }

  function formatTitle(name) {
    return name
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  function selectIndex(items, key) {
    const lastIndex = Number.parseInt(localStorage.getItem(key) || "-1", 10);
    let index = Math.floor(Math.random() * items.length);

    if (items.length > 1) {
      while (index === lastIndex) {
        index = Math.floor(Math.random() * items.length);
      }
    }

    localStorage.setItem(key, String(index));
    return index;
  }

  function setBackground() {
    if (!backgrounds.length) return null;

    const bg = backgrounds[selectIndex(backgrounds, storageKeys.photo)];
    activeBackground = bg;

    applyBackground(bg);
    return bg;
  }

  function applyBackground(bg) {
    if (!bg) return;

    document.body.style.backgroundImage = [
      "linear-gradient(120deg, rgba(8, 17, 24, 0.76), rgba(8, 17, 24, 0.26))",
      "radial-gradient(circle at top left, rgba(216, 177, 93, 0.28), transparent 30%)",
      `url("${bg.url}")`
    ].join(", ");

    if (photoLinkEl) photoLinkEl.href = bg.source;
    if (photoLinkEl) {
      photoLinkEl.title = `${copy[currentLanguage].photoTitlePrefix}: ${bg.title}`;
    }
  }

  function getEthiopianDate(language) {
    const now = new Date();

    const months = language === "am"
      ? ["መስከረም","ጥቅምት","ኅዳር","ታኅሣሥ","ጥር","የካቲት","መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜን"]
      : ["Meskerem","Tikimt","Hidar","Tahsas","Tir","Yekatit","Megabit","Miyazya","Ginbot","Sene","Hamle","Nehase","Pagume"];

    const weekday = new Intl.DateTimeFormat(language === "am" ? "am-ET" : "en-US", {
      weekday: "long",
      timeZone: "Africa/Addis_Ababa"
    }).format(now);

    let gYear = now.getFullYear();
    let ethYear = gYear - 8;

    const newYear = new Date(gYear, 8, 11);
    let diff = Math.floor((now - newYear) / 86400000);

    if (diff < 0) {
      ethYear--;
      diff += 365;
    }

    const month = Math.floor(diff / 30);
    const day = (diff % 30) + 1;

    return `${weekday} ${months[Math.min(month, 12)]} ${day}, ${ethYear}`;
  }

  function updateTime() {
    const now = new Date();

    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString(currentLanguage === "am" ? "am-ET" : "en-US", {
        timeZone: "Africa/Addis_Ababa",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    }

    if (dateEl) {
      const gregorian = now.toLocaleDateString(currentLanguage === "am" ? "am-ET" : "en-US", {
        timeZone: "Africa/Addis_Ababa",
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      });

      dateEl.innerHTML = `${gregorian}<br>
      <span style="opacity:0.7;font-size:0.9em">
        ${copy[currentLanguage].ethiopianCalendarLabel}: ${getEthiopianDate(currentLanguage)}
      </span>`;
    }
  }

  function setQuote() {
    const lastIndex = Number.parseInt(localStorage.getItem(storageKeys.quote) || "-1", 10);
    let index = Math.floor(Math.random() * quotes.length);

    if (quotes.length > 1) {
      while (index === lastIndex) {
        index = Math.floor(Math.random() * quotes.length);
      }
    }

    activeQuoteIndex = index;
    localStorage.setItem(storageKeys.quote, String(index));
    renderQuote();
  }

  function renderQuote() {
    const safeIndex = activeQuoteIndex >= 0 && activeQuoteIndex < quotes.length ? activeQuoteIndex : 0;
    const q = quotes[safeIndex];
    if (quoteEl) quoteEl.textContent = q[currentLanguage];
    if (translationEl) translationEl.textContent = "";
  }

  function applyLanguage() {
    const currentCopy = copy[currentLanguage];

    document.documentElement.lang = currentCopy.htmlLang;
    document.title = currentCopy.pageTitle;

    if (greetingLabelEl) greetingLabelEl.textContent = currentCopy.greetingLabel;
    if (timeZoneLabelEl) timeZoneLabelEl.textContent = currentCopy.timeZoneLabel;
    if (quoteLabelEl) quoteLabelEl.textContent = currentCopy.quoteLabel;
    if (inputEl) inputEl.placeholder = currentCopy.todoPlaceholder;
    if (photoLinkEl) photoLinkEl.setAttribute("aria-label", currentCopy.photoAria);

    amButton?.classList.toggle("active", currentLanguage === "am");
    enButton?.classList.toggle("active", currentLanguage === "en");

    updateGreeting();
    updateTime();
    renderQuote();
    applyBackground(activeBackground);
  }

  function setLanguage(language) {
    currentLanguage = language === "en" ? "en" : "am";
    localStorage.setItem(storageKeys.language, currentLanguage);
    applyLanguage();
  }

  function loadTodos() {
    try {
      return JSON.parse(localStorage.getItem(storageKeys.todos) || "[]");
    } catch {
      return [];
    }
  }

  let todos = loadTodos();

  function saveTodos() {
    localStorage.setItem(storageKeys.todos, JSON.stringify(todos));
  }

  // ✅ FIXED TODO
  function renderTodos() {
    if (!listEl) return;

    listEl.innerHTML = "";
    if (!todos.length) return;

    todos.forEach(todo => {
      const li = document.createElement("li");
      li.className = `todo-item${todo.done ? " done" : ""}`;

      const text = document.createElement("span");
      text.className = "todo-copy";
      text.textContent = todo.text;

      const actions = document.createElement("div");
      actions.className = "todo-actions";

      const toggle = document.createElement("button");
      toggle.className = "todo-toggle";
      toggle.textContent = todo.done ? "✔" : "○";

      toggle.onclick = () => {
        todos = todos.map(t => t.id === todo.id ? { ...t, done: !t.done } : t);
        saveTodos();
        renderTodos();
      };

      const del = document.createElement("button");
      del.className = "todo-delete";
      del.textContent = "×";

      del.onclick = () => {
        todos = todos.filter(t => t.id !== todo.id);
        saveTodos();
        renderTodos();
      };

      actions.append(toggle, del);
      li.append(text, actions);
      listEl.appendChild(li);
    });
  }

  inputEl?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const text = inputEl.value.trim();
    if (!text) return;

    todos = [{ id: Date.now(), text, done: false }, ...todos];
    inputEl.value = "";

    saveTodos();
    renderTodos();
  });

  amButton?.addEventListener("click", () => setLanguage("am"));
  enButton?.addEventListener("click", () => setLanguage("en"));

  // 🚀 IMPORTANT ORDER (THIS WAS YOUR MAIN BUG)
  await fetchGitHubImages();   // load images first
  setBackground();             // THEN use them
  if (activeQuoteIndex < 0 || activeQuoteIndex >= quotes.length) {
    setQuote();
  }
  renderTodos();
  applyLanguage();
  setInterval(updateTime, 1000);
});
