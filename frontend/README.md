# Checkpoint

Frontend da biblioteca de jogos da Prática 6. Usa React, JavaScript, Vite,
Tailwind CSS e ícones Lucide. A interface permite cadastrar, listar, editar,
excluir, buscar, filtrar e ordenar jogos.

## Executar

Requer Node.js 24 e npm. Na raiz do repositório:

```sh
make front-install
make front-dev
```

Abra [http://127.0.0.1:5173](http://127.0.0.1:5173).
Para gerar e visualizar a build:

```sh
make front-build
make front-preview
```

A prévia da build usa a porta 4173. Os servidores recusam portas ocupadas,
sem escolher uma porta diferente silenciosamente.

## Funcionamento

O catálogo inicia com seis jogos fictícios. Os registros ficam no estado
React e voltam aos exemplos iniciais ao recarregar a página. Esta prática
não chama a API, não usa localStorage e não adiciona container do frontend.

O formulário valida título, gênero, plataforma, ano inteiro de 1958 a 2100
e preço positivo. PUT e PATCH são operações do backend; na interface,
a edição altera o registro em memória. A exclusão exige confirmação.

A busca ignora acentos e diferenças entre maiúsculas e minúsculas. Os filtros
de gênero e plataforma podem ser combinados com a busca. A ordenação permite
títulos em ordem alfabética, menor preço e adições mais recentes.

## Organização

- `src/components`: cards, formulário e diálogo modal.
- `src/data`: jogos fictícios e opções de formulário.
- `src/lib`: validação, normalização, filtros, formatação e reducer.
- `src/App.jsx`: estado da biblioteca e composição da tela.
- `tests/unit`: regras sem renderização.
- `tests/integration`: interação entre os componentes, sem API.
- `tests/e2e`: fluxos no Chromium em desktop e celular.

Os diálogos usam o elemento HTML `dialog`, com foco modal e fechamento por
Escape. Labels, mensagens de validação, avisos de status e um link para
pular ao catálogo permitem navegação por teclado.

## Qualidade e testes

```sh
make front-lint
make front-format-check
make front-check
make front-format
make front-test
make front-e2e-install
make front-test-e2e
```

Biome verifica lint, formatação e imports. Vitest executa os testes unitários
e os testes de componentes com Testing Library e jsdom. O setup adapta
`dialog` ao jsdom; o comportamento nativo é verificado pelo Playwright.
Os diretórios E2E e Vitest têm configurações separadas.

O Playwright inicia o Vite automaticamente quando necessário. Em desenvolvimento,
reutiliza o servidor da porta 5173. No CI, inicia um servidor próprio.

O workflow `ci-frontend.yml` tem dois jobs: qualidade e testes/build.
O segundo depende do sucesso do primeiro. Ele executa os testes unitários,
de componentes e E2E, além da build. Se o E2E falhar, salva o relatório
como artifact.

Todos os scripts também estão disponíveis em `frontend/package.json`.
Os comandos já existentes do backend permanecem no Makefile.
