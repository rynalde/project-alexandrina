export interface Question {
  id: number;
  topic: string;
  q: string;
  opts: string[];
  correct: number;
  exp: string;
}

export interface Section {
  id: string;
  num: string;
  title: string;
  subtitle: string;
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    topic: "seq2seq",
    q: "Em tarefas Sequence-to-Sequence, o objetivo principal é:",
    opts: [
      "Classificar um documento inteiro em uma única categoria.",
      "Transformar uma sequência de entrada em uma sequência de saída.",
      "Remover stop words de um corpus.",
      "Calcular apenas a frequência de palavras.",
    ],
    correct: 1,
    exp: "Seq2Seq mapeia sequência → sequência. Comprimento da entrada e da saída podem ser diferentes — não é classificação ponto-a-ponto.",
  },
  {
    id: 2,
    topic: "seq2seq",
    q: "Um exemplo clássico de tarefa Sequence-to-Sequence é:",
    opts: [
      "Tradução automática.",
      "Stemming.",
      "Cálculo de TF-IDF.",
      "Bag of Words.",
    ],
    correct: 0,
    exp: "MT é o caso canônico que motivou o nascimento da arquitetura encoder-decoder em 2014 (Sutskever et al.).",
  },
  {
    id: 3,
    topic: "enc_dec",
    q: "Na arquitetura encoder-decoder, o papel do encoder é:",
    opts: [
      "Gerar diretamente a palavra final da tradução.",
      "Processar a sequência de entrada e produzir uma representação interna.",
      "Aplicar softmax antes de receber qualquer entrada.",
      "Remover palavras desconhecidas do vocabulário.",
    ],
    correct: 1,
    exp: 'O encoder "comprime" toda a entrada em uma representação que o decoder vai usar para gerar a saída.',
  },
  {
    id: 4,
    topic: "enc_dec",
    q: "Na arquitetura encoder-decoder, o papel do decoder é:",
    opts: [
      "Transformar a representação gerada pelo encoder em uma sequência de saída.",
      "Criar a matriz de coocorrência das palavras.",
      "Fazer stemming da frase de entrada.",
      "Calcular apenas os pesos TF-IDF.",
    ],
    correct: 0,
    exp: "Decoder pega a representação do encoder e gera tokens, um a um, até produzir <eos>.",
  },
  {
    id: 5,
    topic: "context",
    q: "O context vector em um modelo Seq2Seq tradicional representa:",
    opts: [
      "Uma representação da sequência de entrada produzida pelo encoder.",
      "A lista completa de stop words.",
      "O vetor one-hot de cada palavra isolada.",
      "A matriz de confusão do modelo.",
    ],
    correct: 0,
    exp: "Context vector = representação resumida da entrada que o decoder consome. No Seq2Seq sem atenção, é o último estado do encoder.",
  },
  {
    id: 6,
    topic: "seq2seq",
    q: "Uma limitação do Seq2Seq tradicional sem atenção é que:",
    opts: [
      "Ele não consegue processar palavras.",
      "Ele precisa comprimir toda a informação da entrada em um único vetor fixo.",
      "Ele não usa nenhuma rede neural.",
      "Ele não pode ser usado em tradução automática.",
    ],
    correct: 1,
    exp: 'O "gargalo do vetor único": toda a sequência de entrada vira um único vetor de tamanho fixo. Para frases longas, é insuficiente.',
  },
  {
    id: 7,
    topic: "context",
    q: "O problema do vetor único é mais grave quando:",
    opts: [
      "As sequências de entrada são longas.",
      "O vocabulário tem apenas duas palavras.",
      "A sequência de entrada tem apenas um token.",
      "O modelo usa apenas documentos pequenos e simples.",
    ],
    correct: 0,
    exp: "Em sequências longas há mais informação para comprimir num vetor de tamanho fixo. A capacidade do vetor não cresce com o input.",
  },
  {
    id: 8,
    topic: "attention",
    q: "O mecanismo de atenção em Seq2Seq permite que o decoder:",
    opts: [
      "Use sempre o mesmo vetor de contexto em todos os passos.",
      "Foque em partes diferentes da sequência de entrada ao gerar cada elemento da saída.",
      "Ignore completamente a sequência de entrada.",
      "Substitua a função softmax por Bag of Words.",
    ],
    correct: 1,
    exp: "Atenção: a cada passo do decoder, um novo vetor de contexto, focando em diferentes partes da entrada. Acaba com o gargalo.",
  },
  {
    id: 9,
    topic: "attention",
    q: "Em um Seq2Seq com atenção, os vetores de contexto:",
    opts: [
      "Podem ser diferentes em cada passo de geração.",
      "São sempre binários.",
      "São iguais ao vetor TF-IDF do documento.",
      "Não dependem dos estados do encoder.",
    ],
    correct: 0,
    exp: "Cada token de saída tem seu próprio context vector — calculado dinamicamente a partir das atenções daquele passo.",
  },
  {
    id: 10,
    topic: "attention",
    q: "Em atenção, os pesos α indicam:",
    opts: [
      "A relevância de cada parte da entrada para a geração de uma saída em determinado passo.",
      "A frequência absoluta de cada palavra no corpus.",
      "A posição fixa de cada palavra no vocabulário.",
      "O número de documentos em que a palavra aparece.",
    ],
    correct: 0,
    exp: "α_ij = quanto o token de saída i \"presta atenção\" no token de entrada j. Maior α = mais relevante para essa predição específica.",
  },
  {
    id: 11,
    topic: "attention",
    q: "Sobre os pesos de atenção, assinale a alternativa correta:",
    opts: [
      "São sempre valores binários, 0 ou 1.",
      "São aprendidos e normalmente normalizados, indicando maior ou menor relevância.",
      "São definidos manualmente para cada frase.",
      "Não influenciam o vetor de contexto.",
    ],
    correct: 1,
    exp: "Pesos α são contínuos em [0,1] e somam 1 (normalizados via softmax). Aprendidos como parte do treino, não definidos a mão.",
  },
  {
    id: 12,
    topic: "attention",
    q: "Em um modelo com atenção, o vetor de contexto em um dado passo é geralmente calculado como:",
    opts: [
      "Uma soma ponderada dos estados do encoder.",
      "Uma contagem simples de stop words.",
      "Uma matriz de coocorrência entre documentos.",
      "Um vetor binário aleatório.",
    ],
    correct: 0,
    exp: "c_t = Σⱼ α_tj · h_j. Os α são os pesos de atenção, os h_j são os hidden states do encoder. Combinação linear ponderada.",
  },
  {
    id: 13,
    topic: "attention",
    q: "A principal vantagem da atenção em Seq2Seq é:",
    opts: [
      "Reduzir sempre o tempo total de treino.",
      "Ajudar o modelo a lidar melhor com sequências longas, focando nas partes relevantes da entrada.",
      "Eliminar completamente erros de tradução.",
      "Fazer com que o modelo não precise de dados de treino.",
    ],
    correct: 1,
    exp: "A grande conquista: o modelo deixa de depender de um único vetor fixo para tudo. Sequências longas se tornam tratáveis.",
  },
  {
    id: 14,
    topic: "align",
    q: "Em tradução automática, word alignment significa:",
    opts: [
      "Relacionar palavras ou grupos de palavras entre a sequência de entrada e a sequência de saída.",
      "Ordenar alfabeticamente todas as palavras da frase.",
      "Remover todas as palavras raras.",
      "Converter palavras em radicais linguísticos.",
    ],
    correct: 0,
    exp: "Alinhamento mostra quais palavras do source correspondem a quais palavras do target. Base do MT estatístico clássico.",
  },
  {
    id: 15,
    topic: "align",
    q: "Em word alignment, é correto afirmar que:",
    opts: [
      "A correspondência precisa ser sempre uma palavra da entrada para uma palavra da saída.",
      "Podem existir relações um-para-muitos, muitos-para-um ou entre grupos de palavras.",
      "A ordem das palavras é sempre igual em todas as línguas.",
      "O alinhamento não tem relação com tradução automática.",
    ],
    correct: 1,
    exp: 'Línguas diferem: "I am" → "Estou" (2-para-1), "casa" → "the house" (1-para-2). Alinhamento é geralmente n-para-m.',
  },
  {
    id: 16,
    topic: "align",
    q: "Uma dificuldade comum em word alignment é que:",
    opts: [
      "Diferentes línguas podem ter ordens de palavras diferentes.",
      "Todas as línguas usam exatamente a mesma estrutura sintática.",
      "Cada palavra sempre tem uma tradução única.",
      "Palavras nunca desaparecem ou aparecem na tradução.",
    ],
    correct: 0,
    exp: "SVO (inglês), SOV (japonês), VSO (galês). Reordenação é o que torna alinhamento — e tradução — não-trivial.",
  },
  {
    id: 17,
    topic: "softmax",
    q: "Em uma rede neural para geração de palavras, a função softmax é usada para:",
    opts: [
      "Transformar os scores de saída em uma distribuição de probabilidades.",
      "Reduzir automaticamente o número de frases do corpus.",
      "Fazer a tokenização do texto.",
      "Eliminar a necessidade de decoder.",
    ],
    correct: 0,
    exp: "Softmax converte logits (scores não normalizados) em probabilidades válidas — todos positivos e somando 1.",
  },
  {
    id: 18,
    topic: "softmax",
    q: "Sobre a saída da função softmax, assinale a alternativa correta:",
    opts: [
      "A soma das probabilidades é igual a 1.",
      "Os valores são sempre negativos.",
      "O vetor gerado é sempre binário.",
      "A dimensão da saída não tem relação com o vocabulário.",
    ],
    correct: 0,
    exp: "Por construção: softmax(z)_i = exp(z_i) / Σ exp(z_j). Soma = Σ exp(z_j) / Σ exp(z_j) = 1.",
  },
  {
    id: 19,
    topic: "softmax",
    q: "Em modelos de tradução neural, a dimensão da saída do softmax geralmente está relacionada:",
    opts: [
      "Ao tamanho do vocabulário de saída.",
      "Ao número de documentos do corpus.",
      "Ao número de camadas do encoder apenas.",
      "Ao número de stop words removidas.",
    ],
    correct: 0,
    exp: "Para gerar a próxima palavra, precisamos uma probabilidade para CADA palavra do vocabulário. Dimensão = |V|.",
  },
  {
    id: 20,
    topic: "softmax",
    q: "Uma limitação do softmax em vocabulários muito grandes é que:",
    opts: [
      "Calcular probabilidades para todas as palavras pode ser computacionalmente caro.",
      "Ele não produz probabilidades.",
      "Ele só funciona com Bag of Words.",
      "Ele impede o uso de redes neurais.",
    ],
    correct: 0,
    exp: "Σ exp(z_j) varre todas as |V| palavras a cada predição. Em |V|=10⁶, fica caro. Daí surgirem softmax hierárquico, sampling, BPE, etc.",
  },
  {
    id: 21,
    topic: "decoder",
    q: "O decoder em um modelo Seq2Seq gera a saída:",
    opts: [
      "Um elemento por vez, usando informações anteriores e a representação da entrada.",
      "Todas as palavras de forma aleatória e independente.",
      "Sem considerar nenhuma palavra gerada antes.",
      "Apenas por contagem de frequência.",
    ],
    correct: 0,
    exp: "Geração autoregressiva: y_t depende de y_<t (palavras já geradas) e da representação da entrada (context vector ou atenção).",
  },
  {
    id: 22,
    topic: "decoder",
    q: "Em um decoder autoregressivo, a geração de uma palavra pode depender:",
    opts: [
      "Das palavras geradas anteriormente.",
      "Apenas das palavras futuras.",
      "Apenas da primeira palavra do corpus.",
      "Apenas da lista de stop words.",
    ],
    correct: 0,
    exp: "P(y_t | y_1...y_{t-1}, x). Cada token novo é alimentado de volta como entrada para o passo seguinte.",
  },
  {
    id: 23,
    topic: "apps",
    q: "Em tradução automática neural, o encoder-decoder foi originalmente proposto para:",
    opts: [
      "Mapear uma frase de uma língua para uma frase em outra língua.",
      "Calcular apenas TF-IDF.",
      "Fazer topic modeling.",
      "Criar regras manuais de stemming.",
    ],
    correct: 0,
    exp: 'Sutskever, Vinyals & Le (2014): "Sequence to Sequence Learning with Neural Networks" — proposto para MT inglês↔francês.',
  },
  {
    id: 24,
    topic: "apps",
    q: "Além de tradução automática, arquiteturas Seq2Seq podem ser usadas em:",
    opts: [
      "Sumarização e chatbots.",
      "Apenas Bag of Words.",
      "Apenas cálculo de IDF.",
      "Apenas remoção de pontuação.",
    ],
    correct: 0,
    exp: "Qualquer mapeamento sequência→sequência: sumarização (texto→resumo), diálogo (turno→resposta), parsing, código (descrição→código).",
  },
  {
    id: 25,
    topic: "seq2seq",
    q: "Qual afirmação descreve melhor a diferença entre Seq2Seq sem atenção e Seq2Seq com atenção?",
    opts: [
      "Sem atenção, o modelo tende a depender de um único vetor fixo; com atenção, o decoder pode consultar partes relevantes da entrada em cada passo.",
      "Com atenção, o modelo deixa de usar encoder.",
      "Sem atenção, o modelo é sempre mais eficiente e mais preciso.",
      "Com atenção, o modelo só funciona com frases de uma palavra.",
    ],
    correct: 0,
    exp: "É a essência da revolução de Bahdanau et al. 2014: substituir o gargalo por um \"olhar dinâmico\" sobre a entrada.",
  },
];

