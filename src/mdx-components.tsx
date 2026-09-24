import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";
import Marginalia from "@/components/shared/Marginalia";
import Callout from "@/components/shared/Callout";
import SectionHeader from "@/components/shared/SectionHeader";
import Highlight from "@/components/shared/Highlight";
import Body from "@/components/shared/Body";
import Kbd from "@/components/shared/Kbd";
import {
  ConceptFlow,
  ExamTrap,
  FlashcardDrill,
  ImportantBlock,
  LessonStage,
  LearningObjectives,
  MatchingDrill,
  MobileStepScreen,
  MobileStepScreens,
  ProgressSummary,
  SectionQuiz,
} from "@/components/learning/LearningBlocks";
import {
  EdgeCloudDecisionLab,
  ElectronicsLab,
  IotTwinFlow,
  MqttBridgeLab,
  MqttProtocolDrill,
  RoboticsComparison,
  Ros2GraphSimulation,
  Ros2ToolingFlow,
  SimulationDecisionLab,
  VisionPipelineExplorer,
} from "@/components/playground/rantia/RantiaInteractions";
import {
  PredictReveal,
  QuickCheck,
  SortBuckets,
  TermTip,
} from "@/components/playground/world-models/Micro";
import {
  BlurLab,
  CollapseLab,
  MaskPlayground,
  NextFrameGuess,
} from "@/components/playground/world-models/ConceptLabs";
import {
  AttentivePoolViz,
  EmaLab,
  FamilyTimeline,
  IJepaDiagram,
  MaskSampler,
  PlanningLab,
  ProbeLab,
  SurpriseLab,
  TokenCounter,
  TubeMaskLab,
} from "@/components/playground/world-models/JepaLabs";
import {
  LabCell,
  LabDownloads,
  LabFigure,
  LabFinish,
  LabOutput,
} from "@/components/playground/world-models/PythonLab";

function ExternalAwareLink(props: ComponentPropsWithoutRef<"a">) {
  const external = props.href?.startsWith("http");
  return <a {...props} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} />;
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ExternalAwareLink,
    Marginalia,
    Callout,
    SectionHeader,
    Highlight,
    Body,
    Kbd,
    ConceptFlow,
    ExamTrap,
    FlashcardDrill,
    ImportantBlock,
    LessonStage,
    LearningObjectives,
    MatchingDrill,
    MobileStepScreen,
    MobileStepScreens,
    ProgressSummary,
    SectionQuiz,
    EdgeCloudDecisionLab,
    ElectronicsLab,
    IotTwinFlow,
    MqttBridgeLab,
    MqttProtocolDrill,
    RoboticsComparison,
    Ros2GraphSimulation,
    Ros2ToolingFlow,
    SimulationDecisionLab,
    VisionPipelineExplorer,
    PredictReveal,
    QuickCheck,
    SortBuckets,
    TermTip,
    BlurLab,
    CollapseLab,
    MaskPlayground,
    NextFrameGuess,
    AttentivePoolViz,
    EmaLab,
    FamilyTimeline,
    IJepaDiagram,
    MaskSampler,
    PlanningLab,
    ProbeLab,
    SurpriseLab,
    TokenCounter,
    TubeMaskLab,
    LabCell,
    LabDownloads,
    LabFigure,
    LabFinish,
    LabOutput,
    ...components,
  };
}
