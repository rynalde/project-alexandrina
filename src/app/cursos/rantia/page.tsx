"use client";

import { type ComponentType } from "react";
import { RANTIA_SECTIONS } from "@/lib/rantia-data";
import { RANTIA_LEARNING_CONFIG } from "@/lib/rantia-learning";
import CoursePage from "@/components/course/CoursePage";
import RantiaSimuladoSection from "@/components/quiz/RantiaSimuladoSection";

import InicioSection from "@/content/cursos/rantia/inicio.mdx";
import CourseMapSection from "@/content/cursos/rantia/course-map.mdx";
import RoboticsFundamentalsSection from "@/content/cursos/rantia/robotics-fundamentals.mdx";
import Ros2ArchitectureSection from "@/content/cursos/rantia/ros2-architecture.mdx";
import Ros2ProjectSection from "@/content/cursos/rantia/ros2-project.mdx";
import SimulationSection from "@/content/cursos/rantia/simulation.mdx";
import ComputerVisionSection from "@/content/cursos/rantia/computer-vision.mdx";
import DistributedRoboticsSection from "@/content/cursos/rantia/distributed-robotics.mdx";
import IotFoundationsSection from "@/content/cursos/rantia/iot-foundations.mdx";
import SensorsElectronicsSection from "@/content/cursos/rantia/sensors-electronics.mdx";
import IotProtocolsSection from "@/content/cursos/rantia/iot-protocols.mdx";
import IotCloudsSection from "@/content/cursos/rantia/iot-clouds.mdx";
import AssessmentSection from "@/content/cursos/rantia/assessment.mdx";
import AnswerKeySection from "@/content/cursos/rantia/answer-key-content.mdx";

const SECTION_MAP: Record<string, ComponentType> = {
  inicio: InicioSection,
  course_map: CourseMapSection,
  robotics_fundamentals: RoboticsFundamentalsSection,
  ros2_architecture: Ros2ArchitectureSection,
  ros2_project: Ros2ProjectSection,
  simulation: SimulationSection,
  computer_vision: ComputerVisionSection,
  distributed_robotics: DistributedRoboticsSection,
  iot_foundations: IotFoundationsSection,
  sensors_electronics: SensorsElectronicsSection,
  iot_protocols: IotProtocolsSection,
  iot_clouds: IotCloudsSection,
  assessment: AssessmentSection,
  answer_key: AnswerKeySection,
  simulado: RantiaSimuladoSection,
};

export default function RantiaPage() {
  return (
    <CoursePage
      sections={RANTIA_SECTIONS}
      sectionComponents={SECTION_MAP}
      vol="vol. ix"
      courseTitle="RAINTIA / Ambientes Inteligentes"
      learningConfig={RANTIA_LEARNING_CONFIG}
    />
  );
}
