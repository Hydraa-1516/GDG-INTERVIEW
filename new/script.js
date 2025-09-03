document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let currentFilter = 'all';
    loadTasks();
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            filterTasks();
        });
    });
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            alert('Please enter a task!');
            return;
        }
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false
        };
        addTaskToDOM(task);
        saveTask(task);
        taskInput.value = '';
        taskInput.focus();
    }
    function addTaskToDOM(task) {
        const emptyState = taskList.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;
        if (task.completed) {
            li.classList.add('completed');
        }
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <button class="edit-btn">✏️</button>
            <button class="delete-btn">❌</button>
        `;
        li.querySelector('.task-checkbox').addEventListener('change', toggleTask);
        li.querySelector('.delete-btn').addEventListener('click', deleteTask);
        li.querySelector('.edit-btn').addEventListener('click', editTask);
        taskList.appendChild(li);
        filterTasks();
    }
    function toggleTask(e) {
        const taskId = e.target.parentElement.dataset.id;
        const tasks = getTasksFromStorage();
        const updatedTasks = tasks.map(task => {
            if (task.id == taskId) {
                task.completed = !task.completed;
            }
            return task;
        });
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        e.target.parentElement.classList.toggle('completed');
        filterTasks();
    }
    function deleteTask(e) {
        const taskId = e.target.parentElement.dataset.id;
        const tasks = getTasksFromStorage();
        const updatedTasks = tasks.filter(task => task.id != taskId);
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        e.target.parentElement.remove();
        if (updatedTasks.length === 0) {
            showEmptyState();
        }
    }
    function editTask(e) {
        const taskItem = e.target.parentElement;
        const taskId = taskItem.dataset.id;
        const taskTextElement = taskItem.querySelector('.task-text');
        const currentText = taskTextElement.textContent;
        const newText = prompt('Edit your task:', currentText);
        if (newText !== null && newText.trim() !== '') {
            const tasks = getTasksFromStorage();
            const updatedTasks = tasks.map(task => {
                if (task.id == taskId) {
                    task.text = newText.trim();
                }
                return task;
            });
            
            localStorage.setItem('tasks', JSON.stringify(updatedTasks));
            taskTextElement.textContent = newText.trim();
        }
    }
    function filterTasks() {
        const taskItems = taskList.querySelectorAll('.task-item');
        taskItems.forEach(item => {
            switch(currentFilter) {
                case 'all':
                    item.style.display = 'flex';
                    break;
                case 'active':
                    item.style.display = item.classList.contains('completed') ? 'none' : 'flex';
                    break;
                case 'completed':
                    item.style.display = item.classList.contains('completed') ? 'flex' : 'none';
                    break;
            }
        });
    }
    function saveTask(task) {
        const tasks = getTasksFromStorage();
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    function getTasksFromStorage() {
        let tasks;
        if (localStorage.getItem('tasks') === null) {
            tasks = [];
        } else {
            tasks = JSON.parse(localStorage.getItem('tasks'));
        }
        return tasks;
    }
    function loadTasks() {
        const tasks = getTasksFromStorage();
        
        if (tasks.length === 0) {
            showEmptyState();
            return;
        }
        
        tasks.forEach(task => {
            addTaskToDOM(task);
        });
        filterTasks();
    }
    function showEmptyState() {
        taskList.innerHTML = '<div class="empty-state">No tasks yet. Add a task to get started!</div>';
    }
});