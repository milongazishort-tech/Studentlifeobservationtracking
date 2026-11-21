/**
 * Life Stage Classification Specification
 * Matches PRD.md Section 3.6
 */

const LIFE_STAGES = [
  {
    stage: 1,
    name: 'Critical / Highly Unbalanced',
    min: 0.0,
    max: 19.99,
    description: 'Routines and habits are severely disrupted. Immediate structural lifestyle realignment is needed.'
  },
  {
    stage: 2,
    name: 'Struggling / Low Discipline',
    min: 20.0,
    max: 29.99,
    description: 'Demonstrates low habit consistency. Academic attendance and basic personal routines require foundational support.'
  },
  {
    stage: 3,
    name: 'Inconsistent Routine',
    min: 30.0,
    max: 39.99,
    description: 'Intermittent bursts of effort countered by frequent missed days and sleep/study irregularities.'
  },
  {
    stage: 4,
    name: 'Emerging Awareness',
    min: 40.0,
    max: 49.99,
    description: 'Demonstrates growing awareness of daily habits, with partial success in establishing core routines.'
  },
  {
    stage: 5,
    name: 'Moderate Balance',
    min: 50.0,
    max: 59.99,
    description: 'Solid baseline habits across study and sleep, with room for improvement in physical exercise and focused study recap.'
  },
  {
    stage: 6,
    name: 'Steady Progress',
    min: 60.0,
    max: 69.99,
    description: 'Consistently completes core academic and personal habits with reliable self-discipline.'
  },
  {
    stage: 7,
    name: 'Disciplined Student',
    min: 70.0,
    max: 79.99,
    description: 'High habit stability. Manages academic coursework, sleep schedule, and personal routines with disciplined consistency.'
  },
  {
    stage: 8,
    name: 'High Achiever',
    min: 80.0,
    max: 89.99,
    description: 'Demonstrates strong discipline and balanced consistency across academic, physical, and personal lifestyle habits.'
  },
  {
    stage: 9,
    name: 'Exemplary Lifestyle',
    min: 90.0,
    max: 94.99,
    description: 'Near-mastery of daily balance. Excels in study execution, health routines, and controlled digital consumption.'
  },
  {
    stage: 10,
    name: 'Exceptional Self-Development',
    min: 95.0,
    max: 100.0,
    description: 'Peak habit excellence and lifestyle mastery. Exhibits flawless adherence to academic goals and personal well-being.'
  }
];

/**
 * Classifies a Life Score percentage into one of 10 stages
 * @param {number} lifeScore
 * @returns {Object} { stage, name, description }
 */
const classifyLifeStage = (lifeScore = 0) => {
  const score = Math.max(0, Math.min(100, parseFloat(lifeScore) || 0));

  for (const stage of LIFE_STAGES) {
    if (score >= stage.min && score <= stage.max) {
      return {
        stage: stage.stage,
        name: stage.name,
        description: stage.description
      };
    }
  }

  // Fallback boundary handling
  if (score >= 95.0) {
    const s10 = LIFE_STAGES[9];
    return { stage: s10.stage, name: s10.name, description: s10.description };
  }

  const s1 = LIFE_STAGES[0];
  return { stage: s1.stage, name: s1.name, description: s1.description };
};

module.exports = {
  LIFE_STAGES,
  classifyLifeStage
};
