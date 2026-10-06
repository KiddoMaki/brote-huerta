const defaultTasks = [
  { id: 'water-monstera', name: 'Regar la Monstera', tag: 'RIEGO', done: false },
  { id: 'rotate-calathea', name: 'Girar la Calathea hacia la luz', tag: 'LUZ', done: false },
  { id: 'check-soil', name: 'Comprobar la humedad de la tierra', tag: 'REVISIÓN', done: true },
];

const taskList = document.querySelector('#task-list');
const taskCount = document.querySelector('#task-count');
const emptyState = document.querySelector('#empty-state');
const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const installButton = document.querySelector('#install-button');
let tasks = loadTasks();

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem('brote-tasks'));
    return Array.isArray(saved) ? saved : defaultTasks;
  } catch {
    return defaultTasks;
  }
}

function saveTasks() {
  localStorage.setItem('brote-tasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.replaceChildren();
  const pending = tasks.filter((task) => !task.done).length;
  taskCount.textContent = `${pending} ${pending === 1 ? 'pendiente' : 'pendientes'}`;
  emptyState.hidden = tasks.length > 0;

  for (const task of tasks) {
    const item = document.createElement('li');
    item.className = `task-item${task.done ? ' done' : ''}`;

    const toggle = document.createElement('button');
    toggle.className = 'task-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-pressed', String(task.done));
    toggle.setAttribute('aria-label', `${task.done ? 'Marcar pendiente' : 'Completar'}: ${task.name}`);
    if (task.done) toggle.innerHTML = '<span aria-hidden="true">✓</span>';
    toggle.addEventListener('click', () => {
      task.done = !task.done;
      saveTasks();
      renderTasks();
    });

    const name = document.createElement('span');
    name.className = 'task-name';
    name.textContent = task.name;
    item.append(toggle, name);

    if (task.tag) {
      const tag = document.createElement('span');
      tag.className = 'task-tag';
      tag.textContent = task.tag;
      item.append(tag);
    }

    if (task.custom) {
      const remove = document.createElement('button');
      remove.className = 'task-remove';
      remove.type = 'button';
      remove.textContent = '×';
      remove.setAttribute('aria-label', `Eliminar: ${task.name}`);
      remove.addEventListener('click', () => {
        tasks = tasks.filter((entry) => entry.id !== task.id);
        saveTasks();
        renderTasks();
      });
      item.append(remove);
    }

    taskList.append(item);
  }
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = taskInput.value.trim();
  if (!name) return;
  tasks.push({ id: crypto.randomUUID(), name, done: false, custom: true });
  saveTasks();
  renderTasks();
  taskForm.reset();
  taskInput.focus();
});

let installPrompt;
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener('click', async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installButton.hidden = true;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
}

renderTasks();