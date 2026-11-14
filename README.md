# Matchcvats

# MATCHCV — MVP de Matchmaking e Currículos ATS

Desenvolva uma aplicação web SaaS chamada MatchCV, utilizando obrigatoriamente Shadcn UI, Tailwind CSS e Lucide Icons.

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

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://matchcvats.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ead28b1f-ea73-4be3-93e1-54dd020b2e3c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
