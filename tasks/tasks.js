(function () {
  const TASK_KEY = "tm_tasks";

  function load() {
    try {
      return JSON.parse(localStorage.getItem(TASK_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function save(arr) {
    localStorage.setItem(TASK_KEY, JSON.stringify(arr));
  }

  function renderTaskList() {
    const container = document.querySelector(".task-list-body");
    if (!container) return;
    const tasks = load();
    container.innerHTML = "";
    if (!tasks.length) {
      const empty = document.createElement("div");
      empty.className = "recent-empty-dashed";
      empty.innerHTML =
        '<div class="empty-icon"></div><div class="empty-title">No tasks yet</div><div class="empty-sub">Create a new task to get started</div>';
      container.appendChild(empty);
      return;
    }

    tasks
      .slice()
      .reverse()
      .forEach((task) => {
        const item = document.createElement("div");
        item.className = "task-item";

        const left = document.createElement("div");
        left.className = "left";
        const checkbox = document.createElement("div");
        checkbox.className = "task-checkbox";
        checkbox.textContent = task.completed ? "✔" : "";
        checkbox.addEventListener("click", () => toggleTaskComplete(task.id));
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
        edit.addEventListener("click", () => editTaskPrompt(task.id));
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
    const tasks = load();
    tasks.push({
      id: "t_" + Date.now(),
      title: String(title || "Untitled"),
      completed: false,
      createdAt: new Date().toISOString(),
    });
    save(tasks);
    renderTaskList();
  }

  function toggleTaskComplete(id) {
    const tasks = load();
    const i = tasks.findIndex((t) => t.id === id);
    if (i === -1) return;
    tasks[i].completed = !tasks[i].completed;
    save(tasks);
    renderTaskList();
  }
  function deleteTask(id) {
    let tasks = load();
    tasks = tasks.filter((t) => t.id !== id);
    save(tasks);
    renderTaskList();
  }
  function editTaskPrompt(id) {
    const tasks = load();
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    const nv = prompt("Edit task", t.title);
    if (nv !== null) {
      t.title = nv;
      save(tasks);
      renderTaskList();
    }
  }

  // Modal for adding task
  function ensureModal() {
    if (document.getElementById("tasks_addTaskModal")) return;
    const modal = document.createElement("div");
    modal.id = "tasks_addTaskModal";
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-panel">
        <h3>Add Task</h3>
        <label>Title</label>
        <input id="tasks_modalTaskTitle" type="text" placeholder="Task title" />
        <div class="modal-actions"><button id="tasks_modalCancel" class="btn ghost">Cancel</button><button id="tasks_modalSave" class="btn primary">Create</button></div>
      </div>`;
    document.body.appendChild(modal);
    document
      .getElementById("tasks_modalCancel")
      .addEventListener("click", closeModal);
    document.getElementById("tasks_modalSave").addEventListener("click", () => {
      const v = document.getElementById("tasks_modalTaskTitle").value.trim();
      if (v) {
        addTask(v);
        closeModal();
        document.getElementById("tasks_modalTaskTitle").value = "";
      } else alert("Please enter a task title");
    });
    modal
      .querySelector(".modal-backdrop")
      .addEventListener("click", closeModal);
  }
  function openModal() {
    const m = document.getElementById("tasks_addTaskModal");
    if (!m) return;
    m.style.display = "block";
    document.getElementById("tasks_modalTaskTitle").focus();
  }
  function closeModal() {
    const m = document.getElementById("tasks_addTaskModal");
    if (m) m.style.display = "none";
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderTaskList();
    ensureModal();
    const addBtn = document.getElementById("addTaskBtn");
    if (addBtn) addBtn.addEventListener("click", openModal);
  });
})();
