import type { LearningCourseConfig } from "@/lib/course-learning";

export const RANTIA_LEARNING_CONFIG: LearningCourseConfig = {
  courseId: "rantia",
  storageKey: "study:rantia:progress:v1",
  sections: {
    inicio: {
      id: "inicio",
      objectives: [
        "Perceber o mapa mental do curso: robotica, ROS2, simulacao e IoT.",
        "Separar conceitos de exame de detalhe instrumental.",
        "Usar checkpoints para descobrir topicos fracos antes do simulado.",
      ],
      keyConcepts: ["ROS2", "MQTT", "sensores", "IoT cloud"],
      examTraps: ["Nao confundir RAINTIA visivel com os identificadores rantia do codigo."],
      interaction: {
        id: "rantia-overview",
        title: "Mapa de estudo",
        kind: "flow",
      },
    },
    course_map: {
      id: "course_map",
      objectives: [
        "Definir robotica inteligente e ambiente inteligente.",
        "Explicar sistema ciber-fisico como ligacao bidirecional.",
        "Memorizar as camadas RAMI 4.0.",
      ],
      keyConcepts: ["ciber-fisico", "Industry 4.0", "RAMI 4.0", "broker"],
      examTraps: ["Sistema ciber-fisico nao e so simulacao: o fisico afeta o software e o software atua no fisico."],
      quizTopic: "course_map",
      interaction: {
        id: "rami-match",
        title: "Associar camadas RAMI",
        kind: "matching",
      },
    },
    robotics_fundamentals: {
      id: "robotics_fundamentals",
      objectives: [
        "Distinguir resolucao, repetibilidade e accuracy.",
        "Ler especificacoes basicas de robots industriais.",
        "Identificar MoveL como movimento linear em task space.",
      ],
      keyConcepts: ["DoF", "cobot", "repeatability", "MoveL"],
      examTraps: ["Repeatability nao e resolucao; MoveL nao e movimento articular."],
      quizTopic: "robotics_fundamentals",
      interaction: {
        id: "robotics-compare",
        title: "Comparador de especificacoes",
        kind: "drill",
      },
    },
    ros2_architecture: {
      id: "ros2_architecture",
      objectives: [
        "Modelar nos, topicos, publishers e subscribers.",
        "Explicar DDS e a ausencia de roscore em ROS2.",
        "Escolher comandos CLI ROS2 corretos.",
      ],
      keyConcepts: ["node", "topic", "publisher", "subscriber", "DDS", "QoS"],
      examTraps: ["Comandos rostopic/rosnode sao ROS1; em ROS2 use ros2 topic/ros2 node."],
      quizTopic: "ros2_architecture",
      interaction: {
        id: "ros2-graph",
        title: "Grafo ROS2",
        kind: "simulation",
      },
    },
    ros2_project: {
      id: "ros2_project",
      objectives: [
        "Ligar workspace, package.xml, launch files e colcon.",
        "Separar RViz2 de simuladores como Gazebo.",
        "Explicar rqt_graph e TF2.",
      ],
      keyConcepts: ["package.xml", "colcon", "RViz2", "rqt_graph", "TF2"],
      examTraps: ["RViz2 visualiza dados; nao simula fisica."],
      quizTopic: "ros2_project",
      interaction: {
        id: "ros2-tooling-flow",
        title: "Fluxo de ferramentas ROS2",
        kind: "flow",
      },
    },
    simulation: {
      id: "simulation",
      objectives: [
        "Distinguir Gazebo, Webots e RViz2.",
        "Distinguir URDF de SDF.",
        "Reconhecer sim-to-real gap e sensores simulados.",
      ],
      keyConcepts: ["Gazebo", "Webots", "URDF", "SDF", "LiDAR"],
      examTraps: ["URDF descreve a estrutura do robot; SDF tambem pode descrever mundos completos."],
      quizTopic: "simulation",
      interaction: {
        id: "simulation-decision",
        title: "Escolha URDF/SDF/Gazebo/RViz2",
        kind: "drill",
      },
    },
    computer_vision: {
      id: "computer_vision",
      objectives: [
        "Mapear o pipeline de imagem em ROS2.",
        "Explicar cv_bridge.",
        "Distinguir H, S e V no modelo HSV.",
      ],
      keyConcepts: ["ROS Image", "cv_bridge", "OpenCV", "YOLO", "HSV"],
      examTraps: ["Hue e a cor; Value e brilho; Saturation e pureza."],
      quizTopic: "computer_vision",
      interaction: {
        id: "vision-pipeline",
        title: "Pipeline percepcao-acao",
        kind: "flow",
      },
    },
    distributed_robotics: {
      id: "distributed_robotics",
      objectives: [
        "Explicar DDS vs MQTT sem os tratar como substitutos.",
        "Modelar uma bridge ROS2-MQTT.",
        "Identificar riscos de bridging indiscriminado.",
      ],
      keyConcepts: ["DDS", "MQTT", "bridge", "latencia", "QoS mismatch"],
      examTraps: ["MQTT nao substitui DDS dentro do ecossistema ROS2."],
      quizTopic: "distributed_robotics",
      interaction: {
        id: "mqtt-bridge",
        title: "Bridge ROS2-MQTT",
        kind: "simulation",
      },
    },
    iot_foundations: {
      id: "iot_foundations",
      objectives: [
        "Definir IoT, AIoT, Edge AI e TinyML.",
        "Escolher entre edge, cloud e tiny para cenarios.",
        "Relacionar digital twins com sistemas ciber-fisicos.",
      ],
      keyConcepts: ["AIoT", "Edge AI", "TinyML", "federated learning"],
      examTraps: ["Edge AI processa perto do dispositivo; nao depende sempre da cloud central."],
      quizTopic: "iot_foundations",
      interaction: {
        id: "edge-cloud-decision",
        title: "Decidir edge/cloud/tiny",
        kind: "drill",
      },
    },
    sensors_electronics: {
      id: "sensors_electronics",
      objectives: [
        "Aplicar V = I x R em exemplos simples.",
        "Distinguir ADC de PWM.",
        "Reconhecer interrupts e pull-up.",
      ],
      keyConcepts: ["Ohm", "ADC", "PWM", "interrupt", "pull-up"],
      examTraps: ["Arduino Uno analogRead vai de 0 a 1023; ESP32 ADC costuma ir ate 4095."],
      quizTopic: "sensors_electronics",
      interaction: {
        id: "electronics-lab",
        title: "ADC/PWM/interrupts",
        kind: "simulation",
      },
    },
    iot_protocols: {
      id: "iot_protocols",
      objectives: [
        "Distinguir MQTT QoS 0, 1 e 2.",
        "Aplicar wildcards + e #.",
        "Reconhecer configuracao basica Mosquitto.",
      ],
      keyConcepts: ["QoS 0", "QoS 1", "QoS 2", "+", "#", "Mosquitto"],
      examTraps: ["+ corresponde a exatamente um nivel; # corresponde a multiplos niveis."],
      quizTopic: "iot_protocols",
      interaction: {
        id: "mqtt-drill",
        title: "Drill MQTT",
        kind: "drill",
      },
    },
    iot_clouds: {
      id: "iot_clouds",
      objectives: [
        "Ordenar a jornada de dados IoT.",
        "Comparar edge e cloud.",
        "Explicar digital twin como representacao operacional.",
      ],
      keyConcepts: ["gateway", "ingestion", "analytics", "dashboard", "digital twin"],
      examTraps: ["Digital twin nao e uma copia fisica; e uma representacao digital ligada ao sistema real."],
      quizTopic: "iot_clouds",
      interaction: {
        id: "iot-twin-flow",
        title: "Fluxo cloud e digital twin",
        kind: "flow",
      },
    },
  },
};
