# Matchcvats


# 💜 MatchCV — Matchmaking de Vagas e Otimização de Currículos ATS

**Encontre oportunidades compatíveis com seu perfil e adapte seu currículo para cada vaga.**

O MatchCV é uma aplicação web desenvolvida com o objetivo de ajudar candidatos a identificar oportunidades profissionais compatíveis com suas qualificações e criar versões personalizadas de seus currículos, seguindo boas práticas de compatibilidade com sistemas ATS (*Applicant Tracking Systems*).

🔗 **Aplicação publicada:** https://matchcvats.lovable.app

---

## 🎯 1. Problema que a aplicação resolve

Muitos candidatos enviam o mesmo currículo para diferentes oportunidades de emprego, sem considerar que cada vaga possui requisitos, competências e palavras-chave específicas.

Além disso, os sistemas ATS utilizados por empresas podem analisar e organizar currículos antes mesmo de chegarem aos recrutadores.

Diante desse cenário, surgiu a ideia do MatchCV: facilitar a identificação de oportunidades compatíveis e ajudar candidatos a adaptar seus currículos de maneira estratégica.

### Solução proposta

A plataforma permite:

- Inserir um currículo em PDF ou DOCX, ou colar seu conteúdo.
- Inserir a descrição de uma oportunidade de emprego.
- Analisar a compatibilidade entre o perfil profissional e a vaga.
- Identificar palavras-chave encontradas e ausentes.
- Visualizar competências compatíveis e requisitos não identificados.
- Gerar uma versão personalizada do currículo.
- Editar e exportar o currículo em PDF e DOCX.

Um dos diferenciais do projeto é permitir o uso das funcionalidades principais sem exigir cadastro ou login.

---

## 💡 2. Como o MatchCV funciona

O funcionamento da aplicação é organizado em cinco etapas:

### 1. Inserção do currículo

O usuário envia seu currículo em PDF ou DOCX ou cola diretamente seu conteúdo na plataforma.

### 2. Inserção da vaga

O usuário cola a descrição da oportunidade desejada.

A aplicação identifica informações relevantes, como:

- Cargo e empresa;
- Requisitos da oportunidade;
- Competências técnicas;
- Competências comportamentais;
- Experiência profissional;
- Formação acadêmica.

### 3. Análise de compatibilidade

O sistema compara as informações do currículo com os requisitos identificados na vaga.

O resultado apresenta:

- Percentual de compatibilidade (*Match*);
- Palavras-chave encontradas;
- Palavras-chave ausentes;
- Competências compatíveis;
- Requisitos que não foram identificados no currículo.

### 4. Personalização do currículo

Com base na análise, a aplicação gera uma versão personalizada do currículo, priorizando experiências relevantes, melhorando descrições profissionais e utilizando palavras-chave pertinentes de maneira natural.

O sistema deve preservar a veracidade das informações, sem inventar experiências, competências ou qualificações.

### 5. Exportação

Após revisar e editar o documento, o usuário pode exportar seu currículo em dois formatos:

- DOCX: documento editável.
- PDF: documento pronto para compartilhamento.

---


---

## 🤖 3. Megaprompt utilizado no desenvolvimento

O MatchCV foi desenvolvido a partir de um megaprompt, elaborado e refinado para orientar o Lovable na construção da aplicação.

O objetivo inicial era criar uma plataforma completa de matchmaking de vagas e otimização de currículos ATS.

Durante o processo, o escopo foi sendo ajustado para priorizar as funcionalidades essenciais e evitar complexidade desnecessária.

### Versão final do megaprompt

## 1. Design e identidade visual

Crie uma interface moderna, tecnológica, profissional e responsiva.

Paleta de cores:
- Roxo: #7C3AED
- Roxo escuro: #6D28D9
- Azul: #2563EB
- Preto: #09090B
- Cinza: #27272A
- Branco: #FAFAFA

Utilize tema escuro, cards elegantes, bordas discretas, gradientes roxo e azul e componentes Shadcn UI.

## 2. Acesso direto, sem login

A aplicação deve funcionar integralmente sem cadastro, login ou autenticação.

Não crie páginas de login, cadastro, recuperação de senha ou histórico de contas.

Ao acessar o MatchCV, o usuário deve conseguir utilizar imediatamente todas as funcionalidades.

## 3. Inserção de informações

Na página principal, apresente dois campos:

**Meu currículo**
- Upload de arquivos PDF ou DOCX.
- Alternativa para colar o texto do currículo.

**Descrição da vaga**
- Campo para colar a descrição completa da oportunidade.

Adicione o botão "Analisar compatibilidade".

## 4. Análise de compatibilidade

Compare o currículo com a descrição da vaga.

Calcule uma porcentagem de compatibilidade considerando:
- Competências técnicas.
- Experiência profissional.
- Formação acadêmica.
- Senioridade.
- Requisitos da oportunidade.

Apresente um dashboard com:
- Porcentagem de match.
- Palavras-chave encontradas.
- Palavras-chave ausentes.
- Competências compatíveis.
- Requisitos não identificados.

Utilize cards, indicadores visuais e barras de progresso.

A análise deve utilizar dados reais do currículo e da vaga, sem apresentar resultados fictícios como análises verdadeiras.

## 5. Gerador de currículo ATS

Adicione o botão "Gerar currículo otimizado".

