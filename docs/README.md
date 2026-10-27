# Documentação do Codap

Esta pasta é a **documentação oficial** do projeto. Ela explica o que o Codap é,
como as peças se encaixam, como cada fluxo funciona de ponta a ponta e como
rodar, evoluir e publicar o sistema. Foi escrita para quem chega ao repositório
agora — uma pessoa nova no time, quem for dar continuidade ao projeto ou quem só
quer entender como ele funciona.

> Os arquivos `CLAUDE.md` (na raiz e em cada pacote) são instruções de trabalho
> para o assistente de código e guardam o nível de detalhe fino (armadilhas,
> históricos de decisão). Esta pasta é a fonte para **pessoas**. Quando os dois
> divergirem, o código manda e a divergência é um defeito de documentação.

## Por onde começar

| Quero… | Leia |
|---|---|
| Entender o que é o Codap e como as partes se relacionam | [Visão geral](visao-geral.md) |
| Rodar tudo na minha máquina | [Primeiros passos](primeiros-passos.md) |
| Entender as decisões de arquitetura | [Arquitetura](arquitetura.md) |
| Saber o que existe no banco | [Modelo de dados](modelo-de-dados.md) |
| Consultar um endpoint | [Referência da API](api.md) |
| Mexer no aplicativo | [Aplicativo](app.md) |
| Editar o currículo | [Dashboard](dashboard.md) e [Autoria de conteúdo](guias/autoria-de-conteudo.md) |
| Publicar uma versão | [Publicação](guias/publicacao.md) |
| Contribuir com código | [Contribuindo](contribuindo.md) |

## Mapa da documentação

**Conceitos**
- [Visão geral](visao-geral.md) — produto, pacotes, mapa do sistema e glossário.
- [Arquitetura](arquitetura.md) — monorepo, contratos compartilhados, offline-first, ambientes.
- [Modelo de dados](modelo-de-dados.md) — tabelas do Postgres e do SQLite do aparelho.

**Referência por pacote**
- [Referência da API](api.md) — rotas, autenticação, limites e convenções.
- [Aplicativo](app.md) — estrutura, navegação, estado, temas e componentes.
- [Dashboard](dashboard.md) — a ferramenta local de edição de conteúdo.
- [Tipos de atividade](referencia/tipos-de-atividade.md) — o formato do `content` de cada exercício.

**Fluxos de ponta a ponta** (cada um cruza app, API e banco)
- [Autenticação e sessão](fluxos/autenticacao-e-sessao.md)
- [Contas e e-mails](fluxos/contas-e-emails.md)
- [Sincronização e progresso](fluxos/sincronizacao-e-progresso.md)
- [Lição e atividades](fluxos/licao-e-atividades.md)
- [Gamificação: XP, níveis, Bits e conquistas](fluxos/gamificacao.md)
- [Loja e Baú Surpresa](fluxos/loja-e-bau.md)
- [Conteúdo e versionamento](fluxos/conteudo-e-versionamento.md)
- [Servidor lento e aviso de nova versão](fluxos/servidor-lento-e-nova-versao.md)

**Guias**
- [Autoria de conteúdo](guias/autoria-de-conteudo.md) — do dashboard ao aluno.
- [Publicação](guias/publicacao.md) — API, APK, versão do app e changelog.
- [Contribuindo](contribuindo.md) — convenções, testes e regras do repositório.

**Planejamento**
- [Limitações conhecidas e próximos passos](roadmap.md)

## Convenções desta documentação

- Escrita em português do Brasil, como o produto.
- Caminhos de arquivo são relativos à raiz do repositório.
- Diagramas usam [Mermaid](https://mermaid.js.org/), que o GitHub renderiza.
- Cada documento descreve o **estado atual** do sistema. O histórico de como se
  chegou até aqui está no Git (`git log -- <arquivo>`).
- Alterou comportamento, rota, tabela, comando ou fluxo? Atualize o documento
  correspondente **na mesma mudança** — essa é uma regra do repositório (ver
  [Contribuindo](contribuindo.md)).
