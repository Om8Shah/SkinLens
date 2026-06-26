const CONDITIONS = [
  { key: 'unevenSkinTone', label: 'Uneven Skin Tone' },
  { key: 'pimplesPresence', label: 'Pimples Presence' },
  { key: 'acneMarks', label: 'Acne Marks' },
  { key: 'hyperpigmentation', label: 'Hyperpigmentation' },
  { key: 'fineLines', label: 'Fine Lines (<1mm)' },
  { key: 'coarseWrinkles', label: 'Coarse Wrinkles (>1mm)' },
];

function randomSeverity() {
  const weights = [0.35, 0.40, 0.25];
  const r = Math.random();
  if (r < weights[0]) return 'not_detected';
  if (r < weights[0] + weights[1]) return 'mild';
  return 'moderate_severe';
}

function randomConfidence(severity) {
  if (severity === 'not_detected') return Math.floor(Math.random() * 15) + 82;
  if (severity === 'mild') return Math.floor(Math.random() * 20) + 60;
  return Math.floor(Math.random() * 25) + 55;
}

export function generateMockResults() {
  const results = {};
  CONDITIONS.forEach(({ key }) => {
    const severity = randomSeverity();
    results[key] = { severity, confidence: randomConfidence(severity) };
  });
  return {
    claude: {
      name: 'Claude',
      icon: 'sparkles',
      color: '#CC6B2C',
      results,
    },
  };
}

export function getConditions() {
  return CONDITIONS;
}

export function getSeverityConfig(severity) {
  switch (severity) {
    case 'not_detected':
      return { label: 'Not Detected', color: '#6BBF8A', bgColor: '#E8F7EE' };
    case 'mild':
      return { label: 'Mild', color: '#E8B44E', bgColor: '#FFF5E0' };
    case 'moderate_severe':
      return { label: 'Moderate-Severe', color: '#E07070', bgColor: '#FDECEC' };
    default:
      return { label: 'Unknown', color: '#A89898', bgColor: '#F0F0F0' };
  }
}
