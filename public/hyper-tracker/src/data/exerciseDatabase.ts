// Common exercises database for autocomplete suggestions
// Organized by muscle group/category

export type ExerciseSuggestion = {
  name: string;
  category: string;
  defaultSets?: string;
  defaultTempo?: string;
  defaultFocus?: string;
};

export const EXERCISE_DATABASE: ExerciseSuggestion[] = [
  // Chest
  { name: "Barbell Bench Press", category: "Chest", defaultSets: "3×8-10", defaultFocus: "Strength" },
  { name: "Dumbbell Bench Press", category: "Chest", defaultSets: "3×8-12", defaultFocus: "Hypertrophy" },
  { name: "Incline Dumbbell Press", category: "Chest", defaultSets: "3×8-12", defaultFocus: "Hypertrophy" },
  { name: "Decline Bench Press", category: "Chest", defaultSets: "3×8-10", defaultFocus: "Strength" },
  { name: "Dumbbell Fly", category: "Chest", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Cable Fly", category: "Chest", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Push-Up", category: "Chest", defaultSets: "3×15-20", defaultFocus: "Hypertrophy" },
  { name: "Chest Dip", category: "Chest", defaultSets: "3×8-12", defaultFocus: "Hypertrophy" },
  { name: "Machine Chest Press", category: "Chest", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },
  { name: "Pec Deck", category: "Chest", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Floor Press", category: "Chest", defaultSets: "3×8-10", defaultFocus: "Strength" },
  { name: "Close-Grip Bench Press", category: "Chest", defaultSets: "3×8-10", defaultFocus: "Strength" },

  // Back
  { name: "Barbell Row", category: "Back", defaultSets: "3×8-10", defaultFocus: "Strength" },
  { name: "Dumbbell Row", category: "Back", defaultSets: "3×8-12", defaultFocus: "Hypertrophy" },
  { name: "One-Arm Dumbbell Row", category: "Back", defaultSets: "3×8-12", defaultFocus: "Hypertrophy" },
  { name: "Pull-Up", category: "Back", defaultSets: "3×6-10", defaultFocus: "Strength" },
  { name: "Chin-Up", category: "Back", defaultSets: "3×6-10", defaultFocus: "Strength" },
  { name: "Lat Pulldown", category: "Back", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },
  { name: "Seated Cable Row", category: "Back", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },
  { name: "T-Bar Row", category: "Back", defaultSets: "3×8-10", defaultFocus: "Strength" },
  { name: "Chest-Supported Row", category: "Back", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },
  { name: "Deadlift", category: "Back", defaultSets: "3×5-6", defaultFocus: "Strength" },
  { name: "Rack Pull", category: "Back", defaultSets: "3×5-6", defaultFocus: "Strength" },
  { name: "Face Pull", category: "Back", defaultSets: "3×15-20", defaultFocus: "Prehab" },
  { name: "Straight-Arm Pulldown", category: "Back", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Pullover", category: "Back", defaultSets: "3×12-15", defaultFocus: "Isolation" },

  // Shoulders
  { name: "Overhead Press", category: "Shoulders", defaultSets: "3×6-8", defaultFocus: "Strength" },
  { name: "Dumbbell Shoulder Press", category: "Shoulders", defaultSets: "3×8-10", defaultFocus: "Hypertrophy" },
  { name: "Arnold Press", category: "Shoulders", defaultSets: "3×8-12", defaultFocus: "Hypertrophy" },
  { name: "Lateral Raise", category: "Shoulders", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Front Raise", category: "Shoulders", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Rear Delt Fly", category: "Shoulders", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Upright Row", category: "Shoulders", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },
  { name: "Shrugs", category: "Shoulders", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Cable Lateral Raise", category: "Shoulders", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Machine Shoulder Press", category: "Shoulders", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },
  { name: "Reverse Pec Deck", category: "Shoulders", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Band Pull-Apart", category: "Shoulders", defaultSets: "3×15-20", defaultFocus: "Prehab" },

  // Biceps
  { name: "Barbell Curl", category: "Biceps", defaultSets: "3×8-12", defaultFocus: "Hypertrophy" },
  { name: "Dumbbell Curl", category: "Biceps", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },
  { name: "Hammer Curl", category: "Biceps", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },
  { name: "Incline Curl", category: "Biceps", defaultSets: "3×10-12", defaultFocus: "Isolation" },
  { name: "Preacher Curl", category: "Biceps", defaultSets: "3×10-12", defaultFocus: "Isolation" },
  { name: "Concentration Curl", category: "Biceps", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Cable Curl", category: "Biceps", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Spider Curl", category: "Biceps", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Zottman Curl", category: "Biceps", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },
  { name: "EZ Bar Curl", category: "Biceps", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },

  // Triceps
  { name: "Tricep Pushdown", category: "Triceps", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Skull Crusher", category: "Triceps", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },
  { name: "Overhead Tricep Extension", category: "Triceps", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },
  { name: "Dumbbell Kickback", category: "Triceps", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Diamond Push-Up", category: "Triceps", defaultSets: "3×12-15", defaultFocus: "Hypertrophy" },
  { name: "Tricep Dip", category: "Triceps", defaultSets: "3×8-12", defaultFocus: "Hypertrophy" },
  { name: "Rope Pushdown", category: "Triceps", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Band Pushdown", category: "Triceps", defaultSets: "3×15-20", defaultFocus: "Isolation" },

  // Legs - Quads
  { name: "Barbell Squat", category: "Quads", defaultSets: "3×6-8", defaultFocus: "Strength" },
  { name: "Front Squat", category: "Quads", defaultSets: "3×6-8", defaultFocus: "Strength" },
  { name: "Goblet Squat", category: "Quads", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },
  { name: "Leg Press", category: "Quads", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },
  { name: "Hack Squat", category: "Quads", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },
  { name: "Leg Extension", category: "Quads", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Bulgarian Split Squat", category: "Quads", defaultSets: "3×8-10", defaultFocus: "Hypertrophy" },
  { name: "Walking Lunge", category: "Quads", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },
  { name: "Step-Up", category: "Quads", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },
  { name: "Sissy Squat", category: "Quads", defaultSets: "3×12-15", defaultFocus: "Isolation" },

  // Legs - Hamstrings & Glutes
  { name: "Romanian Deadlift", category: "Hamstrings", defaultSets: "3×8-10", defaultFocus: "Hypertrophy" },
  { name: "Stiff-Leg Deadlift", category: "Hamstrings", defaultSets: "3×8-10", defaultFocus: "Hypertrophy" },
  { name: "Leg Curl", category: "Hamstrings", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Seated Leg Curl", category: "Hamstrings", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Good Morning", category: "Hamstrings", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },
  { name: "Hip Thrust", category: "Glutes", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },
  { name: "Glute Bridge", category: "Glutes", defaultSets: "3×12-15", defaultFocus: "Hypertrophy" },
  { name: "Cable Pull-Through", category: "Glutes", defaultSets: "3×12-15", defaultFocus: "Isolation" },
  { name: "Kickback", category: "Glutes", defaultSets: "3×12-15", defaultFocus: "Isolation" },

  // Calves
  { name: "Standing Calf Raise", category: "Calves", defaultSets: "3×15-20", defaultFocus: "Hypertrophy" },
  { name: "Seated Calf Raise", category: "Calves", defaultSets: "3×15-20", defaultFocus: "Hypertrophy" },
  { name: "Leg Press Calf Raise", category: "Calves", defaultSets: "3×15-20", defaultFocus: "Hypertrophy" },
  { name: "Donkey Calf Raise", category: "Calves", defaultSets: "3×15-20", defaultFocus: "Hypertrophy" },

  // Core
  { name: "Plank", category: "Core", defaultSets: "3×30-60s", defaultFocus: "Prehab" },
  { name: "Dead Bug", category: "Core", defaultSets: "3×10-12", defaultFocus: "Prehab" },
  { name: "Bird Dog", category: "Core", defaultSets: "3×10-12", defaultFocus: "Prehab" },
  { name: "Ab Wheel Rollout", category: "Core", defaultSets: "3×10-12", defaultFocus: "Hypertrophy" },
  { name: "Hanging Leg Raise", category: "Core", defaultSets: "3×10-15", defaultFocus: "Hypertrophy" },
  { name: "Cable Crunch", category: "Core", defaultSets: "3×15-20", defaultFocus: "Hypertrophy" },
  { name: "Russian Twist", category: "Core", defaultSets: "3×15-20", defaultFocus: "Hypertrophy" },
  { name: "Pallof Press", category: "Core", defaultSets: "3×10-12", defaultFocus: "Prehab" },
  { name: "Side Plank", category: "Core", defaultSets: "3×30-45s", defaultFocus: "Prehab" },
  { name: "Crunch", category: "Core", defaultSets: "3×15-20", defaultFocus: "Hypertrophy" },

  // Rehab/Prehab
  { name: "External Rotation", category: "Prehab", defaultSets: "3×15-20", defaultFocus: "Prehab" },
  { name: "Internal Rotation", category: "Prehab", defaultSets: "3×15-20", defaultFocus: "Prehab" },
  { name: "Band Dislocates", category: "Prehab", defaultSets: "2×15", defaultFocus: "Prehab" },
  { name: "Foam Rolling", category: "Rehab", defaultSets: "5-10 min", defaultFocus: "Rehab" },
  { name: "Stretching", category: "Rehab", defaultSets: "10-15 min", defaultFocus: "Rehab" },
  { name: "Mobility Flow", category: "Rehab", defaultSets: "10-15 min", defaultFocus: "Rehab" },
  { name: "Rice Bucket", category: "Rehab", defaultSets: "5-10 min", defaultFocus: "Rehab" },
];

// Search exercises by name (fuzzy match)
export function searchExercises(query: string, limit = 10): ExerciseSuggestion[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  const results: { exercise: ExerciseSuggestion; score: number }[] = [];

  for (const exercise of EXERCISE_DATABASE) {
    const name = exercise.name.toLowerCase();
    const category = exercise.category.toLowerCase();

    // Exact match gets highest score
    if (name === q) {
      results.push({ exercise, score: 100 });
      continue;
    }

    // Starts with query
    if (name.startsWith(q)) {
      results.push({ exercise, score: 80 });
      continue;
    }

    // Contains query as word
    if (name.includes(` ${q}`) || name.includes(`${q} `)) {
      results.push({ exercise, score: 60 });
      continue;
    }

    // Contains query
    if (name.includes(q)) {
      results.push({ exercise, score: 40 });
      continue;
    }

    // Category match
    if (category.includes(q)) {
      results.push({ exercise, score: 20 });
      continue;
    }

    // Fuzzy: check if all query chars appear in order
    let idx = 0;
    for (const char of q) {
      const found = name.indexOf(char, idx);
      if (found === -1) break;
      idx = found + 1;
    }
    if (idx > 0 && q.length > 2) {
      results.push({ exercise, score: 10 });
    }
  }

  // Sort by score descending, then alphabetically
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.exercise.name.localeCompare(b.exercise.name);
  });

  return results.slice(0, limit).map(r => r.exercise);
}

// Get exercises by category
export function getExercisesByCategory(category: string): ExerciseSuggestion[] {
  return EXERCISE_DATABASE.filter(e =>
    e.category.toLowerCase() === category.toLowerCase()
  );
}

// Get all categories
export function getCategories(): string[] {
  const cats = new Set(EXERCISE_DATABASE.map(e => e.category));
  return Array.from(cats).sort();
}
