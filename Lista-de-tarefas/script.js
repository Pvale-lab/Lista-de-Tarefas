document.addEventListener('DOMContentLoaded', () => {
    
    // --- FUNÇÕES GLOBAIS (COMPARTILHADAS ENTRE PÁGINAS) ---
    
    /**
     * Pega as tarefas do Local Storage.
     * @returns {Array} Array de tarefas.
     */
    const getTasks = () => {
        // Adiciona uma prioridade padrão se não existir (para tarefas antigas)
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            if (!task.priority) {
                task.priority = 'media';
            }
        });
        return tasks;
    };

    /**
     * Salva as tarefas no Local Storage.
     * @param {Array} tasks - O array de tarefas para salvar.
     */
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

            // 1. Filtrar por status (pendente, concluída, todas)
            const statusFilteredTasks = tasks.filter(task => {
                if (currentFilter === 'pending') return !task.completed;
                if (currentFilter === 'completed') return task.completed;
                return true;
            });

            // 2. Filtrar por texto da busca
            const searchFilteredTasks = statusFilteredTasks.filter(task => 
                task.title.toLowerCase().includes(searchTerm) || 
                task.description.toLowerCase().includes(searchTerm)
            );

            if (searchFilteredTasks.length === 0) {
                taskList.innerHTML = '<p style="text-align: center; color: #6c757d;">Nenhuma tarefa encontrada.</p>';
                return;
            }

            searchFilteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;
                li.dataset.id = task.id;

                li.innerHTML = `
                    <div class="task-content">
                        <div class="task-content-header">
                            <h3>${task.title}</h3>
                            <span class="priority-badge ${task.priority}">${task.priority}</span>
                        </div>
                        <p>${task.description || ''}</p>
                    </div>
                    <div class="task-actions">
                        <button class="complete-btn" title="${task.completed ? 'Reativar' : 'Completar'}">
                            <i class="fas ${task.completed ? 'fa-undo-alt' : 'fa-check'}"></i>
                        </button>
                        <a href="edit.html?id=${task.id}" class="edit-btn" title="Editar">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button class="delete-btn" title="Remover">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                taskList.appendChild(li);
            });
        };

        taskList.addEventListener('click', (e) => {
            const tasks = getTasks();
            const taskItem = e.target.closest('.task-item');
            if (!taskItem) return;
            const taskId = Number(taskItem.dataset.id);

            if (e.target.closest('.complete-btn')) {
                const task = tasks.find(t => t.id === taskId);
                task.completed = !task.completed;
            }

            if (e.target.closest('.delete-btn')) {
                const task = tasks.find(t => t.id === taskId);
                if (confirm(`Tem certeza que deseja remover a tarefa "${task.title}"?`)) {
                    const updatedTasks = tasks.filter(t => t.id !== taskId);
                    saveTasks(updatedTasks);
                } else {
                    return;
                }
            }
            saveTasks(tasks);
            renderTasks();
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


    // --- LÓGICA DA PÁGINA DE ADICIONAR TAREFA ---

    const initAddPage = () => {
        const taskForm = document.getElementById('task-form');
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newTask = {
                id: Date.now(),
                title: document.getElementById('task-title').value.trim(),
                description: document.getElementById('task-description').value.trim(),
                priority: document.getElementById('task-priority').value,
                completed: false,
            };

            const tasks = getTasks();
            tasks.unshift(newTask);
            saveTasks(tasks);

            window.location.href = 'index.html';
        });
    };


    // --- LÓGICA DA PÁGINA DE EDITAR TAREFA ---

    const initEditPage = () => {
        const taskForm = document.getElementById('task-form');
        const taskIdInput = document.getElementById('task-id');
        const taskTitleInput = document.getElementById('task-title');
        const taskDescriptionInput = document.getElementById('task-description');
        const taskPriorityInput = document.getElementById('task-priority');
        
        const urlParams = new URLSearchParams(window.location.search);
        const taskId = Number(urlParams.get('id'));

        const tasks = getTasks();
        const taskToEdit = tasks.find(t => t.id === taskId);

        if (!taskToEdit) {
            alert('Tarefa não encontrada!');
            window.location.href = 'index.html';
            return;
        }

        // Preenche o formulário com os dados da tarefa
        taskIdInput.value = taskToEdit.id;
        taskTitleInput.value = taskToEdit.title;
        taskDescriptionInput.value = taskToEdit.description;
        taskPriorityInput.value = taskToEdit.priority;

        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();

            taskToEdit.title = taskTitleInput.value.trim();
            taskToEdit.description = taskDescriptionInput.value.trim();
            taskToEdit.priority = taskPriorityInput.value;

            saveTasks(tasks);
            window.location.href = 'index.html';
        });
    };


    // --- INICIALIZADOR ---
    // Verifica o ID do body para chamar a função correta
    
    const page = document.body.id;
    if (page === 'page-index') {
        initIndexPage();
    } else if (page === 'page-add') {
        initAddPage();
    } else if (page === 'page-edit') {
        initEditPage();
    }

});