export const EXAM_HISTORY: Record<string, boolean[]> = {
  attention: [true, false, false, true, false],
  seq2seq: [true, true, false, false, false],
  enc_dec: [false, true, false, false, false],
  align: [false, true, false, false, false],
  softmax: [false, true, false, false, false],
  decoder: [false, false, false, false, false],
  context: [false, false, false, false, false],
  apps: [false, false, false, false, false],
};

export const EXAM_YEARS = [2021, 2022, 2023, 2024, 2025];

export const TOPIC_LABELS: Record<string, string> = {
  seq2seq: "Seq2Seq",
  enc_dec: "Encoder-Decoder",
  context: "Context Vector",
  attention: "Atenção",
  align: "Word Alignment",
  softmax: "Softmax",
  decoder: "Decoder Autoregressivo",
  apps: "Aplicações",
};

export const SECTIONS: Section[] = [
  {
    id: "inicio",
    num: "00",
    title: "Visão Geral",
    subtitle: "De entrada para saída, com inteligência",
  },
  {
    id: "seq2seq",
    num: "01",
    title: "Sequence-to-Sequence",
    subtitle: "Mapeando sequências em sequências",
  },
  {
    id: "enc_dec",
    num: "02",
    title: "Encoder-Decoder",
    subtitle: "Duas redes, uma tarefa",
  },
  {
    id: "context",
    num: "03",
    title: "Context Vector",
    subtitle: "O gargalo do vetor único",
  },
  {
    id: "attention",
    num: "04",
    title: "Atenção",
    subtitle: "Olhares dinâmicos sobre a entrada",
  },
  {
    id: "align",
    num: "05",
    title: "Word Alignment",
    subtitle: "Quem traduz quem?",
  },
  {
    id: "softmax",
    num: "06",
    title: "Softmax",
    subtitle: "Logits viram probabilidades",
  },
  {
    id: "decoder",
    num: "07",
    title: "Decoder Autoregressivo",
    subtitle: "Um token de cada vez",
  },
  {
    id: "apps",
    num: "08",
    title: "Aplicações",
    subtitle: "MT, sumarização, diálogo",
  },
  {
    id: "simulado",
    num: "∞",
    title: "Simulado Final",
    subtitle: "25 questões estilo prova",
  },
];
