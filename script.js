class TodoList {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.form = document.getElementById('todo-form');
        this.input = document.getElementById('todo-input');
        this.list = document.getElementById('todo-list');

        this.initializeEventListeners();
        this.render();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.list.addEventListener('dragstart', (e) => this.handleDragStart(e));
        this.list.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.list.addEventListener('drop', (e) => this.handleDrop(e));
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    handleSubmit(e) {
        e.preventDefault();
        const text = this.input.value.trim();
        if (text) {
            this.addTodo(text);
            this.input.value = '';
        }
    }

    addTodo(text) {
        this.todos.push({
            id: Date.now(),
            text,
            completed: false
        });
        this.saveTodos();
        this.render();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }

    toggleTodo(id) {
        this.todos = this.todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        this.saveTodos();
        this.render();
    }

    editTodo(id, newText) {
        this.todos = this.todos.map(todo =>
            todo.id === id ? { ...todo, text: newText } : todo
        );
        this.saveTodos();
        this.render();
    }

    handleDragStart(e) {
        const item = e.target.closest('.todo-item');
        if (!item) return;

        item.classList.add('dragging');
        e.dataTransfer.setData('text/plain', item.dataset.id);
    }

    handleDragOver(e) {
        e.preventDefault();
        const item = e.target.closest('.todo-item');
        if (!item) return;

        const draggingItem = this.list.querySelector('.dragging');
        if (draggingItem === item) return;

        const rect = item.getBoundingClientRect();
        const offset = e.clientY - rect.top - rect.height / 2;

        if (offset < 0) {
            item.parentNode.insertBefore(draggingItem, item);
        } else {
            item.parentNode.insertBefore(draggingItem, item.nextSibling);
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const draggingItem = this.list.querySelector('.dragging');
        if (!draggingItem) return;

        draggingItem.classList.remove('dragging');

        // Update todos array to match new order
        const newTodos = [];
        this.list.querySelectorAll('.todo-item').forEach(item => {
            const todo = this.todos.find(t => t.id === parseInt(item.dataset.id));
            if (todo) newTodos.push(todo);
        });

        this.todos = newTodos;
        this.saveTodos();
    }

    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.draggable = true;
        li.dataset.id = todo.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

        const text = document.createElement('span');
        text.className = 'todo-text';
        text.textContent = todo.text;

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'edit-input';
            input.value = todo.text;

            const saveBtn = document.createElement('button');
            saveBtn.textContent = 'Save';
            saveBtn.addEventListener('click', () => {
                const newText = input.value.trim();
                if (newText) {
                    this.editTodo(todo.id, newText);
                }
            });

            li.innerHTML = '';
            li.appendChild(input);
            li.appendChild(saveBtn);
            input.focus();
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

        li.appendChild(checkbox);
        li.appendChild(text);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);

        return li;
    }

    render() {
        this.list.innerHTML = '';
        this.todos.forEach(todo => {
            this.list.appendChild(this.createTodoElement(todo));
        });
    }
}

// Initialize the todo list when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TodoList();
});