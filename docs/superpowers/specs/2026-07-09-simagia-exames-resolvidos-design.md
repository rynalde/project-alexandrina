# SIMAGIA — Exames Resolvidos

## Objetivo

Transformar a secção existente de chave de respostas num guia de estudo que
reproduz todos os enunciados fornecidos dos exames de 2021, 2022 e 2024 e
coloca uma resposta-modelo imediatamente a seguir a cada pergunta ou alínea.

## Decisão

Será mantido o identificador de navegação `answer_key` e será expandido
`src/content/cursos/simagia/answer-key.mdx`. Desta forma a nova experiência
fica junto da chave já existente, sem alterar a navegação, o curso ou o
simulado de escolha múltipla.

O conteúdo será agrupado por ano e cada grupo terá o enunciado original, a
resposta-modelo objetiva e, quando necessário, um diagrama Mermaid. A imagem
repetida do exame de 2022 não cria uma secção adicional.

## Tooltips

Será criado um único componente `TermTooltip`. É um componente sem estado,
sem dependências novas, que revela uma definição curta com hover, foco de
teclado ou toque. O texto continuará legível sem interação e o controlo terá
um nome acessível que inclui o termo e a definição.

Os tooltips cobrirão, entre outros, Agente, SMA, autonomia, BDI, KQML, ACL,
performativa, ontologia, Contract Net Protocol, CFP, leilão holandês,
Facilitator, Broker, RL, MARL e CTDE.

## Limites

As respostas são modelos pedagógicos consistentes com o conteúdo do curso;
as imagens não incluem uma grelha de correção oficial. As perguntas que fazem
referência ao Challenge 4 indicarão explicitamente que o exemplo deve ser
adaptado ao Challenge realizado pelo estudante.

## Verificação

Um teste Node nativo irá confirmar a presença de todos os anos, perguntas e
alíneas. O lint e o build de Next irão validar a compilação da MDX e do
componente de tooltip; a página será ainda verificada no navegador local.
