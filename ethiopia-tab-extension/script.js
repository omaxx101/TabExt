document.addEventListener("DOMContentLoaded", async () => {
  const greetingText = document.getElementById("greetingText");

function getOrAskName() {
  let name = localStorage.getItem("ethiopia-tab:name");

  if (!name) {
    name = prompt("እባክዎ ስምዎን ያስገቡ / Enter your name:");

    if (name && name.trim() !== "") {
      localStorage.setItem("ethiopia-tab:name", name.trim());
    } else {
      name = "Guest";
    }
  }

  return name;
}

function updateGreeting() {
  const name = getOrAskName();
  greetingText.textContent = `ሰላም  ${name}`;
}

  let backgrounds = [];

  const quotes = [
    { am: "ትዕግስት ወርቅ ነው።", en: "Patience is gold." },
    { am: "ትንሽ በትንሽ ታላቅ ይሆናል።", en: "Little by little becomes something great." },
    { am: "የታገሰ ይበረታል።", en: "The one who endures grows strong." },
    { am: "እውነት ይበልጣል።", en: "Truth rises above." },
    { am: "ስራ ከተማ ያበጃል።", en: "Work is what builds a city." }
  ];

  const timeEl = document.getElementById("time");
  const dateEl = document.getElementById("date");
  const quoteEl = document.getElementById("quote");
  const translationEl = document.getElementById("translation");
  const photoTitleEl = document.getElementById("photoTitle");
  const photoLinkEl = document.getElementById("photoLink");
  const inputEl = document.getElementById("todoInput");
  const listEl = document.getElementById("todoList");

  const storageKeys = {
    photo: "ethiopia-tab:last-photo",
    todos: "ethiopia-tab:todos"
  };

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
    if (!backgrounds.length) return;

    const bg = backgrounds[selectIndex(backgrounds, storageKeys.photo)];

    document.body.style.backgroundImage = [
      "linear-gradient(120deg, rgba(8, 17, 24, 0.76), rgba(8, 17, 24, 0.26))",
      "radial-gradient(circle at top left, rgba(216, 177, 93, 0.28), transparent 30%)",
      `url("${bg.url}")`
    ].join(", ");

    if (photoTitleEl) photoTitleEl.textContent = bg.title;
    if (photoLinkEl) photoLinkEl.href = bg.source;
  }

  function getEthiopianDateAmharic() {
    const now = new Date();
  
    const months = ["መስከረም","ጥቅምት","ኅዳር","ታኅሣሥ","ጥር","የካቲት","መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜን"];
    const days = ["እሑድ","ሰኞ","ማክሰኞ","ረቡዕ","ሐሙስ","አርብ","ቅዳሜ"];
  
    // ✅ Get Ethiopia weekday correctly
    const weekday = new Intl.DateTimeFormat("am-ET", {
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
      timeEl.textContent = now.toLocaleTimeString("en-US", {
        timeZone: "Africa/Addis_Ababa",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    }

    if (dateEl) {
      const gregorian = now.toLocaleDateString("en-US", {
        timeZone: "Africa/Addis_Ababa",
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      });

      dateEl.innerHTML = `${gregorian}<br>
      <span style="opacity:0.7;font-size:0.9em">
        ${getEthiopianDateAmharic()}
      </span>`;
    }
  }

  function setQuote() {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    if (quoteEl) quoteEl.textContent = q.am;
    if (translationEl) translationEl.textContent = q.en;
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

  // 🚀 IMPORTANT ORDER (THIS WAS YOUR MAIN BUG)
  await fetchGitHubImages();   // load images first
  setBackground();             // THEN use them
  updateGreeting();
  setQuote();
  updateTime();
  renderTodos();
  setInterval(updateTime, 1000);
});