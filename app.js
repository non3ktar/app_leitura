document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Lucide Icons
    lucide.createIcons();

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
            li.className = "flex justify-between items-center p-3 bg-paper-50 rounded-md border border-paper-300 shadow-inner-paper";
            li.innerHTML = `
                <span class="font-display font-medium text-ink">${book.title}</span>
                <button onclick="removeBook('${book.id}', ${index})" class="text-red-700 hover:text-red-900 hover:bg-red-100 p-1 rounded transition-colors" title="Remover Livro">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            `;
            teacherBookList.appendChild(li);
        });
        lucide.createIcons();
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
            v.classList.remove('fade-in');
        });
        void views[viewName].offsetWidth;
        views[viewName].classList.remove('hidden');
        views[viewName].classList.add('fade-in');
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
        msgDiv.className = `flex w-full ${isApp ? 'justify-start' : 'justify-end'} opacity-0 translate-y-4 transition-all duration-500 ease-out`;
        
        const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        const innerDiv = document.createElement('div');
        
        const baseClasses = "max-w-[85%] md:max-w-[75%] p-5 shadow-sm border font-sans relative";
        const appClasses = "bg-paper-100 text-ink border-paper-300 rounded-sm rounded-tl-none";
        const userClasses = "bg-[#F4E9D8] text-ink border-[#E3D3B8] rounded-sm rounded-tr-none shadow-inner-paper";
        innerDiv.className = `${baseClasses} ${isApp ? appClasses : userClasses}`;
        
        const headerHTML = isApp 
            ? `<div class="text-[10px] font-display font-bold text-leather-dark mb-3 uppercase tracking-widest border-b border-paper-300 pb-1">Guia de Leitura</div>`
            : `<div class="text-[10px] font-display font-bold text-ink-light mb-3 uppercase tracking-widest border-b border-[#E3D3B8] pb-1">Sua Reflexão</div>`;

        innerDiv.innerHTML = `${headerHTML}<p class="text-[16px] leading-loose">${formattedText}</p>`;
        
        msgDiv.appendChild(innerDiv);
        chatContainer.appendChild(msgDiv);
        
        requestAnimationFrame(() => msgDiv.classList.remove('opacity-0', 'translate-y-4'));
        setTimeout(() => chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' }), 100);
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
        
        // Supabase já retorna ordenado por created_at desc se pedirmos
        allSessions.forEach((session, index) => {
            const diag = getDiagnosis(session.final_probability);
            const initials = session.student_name.substring(0,2).toUpperCase();
            
            const div = document.createElement('div');
            div.className = "p-4 bg-paper-50 rounded-md border border-paper-300 flex justify-between items-center hover:bg-paper-200 transition-colors cursor-pointer shadow-inner-paper";
            div.onclick = () => openReportModal(index);
            
            div.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full bg-paper-300 border border-paper-400 flex items-center justify-center text-sm font-display font-bold text-ink">${initials}</div>
                    <div>
                        <span class="font-medium font-display block text-ink text-lg">${session.student_name}</span>
                        <span class="text-sm text-ink-light italic">${session.book} - ${session.date}</span>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-xs px-3 py-1 ${diag.color} border rounded-sm font-medium uppercase tracking-wider font-display">${diag.text}</span>
                </div>
            `;
            teacherMetricsList.appendChild(div);
        });
    }

    let activeReportIndex = null;

    function openReportModal(index) {
        activeReportIndex = index;
        const session = allSessions[index];
        const diag = getDiagnosis(session.final_probability);
        
        let historyHTML = '';
        session.history.forEach((h, i) => {
            const probPct = (h.probabilityAfter * 100).toFixed(1);
            historyHTML += `
                <div class="border-l-2 border-leather pl-4 mb-6">
                    <p class="text-sm font-display font-bold text-leather-dark mb-1">Pergunta ${i+1}:</p>
                    <p class="text-ink text-sm mb-3 italic">${h.question.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>
                    <p class="text-sm font-display font-bold text-ink mb-1">Resposta do Aluno:</p>
                    <p class="text-ink p-3 bg-paper-200 rounded-sm shadow-inner-paper mb-2">${h.answer}</p>
                    <p class="text-xs text-ink-light text-right">Probabilidade Bayesiana após resposta: <span class="font-bold text-ink">${probPct}%</span></p>
                </div>
            `;
        });

        reportContent.innerHTML = `
            <div class="border-b border-paper-300 pb-4 mb-4">
                <h4 class="text-2xl font-display font-bold text-ink mb-1">${session.student_name}</h4>
                <p class="text-ink-light italic">${session.book} | Data: ${session.date}</p>
            </div>
            
            <div class="bg-paper-200 p-4 rounded-sm border border-paper-300 mb-6 flex justify-between items-center shadow-inner-paper">
                <div>
                    <span class="block text-xs uppercase tracking-widest text-ink-light font-display mb-1">Diagnóstico Final do Algoritmo</span>
                    <span class="font-display font-bold text-lg ${diag.color.split(' ')[0]}">${diag.text}</span>
                </div>
                <div class="text-right">
                    <span class="block text-xs uppercase tracking-widest text-ink-light font-display mb-1">Aproveitamento</span>
                    <span class="font-display font-bold text-2xl text-ink">${(session.final_probability * 100).toFixed(1)}%</span>
                </div>
            </div>
            
            <h5 class="font-display font-bold text-ink text-lg mb-4">Trajetória de Escrita</h5>
            ${historyHTML}
        `;
        
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
