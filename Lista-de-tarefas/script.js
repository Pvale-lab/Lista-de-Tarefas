document.addEventListener('DOMContentLoaded', () => {
    
    // --- FUNÇÕES GLOBAIS (COMPARTILHADAS ENTRE PÁGINAS) ---
    
    const getTasks = () => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            if (!task.priority) {
                task.priority = 'media';
            }
        });
        return tasks;
    };

    const saveTasks = (tasks) => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };


    // --- LÓGICA DA PÁGINA INDEX (LISTAGEM) ---

    const initIndexPage = () => {
        const taskList = document.getElementById('task-list');
        const filterControls = document.getElementById('filter-controls');
        const searchInput = document.getElementById('search-input');
        let currentFilter = 'all';
        let searchTerm = '';

        const renderTasks = () => {
            taskList.innerHTML = '';
            let tasks = getTasks();

            const statusFilteredTasks = tasks.filter(task => {
                if (currentFilter === 'pending') return !task.completed;
                if (currentFilter === 'completed') return task.completed;
                return true;
            });

            const searchFilteredTasks = statusFilteredTasks.filter(task => 
                task.title.toLowerCase().includes(searchTerm) || 
                (task.description && task.description.toLowerCase().includes(searchTerm))
            );

            if (searchFilteredTasks.length === 0) {
                taskList.innerHTML = '<p style="text-align: center; color: #6c757d;">Nenhuma tarefa encontrada.</p>';
                return;
            }

            searchFilteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;
                li.dataset.id = task.id;

                // **** INÍCIO DA ALTERAÇÃO 1 ****
                // Define os atributos do botão 'completar' com base no status da tarefa
                const completeBtnDisabled = task.completed ? 'disabled' : '';
                const completeBtnTitle = task.completed ? 'Tarefa Concluída' : 'Completar Tarefa';

                li.innerHTML = `
                    <div class="task-content">
                        <div class="task-content-header">
                            <h3>${task.title}</h3>
                            <span class="priority-badge ${task.priority}">${task.priority}</span>
                        </div>
                        <p>${task.description || ''}</p>
                    </div>
                    <div class="task-actions">
                        <button class="complete-btn" title="${completeBtnTitle}" ${completeBtnDisabled}>
                            <i class="fas fa-check"></i>
                        </button>
                        <a href="edit.html?id=${task.id}" class="edit-btn" title="Editar">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button class="delete-btn" title="Remover">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                // **** FIM DA ALTERAÇÃO 1 ****
                taskList.appendChild(li);
            });
        };
        
        taskList.addEventListener('click', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (!taskItem) return;

            const taskId = Number(taskItem.dataset.id);
            let tasks = getTasks();
            let taskChanged = false;

            // **** INÍCIO DA ALTERAÇÃO 2 ****
            // Ação de Completar Tarefa (sem reativar)
            if (e.target.closest('.complete-btn')) {
                const task = tasks.find(t => t.id === taskId);
                // A ação só ocorre se a tarefa não estiver concluída
                if (task && !task.completed) {
                    task.completed = true;
                    taskChanged = true;
                }
            }
            // **** FIM DA ALTERAÇÃO 2 ****

            // Ação de Deletar Tarefa
            if (e.target.closest('.delete-btn')) {
                const task = tasks.find(t => t.id === taskId);
                if (task && confirm(`Tem certeza que deseja remover a tarefa "${task.title}"?`)) {
                    tasks = tasks.filter(t => t.id !== taskId);
                    taskChanged = true;
                }
            }
            
            if (taskChanged) {
                saveTasks(tasks);
                renderTasks();
            }
        });

        filterControls.addEventListener('click', (e) => {
            if (!e.target.matches('.filter-btn')) return;
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTasks();
        });

        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            renderTasks();
        });

        renderTasks();
    };


    // --- LÓGICA DA PÁGINA DE ADICIONAR TAREFA --- (Sem alterações aqui)
    const initAddPage = () => {
        const taskForm = document.getElementById('task-form');
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newTask = { id: Date.now(), title: document.getElementById('task-title').value.trim(), description: document.getElementById('task-description').value.trim(), priority: document.getElementById('task-priority').value, completed: false };
            const tasks = getTasks();
            tasks.unshift(newTask);
            saveTasks(tasks);
            window.location.href = 'index.html';
        });
    };


    // --- LÓGICA DA PÁGINA DE EDITAR TAREFA --- (Sem alterações aqui)
    const initEditPage = () => {
        const taskForm = document.getElementById('task-form');
        const urlParams = new URLSearchParams(window.location.search);
        const taskId = Number(urlParams.get('id'));
        const tasks = getTasks();
        const taskToEdit = tasks.find(t => t.id === taskId);

        if (!taskToEdit) {
            alert('Tarefa não encontrada!');
            window.location.href = 'index.html';
            return;
        }

        document.getElementById('task-id').value = taskToEdit.id;
        document.getElementById('task-title').value = taskToEdit.title;
        document.getElementById('task-description').value = taskToEdit.description;
        document.getElementById('task-priority').value = taskToEdit.priority;

        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            taskToEdit.title = document.getElementById('task-title').value.trim();
            taskToEdit.description = document.getElementById('task-description').value.trim();
            taskToEdit.priority = document.getElementById('task-priority').value;
            saveTasks(tasks);
            window.location.href = 'index.html';
        });
    };


    // --- INICIALIZADOR ---
    const page = document.body.id;
    if (page === 'page-index') { initIndexPage(); } 
    else if (page === 'page-add') { initAddPage(); } 
    else if (page === 'page-edit') { initEditPage(); }
});