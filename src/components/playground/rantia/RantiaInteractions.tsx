"use client";

import { useState } from "react";
import {
  Bot,
  Boxes,
  Braces,
  Cloud,
  Cpu,
  Eye,
  GitBranch,
  Network,
  Wifi,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLearningProgress } from "@/components/learning/LearningProgressProvider";

type Scenario = {
  prompt: string;
  options: string[];
  correct: string;
  note: string;
};

export function RoboticsComparison() {
  return (
    <ChoiceLab
      interactionId="robotics-compare"
      icon={<Bot size={15} />}
      title="comparador de especificações"
      scenarios={[
        {
          prompt: "O robot volta muitas vezes ao mesmo ponto com pouca variação.",
          options: ["repeatability", "resolução", "DoF"],
          correct: "repeatability",
          note: "Repeatability mede consistência ao regressar a uma posição.",
        },
        {
          prompt: "O comando ABB pede uma trajetória reta no espaço operacional.",
          options: ["MoveJ", "MoveL", "z50"],
          correct: "MoveL",
          note: "MoveL é movimento linear em task space.",
        },
      ]}
    />
  );
}

export function Ros2GraphSimulation() {
  const [active, setActive] = useState("camera");
  const nodes = [
    { id: "camera", label: "camera_node", topic: "/image_raw", x: 15, y: 35 },
    { id: "vision", label: "vision_node", topic: "/detections", x: 50, y: 35 },
    { id: "control", label: "control_node", topic: "/cmd_vel", x: 85, y: 35 },
  ];
  const current = nodes.find((node) => node.id === active) ?? nodes[0];

  return (
    <div className="my-6 rounded-lg border border-border bg-card p-4 shadow-[0_12px_30px_rgba(26,21,18,0.05)] sm:p-5">
      <LabTitle icon={<Network size={15} />} title="simulador — grafo ROS2" />
      <svg viewBox="0 0 100 62" className="w-full rounded-lg border border-border bg-background">
        <line x1="24" y1="35" x2="41" y2="35" className="stroke-rubric animate-flow" strokeWidth="1.4" />
        <line x1="59" y1="35" x2="76" y2="35" className="stroke-rubric animate-flow" strokeWidth="1.4" />
        {nodes.map((node) => (
          <g key={node.id}>
            <button type="button" onClick={() => setActive(node.id)}>
              <circle
                cx={node.x}
                cy={node.y}
                r="8"
                fill={active === node.id ? "#1a1512" : "#ede4d0"}
                stroke="#c7502e"
                strokeWidth="1"
              />
            </button>
            <text x={node.x} y={node.y + 18} textAnchor="middle" className="fill-ink font-mono text-[3px]">
              {node.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-3 rounded-lg border border-border bg-background p-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          {current.label}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Publica ou consome o tópico <span className="font-mono text-ink">{current.topic}</span>.
          Discovery e transporte são feitos por DDS, sem ROS Master.
        </p>
      </div>
      <CompleteButton interactionId="ros2-graph" />
    </div>
  );
}

export function Ros2ToolingFlow() {
  return (
    <StageFlow
      interactionId="ros2-tooling-flow"
      icon={<GitBranch size={15} />}
      title="fluxo de ferramentas ROS2"
      stages={[
        ["workspace", "Contém packages e é compilado por colcon build."],
        ["package.xml", "Declara metadados e dependências do package."],
        ["launch", "Arranca vários nós com parâmetros consistentes."],
        ["rqt_graph", "Mostra a topologia de nós e tópicos."],
        ["RViz2", "Visualiza TF, sensores, odometria e markers."],
      ]}
    />
  );
}

export function SimulationDecisionLab() {
  return (
    <ChoiceLab
      interactionId="simulation-decision"
      icon={<Boxes size={15} />}
      title="decisor — simulação"
      scenarios={[
        {
          prompt: "Preciso descrever links e joints de um robot.",
          options: ["URDF", "SDF", "RViz2"],
          correct: "URDF",
          note: "URDF descreve a estrutura do robot.",
        },
        {
          prompt: "Preciso de mundo completo com terreno, luzes e sensores simulados.",
          options: ["SDF", "RViz2", "package.xml"],
          correct: "SDF",
          note: "SDF pode descrever modelos de simulação e mundos completos.",
        },
        {
          prompt: "Quero ver TF e odometria publicados por ROS2, sem física.",
          options: ["Gazebo", "RViz2", "Webots"],
          correct: "RViz2",
          note: "RViz2 visualiza dados; Gazebo/Webots simulam.",
        },
      ]}
    />
  );
}

export function VisionPipelineExplorer() {
  return (
    <StageFlow
      interactionId="vision-pipeline"
      icon={<Eye size={15} />}
      title="pipeline visão → ação"
      stages={[
        ["camera driver", "Publica imagens como mensagens ROS2 Image."],
        ["cv_bridge", "Converte Image para arrays OpenCV/NumPy."],
        ["OpenCV/HSV", "Segmenta cor, brilho e saturação quando basta visão clássica."],
        ["YOLO", "Deteta objetos com modelo de deep learning."],
        ["decision node", "Transforma perceção em comando ou alerta."],
      ]}
    />
  );
}

export function MqttBridgeLab() {
  const [bridgeAll, setBridgeAll] = useState(false);
  const [qos, setQos] = useState("1");
  const warnings = [
    bridgeAll ? "bridging indiscriminado aumenta bandwidth e dados obsoletos" : "bridge seletiva reduz ruído",
    qos === "0" ? "QoS 0 pode perder mensagens" : qos === "2" ? "QoS 2 aumenta overhead" : "QoS 1 equilibra entrega e custo",
  ];

  return (
    <div className="my-6 rounded-lg border border-border bg-card p-4 shadow-[0_12px_30px_rgba(26,21,18,0.05)] sm:p-5">
      <LabTitle icon={<Wifi size={15} />} title="simulador — bridge ROS2-MQTT" />
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-ink">
            <span>ROS2 / DDS</span>
            <span className="text-rubric animate-pulse-slow">↔ bridge ↔</span>
            <span>MQTT broker</span>
          </div>
          <div className="mt-4 space-y-2">
            {warnings.map((warning) => (
              <div key={warning} className="rounded-md border border-border bg-card px-3 py-2 text-sm leading-relaxed text-muted-foreground">
                {warning}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={bridgeAll}
              onChange={(event) => setBridgeAll(event.target.checked)}
              className="accent-rubric"
            />
            publicar todos os tópicos
          </label>
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-fade">
              QoS MQTT
            </div>
            <div className="grid gap-2">
              {[
                ["0", "0 — at most once"],
                ["1", "1 — at least once"],
                ["2", "2 — exactly once"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setQos(value)}
                  className={`min-h-11 rounded-lg border px-3 py-2 text-left text-sm transition ${
                    qos === value
                      ? "border-transparent bg-ink text-paper"
                      : "border-border bg-background text-ink hover:border-rubric/30"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <CompleteButton interactionId="mqtt-bridge" />
        </div>
      </div>
    </div>
  );
}

export function EdgeCloudDecisionLab() {
  return (
    <ChoiceLab
      interactionId="edge-cloud-decision"
      icon={<Cpu size={15} />}
      title="decisor — edge/cloud/tiny"
      scenarios={[
        {
          prompt: "Latência baixa e privacidade são prioridade no dispositivo.",
          options: ["Edge AI", "Cloud-only", "Dashboard"],
          correct: "Edge AI",
          note: "Edge AI processa perto do dispositivo.",
        },
        {
          prompt: "Modelo pequeno corre num microcontrolador.",
          options: ["TinyML", "Federated Learning", "MQTT QoS"],
          correct: "TinyML",
          note: "TinyML leva inferência leve a hardware limitado.",
        },
      ]}
    />
  );
}

export function ElectronicsLab() {
  const learning = useLearningProgress();
  const [voltage, setVoltage] = useState(10);
  const [resistance, setResistance] = useState(2);
  const current = voltage / resistance;
  const adc = Math.round((voltage / 10) * 1023);

  return (
    <div className="my-6 rounded-lg border border-border bg-card p-4 shadow-[0_12px_30px_rgba(26,21,18,0.05)] sm:p-5">
      <LabTitle icon={<Zap size={15} />} title="laboratório — sensores e eletrónica" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="tensão (V)" value={voltage} min={1} max={10} onChange={setVoltage} />
        <Slider label="resistencia total (kΩ)" value={resistance} min={1} max={10} onChange={setResistance} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric label="corrente" value={`${current.toFixed(1)} mA`} />
        <Metric label="ADC Arduino" value={`${adc}/1023`} />
        <Metric label="PWM 50%" value="127/255" />
      </div>
      <Button
        type="button"
        size="sm"
        className="mt-4 h-10"
        onClick={() => learning?.markInteractionComplete("electronics-lab")}
      >
        marcar interação
      </Button>
    </div>
  );
}

export function MqttProtocolDrill() {
  return (
    <ChoiceLab
      interactionId="mqtt-drill"
      icon={<Braces size={15} />}
      title="drill — MQTT"
      scenarios={[
        {
          prompt: "devices/+/battery corresponde a um nível no lugar de +.",
          options: ["verdadeiro", "falso"],
          correct: "verdadeiro",
          note: "+ faz match de exatamente um nível.",
        },
        {
          prompt: "QoS 2 significa:",
          options: ["at most once", "at least once", "exactly once"],
          correct: "exactly once",
          note: "QoS 2 é a garantia mais forte.",
        },
        {
          prompt: "Mosquitto permite clientes anónimos com:",
          options: ["allow_anonymous true", "anonymous_clients = yes", "set_anon true"],
          correct: "allow_anonymous true",
          note: "Esta é a diretiva que aparece nos apontamentos.",
        },
      ]}
    />
  );
}

export function IotTwinFlow() {
  return (
    <StageFlow
      interactionId="iot-twin-flow"
      icon={<Cloud size={15} />}
      title="fluxo cloud e digital twin"
      stages={[
        ["device/sensor", "Mede o mundo físico."],
        ["gateway/edge", "Filtra e reduz latência/bandwidth."],
        ["cloud ingestion", "Recebe stream de eventos."],
        ["analytics", "Transforma dados em estado e previsões."],
        ["dashboard/action", "Mostra, alerta ou atua."],
        ["digital twin", "Mantém representação digital do sistema físico."],
      ]}
    />
  );
}

function StageFlow({
  interactionId,
  icon,
  title,
  stages,
}: {
  interactionId: string;
  icon: React.ReactNode;
  title: string;
  stages: Array<[string, string]>;
}) {
  const [active, setActive] = useState(0);
  const stage = stages[active];

  return (
    <div className="my-6 rounded-lg border border-border bg-card p-4 shadow-[0_12px_30px_rgba(26,21,18,0.05)] sm:p-5">
      <LabTitle icon={icon} title={title} />
      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <div className="grid gap-2 sm:grid-cols-2">
          {stages.map(([label], index) => (
            <button
              key={label}
              type="button"
              onClick={() => setActive(index)}
              className={`min-h-11 rounded-lg border px-3 py-2 text-left font-mono text-[10px] uppercase tracking-widest leading-snug transition ${
                active === index
                  ? "border-transparent bg-ink text-paper"
                  : "border-border bg-background text-ink hover:border-rubric/30"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">
            {stage[0]}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {stage[1]}
          </p>
        </div>
      </div>
      <CompleteButton interactionId={interactionId} />
    </div>
  );
}

function ChoiceLab({
  interactionId,
  icon,
  title,
  scenarios,
}: {
  interactionId: string;
  icon: React.ReactNode;
  title: string;
  scenarios: Scenario[];
}) {
  const learning = useLearningProgress();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const scenario = scenarios[index];
  const correct = answer === scenario.correct;
  const finished = index === scenarios.length - 1 && correct;

  const next = () => {
    if (!correct) return;
    if (finished) {
      learning?.markInteractionComplete(interactionId);
      setIndex(0);
    } else {
      setIndex((value) => value + 1);
    }
    setAnswer("");
  };

  return (
    <div className="my-6 rounded-lg border border-border bg-card p-4 shadow-[0_12px_30px_rgba(26,21,18,0.05)] sm:p-5">
      <LabTitle icon={icon} title={title} />
      <div className="rounded-lg border border-border bg-background p-4">
        <div className="mb-3 flex gap-1">
          {scenarios.map((item, itemIndex) => (
            <span
              key={item.prompt}
              className={`h-1.5 flex-1 rounded-full ${
                itemIndex <= index ? "bg-rubric" : "bg-border"
              }`}
            />
          ))}
        </div>
        <div className="font-serif text-lg italic leading-snug text-ink">
          {scenario.prompt}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {scenario.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setAnswer(option)}
              className={`min-h-11 rounded-lg border px-3 py-2 text-left text-sm transition ${
                answer === option
                  ? "border-transparent bg-ink text-paper"
                  : "border-border bg-card text-ink hover:border-rubric/30"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {answer ? (
          <div className={`mt-3 rounded-md border p-3 text-sm leading-relaxed ${correct ? "border-[rgba(92,140,92,0.35)] bg-[rgba(92,140,92,0.1)] text-[#456b45]" : "border-rubric/30 bg-rubric/10 text-rubric"}`}>
            {correct ? scenario.note : "Rever a distinção antes de avançar."}
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-fade">
          {index + 1}/{scenarios.length}
        </span>
        <Button type="button" size="sm" onClick={next} disabled={!correct} className="h-10">
          {finished ? "concluir" : "seguinte"}
        </Button>
      </div>
    </div>
  );
}

function CompleteButton({ interactionId }: { interactionId: string }) {
  const learning = useLearningProgress();
  const done = learning?.progress.completedInteractions.includes(interactionId);

  return (
    <Button
      type="button"
      size="sm"
      variant={done ? "outline" : "default"}
      className="mt-4 h-10"
      onClick={() => learning?.markInteractionComplete(interactionId)}
    >
      {done ? "interação concluída" : "marcar interação"}
    </Button>
  );
}

function LabTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-rubric/20 bg-rubric/10 text-rubric">
        {icon}
      </span>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          interação
        </div>
        <div className="font-serif text-lg italic leading-tight text-ink">
          {title}
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-widest text-ink-fade">
        <span>{label}</span>
        <span>{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step="1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-rubric"
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-fade">
        {label}
      </div>
      <div className="mt-1 font-serif text-2xl text-ink">{value}</div>
    </div>
  );
}
