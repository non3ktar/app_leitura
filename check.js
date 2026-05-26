// Stars
(function() {
  const bg = document.getElementById('stars-bg');
  for (let i = 0; i < 120; i++) {
    const s = document.createElement('div');
    s.className = 'star-dot';
    const size = Math.random() < 0.15 ? 2.5 : (Math.random() < 0.4 ? 1.5 : 1);
    s.style.cssText = `
      width:${size}px; height:${size}px;
      top:${Math.random()*100}%;
      left:${Math.random()*100}%;
      --d:${2+Math.random()*4}s;
      --delay:-${Math.random()*5}s;
      --op:${0.4+Math.random()*0.6};
    `;
    bg.appendChild(s);
  }
})();

// State
let rating = 0;
let mood = '';
const entries = [];

// Mood buttons
document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mood = btn.dataset.mood;
  });
});

// Star rating
const starBtns = document.querySelectorAll('.star-btn');
const starLabel = document.getElementById('star-label');
const labels = ['', 'Não gostei', 'Mais ou menos', 'Gostei', 'Muito bom!', 'Incrível! ★'];
starBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    rating = +btn.dataset.val;
    starBtns.forEach(b => b.classList.toggle('lit', +b.dataset.val <= rating));
    starLabel.textContent = labels[rating] || '';
  });
  btn.addEventListener('mouseenter', () => {
    const v = +btn.dataset.val;
    starBtns.forEach(b => b.style.color = +b.dataset.val <= v ? '#d4a83a' : '');
  });
  btn.addEventListener('mouseleave', () => {
    starBtns.forEach(b => b.style.color = +b.dataset.val <= rating ? '#d4a83a' : '');
  });
});

// --- SUPABASE CLIENT ---
const SUPABASE_URL = 'https://zmiyiuhevujyxjcukdpe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptaXlpdWhldnVqeXhqY3VrZHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3Mjg0MjgsImV4cCI6MjA5NTMwNDQyOH0.fDzK49FEKXvCNs6X7RYv-qvj-eYJm7pVTbGZ5twvOR4';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Load books from Supabase
async function loadBooks() {
  const select = document.getElementById('book-select');
  
  // Spinner animation for the option text
  let dots = 0;
  const spinnerInterval = setInterval(() => {
    dots = (dots + 1) % 4;
    select.innerHTML = `<option value="">— Carregando acervo da turma${'*'.repeat(dots)} —</option>`;
  }, 400);

  try {
    console.log("Iniciando carregamento do acervo...");
    const { data: books, error } = await supabase.from('books').select('*').order('created_at', { ascending: true });
    console.log("Acervo recebido:", books, error);
    
    clearInterval(spinnerInterval);
    
    select.innerHTML = '<option value="" disabled selected>— Escolha o livro —</option>';
    
    if (error) {
      console.error(error);
      select.innerHTML = '<option value="">Erro ao carregar livros. Tente F5.</option>';
      return;
    }

    if (books && books.length > 0) {
      books.forEach(book => {
        const opt = document.createElement('option');
        opt.value = book.title;
        opt.textContent = book.title;
        select.appendChild(opt);
      });
    } else {
      select.innerHTML = '<option value="" disabled selected>Nenhum livro cadastrado pelo professor.</option>';
    }
  } catch(err) {
    clearInterval(spinnerInterval);
    select.innerHTML = '<option value="">Falha na conexão.</option>';
  }
}
loadBooks();

// Word count
const area = document.getElementById('writing-area');
const wc = document.getElementById('wc');
area.addEventListener('input', () => {
  const words = area.value.trim() ? area.value.trim().split(/\s+/).length : 0;
  wc.textContent = `${words} palavra${words !== 1 ? 's' : ''}`;
});

// Submit
document.getElementById('btn-submit').addEventListener('click', async () => {
  const btn = document.getElementById('btn-submit');
  const name = document.getElementById('student-name').value.trim();
  const cls  = document.getElementById('student-class').value.trim();
  const book = document.getElementById('book-select').value;
  const text = area.value.trim();
  
  if (!name) { alert('Por favor, escreva seu nome antes de guardar.'); return; }
  if (!book) { alert('Escolha o livro que você leu.'); return; }
  if (text.length < 10) { alert('Escreva um pouco mais antes de guardar. Este diário é seu!'); return; }

  btn.disabled = true;
  btn.textContent = "Guardando...";

  const finalDiagnosis = `Humor: ${mood || '✨'} | ${rating > 0 ? rating + ' Estrelas' : 'Sem nota'} | ${text.split(/\s+/).length} palavras.`;

  const currentSession = {
    student_name: `${name} ${cls ? '('+cls+')' : ''}`.trim(),
    book: book,
    date: new Date().toLocaleDateString('pt-BR'),
    history: [{
      question: "📝 Relato de Escrita Livre Encantada",
      answer: text,
      probabilityAfter: 0
    }],
    final_probability: 0.5,
    diagnosis: finalDiagnosis
  };

  const { error } = await supabase.from('sessions').insert([currentSession]);
  
  btn.disabled = false;
  btn.textContent = "✦ Guardar no Diário ✦";

  if(error) {
      alert("Houve uma falha mágica ao tentar guardar. Tente novamente!");
      console.error(error);
      return;
  }

  // Show confirmation
  document.getElementById('write-card').style.display = 'none';
  const c = document.getElementById('confirm');
  c.classList.add('show');
  
  // Add to local list visually
  const list = document.getElementById('entries-list');
  if(list.querySelector('.no-entries')) list.innerHTML = '';
  list.innerHTML = `
    <div class="entry-card">
      <div class="entry-meta">
        <div>
          <span class="entry-author">${currentSession.student_name}</span>
          <br><span class="entry-book">Livro: ${currentSession.book}</span>
        </div>
        <div>
          <span class="entry-mood">${mood || '✨'}</span>
          <br><div class="entry-stars">${'★'.repeat(rating)}${'☆'.repeat(5-rating)}</div>
        </div>
      </div>
      <div class="entry-text">${text}</div>
      <div class="entry-date">${currentSession.date}</div>
    </div>
  ` + list.innerHTML;
});

document.getElementById('btn-new').addEventListener('click', () => {
  document.getElementById('confirm').classList.remove('show');
  document.getElementById('write-card').style.display = 'block';
  document.getElementById('writing-area').value = '';
  document.getElementById('student-name').value = '';
  document.getElementById('student-class').value = '';
  document.getElementById('book-select').value = '';
  rating = 0; mood = '';
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.star-btn').forEach(b => { b.classList.remove('lit'); b.style.color = ''; });
  document.getElementById('star-label').textContent = 'Toque nas estrelas para avaliar';
  document.getElementById('wc').textContent = '0 palavras';
});
