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

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
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
    ...components,
  };
}
