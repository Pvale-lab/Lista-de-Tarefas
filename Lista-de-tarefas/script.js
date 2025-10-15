//  Espera Carregar
document.addEventListener('DOMContentLoaded', () => {
    
    // Função para buscar as tarefas salvas no navegador.
    const obterTarefas = () => {
        const tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
        // Retorna o array de tarefas.
        return tarefas;
    };

    // Salvar o array de tarefas .
    const salvarTarefas = (tarefas) => {
        localStorage.setItem('tarefas', JSON.stringify(tarefas));
    };


    // --- LISTAGEM ---

    const inicializarPaginaPrincipal = () => {
        // Pega os elementos do HTML pelos IDs.
        const listaTarefas = document.getElementById('lista-tarefas');
        const controlesFiltro = document.getElementById('controles-filtro');
        const inputBusca = document.getElementById('input-busca');
        
        // Inicia
        let filtroAtual = 'todas';
        let termoBusca = '';

        const renderizarTarefas = () => {
            // Limpa a lista de tarefas atual para não duplicar itens.
            listaTarefas.innerHTML = '';
            // Pega a lista de tarefas atualizada.
            let tarefas = obterTarefas();

            // Primeiro, filtra com base no status .
            const tarefasFiltradasPorStatus = tarefas.filter(tarefa => {
                if (filtroAtual === 'pendentes') return !tarefa.completed;
                if (filtroAtual === 'concluidas') return tarefa.completed;
                return true; // Se o filtro for 'todas', retorna todas as tarefas.
            });

            // Em seguida, filtra o resultado anterior com base no termo de busca.
            const tarefasFiltradasFinais = tarefasFiltradasPorStatus.filter(tarefa => 
                tarefa.title.toLowerCase().includes(termoBusca) || 
                (tarefa.description && tarefa.description.toLowerCase().includes(termoBusca))
            );

            // Se, após todos os filtros, o array de tarefas estiver vazio...
            if (tarefasFiltradasFinais.length === 0) {
                // Mostra uma mensagem na tela.
                listaTarefas.innerHTML = '<p style="text-align: center; color: #6c757d;">Nenhuma tarefa encontrada.</p>';
                return; // Encerra a função.
            }

            // Para cada tarefa que passou pelos filtros...
            tarefasFiltradasFinais.forEach(tarefa => {
                // Cria um novo elemento de lista <li>.
                const itemLista = document.createElement('li');
                // Adiciona as classes CSS. 
                itemLista.className = `item-tarefa ${tarefa.completed ? 'concluido' : ''} prioridade-${tarefa.priority}`;
                // Adiciona um 'data attribute' com o ID da tarefa para facilitar encontrá-la depois.
                itemLista.dataset.id = tarefa.id;

                // Define se o botão 'completar' deve estar desabilitado e qual texto de ajuda ('title') deve ter.
                const btnConcluirDesabilitado = tarefa.completed ? 'disabled' : '';
                const btnConcluirTitulo = tarefa.completed ? 'Tarefa Concluída' : 'Completar Tarefa';

                // Constrói o HTML do item com as novas classes em português.
                itemLista.innerHTML = `
                    <div class="conteudo-tarefa">
                        <div class="cabecalho-conteudo-tarefa">
                            <h3>${tarefa.title}</h3>
                            <span class="etiqueta-prioridade ${tarefa.priority}">${tarefa.priority}</span>
                        </div>
                        <p>${tarefa.description || ''}</p>
                    </div>
                    <div class="acoes-tarefa">
                        <button class="btn-completar" title="${btnConcluirTitulo}" ${btnConcluirDesabilitado}>
                            <i class="fas fa-check"></i>
                        </button>
                        <a href="edit.html?id=${tarefa.id}" class="btn-editar" title="Editar">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button class="btn-deletar" title="Remover">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                // Adiciona o novo item <li> à lista <ul> na página.
                listaTarefas.appendChild(itemLista);
            });
        };
        
        // Adiciona um  evento de clique na lista de tarefas.
        listaTarefas.addEventListener('click', (e) => {
            // Procura pelo elemento com a nova classe '.item-tarefa'.
            const itemTarefa = e.target.closest('.item-tarefa');
            if (!itemTarefa) return;

            const idDaTarefa = Number(itemTarefa.dataset.id);
            let tarefas = obterTarefas();
            let tarefaAlterada = false;

            // Verifica o clique no botão com a nova classe '.btn-completar'.
            if (e.target.closest('.btn-completar')) {
                const tarefa = tarefas.find(t => t.id === idDaTarefa);
                if (tarefa && !tarefa.completed) {
                    tarefa.completed = true;
                    tarefaAlterada = true;
                }
            }

            // Verifica o clique no botão com a nova classe '.btn-deletar'.
            if (e.target.closest('.btn-deletar')) {
                const tarefa = tarefas.find(t => t.id === idDaTarefa);
                if (tarefa && confirm(`Tem certeza que deseja remover a tarefa "${tarefa.title}"?`)) {
                    tarefas = tarefas.filter(t => t.id !== idDaTarefa);
                    tarefaAlterada = true;
                }
            }
            
            // Se alguma tarefa foi alterada, salva e redesenha a lista.
            if (tarefaAlterada) {
                salvarTarefas(tarefas);
                renderizarTarefas();
            }
        });

        // Adiciona um ouvinte de clique nos controles de filtro.
        controlesFiltro.addEventListener('click', (e) => {
            // Verifica se o clique foi em um '.btn-filtro'.
            if (!e.target.matches('.btn-filtro')) return;
            // Remove a classe '.ativo' de todos os botões.
            document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('ativo'));
            // Adiciona a classe '.ativo' ao botão clicado.
            e.target.classList.add('ativo');
            // Atualiza o filtro com o valor do 'data-filtro'.
            filtroAtual = e.target.dataset.filtro;
            renderizarTarefas();
        });

        // Adiciona um ouvinte de evento 'input' no campo de busca.
        inputBusca.addEventListener('input', (e) => {
            termoBusca = e.target.value.toLowerCase();
            renderizarTarefas();
        });

        // Chama a função para renderizar as tarefas assim que a página carrega.
        renderizarTarefas();
    };


    // --- LÓGICA DA PÁGINA DE ADICIONAR TAREFA --- 
    const inicializarPaginaAdicionar = () => {
        // Pega o formulário pelo novo ID.
        const formularioTarefa = document.getElementById('formulario-tarefa');
        formularioTarefa.addEventListener('submit', (e) => {
            e.preventDefault();
            // Pega os valores dos campos pelos novos IDs.
            const novaTarefa = { 
                id: Date.now(), 
                title: document.getElementById('tarefa-titulo').value.trim(), 
                description: document.getElementById('tarefa-descricao').value.trim(), 
                priority: document.getElementById('tarefa-prioridade').value, 
                completed: false 
            };
            const tarefas = obterTarefas();
            tarefas.unshift(novaTarefa); // Adiciona a nova tarefa no início da lista.
            salvarTarefas(tarefas);
            window.location.href = 'index.html'; // Redireciona para a página inicial.
        });
    };


    // --- LÓGICA DA PÁGINA DE EDITAR TAREFA --- 
    const inicializarPaginaEditar = () => {
        // Pega o formulário pelo novo ID.
        const formularioTarefa = document.getElementById('formulario-tarefa');
        const parametrosUrl = new URLSearchParams(window.location.search);
        const idDaTarefa = Number(parametrosUrl.get('id'));
        const tarefas = obterTarefas();
        const tarefaParaEditar = tarefas.find(t => t.id === idDaTarefa);

        if (!tarefaParaEditar) {
            alert('Tarefa não encontrada!');
            window.location.href = 'index.html';
            return;
        }

        // Preenche os campos do formulário usando os novos IDs.
        document.getElementById('tarefa-id').value = tarefaParaEditar.id;
        document.getElementById('tarefa-titulo').value = tarefaParaEditar.title;
        document.getElementById('tarefa-descricao').value = tarefaParaEditar.description;
        document.getElementById('tarefa-prioridade').value = tarefaParaEditar.priority;

        formularioTarefa.addEventListener('submit', (e) => {
            e.preventDefault();
            // Atualiza o objeto da tarefa com os dados dos campos (usando os novos IDs).
            tarefaParaEditar.title = document.getElementById('tarefa-titulo').value.trim();
            tarefaParaEditar.description = document.getElementById('tarefa-descricao').value.trim();
            tarefaParaEditar.priority = document.getElementById('tarefa-prioridade').value;
            salvarTarefas(tarefas);
            window.location.href = 'index.html';
        });
    };


    // --- INICIALIZADOR ---
    // Este bloco verifica qual página está aberta e chama a função de inicialização correta.
    const paginaAtual = document.body.id;
    if (paginaAtual === 'pagina-inicial') { inicializarPaginaPrincipal(); } 
    else if (paginaAtual === 'pagina-adicionar') { inicializarPaginaAdicionar(); } 
    else if (paginaAtual === 'pagina-editar') { inicializarPaginaEditar(); }
});