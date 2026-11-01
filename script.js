let habits = [];
try {
  habits = JSON.parse(localStorage.getItem('weeklyHabits')) || [];
} catch (e) {
  habits = [];
}

let selectedDate = new Date();

const datePicker = document.getElementById('date-picker');
const headerRow = document.getElementById('header-row');
const habitsContainer = document.getElementById('habits-container');
const emptyMsg = document.getElementById('empty-msg');
const addForm = document.getElementById('add-form');
const clearBtn = document.getElementById('clear-btn');

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getDateKey(date) {
  let d = new Date(date);
  if (isNaN(d.getTime())) return "invalid-date";
  let day = String(d.getDate()).padStart(2, '0');
  let month = String(d.getMonth() + 1).padStart(2, '0');
  let year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

function saveData() {
  localStorage.setItem('weeklyHabits', JSON.stringify(habits));
}

function getWeekDates(baseDate) {
  let current = new Date(baseDate);
  if (isNaN(current.getTime())) current = new Date(); 
  let dayOfWeek = current.getDay(); 
  current.setDate(current.getDate() - dayOfWeek); 
  
  let dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function renderHeader() {
  headerRow.innerHTML = '<div class="habit-info-col">Habit Details</div>';
  let weekDates = getWeekDates(selectedDate);
  
  weekDates.forEach(date => {
    let dayName = daysOfWeek[date.getDay()];
    let dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    let div = document.createElement('div');
    div.className = 'day-col';
    div.innerHTML = `${dayName}<br><span class="date-text">${dateStr}</span>`;
    headerRow.appendChild(div);
  });
}

function renderHabits() {
  habitsContainer.innerHTML = '';
  
  if (habits.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  } else {
    emptyMsg.style.display = 'none';
  }

  let weekDates = getWeekDates(selectedDate);

  habits.forEach((habit, index) => {
    let row = document.createElement('div');
    row.className = 'board-row';

    let infoCol = document.createElement('div');
    infoCol.className = 'habit-info-col';
    
    let textWrapper = document.createElement('div');
    textWrapper.className = 'habit-text';
    
    let nameEl = document.createElement('div');
    nameEl.className = 'habit-name';
    nameEl.textContent = habit.name || 'Unnamed';
    
    let descEl = document.createElement('div');
    descEl.className = 'habit-desc';
    descEl.textContent = habit.desc || 'No description';
    
    textWrapper.appendChild(nameEl);
    textWrapper.appendChild(descEl);

    let delBtn = document.createElement('button');
    delBtn.className = 'del-btn';
    delBtn.innerHTML = '&#10005;'; // X icon
    delBtn.title = "Delete Habit";
    delBtn.addEventListener('click', () => {
      habits.splice(index, 1);
      saveData();
      renderHabits(); 
    });

    infoCol.appendChild(textWrapper);
    infoCol.appendChild(delBtn);
    row.appendChild(infoCol);

    weekDates.forEach(date => {
      let dateKey = getDateKey(date);
      if (!habit.history) habit.history = {};
      let isDone = habit.history[dateKey] === true;
      
      let dayCol = document.createElement('div');
      dayCol.className = 'day-col';

      let icon = document.createElement('div');
      icon.className = 'status-icon ' + (isDone ? 'done' : 'missed');
      icon.innerHTML = isDone ? '&#10003;' : '&#10005;';

      icon.addEventListener('click', () => {
        if (habit.history[dateKey]) {
          delete habit.history[dateKey];
        } else {
          habit.history[dateKey] = true;
        }
        saveData();
        renderHabits();
      });

      dayCol.appendChild(icon);
      row.appendChild(dayCol);
    });

    habitsContainer.appendChild(row);
  });
}

function renderAll() {
  renderHeader();
  renderHabits();
}

addForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  if (!datePicker.value) {
    alert("Please select a date.");
    return;
  }

  let name = document.getElementById('habit-name').value.trim();
  let desc = document.getElementById('habit-desc').value.trim();
  
  if (name === '') {
    alert("Please enter a habit name.");
    return;
  }

  habits.push({ name: name, desc: desc, history: {} });
  document.getElementById('habit-name').value = '';
  document.getElementById('habit-desc').value = '';
  
  saveData();
  renderAll();
});

clearBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all habits?')) {
    habits = [];
    saveData();
    renderAll();
  }
});

datePicker.addEventListener('change', (e) => {
  if (e.target.value) {
    selectedDate = new Date(e.target.value + 'T00:00:00');
  } else {
    selectedDate = new Date();
    datePicker.value = new Date().toISOString().split('T')[0];
  }
  renderAll();
});

let today = new Date();
let todayString = today.toISOString().split('T')[0];
datePicker.value = todayString;
selectedDate = new Date(todayString + 'T00:00:00');

renderAll();