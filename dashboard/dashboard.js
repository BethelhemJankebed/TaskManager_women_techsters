(function () {
  const TASK_KEY = "tm_tasks";
  const EXP_KEY = "tm_expenses";
  const NOTE_KEY = "tm_notes";

  function load(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (e) {
      return [];
    }
  }
  function save(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
  }

  function loadTasks() {
    return load(TASK_KEY);
  }
  function saveTasks(arr) {
    save(TASK_KEY, arr);
  }
  function loadExpenses() {
    return load(EXP_KEY);
  }
  function saveExpenses(arr) {
    save(EXP_KEY, arr);
  }
  function loadNotes() {
    return load(NOTE_KEY);
  }
  function saveNotes(arr) {
    save(NOTE_KEY, arr);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderSummary() {
    const boxes = document.querySelectorAll("summary-box.overview");
    const tasks = loadTasks();
    const expenses = loadExpenses();
    const notes = loadNotes();

    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const active = total - completed;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    const expenseTotal = expenses
      .reduce((s, e) => s + (Number(e.amount) || 0), 0)
      .toFixed(2);

    boxes.forEach((box) => {
      const headingEl = box.querySelector('p[slot="summary__heading"]');
      const dataEl = box.querySelector('p[slot="summary__data"]');
      const titleEl = box.querySelector('p[slot="summary__title"]');
      if (!headingEl || !dataEl) return;
      const heading = headingEl.textContent.trim().toLowerCase();
      if (heading.includes("active")) {
        dataEl.textContent = String(active);
        if (titleEl) titleEl.textContent = `${completed} completed`;
      } else if (heading.includes("expense")) {
        dataEl.textContent = `$${expenseTotal}`;
      } else if (heading.includes("notes")) {
        dataEl.textContent = String(notes.length);
      } else if (heading.includes("completion")) {
        dataEl.textContent = `${completionRate}%`;
      }
    });
  }

  function renderRecentTasks() {
    const container = document.querySelector(".recent-task-body");
    if (!container) return;
    const tasks = loadTasks();
    container.innerHTML = "";
    if (!tasks.length) {
      const empty = document.createElement("div");
      empty.className = "summary-tab__body__option";
      empty.textContent = "No tasks yet";
      container.appendChild(empty);
      return;
    }

    tasks
      .slice()
      .reverse()
      .forEach((task) => {
        const item = document.createElement("div");
        item.className = "summary-tab__body__option";
        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.justifyContent = "space-between";

        const left = document.createElement("div");
        left.style.display = "flex";
        left.style.alignItems = "center";
        left.style.gap = "12px";

        const checkbox = document.createElement("div");
        checkbox.className = "task-checkbox";
        checkbox.style.width = "20px";
        checkbox.style.height = "20px";
        checkbox.style.borderRadius = "6px";
        checkbox.style.display = "inline-flex";
        checkbox.style.alignItems = "center";
        checkbox.style.justifyContent = "center";
        checkbox.style.cursor = "pointer";
        checkbox.textContent = task.completed ? "✔" : "";
        checkbox.addEventListener("click", () => {
          toggleTaskComplete(task.id);
        });

        const info = document.createElement("div");
        const title = document.createElement("div");
        title.className = "task-title";
        title.textContent = task.title;
        const meta = document.createElement("div");
        meta.className = "task-meta";
        meta.textContent = new Date(task.createdAt).toLocaleString();
        info.appendChild(title);
        info.appendChild(meta);

        left.appendChild(checkbox);
        left.appendChild(info);

        const actions = document.createElement("div");
        actions.style.display = "flex";
        actions.style.gap = "8px";
        const edit = document.createElement("button");
        edit.className = "btn ghost";
        edit.textContent = "Edit";
        const del = document.createElement("button");
        del.className = "btn ghost";
        del.textContent = "Delete";
        edit.addEventListener("click", () => {
          editTaskPrompt(task.id);
        });
        del.addEventListener("click", () => {
          if (confirm("Delete task?")) deleteTask(task.id);
        });
        actions.appendChild(edit);
        actions.appendChild(del);

        if (task.completed) title.style.textDecoration = "line-through";

        item.appendChild(left);
        item.appendChild(actions);
        container.appendChild(item);
      });
  }

  function addTask(title) {
    const tasks = loadTasks();
    tasks.push({
      id: "t_" + Date.now(),
      title: title,
      completed: false,
      createdAt: new Date().toISOString(),
    });
    saveTasks(tasks);
    renderSummary();
    renderRecentTasks();
  }
  function toggleTaskComplete(id) {
    const tasks = loadTasks();
    const i = tasks.findIndex((t) => t.id === id);
    if (i === -1) return;
    tasks[i].completed = !tasks[i].completed;
    saveTasks(tasks);
    renderSummary();
    renderRecentTasks();
  }
  function deleteTask(id) {
    let tasks = loadTasks();
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks(tasks);
    renderSummary();
    renderRecentTasks();
  }
  function editTaskPrompt(id) {
    const tasks = loadTasks();
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    const nv = prompt("Edit task", t.title);
    if (nv !== null) {
      t.title = nv;
      saveTasks(tasks);
      renderRecentTasks();
      renderSummary();
    }
  }

  function addExpense(amount, note) {
    const ex = loadExpenses();
    ex.push({
      id: "e_" + Date.now(),
      amount: Number(amount) || 0,
      note: note || "",
      createdAt: new Date().toISOString(),
    });
    saveExpenses(ex);
    renderSummary();
  }
  function addNote(text) {
    const notes = loadNotes();
    notes.push({
      id: "n_" + Date.now(),
      text: text,
      createdAt: new Date().toISOString(),
    });
    saveNotes(notes);
    renderSummary();
  }

  function initQuickActions() {
    const opts = document.querySelectorAll(
      ".quick-actions-body app-button, .quick-actions-body .summary-tab__body__option"
    );
    opts.forEach((el) => {
      const label =
        el.querySelector(
          ".quick-task-name, .summary-button-label .quick-task-name"
        ) || el.querySelector('[slot="button-label"]');
      // Wire Add Task button to open modal
      const addBtn = document.getElementById("addTaskBtn");
      if (addBtn) {
        addBtn.addEventListener("click", function () {
          openAddTaskModal();
        });
      }

      // Create modal HTML and append if not present
      if (!document.getElementById("addTaskModal")) {
        const modal = document.createElement("div");
        modal.id = "addTaskModal";
        modal.className = "modal";
        modal.innerHTML = `
          <div class="modal-backdrop"></div>
          <div class="modal-panel">
            <h3>Add Task</h3>
            <label>Title</label>
            <input id="modalTaskTitle" type="text" placeholder="Task title" />
            <div class="modal-actions"><button id="modalCancel" class="btn ghost">Cancel</button><button id="modalSave" class="btn primary">Create</button></div>
          </div>
        `;
        document.body.appendChild(modal);

        document
          .getElementById("modalCancel")
          .addEventListener("click", closeAddTaskModal);
        document
          .getElementById("modalSave")
          .addEventListener("click", function () {
            const v = document.getElementById("modalTaskTitle").value.trim();
            if (v) {
              addTask(v);
              closeAddTaskModal();
              document.getElementById("modalTaskTitle").value = "";
            } else alert("Please enter a task title");
          });
        modal
          .querySelector(".modal-backdrop")
          .addEventListener("click", closeAddTaskModal);
      }
      const text = label ? (label.textContent || "").toLowerCase() : "";
      el.addEventListener("click", () => {
        if (text.includes("create") || text.includes("task")) {
          const title = prompt("Task title");
          if (title) addTask(title);
        } else if (text.includes("expense")) {
          const amt = prompt("Amount");
          if (amt) addExpense(amt, "");
        } else if (text.includes("note") || text.includes("write")) {
          const t = prompt("Note text");
          if (t) addNote(t);
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderSummary();
    renderRecentTasks();
    initQuickActions();
    try {
      const u = JSON.parse(localStorage.getItem("tm_user") || "null");
      if (u && u.name) {
        const el = document.querySelector(".user-name");
        if (el) el.textContent = u.name;
      }
    } catch (e) {}
  });

  function openAddTaskModal() {
    const m = document.getElementById("addTaskModal");
    if (!m) return;
    m.style.display = "block";
    document.getElementById("modalTaskTitle").focus();
  }
  function closeAddTaskModal() {
    const m = document.getElementById("addTaskModal");
    if (m) m.style.display = "none";
  }
})();