Utilize o currículo original e a descrição da vaga para gerar uma versão personalizada.

O sistema deve:
- Adaptar o resumo profissional.
- Destacar experiências relevantes.
- Melhorar descrições profissionais.
- Organizar competências.
- Incorporar palavras-chave pertinentes naturalmente.

Nunca invente experiências, competências, resultados, formação ou qualificações.

Permita editar todas as seções do currículo gerado.

## 6. Exportação DOCX e PDF

Disponibilize dois botões funcionais:

- Baixar currículo em DOCX.
- Baixar currículo em PDF.

Gere documentos reais, não imagens ou capturas de tela.

O currículo deve seguir boas práticas ATS:
- Layout de uma coluna.
- Títulos convencionais.
- Texto selecionável.
- Sem tabelas complexas.
- Sem gráficos ou imagens.
- Estrutura simples e profissional.

O DOCX deve ser editável e o PDF deve preservar a estrutura do documento.

A exportação deve funcionar sem restrições.

## 7. Persistência temporária

Utilize armazenamento local do navegador para preservar temporariamente as informações durante a utilização.

Não implemente banco de dados de usuários, autenticação ou histórico permanente.

O usuário deve conseguir baixar seus documentos antes de sair da aplicação.

## 8. Regras de desenvolvimento

- Utilize Shadcn UI.
- Desenvolva somente as funcionalidades descritas.
- Não crie módulos desnecessários.
- Não crie dashboards administrativos.
- Não implemente integrações pagas.
- Não simule funcionalidades inexistentes.
- Todos os botões devem funcionar.
- Utilize português brasileiro em toda a interface.
- Priorize velocidade, simplicidade e funcionalidade.

## RESULTADO ESPERADO

Um MVP funcional do MatchCV no qual qualquer pessoa consegue:

1. Inserir seu currículo.
2. Colar a descrição de uma vaga.
3. Visualizar a porcentagem de compatibilidade.
4. Identificar palavras-chave encontradas e ausentes.
5. Gerar um currículo personalizado para aquela oportunidade.
6. Editar o currículo.
7. Baixar o documento em DOCX ou PDF.

**PRIORIDADE ABSOLUTA:** Entregar o fluxo completo de análise e geração de currículos ATS. Não expandir o escopo com funcionalidades secundárias.
## 🔄 4. Evolução do megaprompt

O prompt passou por algumas modificações durante o desenvolvimento.

### Primeira versão — Plataforma completa

A ideia inicial era desenvolver uma plataforma SaaS mais ampla, com:

- Cadastro e autenticação;
- Perfil profissional;
- Matchmaking de vagas;
- Dashboard;
- Gerador de currículos ATS;
- Histórico de candidaturas;
- Armazenamento de informações.

### Segunda versão — Simplificação da experiência

Foi decidido que o usuário não deveria precisar criar uma conta para utilizar o gerador de currículos.

O login passou a ser pensado apenas como um recurso complementar para salvar informações.

### Terceira versão — Redução do escopo

Para trabalhar dentro do limite de créditos disponíveis no Lovable, foram retiradas funcionalidades secundárias.

As principais mudanças foram:

- Exclusão da autenticação;
- Exclusão do cadastro;
- Remoção do histórico permanente;
- Eliminação de módulos administrativos;
- Simplificação do dashboard;
- Priorização da análise de compatibilidade;
- Priorização da exportação em DOCX e PDF.

### Resultado da evolução

O projeto passou a ter um objetivo mais claro: entregar uma ferramenta simples, acessível e funcional, concentrada no matchmaking e na personalização de currículos.

---

## 🧪 5. Ajustes solicitados após a primeira geração

Durante a construção, foram identificadas necessidades de refinamento para melhorar a qualidade da análise.

Entre os ajustes solicitados e pontos trabalhados estavam:

- Refinamento do reconhecimento de competências para evitar correspondências incorretas entre nomes de habilidades.
- Inclusão da leitura de datas para permitir o cálculo do tempo de experiência profissional.
- Ajuste da identificação de datas para evitar confusão com números de telefone.
- Desenvolvimento da leitura da descrição da vaga, incluindo cargo, empresa, requisitos e competências.
- Refinamento do reconhecimento dos títulos das seções das descrições de emprego.

Esses ajustes foram importantes porque a qualidade do matchmaking depende diretamente da capacidade de interpretar corretamente as informações presentes no currículo e na oportunidade.

---

## 📸 6. Evidências de funcionamento

<img width="1347" height="623" alt="image" src="https://github.com/user-attachments/assets/5f569612-ad94-4abe-8957-497c3f3fae64" />
<img width="1021" height="520" alt="image" src="https://github.com/user-attachments/assets/d4eda800-c61f-4781-9876-d79dc231c8b9" />
<img width="1129" height="546" alt="image" src="https://github.com/user-attachments/assets/fa2c8636-8640-4031-a474-5d00c9a400d3" />

---

## 👩‍💻 7. Desenvolvimento

Projeto desenvolvido como parte de uma jornada prática de desenvolvimento de produto digital, utilizando o Lovable para transformar uma ideia em um MVP.

O processo envolveu definição do problema, elaboração e refinamento de prompts, desenvolvimento da interface, priorização de funcionalidades e evolução da proposta do produto.

**MatchCV — O match certo pode transformar sua busca por oportunidades.** 💜

