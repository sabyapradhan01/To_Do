let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Ask notification permission
if ("Notification" in window) {
    Notification.requestPermission();
}

// ADD TASK (SAFE VERSION)
function addTask() {
    const textInput = document.getElementById("taskText");
    const dateInput = document.getElementById("taskDate");
    const timeInput = document.getElementById("taskTime");

    const text = textInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;

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
    saveTasks();
    scheduleNotification(task);
    renderTasks();

    // Clear input
    textInput.value = "";
}

// SAVE
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// RENDER
function renderTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    const now = new Date();

    const upcomingTasks = tasks
        .filter(t => !t.completed && new Date(`${t.date}T${t.time}`) >= now)
        .sort((a, b) =>
            new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
        );

    upcomingTasks.forEach((task, index) => {
        const li = document.createElement("li");

        li.innerHTML = `
            <div class="task">
                <div>
                    <strong>${index + 1}.</strong> ${task.text}
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

    if (upcomingTasks.length === 0) {
        list.innerHTML =
            `<p style="text-align:center;color:#7abaff;">
                No upcoming tasks 🎉
            </p>`;
    }
}

// COMPLETE
function completeTask(id) {
    const task = tasks.find(t => t.id === id);
    task.completed = true;
    saveTasks();
    renderTasks();
}

// EDIT
function editTask(id) {
    const task = tasks.find(t => t.id === id);

    const newText = prompt("Edit task", task.text);
    if (newText !== null) task.text = newText;

    const newDate = prompt("Edit date (YYYY-MM-DD)", task.date);
    if (newDate !== null) task.date = newDate;

    const newTime = prompt("Edit time (HH:MM)", task.time);
    if (newTime !== null) task.time = newTime;

    saveTasks();
    renderTasks();
}

// DELETE
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

// NOTIFICATION
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

// Re-register notifications
tasks.forEach(scheduleNotification);
renderTasks();
