# Diário de Leitura Bayesiano e Escrita Livre (ODA)

## Objetivo do Projeto
Este é um Objeto Digital de Aprendizagem (ODA) duplo, focado no acompanhamento de projetos de leitura física em sala de aula. Ele consolida duas abordagens pedagógicas em um único ecossistema:
1. **Diário Guiado (IA Bayesiana):** Atua como um tutor iterativo. Analisa o engajamento do aluno através de respostas textuais e aplica o Teorema de Bayes para calcular a "Profundidade de Leitura", direcionando o aluno com perguntas de "andaime" ou desafios analíticos.
2. **Escrita Livre (Diário Encantado):** Permite um espaço "zen" e não-avaliativo para o aluno registrar emoções e sentimentos de forma autoral, sem a pressão de algoritmos iterativos.

Tudo é salvo em nuvem e centralizado no **Painel do Professor**, permitindo análises quantitativas e qualitativas.

## Tecnologias Utilizadas (Tech Stack)
- **Frontend:** HTML5, JavaScript Vanilla (ES6+)
- **Estilização:** Tailwind CSS (via CDN) + CSS Puro para a Escrita Livre
- **Design UI/UX:** Material Design 3 (Google Stitch) / UI Pro Max (Glassmorphism sutil, transições fluidas)
- **Tipografia:** Inter, Libre Caslon Text, Spectral, Cinzel.
- **Ícones:** Material Symbols Outlined
- **Backend / Banco de Dados:** Supabase (PostgreSQL) com biblioteca cliente `@supabase/supabase-js`. 

## Funcionalidades Principais
- **Módulo de Leitura Guiada (`index.html`):** Motor de cálculo probabilístico do engajamento estudantil.
- **Módulo de Escrita Livre (`escritalivre.html`):** Registro de relatos textuais acoplado a seletor de "Humor" e nota (1 a 5 estrelas).
- **Gerenciamento Unificado de Acervo:** Títulos carregados em tempo real do banco de dados para ambas as interfaces.
- **Painel do Professor Avançado:** 
  - Protegido por senha.
  - Grade de Métricas separadas (Leituras Guiadas, Escritas Livres, Engajamento Médio e Alertas).
  - Modal dinâmico que exibe os relatórios formatados de acordo com a origem (Guiado ou Livre).

## Instruções de Execução (Setup/Run)
1. Não há dependências locais (`node_modules`). O app consome CDNs e o Supabase via API.
2. Basta iniciar um servidor local (ex: `Live Server` do VSCode) ou abrir `index.html` diretamente no navegador.
3. Para acesso ao Painel do Professor:
   - Clique no ícone de "Gráfico / Analytics" no topo direito da tela inicial.
   - A senha atual configurada no código é: `Zk7!pL9x$Qe2`

## Deployment
O projeto pode ser publicado livremente em provedores estáticos como **GitHub Pages**, Cloudflare Pages ou Netlify. O banco de dados (Supabase) gerencia a persistência de forma remota, permitindo que a aplicação frontend permaneça serverless.
- URL atual: GitHub Pages no repositório `non3ktar/app_leitura`.

## Histórico de Modificações (Changelog)
- **v1.0.0**: Criação da Estrutura Base com UI "Paper" e LocalStorage.
- **v2.0.0**: Migração massiva de Design System para o Google Stitch (Material Design 3). Introdução do banco de dados remoto Supabase substituindo o LocalStorage.
- **v2.1.0 (Atualização Maior - Maio/2026)**:
  - Fusão da aplicação de **Escrita Livre** (Diário Encantado) ao banco de dados Supabase da aplicação principal.
  - Criação de navegação unificada na tela inicial (`index.html`).
  - Atualização do motor do Painel do Professor para exibir relatórios da Escrita Livre lado a lado com os Relatórios Bayesianos.
  - Refatoração dos cálculos de Métricas (Engajamento Médio focado apenas nas leituras guiadas).
  - Correção Crítica de Conflito de Escopo Global (`window.supabase`).
- **v2.2.0 (Galeria de Leitores - Maio/2026)**:
  - Implementação da **Galeria de Leitores** (`galeria.html`) que exibe de forma gamificada o histórico de leitura da turma.
  - Geração automática de avatares baseados em seed usando a API DiceBear.
  - Distribuição automática de Insígnias e Títulos (Aprendiz, Aventureiro, Especialista, Mestre) dependendo da quantidade de livros lidos (base de dados Supabase).
  - UI Pro Max, Glassmorphism e Tema Escuro elegante para incentivar e engajar os alunos a lerem mais.
