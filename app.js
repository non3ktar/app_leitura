document.addEventListener('DOMContentLoaded', async () => {
    // Lucide was removed, using Material Symbols.
    
    // ----- SUPABASE CLIENT ----- //
    const SUPABASE_URL = 'https://zmiyiuhevujyxjcukdpe.supabase.co';
    const TEACHER_PASSWORD = 'Zk7!pL9x$Qe2';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptaXlpdWhldnVqeXhqY3VrZHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3Mjg0MjgsImV4cCI6MjA5NTMwNDQyOH0.fDzK49FEKXvCNs6X7RYv-qvj-eYJm7pVTbGZ5twvOR4';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // DOM Elements
    const views = {
        selection: document.getElementById('view-selection'),
        teacher: document.getElementById('view-teacher'),
        bayesian: document.getElementById('view-bayesian')
    };

    const inputStudentName = document.getElementById('student-name');
    const selectBook = document.getElementById('book-select');
    const btnTeacherPanel = document.getElementById('btn-teacher-panel');
    const btnBackTeacher = document.getElementById('btn-back-teacher');
    
    const btnBackBayesian = document.getElementById('btn-back-bayesian');

    // Teacher Panel DOM
    const inputNewBook = document.getElementById('new-book-input');
    const btnAddBook = document.getElementById('btn-add-book');
    const teacherBookList = document.getElementById('teacher-book-list');
    const teacherMetricsList = document.getElementById('teacher-metrics-list');
    
    // Modal DOM
    const helpModal = document.getElementById('help-modal');
    const btnHelp = document.getElementById('btn-help');
    const btnCloseHelp = document.getElementById('btn-close-help');
    
    const reportModal = document.getElementById('report-modal');
    const reportContent = document.getElementById('report-content');
    const btnCloseReport = document.getElementById('btn-close-report');
    const btnExportReport = document.getElementById('btn-export-report');

    // Elementos da Análise Bayesiana
    const btnStartBayesian = document.getElementById('btn-start-bayesian');
    const bayesianInput = document.getElementById('bayesian-input');
    const btnAnalyzeBayesian = document.getElementById('btn-analyze-bayesian');
    const bayesianResultArea = document.getElementById('bayesian-result-area');
    const bayesianDepthPercentage = document.getElementById('bayesian-depth-percentage');
    const bayesianDepthBar = document.getElementById('bayesian-depth-bar');
    const bayesianDiagnosis = document.getElementById('bayesian-diagnosis');
    const btnSaveBayesian = document.getElementById('btn-save-bayesian');

    // Abrir/Fechar Help Modal
    btnHelp.addEventListener('click', () => helpModal.classList.remove('hidden'));
    btnCloseHelp.addEventListener('click', () => helpModal.classList.add('hidden'));


    // Estado Global
    let currentBook = null;
    let currentStudent = null;
    let priorProb = 0.5; // Probabilidade inicial
    
    let currentSession = {
        student_name: "",
        book: "",
        date: "",
        history: [], 
        final_probability: 0.5,
        diagnosis: ""
    };

    let books = [];
    let allSessions = [];


    // ----- INTEGRAÇÃO SUPABASE ----- //
    
    async function loadBooks() {
        const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: true });
        if (!error && data) {
            books = data;
            renderBooks();
        }
    }

    async function loadSessions() {
        const { data, error } = await supabase.from('sessions').select('*').order('created_at', { ascending: false });
        if (!error && data) {
            allSessions = data;
            renderTeacherPanel();
        }
    }

    // Carrega dados iniciais da nuvem
    loadBooks();

    function renderBooks() {
        selectBook.innerHTML = '<option value="" disabled selected>Escolha um livro da lista...</option>';
        books.forEach((book) => {
            const opt = document.createElement('option');
            opt.value = book.id;
            opt.textContent = book.title;
            selectBook.appendChild(opt);
        });

        teacherBookList.innerHTML = '';
        books.forEach((book, index) => {
            const li = document.createElement('li');
            li.className = "flex justify-between items-center p-3 bg-surface rounded-xl border border-outline-variant shadow-sm";
            li.innerHTML = `
                <span class="font-body-md text-on-surface">${book.title}</span>
                <button onclick="removeBook('${book.id}', ${index})" class="text-error hover:bg-error-container hover:text-on-error-container p-2 rounded-full transition-colors flex items-center justify-center" title="Remover Livro">
                    <span class="material-symbols-outlined text-sm">delete</span>
                </button>
            `;
            teacherBookList.appendChild(li);
        });
    }

    btnAddBook.addEventListener('click', async () => {
        const title = inputNewBook.value.trim();
        
        if (!title) {
            alert('Por favor, digite o título do livro.');
            return;
        }

        const bookExists = books.find(b => b.title.toLowerCase() === title.toLowerCase());
        if (bookExists) {
            alert('Este livro já está no acervo.');
            return;
        }

        // Loading state
        btnAddBook.innerHTML = 'Salvando...';
        btnAddBook.disabled = true;
        
        try {
            const { data, error } = await supabase.from('books').insert([{ title }]).select();
            
            if (error) {
                console.error('Erro Supabase:', error);
                alert('Erro ao salvar o livro na nuvem: ' + error.message);
            } else if (data && data.length > 0) {
                books.push(data[0]);
                renderBooks();
                inputNewBook.value = '';
            }
        } catch (err) {
            console.error('Erro de requisição:', err);
            alert('Erro inesperado ao salvar.');
        } finally {
            btnAddBook.innerHTML = 'Adicionar Livro';
            btnAddBook.disabled = false;
        }
    });

    window.removeBook = async function(id, index) {
        if(confirm(`Tem certeza que deseja remover este livro da nuvem?`)) {
            await supabase.from('books').delete().eq('id', id);
            books.splice(index, 1);
            renderBooks();
        }
    }

    // ----- LÓGICA BAYESIANA ----- //
    function updateBayesianProbability(text) {
        text = text.toLowerCase();
        const isLong = text.length > 80;
        const connectives = ['porque', 'mas', 'contudo', 'por isso', 'portanto', 'embora', 'então', 'pois', 'entretanto', 'todavia', 'apesar', 'como', 'devido'];
        const hasConnectives = connectives.some(c => text.includes(c));
        const sentiments = ['triste', 'feliz', 'raiva', 'injustiça', 'medo', 'alegria', 'angústia', 'amor', 'ódio', 'pena', 'coragem', 'chorei', 'revolta', 'assustador', 'engraçado', 'chato', 'legal'];
        const hasSentiment = sentiments.some(s => text.includes(s));

        const pE_given_Profunda = (isLong ? 0.8 : 0.2) * (hasConnectives ? 0.85 : 0.3) * (hasSentiment ? 0.7 : 0.4);
        const pE_given_Superficial = (isLong ? 0.3 : 0.8) * (hasConnectives ? 0.2 : 0.7) * (hasSentiment ? 0.4 : 0.6);

        const likelihoodProfunda = pE_given_Profunda * priorProb;
        const likelihoodSuperficial = pE_given_Superficial * (1 - priorProb);
        
        priorProb = likelihoodProfunda / (likelihoodProfunda + likelihoodSuperficial);
        return priorProb;
    }

    function getDiagnosis(prob) {
        if (prob < 0.4) return { text: "Leitura Superficial", color: "text-red-800 bg-red-100 border-red-300" };
        if (prob < 0.7) return { text: "Necessita Estímulo", color: "text-amber-800 bg-amber-100 border-amber-300" };
        return { text: "Leitura Crítica Ativa", color: "text-green-800 bg-green-100 border-green-300" };
    }

    // ----- INTERFACE E CHAT ----- //
    function showView(viewName) {
        Object.values(views).forEach(v => {
            v.classList.add('hidden');
            v.classList.remove('fade-in', 'flex');
        });
        
        if(views[viewName]) {
            void views[viewName].offsetWidth;
            views[viewName].classList.remove('hidden');
            views[viewName].classList.add('fade-in', 'flex');
        }
    }

    function checkStartConditions() {
        const canStart = inputStudentName.value.trim() && selectBook.value;
        if(btnStartBayesian) btnStartBayesian.disabled = !canStart;
    }
    inputStudentName.addEventListener('input', checkStartConditions);
    selectBook.addEventListener('change', checkStartConditions);

    // --- NOVA LÓGICA: INICIAR ANÁLISE BAYESIANA ---
    let bayesianProbResult = 0.5;

    if(btnStartBayesian) {
        btnStartBayesian.addEventListener('click', () => {
            currentStudent = inputStudentName.value.trim();
            currentBook = selectBook.options[selectBook.selectedIndex].text;
            priorProb = 0.5; // Reset
            
            showView('bayesian');
            bayesianInput.value = '';
            bayesianResultArea.classList.add('hidden');
            bayesianResultArea.classList.remove('flex');
            bayesianDepthBar.style.width = '0%';
            bayesianDepthPercentage.innerText = '0%';
        });
    }

    if(btnAnalyzeBayesian) {
        btnAnalyzeBayesian.addEventListener('click', () => {
            const text = bayesianInput.value.trim();
            if(!text) return;
            
            bayesianProbResult = updateBayesianProbability(text);
            const probPct = Math.round(bayesianProbResult * 100);
            
            bayesianResultArea.classList.remove('hidden');
            bayesianResultArea.classList.add('flex');
            
            setTimeout(() => {
                bayesianDepthBar.style.width = `${probPct}%`;
                bayesianDepthPercentage.innerText = `${probPct}%`;
            }, 100);
            
            const diag = getDiagnosis(bayesianProbResult);
            bayesianDiagnosis.className = `text-center mt-2 p-3 rounded-lg font-label-md text-lg border ${diag.color}`;
            bayesianDiagnosis.innerText = diag.text;
        });
    }

    if(btnSaveBayesian) {
        btnSaveBayesian.addEventListener('click', async () => {
            const text = bayesianInput.value.trim();
            btnSaveBayesian.innerHTML = "Salvando...";
            btnSaveBayesian.disabled = true;
            
            const diagText = getDiagnosis(bayesianProbResult).text;
            
            const sessionData = {
                student_name: currentStudent,
                book: currentBook,
                date: new Date().toLocaleDateString('pt-BR'),
                history: [
                    { question: "Reflexão Bayesiana:", answer: text, probabilityAfter: bayesianProbResult }
                ],
                final_probability: bayesianProbResult,
                diagnosis: `Análise: ${diagText}`
            };
            
            const { error } = await supabase.from('sessions').insert([sessionData]);
            
            if(!error) {
                alert("Análise salva com sucesso no painel do professor!");
                showView('selection');
            } else {
                alert("Erro ao salvar: " + error.message);
            }
            
            btnSaveBayesian.innerHTML = `<span class="material-symbols-outlined">save</span> Salvar Resultado no Painel do Professor`;
            btnSaveBayesian.disabled = false;
        });
    }

    btnTeacherPanel.addEventListener('click', async () => {
        const pw = prompt('Acesso restrito. Senha do Professor (digite "admin"):');
        if (pw === TEACHER_PASSWORD) {
            teacherMetricsList.innerHTML = '<p class="text-ink-light italic p-4 text-center">Buscando dados na nuvem...</p>';
            showView('teacher');
            await loadSessions(); // Busca atualizada da nuvem
        } else if(pw !== null) {
            alert('Senha incorreta!');
        }
    });

    btnBackTeacher.addEventListener('click', () => showView('selection'));
    
    if(btnBackBayesian) {
        btnBackBayesian.addEventListener('click', () => {
            showView('selection');
        });
    }


    // ----- PAINEL DO PROFESSOR ----- //
    function updateMetrics(){
        const freeWritingSessions = allSessions.filter(s => s.diagnosis && s.diagnosis.startsWith('Humor:'));
        const bayesianSessions = allSessions.filter(s => s.diagnosis && s.diagnosis.startsWith('Análise:'));
        const guidedSessions = allSessions.filter(s => s.diagnosis === 'Papo com IA');

        // Active readings count: guided sessions
        const activeSpan = document.getElementById('active-readings-count');
        if(activeSpan) activeSpan.textContent = guidedSessions.length + bayesianSessions.length;

        // Free writing count
        const freeSpan = document.getElementById('free-writing-count');
        if(freeSpan) freeSpan.textContent = freeWritingSessions.length;

        // Average engagement: average final_probability * 100 (only bayesian analysis)
        let avg = 0;
        if(bayesianSessions.length > 0){
            const sum = bayesianSessions.reduce((acc,s)=>acc + (s.final_probability||0),0);
            avg = (sum/bayesianSessions.length)*100;
        }
        const avgSpan = document.getElementById('average-engagement');
        if(avgSpan) avgSpan.textContent = avg.toFixed(0)+'%';

        // Attention alerts: count of bayesian sessions with low probability (<0.4)
        const alerts = bayesianSessions.filter(s=> (s.final_probability||0) < 0.4).length;
        const alertsSpan = document.getElementById('attention-alerts');
        if(alertsSpan) alertsSpan.textContent = alerts;
    }
    // Call updateMetrics after loading sessions initially
    loadSessions().then(updateMetrics);

    function renderTeacherPanel() {
        teacherMetricsList.innerHTML = '';
        
        if(allSessions.length === 0) {
            teacherMetricsList.innerHTML = '<p class="text-ink-light italic p-4 text-center">Nenhum diário registrado ainda.</p>';
            return;
        }
        
                allSessions.forEach((session, index) => {
            const isFreeWriting = session.diagnosis && session.diagnosis.startsWith('Humor:');
            const isBayesian = session.diagnosis && session.diagnosis.startsWith('Análise:');
            let diag;
            if (isFreeWriting) {
                diag = { color: 'bg-secondary-container text-on-secondary-container', text: 'Escrita Livre' };
            } else if (isBayesian) {
                diag = getDiagnosis(session.final_probability);
            } else {
                diag = { color: 'bg-primary-container text-on-primary-container', text: 'Papo com IA' };
            }
            const initials = session.student_name.substring(0,2).toUpperCase();
            
            const div = document.createElement('div');
            div.className = "p-4 bg-surface rounded-xl border border-outline-variant flex justify-between items-center hover:bg-secondary-container transition-colors cursor-pointer shadow-sm";
            div.onclick = () => openReportModal(index);
            
            div.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-sm font-label-md font-bold text-on-primary-container">${initials}</div>
                    <div>
                        <span class="font-title-lg block text-on-surface">${session.student_name}</span>
                        <span class="text-sm text-on-surface-variant italic">${session.book} - ${session.date}</span>
                    </div>
                </div>
                <div class="flex items-center gap-3 text-right">
                    <span class="text-xs px-3 py-1 ${diag.color} border border-outline-variant rounded-full font-label-md uppercase tracking-wider">${diag.text}</span>
                    <button onclick="removeSession(event, '${session.id}', ${index})" class="text-error hover:bg-error-container hover:text-on-error-container p-2 rounded-full transition-colors" title="Apagar Diário">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                </div>
            `;
            teacherMetricsList.appendChild(div);
        });
    }

    window.removeSession = async function(e, id, index) {
        e.stopPropagation(); // Impede de abrir o modal ao clicar em excluir
        if(confirm(`Tem certeza que deseja apagar o diário deste aluno permanentemente?`)) {
            const { error } = await supabase.from('sessions').delete().eq('id', id);
            if(error) {
                alert("Erro ao excluir: " + error.message);
                return;
            }
            allSessions.splice(index, 1);
            renderTeacherPanel();
            updateMetrics();
        }
    }

    let activeReportIndex = null;

    function openReportModal(index) {
        activeReportIndex = index;
        const session = allSessions[index];
        const diag = getDiagnosis(session.final_probability);
        
        let historyHTML = '';
        const isFreeWriting = session.diagnosis && session.diagnosis.startsWith('Humor:');

        if (isFreeWriting) {
            historyHTML = `
                <div class="border-l-2 border-secondary pl-4 mb-6">
                    <p class="text-sm font-label-md text-secondary mb-1">📝 Relato de Escrita Livre Encantada</p>
                    <p class="text-on-surface p-4 bg-surface-container rounded-xl border border-outline-variant mb-2">${session.history[0].answer.replace(/\n/g, '<br>')}</p>
                </div>
            `;
            
            reportContent.innerHTML = `
                <div class="border-b border-outline-variant pb-4 mb-4">
                    <h4 class="text-[28px] font-headline-md text-primary mb-1">${session.student_name}</h4>
                    <p class="text-on-surface-variant italic font-body-md">${session.book} | Data: ${session.date}</p>
                </div>
                
                <div class="bg-secondary-container p-6 rounded-2xl border border-outline-variant mb-6 shadow-sm">
                    <span class="block text-xs uppercase tracking-widest text-on-secondary-container font-label-md mb-2 opacity-80">Detalhes da Escrita Livre</span>
                    <span class="font-headline-sm text-lg text-on-secondary-container block">${session.diagnosis}</span>
                </div>
                
                <div class="font-body-md">
                    ${historyHTML}
                </div>
            `;
        } else {
            session.history.forEach((h, i) => {
                const probPct = (h.probabilityAfter * 100).toFixed(1);
                historyHTML += `
                    <div class="border-l-2 border-primary pl-4 mb-6">
                        <p class="text-sm font-label-md text-primary mb-1">Pergunta ${i+1}:</p>
                        <p class="text-on-surface text-sm mb-3 italic">${h.question.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>
                        <p class="text-sm font-label-md text-on-surface mb-1">Resposta do Aluno:</p>
                        <p class="text-on-surface p-4 bg-surface-container rounded-xl border border-outline-variant mb-2">${h.answer.replace(/\n/g, '<br>')}</p>
                        <p class="text-xs text-on-surface-variant text-right">Profundidade Bayesiana Após Resposta: <span class="font-bold text-primary">${probPct}%</span></p>
                    </div>
                `;
            });

            reportContent.innerHTML = `
                <div class="border-b border-outline-variant pb-4 mb-4">
                    <h4 class="text-[28px] font-headline-md text-primary mb-1">${session.student_name}</h4>
                    <p class="text-on-surface-variant italic font-body-md">${session.book} | Data: ${session.date}</p>
                </div>
                
                <div class="bg-surface-container p-6 rounded-2xl border border-outline-variant mb-6 flex flex-col md:flex-row justify-between items-center shadow-sm">
                    <div class="mb-4 md:mb-0 text-center md:text-left">
                        <span class="block text-xs uppercase tracking-widest text-on-surface-variant font-label-md mb-1">Diagnóstico Final do Algoritmo</span>
                        <span class="font-headline-sm text-lg ${diag.color.split(' ')[0]}">${diag.text}</span>
                    </div>
                    <div class="text-center md:text-right">
                        <span class="block text-xs uppercase tracking-widest text-on-surface-variant font-label-md mb-1">Aproveitamento</span>
                        <span class="font-display-lg text-primary">${(session.final_probability * 100).toFixed(1)}%</span>
                    </div>
                </div>
                
                <div class="font-body-md">
                    ${historyHTML}
                </div>
            `;
        }
        
        reportModal.classList.remove('hidden');
    }

    btnCloseReport.addEventListener('click', () => {
        reportModal.classList.add('hidden');
    });

    btnExportReport.addEventListener('click', () => {
        if(activeReportIndex === null) return;
        const session = allSessions[activeReportIndex];
        const diag = getDiagnosis(session.final_probability);
        
        let txt = `RELATÓRIO DE LEITURA BAYESIANO\n`;
        txt += `===================================\n`;
        txt += `Aluno: ${session.student_name}\n`;
        txt += `Livro: ${session.book}\n`;
        txt += `Data: ${session.date}\n`;
        txt += `Diagnóstico: ${diag.text} (${(session.final_probability * 100).toFixed(1)}%)\n\n`;
        txt += `TRAJETÓRIA DE ESCRITA:\n`;
        txt += `-----------------------------------\n`;
        
        session.history.forEach((h, i) => {
            txt += `PERGUNTA ${i+1}:\n${h.question.replace(/\*\*(.*?)\*\*/g, '$1')}\n\n`;
            txt += `RESPOSTA:\n${h.answer}\n\n`;
            txt += `(Probabilidade atualizada para: ${(h.probabilityAfter * 100).toFixed(1)}%)\n`;
            txt += `-----------------------------------\n`;
        });
        
        const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Relatorio_${session.student_name.replace(/\s+/g, '_')}_${session.book.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

});
