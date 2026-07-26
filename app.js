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
        aura: document.getElementById('view-aura')
    };

    const inputStudentName = document.getElementById('student-name');
    const selectBook = document.getElementById('book-select');
    const btnTeacherPanel = document.getElementById('btn-teacher-panel');
    const btnBackTeacher = document.getElementById('btn-back-teacher');
    
    const btnBackAura = document.getElementById('btn-back-aura');

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
    const btnStartAura = document.getElementById('btn-start-aura');
    
    
    
    
    
    
    

    // Abrir/Fechar Help Modal
    btnHelp.addEventListener('click', () => helpModal.classList.remove('hidden'));
    btnCloseHelp.addEventListener('click', () => helpModal.classList.add('hidden'));


    
    // --- AURA STATE & QUESTIONS ---
    const playerDisplay = document.getElementById('playerDisplay');
    const playerAvatar = document.getElementById('playerAvatar');
    const auraScore = document.getElementById('auraScore');
    const chapterSelect = document.getElementById('chapterSelect');
    const questionText = document.getElementById('questionText');
    const expectedAnswer = document.getElementById('expectedAnswer');
    const studentAnswer = document.getElementById('studentAnswer');
    const btnSubmit = document.getElementById('btnSubmit');
    const evaluationArea = document.getElementById('evaluationArea');
    const autoFeedbackTitle = document.getElementById('autoFeedbackTitle');
    const autoFeedbackPoints = document.getElementById('autoFeedbackPoints');
    const autoFeedbackBox = document.getElementById('autoFeedbackBox');
    const autoFeedbackIcon = document.getElementById('autoFeedbackIcon');
    const auraPowerFill = document.getElementById('auraPowerFill');
    const sigmaRank = document.getElementById('sigmaRank');
    const completionModal = document.getElementById('completionModal');

    let playerData = { id: null, name: null, avatar: './farmador_nobg.png', aura: 0, history: [0] };
    let currentQuestion = 1;

    const auraQuestions = {
        1: { q: "(D1 - Info. Explícita) Para começarmos a farmar aura, transcreva um pequeno trecho do livro que descreve fisicamente ou psicologicamente a personagem principal.", a: "Espera-se que o aluno localize e copie um trecho literal do livro focado em características (adjetivos) do protagonista." },
        2: { q: "(D1 - Info. Explícita) De acordo com as primeiras páginas da leitura, onde e em que época a história principal acontece?", a: "O aluno deve identificar o tempo e espaço da narrativa de forma direta, baseado no início do texto." },
        3: { q: "(D4 - Info. Implícita) Lendo nas entrelinhas: com base nas atitudes do protagonista, o que podemos deduzir sobre suas verdadeiras intenções ou seus maiores medos?", a: "O aluno deve inferir informações que não estão escritas diretamente, usando pistas dadas pelo comportamento do personagem." },
        4: { q: "(D4 - Info. Implícita) Há algum mistério ou segredo não revelado diretamente pelo autor que você conseguiu pescar durante a leitura? Explique o que você descobriu.", a: "O aluno deve apontar uma dedução pessoal sobre o enredo, justificando sua inferência a partir do texto lido." },
        5: { q: "(D14 - Fato x Opinião) Escolha um acontecimento impactante do livro. Descreva o fato (o que realmente ocorreu) e depois dê a sua opinião sobre a atitude dos personagens nesse momento.", a: "O aluno deve separar nitidamente a ação (fato inquestionável) do seu julgamento moral (opinião)." },
        6: { q: "(D14 - Fato x Opinião) Identifique no texto um momento em que o narrador ou outro personagem expressa uma opinião forte sobre algo ou alguém. Transcreva e explique.", a: "Espera-se que o aluno encontre um trecho com marcas de subjetividade, julgamento ou adjetivação valorativa." },
        7: { q: "(D10 - Conflito) Todo bom livro tem um problema a ser resolvido. Qual é o conflito principal, o grande obstáculo que movimenta essa história?", a: "O aluno deve identificar o núcleo do enredo, a força ou problema que se opõe ao desejo dos protagonistas." },
        8: { q: "(D10 - Clímax) Qual foi a cena de maior tensão ou emoção do livro (o clímax)? Como você se sentiu lendo essa parte?", a: "O aluno deve relatar o momento de virada ou pico de tensão da obra, e expressar sua reação pessoal (engajamento)." },
        9: { q: "(D2 - Estabelecer Relações) Faça uma conexão: como um acontecimento que parecia sem importância no início da história se mostrou fundamental para o final?", a: "Espera-se uma análise estrutural do texto, ligando causa inicial com consequência final." },
        10: { q: "(D6 - Tema Central) Se você tivesse que resumir a mensagem principal (ou o tema) que o autor quis passar com esse livro em uma frase, qual seria?", a: "O aluno deve abstrair o assunto geral da obra, indo além dos personagens (ex: 'O tema é a corrupção do ser humano', etc)." },
        11: { q: "(D12 - Finalidade do Texto) Embora seja um texto literário focado no entretenimento, você acha que o autor escreveu essa história para fazer alguma crítica social ou passar algum ensinamento? Qual?", a: "Espera-se que o aluno identifique intenções secundárias do texto, como moral da história ou denúncia social." },
        12: { q: "(D13 - Marcas de Linguagem) Observe a linguagem do livro: há uso de gírias, palavras muito antigas ou sotaques regionais? Dê um exemplo de como os personagens falam.", a: "O aluno deve reconhecer as variações linguísticas presentes no livro (históricas, regionais ou sociais)." },
        13: { q: "(D15 - Relação Lógico-Discursiva) Encontre um momento em que uma ação gerou uma grande consequência na história (Causa e Consequência) e explique como uma coisa levou à outra.", a: "O aluno deve articular os fatos demonstrando a conexão lógica entre eventos sucessivos da narrativa." },
        14: { q: "(D11 - Relação entre Textos) Esse livro te lembrou de algum filme, série ou outro livro que você já leu? Faça uma comparação entre os dois.", a: "O aluno fará uma intertextualidade temática, comparando a obra atual com seu repertório cultural." },
        15: { q: "(D8 - Efeito de Sentido / Ironia) Aconteceu alguma situação irônica na história? (Algo que aconteceu exatamente ao contrário do que o personagem esperava). Conte como foi.", a: "Espera-se a identificação da quebra de expectativa ou de um acontecimento irônico na trama." },
        16: { q: "(D3 - Sentido de Palavras) Houve alguma palavra ou expressão curiosa/desconhecida que você aprendeu com esse livro pelo contexto da frase? Qual era e o que significa?", a: "O aluno deve demonstrar dedução do significado de vocabulário pelo contexto em que foi empregado." },
        17: { q: "(D4 - Inferência de Humor) Qual cena do livro você achou mais engraçada ou bizarra? O que o autor fez para deixar essa cena com esse tom?", a: "Espera-se que o aluno descreva os recursos (exagero, quebra de expectativa) usados para criar humor ou estranheza." },
        18: { q: "(D10 - Desfecho) Como o grande problema da história foi resolvido? Você mudaria algo nesse final se fosse o autor?", a: "O aluno deve sintetizar o desfecho da narrativa e demonstrar engajamento crítico com o final." },
        19: { q: "(D14 - Fato x Opinião) Se você pudesse entrar na história e dar um conselho final ao protagonista baseado no que aconteceu, o que você diria?", a: "O aluno posiciona sua opinião pessoal sobre a jornada do personagem, avaliando suas atitudes." },
        20: { q: "(Síntese Final) Para platinar sua Aura e ganhar o certificado: por que o próximo leitor da escola deveria (ou não) escolher este mesmo livro para ler?", a: "O aluno formula um argumento final, atuando como crítico literário e recomendando a obra a seus pares." }
    };

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
        if(btnStartAura) btnStartAura.disabled = !canStart;
    }
    inputStudentName.addEventListener('input', checkStartConditions);
    selectBook.addEventListener('change', checkStartConditions);

    
    // --- FLUXO DA AURA ---
    if(btnStartAura) {
        btnStartAura.addEventListener('click', () => {
            currentStudent = inputStudentName.value.trim();
            currentBook = selectBook.options[selectBook.selectedIndex].text;
            
            playerData.name = currentStudent;
            playerData.aura = 0;
            playerData.history = [0];
            currentQuestion = 1;

            initAuraUI();
            showView('aura');
        });
    }

    function updateAuraUI() {
        if(!playerDisplay) return;
        playerDisplay.innerText = playerData.name;
        auraScore.innerText = playerData.aura;
        
        let rank = "Iniciante";
        let color = "from-slate-400 to-slate-200";
        if (playerData.aura > 100) { rank = "Leitor Ávido"; color = "from-green-400 to-emerald-300"; }
        if (playerData.aura > 300) { rank = "Explorador"; color = "from-blue-400 to-cyan-300"; }
        if (currentQuestion > 20) { rank = "MESTRE DA AURA"; color = "from-yellow-400 to-amber-200"; }
        
        sigmaRank.innerText = rank;
        sigmaRank.className = `text-xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r ${color} mb-1 uppercase tracking-[0.2em] drop-shadow-lg text-center transition-all duration-500`;
        
        const pct = Math.min(((currentQuestion-1) / 20) * 100, 100);
        auraPowerFill.style.width = pct + "%";
    }

    function initAuraUI() {
        chapterSelect.innerHTML = "";
        for (let i = 1; i <= 20; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `Questão ${i} / 20`;
            chapterSelect.appendChild(opt);
        }
        loadQuestion();
        updateAuraUI();
    }

    chapterSelect.addEventListener('change', (e) => {
        currentQuestion = parseInt(e.target.value);
        loadQuestion();
    });

    function loadQuestion() {
        const q = auraQuestions[currentQuestion];
        if(!q) return;
        document.getElementById('questionArea').classList.remove('hidden');
        document.getElementById('welcomeArea').classList.add('hidden');
        questionText.innerHTML = q.q;
        studentAnswer.value = '';
        evaluationArea.classList.add('hidden');
        studentAnswer.disabled = false;
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span>Verificar Resposta</span><span class="material-symbols-outlined ml-2">arrow_forward</span>`;
        chapterSelect.value = currentQuestion;
    }

    btnSubmit.addEventListener('click', async () => {
        const ans = studentAnswer.value.trim();
        if (ans.length < 20) {
            alert("Sua resposta está muito curta. Desenvolva melhor seus argumentos (mínimo 20 letras) para farmar Aura!");
            return;
        }

        studentAnswer.disabled = true;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="animate-pulse">Analisando...</span>`;

        await new Promise(r => setTimeout(r, 1000));

        let points = 50;
        
        playerData.aura += points;
        playerData.history.push(playerData.aura);
        
        evaluationArea.classList.remove('hidden');
        autoFeedbackTitle.innerText = "Resposta Aceita!";
        autoFeedbackTitle.className = "text-xl font-display font-bold text-emerald-400 tracking-wide";
        autoFeedbackPoints.innerText = `+${points}`;
        autoFeedbackPoints.className = "text-3xl font-black font-display text-emerald-400 drop-shadow-md";
        autoFeedbackBox.className = "absolute top-0 left-0 w-1 h-full bg-emerald-500";
        autoFeedbackIcon.innerText = "✅";
        
        const q = auraQuestions[currentQuestion];
        expectedAnswer.innerHTML = q.a;
        
        updateAuraUI();

        const anim = document.getElementById('animContainer');
        if(anim) {
            anim.textContent = `+${points} AURA!`;
            anim.className = `absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-5xl font-display font-black pointer-events-none z-50 drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] text-emerald-400 animate-float-up`;
            anim.style.opacity = '1';
            
            setTimeout(async () => {
                anim.style.opacity = '0';
                anim.classList.remove('animate-float-up');
                
                const sessionData = {
                    student_name: currentStudent,
                    book: currentBook,
                    date: new Date().toISOString().split('T')[0],
                    history: playerData.history,
                    final_probability: playerData.aura,
                    diagnosis: "Nível: " + sigmaRank.innerText + " (Questão " + currentQuestion + ")"
                };
                await supabase.from('sessions').insert([sessionData]);
                
                if (currentQuestion < 20) {
                    currentQuestion++;
                    chapterSelect.value = currentQuestion;
                    loadQuestion();
                } else {
                    if(completionModal) { completionModal.classList.remove('hidden'); setTimeout(() => completionModal.classList.remove('opacity-0'), 10); btnSubmit.innerHTML = `<span>Finalizado!</span>`; }
                }
            }, 1500);
        }
    });

    window.closeLeaderboard = () => document.getElementById('leaderboardModal')?.classList.add('hidden');
    window.openLeaderboard = async () => {
        document.getElementById('leaderboardModal')?.classList.remove('hidden');
        const list = document.getElementById('leaderboardList');
        if(list) list.innerHTML = '<div class="absolute inset-0 flex items-center justify-center text-slate-500">Carregando...</div>';
        
        const { data, error } = await supabase.from('sessions').select('*').order('final_probability', { ascending: false }).limit(50);
        
        if(list) {
            list.innerHTML = '';
            if(error || !data || data.length === 0) {
                list.innerHTML = '<div class="text-center text-slate-400 mt-4">Nenhum jogador encontrado.</div>';
                return;
            }
            const uniqueMap = {};
            data.forEach(p => {
                if(!uniqueMap[p.student_name] || uniqueMap[p.student_name].final_probability < p.final_probability) {
                    uniqueMap[p.student_name] = p;
                }
            });
            const uniqueArr = Object.values(uniqueMap).sort((a,b) => b.final_probability - a.final_probability);
            
            uniqueArr.forEach((p, idx) => {
                const isPlatinado = p.final_probability >= 1000;
                const borderClass = isPlatinado ? 'border-yellow-400/50 bg-yellow-900/20' : 'border-white/5 bg-dark-800/50';
                const scoreColor = isPlatinado ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'text-brand-300';
                const badge = isPlatinado ? '<span class="text-[10px] bg-yellow-500 text-black font-bold px-2 py-1 rounded ml-2 shadow-[0_0_10px_rgba(234,179,8,0.5)]">🎖️ PLATINADO</span>' : '';
                
                const div = document.createElement('div');
                div.className = `flex items-center justify-between p-4 mb-2 rounded-xl ${borderClass} hover:bg-white/10 transition-colors border`;
                div.innerHTML = `
                    <div class="flex items-center gap-4">
                        <span class="text-2xl font-black text-slate-600 w-6">${idx + 1}</span>
                        <span class="text-xl">👤</span>
                        <div>
                            <div class="font-bold text-white flex items-center">${p.student_name} ${badge}</div>
                            <div class="text-xs text-brand-400">${p.book}</div>
                        </div>
                    </div>
                    <div class="text-xl font-black ${scoreColor}">${p.final_probability} ⚡</div>
                `;
                list.appendChild(div);
            });
        }
    };

    if(btnBackAura) {
        btnBackAura.addEventListener('click', () => {
            showView('selection');
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
            
            const isPlatinado = session.final_probability >= 1000 && !isFreeWriting && !isBayesian && session.diagnosis?.startsWith('Nível:');
            
            const div = document.createElement('div');
            let borderClass = isPlatinado ? 'border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)] bg-surface-bright' : 'border border-outline-variant bg-surface';
            div.className = `p-4 rounded-xl flex justify-between items-center hover:bg-secondary-container transition-all cursor-pointer ${borderClass}`;
            div.onclick = () => openReportModal(index);
            
            const platinadoBadge = isPlatinado ? '<span class="text-xs ml-2 bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold shadow-sm">🎖️ PLATINOU</span>' : '';
            
            div.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-sm font-label-md font-bold text-on-primary-container">${initials}</div>
                    <div>
                        <span class="font-title-lg block text-on-surface flex items-center">${session.student_name} ${platinadoBadge}</span>
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


    window.gerarCertificado = async () => {
        const btn = document.getElementById('btnDownloadCert');
        const status = document.getElementById('certStatus');
        if(!btn || !status) return;
        
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
        status.classList.remove('hidden');

        try {
            const certName = document.getElementById('certStudentName');
            // Use playerData.name or the input field fallback
            const name = playerData.name || (document.getElementById('student-name') ? document.getElementById('student-name').value.trim() : "Jogador");
            if(certName) certName.innerText = name;
            
            const template = document.getElementById('certificateTemplate');
            if(!template) throw new Error("Template do certificado não encontrado no HTML!");
            
            const canvas = await html2canvas(template, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('l', 'mm', 'a4');
            
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
            
            const safeName = name.replace(/\s+/g, '_');
            pdf.save(`Certificado_Aura_${safeName}.pdf`);
            
            status.innerText = "Certificado Baixado com Sucesso! 🎓";
            status.classList.replace('text-yellow-400', 'text-emerald-400');
        } catch (err) {
            console.error(err);
            status.innerText = "Erro ao gerar PDF. Verifique o console.";
            status.classList.replace('text-yellow-400', 'text-rose-500');
        } finally {
            setTimeout(() => {
                btn.disabled = false;
                btn.classList.remove('opacity-50', 'cursor-not-allowed');
                status.classList.add('hidden');
                status.innerText = "Gerando seu diploma...";
                status.classList.remove('text-emerald-400', 'text-rose-500');
                status.classList.add('text-yellow-400');
            }, 3000);
        }
    };
});
