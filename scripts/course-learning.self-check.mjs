import assert from "node:assert/strict";
import {
  createEmptyProgress,
  mergeProgress,
  parseProgress,
  serializeProgress,
} from "../src/lib/course-learning.ts";

const empty = createEmptyProgress();
assert.deepEqual(empty, {
  completedSections: [],
  completedInteractions: [],
  quizScores: {},
  weakTopics: [],
});

const parsed = parseProgress(
  JSON.stringify({
    completedSections: ["ros2_architecture", "ros2_architecture", 7],
    completedInteractions: ["ros2-graph", null],
    quizScores: {
      ros2_architecture: { correct: 2, total: 3 },
      broken: { correct: "2", total: 3 },
    },
    weakTopics: ["ros2_architecture", "mqtt", "mqtt"],
  })
);

assert.deepEqual(parsed.completedSections, ["ros2_architecture"]);
assert.deepEqual(parsed.completedInteractions, ["ros2-graph"]);
assert.deepEqual(parsed.quizScores, {
  ros2_architecture: { correct: 2, total: 3 },
});
assert.deepEqual(parsed.weakTopics, ["ros2_architecture", "mqtt"]);

assert.deepEqual(parseProgress("{bad json"), createEmptyProgress());

const merged = mergeProgress(parsed, {
  completedSections: ["simulation"],
  completedInteractions: ["ros2-graph", "mqtt-bridge"],
  quizScores: {
    simulation: { correct: 1, total: 2 },
  },
  weakTopics: ["mqtt", "simulation"],
});

assert.deepEqual(merged.completedSections, [
  "ros2_architecture",
  "simulation",
]);
assert.deepEqual(merged.completedInteractions, ["ros2-graph", "mqtt-bridge"]);
assert.deepEqual(merged.quizScores.simulation, { correct: 1, total: 2 });
assert.deepEqual(merged.weakTopics, ["ros2_architecture", "mqtt", "simulation"]);

assert.equal(serializeProgress(merged), JSON.stringify(merged));

console.log("course-learning self-check passed");
