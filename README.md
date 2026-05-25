# Diário de Leitura Bayesiano (ODA)

## Objetivo do Projeto
Este é um Objeto Digital de Aprendizagem (ODA) criado para apoiar um Projeto de Leitura Física em sala de aula (6º ao 9º ano). 
Em vez de avaliar os alunos com testes de múltipla escolha ou resumos genéricos, o app atua como um diário interativo que utiliza um **Motor Adaptativo Bayesiano**. 
Ele analisa as respostas do aluno (comprimento, conectivos lógicos e sentimentos), calcula a probabilidade de "Leitura Profunda" e faz perguntas de "andaime" (fáceis) ou desafios críticos (avançados) dependendo do nível de engajamento detectado. 
Tudo isso é registrado em um Painel do Professor para avaliação qualitativa e pedagógica.

## Tecnologias Utilizadas (Tech Stack)
- **Frontend:** HTML5, JavaScript Vanilla (ES6+)
- **Estilização:** Tailwind CSS v3 (via CDN)
- **Design UI/UX:** Aestética "Paper/Livro" (Letterpress, Textura de Papel, Cores de Tinta e Couro, Glassmorphism Clássico)
- **Tipografia:** Google Fonts (Playfair Display, Lora)
- **Ícones:** Lucide Icons
- **Persistência de Dados:** `localStorage` do navegador (Não requer backend)

## Funcionalidades Principais
1. **Diário de Leitura:** Interface de chat adaptativa onde o algoritmo conversa com o aluno com base no nível calculado.
2. **Motor Bayesiano:** Analisa o texto e atualiza as probabilidades usando o Teorema de Bayes.
3. **Painel do Professor:** Protegido por senha (`admin`), exibe estatísticas gerais e a lista de alunos avaliados.
4. **Gerenciador de Acervo:** Permite ao professor adicionar os títulos de qualquer obra trabalhada.
5. **Relatórios:** Diagnóstico automático (Ex: Leitura Superficial vs Leitura Crítica) e botão para Exportar o Relatório do Aluno em formato `.txt`.

## Instruções de Execução (Setup/Run)
1. Não há necessidade de instalação via `npm` ou servidores complexos, pois o projeto não usa `node_modules`.
2. Basta abrir o arquivo `index.html` diretamente no seu navegador Chrome/Firefox preferido.
3. Para simular a experiência:
   - Cadastre um nome, selecione um livro e inicie a conversa.
   - Responda 3 vezes às perguntas para finalizar a sessão.
   - Atualize a página e clique no ícone superior direito (marcador de livro), digite a senha `admin`.
   - Veja seu próprio diagnóstico gerado pelo modelo bayesiano.

## Deployment
- Como é um Single Page Application estático focado no LocalStorage, você pode hospedá-lo gratuitamente na **Cloudflare Pages**, **Netlify**, **Vercel** ou até mesmo pelo **GitHub Pages**.

## Histórico de Modificações (Changelog)
- **v1.0.0 (Data: 25/05/2026)**:
  - Criação da Estrutura Base (Prompt 1).
  - Implementação do design temático "Livros e Papel" (UI Pro Max).
  - Geração de IA e aplicação de background estilizado vintage.
  - Implementação do Motor Bayesiano Dinâmico e Perguntas Universais (Prompt 2).
  - Criação do Painel do Professor, lógica de armazenamento LocalStorage e Exportação TXT (Prompt 3).
