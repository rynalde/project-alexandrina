export interface Course {
  slug: string;
  vol: string;
  title: string;
  subtitle: string;
  description: string;
  topics: string[];
  sectionCount: number;
  questionCount: number;
  accent: string;
}

export const COURSES: Course[] = [
  {
    slug: "seq2seq",
    vol: "vol. iv",
    title: "Seq2Seq & Atenção",
    subtitle: "Encoder-Decoder, Atenção e Geração",
    description:
      "Do vetor de contexto único ao mecanismo de atenção dinâmico. Cobre Sequence-to-Sequence, Encoder-Decoder, Context Vector, Atenção de Bahdanau, Word Alignment, Softmax e Decoder Autoregressivo.",
    topics: [
      "Sequence-to-Sequence",
      "Encoder-Decoder",
      "Context Vector",
      "Atenção",
      "Word Alignment",
      "Softmax",
      "Decoder Autoregressivo",
      "Aplicações",
    ],
    sectionCount: 9,
    questionCount: 25,
    accent: "#c7502e",
  },
  {
    slug: "transformer",
    vol: "vol. v",
    title: "Transformer",
    subtitle: "Attention is all you need",
    description:
      "A arquitetura que aposentou as RNNs em geração de sequência. Cobre self-attention, intra/inter-attention, multi-head, positional encoding, layer normalization, conexões residuais, decoder masking e a saída softmax sobre o vocabulário.",
    topics: [
      "Self-Attention",
      "Encoder-Decoder Attention",
      "Multi-Head",
      "Positional Encoding",
      "Layer Norm",
      "Arquitetura",
      "Masked Attention",
      "Softmax",
    ],
    sectionCount: 9,
    questionCount: 25,
    accent: "#c7502e",
  },
  {
    slug: "perceptrons-geometria",
    vol: "vol. vi",
    title: "Perceptrons e Geometria",
    subtitle: "Retas, planos, regiões e composição lógica",
    description:
      "Treino focado no método de prova: identificar fronteiras, escrever w·x + b = 0, orientar o lado de saída 1 e combinar perceptrons com AND, NOT e OR. Inclui triângulos, faixas, elipses aproximadas, união de regiões e planos 3D.",
    topics: [
      "Retas e Planos",
      "Lado Positivo",
      "AND / NOT / OR",
      "Triângulo",
      "Faixa Paralela",
      "Elipses",
      "União de Regiões",
      "Planos 3D",
    ],
    sectionCount: 9,
    questionCount: 25,
    accent: "#c7502e",
  },
  {
    slug: "metricas-classificacao",
    vol: "vol. vii",
    title: "Métricas de Classificação",
    subtitle: "Accuracy, precision e recall",
    description:
      "Leitura de métricas em classificadores geométricos: elipse real, retângulo previsto por retas, contagem de PV/TP, PF/FP, NV/TN e NF/FN, e cálculo de accuracy, precision e recall no estilo da prova de 2024.",
    topics: [
      "PV / TP",
      "PF / FP",
      "NV / TN",
      "NF / FN",
      "Accuracy",
      "Precision",
      "Recall",
      "Regiões ra-rf",
    ],
    sectionCount: 8,
    questionCount: 20,
    accent: "#c7502e",
  },
  {
    slug: "simagia",
    vol: "vol. viii",
    title: "Sistemas Multi-Agente",
    subtitle: "Agentes, coordenação, negociação e plataformas",
    description:
      "Guia completo de SIMAGIA: agentes e ambientes, arquiteturas (BDI), sistemas multi-agente, coordenação, negociação e Contract Net, standards FIPA/ACL/KQML, plataformas e agentes LLM/MARL.",
    topics: [
      "Agentes",
      "Ambientes",
      "Arquiteturas",
      "BDI",
      "MAS/SMA",
      "Coordenação",
      "Negociação",
      "Contract Net",
      "FIPA/ACL",
      "LLM Agents",
      "MARL",
    ],
    sectionCount: 11,
    questionCount: 25,
    accent: "#c7502e",
  },
  {
    slug: "rantia",
    vol: "vol. ix",
    title: "RAINTIA / Ambientes Inteligentes",
    subtitle: "Robótica, ROS2, IoT, MQTT e sensores",
    description:
      "Guia completo de RAINTIA: robótica inteligente, ROS2 (nós, tópicos, DDS, CLI), simulação (Gazebo, URDF, SDF), visão computacional, robótica distribuída (MQTT bridges), IoT (AIoT, edge AI), sensores/Arduino/ESP32, protocolos MQTT e IoT cloud.",
    topics: [
      "ROS2",
      "DDS/QoS",
      "URDF/SDF",
      "Gazebo",
      "RViz2",
      "MQTT",
      "Arduino",
      "ESP32",
      "ADC/PWM",
      "IoT Cloud",
      "Digital Twins",
    ],
    sectionCount: 15,
    questionCount: 25,
    accent: "#c7502e",
  },
  {
    slug: "world-models",
    vol: "vol. x",
    title: "World Models",
    subtitle: "Learning by predicting, not by labeling",
    description:
      "Self-supervised models that learn how the world behaves by predicting missing or future parts of their own input. Covers pretext vs downstream tasks, pixel vs latent prediction, representation collapse (EMA, VICReg, SIGReg), masking, the JEPA family up to V-JEPA 2.1 and LeJEPA, planning in latent space — and a verified PyTorch lab that builds a JEPA world model from scratch.",
    topics: [
      "Prediction vs Classification",
      "Encoder",
      "Predictor",
      "Latent Space",
      "Collapse",
      "EMA",
      "Masking",
      "JEPA",
      "Planning",
      "PyTorch Lab",
    ],
    sectionCount: 11,
    questionCount: 36,
    accent: "#c7502e",
  },
];
