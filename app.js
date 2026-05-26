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
        diary: document.getElementById('view-diary'),
        teacher: document.getElementById('view-teacher')
    };

    const inputStudentName = document.getElementById('student-name');
    const selectBook = document.getElementById('book-select');
    const btnStart = document.getElementById('btn-start-diary');
    
    const btnTeacherPanel = document.getElementById('btn-teacher-panel');
    const btnBackTeacher = document.getElementById('btn-back-teacher');
    
    const chatContainer = document.getElementById('chat-container');
    const diaryInput = document.getElementById('diary-input');
    const btnSend = document.getElementById('btn-send');

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
    
    const stickyInputArea = document.getElementById('sticky-input-area');
    const depthPercentage = document.getElementById('depth-percentage');
    const depthBar = document.getElementById('depth-bar');

    // Abrir/Fechar Help Modal
    btnHelp.addEventListener('click', () => helpModal.classList.remove('hidden'));
    btnCloseHelp.addEventListener('click', () => helpModal.classList.add('hidden'));


    // Estado Global
    let currentBook = null;
    let currentStudent = null;
    let priorProb = 0.5; // Probabilidade inicial
    let questionsAsked = 0; 
    let currentQuestionText = "";
    
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

    // Perguntas Universais (Curingas)
    const genericQuestions = {
        facil: [
            "Qual personagem dessa história mais chamou sua atenção até agora e por quê?",
            "Teve alguma parte que você achou engraçada, estranha ou triste? O que aconteceu?",
            "Se você estivesse no lugar do protagonista, você teria tomado a mesma atitude?",
            "Qual é o cenário ou lugar dessa história que você achou mais interessante?",
            "Como você acha que a história vai terminar? Me conta sua teoria."
        ],
        avancado: [
            "Se você pudesse analisar as decisões do protagonista sob a ótica dos problemas reais da nossa sociedade, o que você diria?",
            "Como o ambiente em que a história se passa afeta os valores ou a moralidade dos personagens?",
            "Você percebe alguma crítica social escondida (ou escancarada) que o autor tentou transmitir na obra?",
            "De que maneira a falta de comunicação ou os segredos entre os personagens geram os conflitos da história?",
            "Acredita que o dilema enfrentado nesta obra tem alguma solução fácil na vida real? Justifique sua resposta."
        ]
    };

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
        
        if (stickyInputArea) {
            if (viewName === 'diary') stickyInputArea.classList.remove('hidden');
            else stickyInputArea.classList.add('hidden');
        }
    }

    function checkStartConditions() {
        btnStart.disabled = !(inputStudentName.value.trim() && selectBook.value);
    }
    inputStudentName.addEventListener('input', checkStartConditions);
    selectBook.addEventListener('change', checkStartConditions);

    btnStart.addEventListener('click', () => {
        currentStudent = inputStudentName.value.trim();
        currentBook = selectBook.options[selectBook.selectedIndex].text;
        priorProb = 0.5; 
        questionsAsked = 0;
        
        currentSession = {
            student_name: currentStudent,
            book: currentBook,
            date: new Date().toLocaleDateString('pt-BR'),
            history: [],
            final_probability: 0.5,
            diagnosis: ""
        };

        if(depthBar) depthBar.style.width = '50%';
        if(depthPercentage) depthPercentage.innerText = '50%';

        showView('diary');
        btnSend.disabled = false;
        diaryInput.disabled = false;
        diaryInput.placeholder = "Escreva o que você sentiu, pensou ou imaginou...";
        initChat();
    });

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

    btnBackTeacher.addEventListener('click', () => showView(currentStudent ? 'diary' : 'selection'));

    diaryInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight < 160 ? this.scrollHeight : 160) + 'px';
        if(this.value === '') this.style.height = 'auto';
    });

    function getNextQuestion(probLevel) {
        const isAdvanced = probLevel >= 0.6;
        const list = isAdvanced ? genericQuestions.avancado : genericQuestions.facil;
        const qIndex = questionsAsked % list.length;
        return list[qIndex];
    }

    function addMessage(sender, text) {
        const msgDiv = document.createElement('div');
        const isApp = sender === 'app';
        
        const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        
        if (isApp) {
            msgDiv.className = `flex flex-col gap-2 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700`;
            msgDiv.innerHTML = `
                <div class="flex items-center gap-2 mb-1">
                    <div class="w-6 h-6 bg-primary-container rounded-full flex items-center justify-center">
                        <span class="material-symbols-outlined text-[14px] text-on-primary">auto_awesome</span>
                    </div>
                    <span class="font-label-md text-label-md text-primary font-semibold">Tutor Literário</span>
                </div>
                <div class="chat-bubble-ai px-4">
                    <p class="font-body-md text-body-md text-on-surface-variant">${formattedText}</p>
                </div>
            `;
        } else {
            msgDiv.className = `flex flex-col gap-2 max-w-3xl ml-auto text-right animate-in fade-in slide-in-from-bottom-4 duration-500`;
            msgDiv.innerHTML = `
                <div class="flex items-center gap-2 mb-1 justify-end">
                    <span class="font-label-md text-label-md text-secondary font-semibold">Sua Reflexão</span>
                    <div class="w-6 h-6 bg-secondary-container rounded-full flex items-center justify-center">
                        <span class="material-symbols-outlined text-[14px] text-on-secondary-container">person</span>
                    </div>
                </div>
                <div class="bg-surface-container border border-outline-variant p-4 rounded-xl shadow-sm text-left">
                    <p class="font-body-md text-body-md text-on-surface">${formattedText}</p>
                </div>
            `;
        }
        
        chatContainer.appendChild(msgDiv);
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    }

    function initChat() {
        chatContainer.innerHTML = '';
        currentQuestionText = `Olá, ${currentStudent}! Que bom te ver por aqui. Vejo que você está lendo **"${currentBook}"**.\n\nPara começarmos, qual parte desse livro mexeu mais com os seus sentimentos ou chamou sua atenção até agora?`;
        setTimeout(() => addMessage('app', currentQuestionText), 500);
        btnSend.addEventListener('click', handleSend);
        // Update teacher metrics after any new session is saved
        const originalHandleSend = handleSend;
        handleSend = async function() {
            await originalHandleSend();
            // After session possibly saved, refresh metrics
            await loadSessions();
            updateMetrics();
        };
    }

    diaryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    async function handleSend() {
        const text = diaryInput.value.trim();
        if (!text) return;

        addMessage('user', text);
        diaryInput.value = '';
        diaryInput.style.height = 'auto';
        
        const newProb = updateBayesianProbability(text);
        
        // --- NEW: Animate Depth Bar --- //
        const newProbPct = Math.round(newProb * 100);
        if(depthBar) depthBar.style.width = `${newProbPct}%`;
        if(depthPercentage) {
            depthPercentage.innerText = `${newProbPct}%`;
            depthPercentage.classList.add('scale-125');
            setTimeout(() => depthPercentage.classList.remove('scale-125'), 300);
        }
        // ----------------------------- //
        
        currentSession.history.push({
            question: currentQuestionText,
            answer: text,
            probabilityAfter: newProb
        });

        const nextQ = getNextQuestion(newProb);
        questionsAsked++;

        setTimeout(async () => {
            let feedback = newProb >= 0.6 
                ? "*Que análise interessante! Vejo que você está refletindo profundamente.* \n\n"
                : "*Obrigado por compartilhar. Vamos pensar um pouco mais:* \n\n";
            
            if (questionsAsked > 2) {
                // Finaliza a sessão e salva no Supabase
                addMessage('app', "*Salvando seus registros na nuvem... aguarde.*");
                btnSend.disabled = true;
                diaryInput.disabled = true;
                
                currentSession.final_probability = newProb;
                currentSession.diagnosis = getDiagnosis(newProb).text;
                
                const { error } = await supabase.from('sessions').insert([currentSession]);
                // After inserting, update metrics
                // (Metrics will be refreshed after handleSend wrapper)
                
                if (!error) {
                    addMessage('app', "Muito obrigado por compartilhar suas ideias! O registro do seu diário de hoje foi salvo com sucesso. Pode fechar o app e até a próxima leitura!");
                    diaryInput.placeholder = "Diário salvo e concluído por hoje.";
                } else {
                    addMessage('app', "Houve um erro ao salvar na nuvem. Mas não se preocupe, o professor foi notificado.");
                    console.error(error);
                }
                
            } else {
                currentQuestionText = feedback + nextQ;
                addMessage('app', currentQuestionText);
            }
        }, 1500);
    }

    // ----- PAINEL DO PROFESSOR ----- //
    function updateMetrics(){
        // Active readings count: total sessions
        const activeCount = allSessions.length;
        const activeSpan = document.getElementById('active-readings-count');
        if(activeSpan) activeSpan.textContent = activeCount;
        // Average engagement: average final_probability *100
        let avg = 0;
        if(activeCount>0){
            const sum = allSessions.reduce((acc,s)=>acc + (s.final_probability||0),0);
            avg = (sum/activeCount)*100;
        }
        const avgSpan = document.getElementById('average-engagement');
        if(avgSpan) avgSpan.textContent = avg.toFixed(0)+'%';
        // Attention alerts: count of sessions with low probability (<0.4)
        const alerts = allSessions.filter(s=> (s.final_probability||0) < 0.4).length;
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
            const diag = isFreeWriting ? { color: 'bg-secondary-container text-on-secondary-container', text: 'Escrita Livre' } : getDiagnosis(session.final_probability);
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
