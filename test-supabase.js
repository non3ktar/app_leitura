const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://zmiyiuhevujyxjcukdpe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptaXlpdWhldnVqeXhqY3VrZHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3Mjg0MjgsImV4cCI6MjA5NTMwNDQyOH0.fDzK49FEKXvCNs6X7RYv-qvj-eYJm7pVTbGZ5twvOR4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const currentSession = {
    student_name: 'Teste Local',
    book: 'Livro Teste',
    date: new Date().toLocaleDateString('pt-BR'),
    history: [{
      question: "📝 Relato de Escrita Livre Encantada",
      answer: "texto de teste texto de teste texto de teste",
      probabilityAfter: 0
    }],
    final_probability: 0.5,
    diagnosis: "Humor: Feliz | 5 Estrelas | 12 palavras."
  };

  const { data, error } = await supabase.from('sessions').insert([currentSession]).select();
  console.log('Error:', error);
  console.log('Data:', data);
}
test();
