let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Ask notification permission once
if ("Notification" in window) {
    Notification.requestPermission();
}

function addTask() {
    const text = taskText.value.trim();
    const date = taskDate.value;
    const time = taskTime.value;

    if (!text || !date || !time) {
        alert("Please fill all fields");
        return;
    }

    const task = {
        id: Date.now(),
        text,
        date,
        time,
        completed: false
    };

    tasks.push(task);
    scheduleNotification(task);
    save();
    render();

    taskText.value = "";
}

// Save to localStorage
function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render sorted tasks with index
function render() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    const now = new Date();

    const upcoming = tasks
        .filter(t => !t.completed && new Date(`${t.date}T${t.time}`) >= now)
        .sort((a, b) =>
            new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
        );

    upcoming.forEach((task, index) => {
        const li = document.createElement("li");

        li.innerHTML = `
            <div class="task">
                <div>
                    <div>
                        <span class="index">${index + 1}.</span> ${task.text}
                    </div>
                    <div class="meta">${task.date} ⏰ ${task.time}</div>
                </div>
                <div class="actions">
                    <button onclick="completeTask(${task.id})">✔</button>
                    <button onclick="editTask(${task.id})">✏️</button>
                    <button onclick="deleteTask(${task.id})">🗑</button>
                </div>
            </div>
        `;

        list.appendChild(li);
    });

    if (upcoming.length === 0) {
        list.innerHTML =
            "<p style='text-align:center;color:#7abaff;'>No upcoming tasks 🎉</p>";
    }
}

// Mark completed (auto removes from list)
function completeTask(id) {
    const task = tasks.find(t => t.id === id);
    task.completed = true;
    save();
    render();
}

// Edit task
function editTask(id) {
    const task = tasks.find(t => t.id === id);

    task.text = prompt("Edit task", task.text) || task.text;
    task.date = prompt("Edit date (YYYY-MM-DD)", task.date) || task.date;
    task.time = prompt("Edit time (HH:MM)", task.time) || task.time;

    save();
    render();
}

// Delete task
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    save();
    render();
}

// Notification scheduler
function scheduleNotification(task) {
    if (Notification.permission !== "granted") return;

    const notifyTime = new Date(`${task.date}T${task.time}`);
    const delay = notifyTime.getTime() - Date.now();

    if (delay <= 0) return;

    setTimeout(() => {
        if (!task.completed) {
            new Notification("📌 Task Due", {
                body: task.text
            });
        }
    }, delay);
}

// Re-register notifications on reload
tasks.forEach(scheduleNotification);
render();
