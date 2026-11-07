'use strict';

// ===== Greeting + Clock =====
function updateClock() {
  var now = new Date();
  var h = String(now.getHours()).padStart(2, '0');
  var m = String(now.getMinutes()).padStart(2, '0');
  var s = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('clock').textContent = h + ':' + m + ':' + s;

  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('date').textContent =
    days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();

  updateGreeting(now.getHours());
}

function updateGreeting(hour) {
  var name = localStorage.getItem('userName') || '';
  var namePart = name ? ', ' + name : '';
  var greet;
  if (hour < 12) greet = 'Good morning';
  else if (hour < 18) greet = 'Good afternoon';
  else greet = 'Good evening';
  document.getElementById('greeting').textContent = greet + namePart + '!';
}

setInterval(updateClock, 1000);
updateClock();

// ===== Custom Name =====
document.getElementById('name-save').addEventListener('click', function() {
  var name = document.getElementById('name-input').value.trim();
  if (name) {
    localStorage.setItem('userName', name);
    updateGreeting(new Date().getHours());
  }
});
// Pre-fill name input on load
document.getElementById('name-input').value = localStorage.getItem('userName') || '';

// ===== Focus Timer =====
var timerSeconds = 25 * 60;
var timerRemaining = timerSeconds;
var timerInterval = null;

function renderTimer() {
  var m = Math.floor(timerRemaining / 60);
  var s = timerRemaining % 60;
  document.getElementById('timer-display').textContent =
    String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

document.getElementById('timer-start').addEventListener('click', function() {
  if (timerInterval) return; // already running
  timerInterval = setInterval(function() {
    timerRemaining--;
    renderTimer();
    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerRemaining = timerSeconds;
      renderTimer();
      alert('Time is up!');
    }
  }, 1000);
});

document.getElementById('timer-stop').addEventListener('click', function() {
  clearInterval(timerInterval);
  timerInterval = null;
});

document.getElementById('timer-reset').addEventListener('click', function() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRemaining = timerSeconds;
  renderTimer();
});

document.getElementById('timer-set').addEventListener('click', function() {
  var mins = parseInt(document.getElementById('timer-minutes').value, 10);
  if (isNaN(mins) || mins < 1 || mins > 120) {
    alert('Enter a number from 1 to 120.');
    return;
  }
  clearInterval(timerInterval);
  timerInterval = null;
  timerSeconds = mins * 60;
  timerRemaining = timerSeconds;
  renderTimer();
});

renderTimer();

// ===== To-Do List =====
function getTodos() {
  try { return JSON.parse(localStorage.getItem('todos')) || []; }
  catch (e) { return []; }
}
function saveTodos(todos) {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
  var todos = getTodos();
  var list = document.getElementById('todo-list');
  list.innerHTML = '';
  todos.forEach(function(todo, i) {
    var li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' done' : '');

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;
    checkbox.addEventListener('change', function() {
      todos[i].done = checkbox.checked;
      saveTodos(todos);
      renderTodos();
    });

    var text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;
    text.addEventListener('dblclick', function() { li.classList.add('editing'); editInput.focus(); });

    var editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'todo-edit';
    editInput.value = todo.text;
    editInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var val = editInput.value.trim();
        if (val) { todos[i].text = val; saveTodos(todos); }
        renderTodos();
      }
      if (e.key === 'Escape') renderTodos();
    });

    var delBtn = document.createElement('button');
    delBtn.className = 'todo-del';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', function() {
      todos.splice(i, 1);
      saveTodos(todos);
      renderTodos();
    });

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(editInput);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

document.getElementById('todo-add').addEventListener('click', function() {
  var input = document.getElementById('todo-input');
  var text = input.value.trim();
  if (!text) return;
  var todos = getTodos();
  // Prevent duplicates
  if (todos.some(function(t) { return t.text.toLowerCase() === text.toLowerCase(); })) {
    alert('That task is already on the list.');
    return;
  }
  todos.push({ text: text, done: false });
  saveTodos(todos);
  input.value = '';
  renderTodos();
});

document.getElementById('todo-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') document.getElementById('todo-add').click();
});

renderTodos();

// ===== Quick Links =====
function getLinks() {
  try { return JSON.parse(localStorage.getItem('quickLinks')) || []; }
  catch (e) { return []; }
}
function saveLinks(links) {
  localStorage.setItem('quickLinks', JSON.stringify(links));
}

function renderLinks() {
  var links = getLinks();
  var container = document.getElementById('links-container');
  container.innerHTML = '';
  links.forEach(function(link, i) {
    var a = document.createElement('a');
    a.className = 'link-btn';
    a.href = link.url;
    a.target = '_blank';
    a.textContent = link.name;

    var remove = document.createElement('button');
    remove.className = 'link-remove';
    remove.textContent = '×';
    remove.title = 'Remove';
    remove.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      links.splice(i, 1);
      saveLinks(links);
      renderLinks();
    });

    a.appendChild(remove);
    container.appendChild(a);
  });
}

document.getElementById('link-add').addEventListener('click', function() {
  var nameInput = document.getElementById('link-name');
  var urlInput = document.getElementById('link-url');
  var name = nameInput.value.trim();
  var url = urlInput.value.trim();
  if (!name || !url) return;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  var links = getLinks();
  links.push({ name: name, url: url });
  saveLinks(links);
  nameInput.value = '';
  urlInput.value = '';
  renderLinks();
});

renderLinks();

// ===== Dark / Light Mode =====
function applyTheme() {
  var dark = localStorage.getItem('darkMode') === 'true';
  document.body.classList.toggle('dark-mode', dark);
  document.getElementById('theme-toggle').textContent = dark ? '☀️ Light' : '🌙 Dark';
}

document.getElementById('theme-toggle').addEventListener('click', function() {
  var dark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', String(!dark));
  applyTheme();
});

applyTheme();
