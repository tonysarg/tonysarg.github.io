import type { Day } from "@/store/useStore";

export const SEED_PLAN: Day[] = [
    {
      "dayKey": "Mon",
      "title": "Monday – Push Strength (Tri Lead)",
      "blocks": [
        { "name": "Close-Grip Flat DB Press", "sets": "3×6–8", "tempo": "Lower 2s, pause 1s, lift 1s", "cue": "Elbows tucked", "focus": "Strength" },
        { "name": "Weighted Dips", "sets": "3×6–8", "tempo": "Lower 2s, lift 1s", "cue": "Slight forward lean", "focus": "Strength" },
        { "name": "DB Overhead Extension", "sets": "3×8–10", "tempo": "Lower 2s, lift 1s", "cue": "Full stretch", "focus": "Hypertrophy" },
        { "name": "Incline DB Curl", "sets": "3×10–12", "tempo": "Lower 2s, pause 1s, lift 1s", "cue": "Supinate hard", "focus": "Hypertrophy" },
        { "name": "Chest-Supported Rear Delt Raise (HEAVY)", "sets": "3×8–10", "tempo": "Lower 2s, lift 1s", "cue": "No lockout pause", "focus": "Hypertrophy" },
        { "name": "Chest-Supported Rear Delt Raise (LIGHT, high reps)", "sets": "3×15–20", "tempo": "Lower 2s, pause 1s, lift 2s, pause 1s", "cue": "Pull to face, elbows high", "focus": "Isolation" }
      ]
    },
    {
      "dayKey": "Tue",
      "title": "Tuesday – Pull Strength (Back Lead)",
      "blocks": [
        { "name": "Weighted Pull-Ups (neutral/sup.)", "sets": "3×5–8", "tempo": "Lower 2s, pause 1s, lift 1s", "cue": "Chest to bar", "focus": "Strength" },
        { "name": "One-Arm DB Row", "sets": "3×8–10", "tempo": "Lower 2s, pause 1s, lift 1s", "cue": "Retract scapula", "focus": "Hypertrophy" },
        { "name": "Chest-Supported Rear Delt Raise", "sets": "3×15–20", "tempo": "Lower 2s, pause 1s, lift 2s", "cue": "No shrug", "focus": "Isolation" },
        { "name": "Zottman Curl", "sets": "3×10–12", "tempo": "Lower 2s, pause 1s, lift 2s", "cue": "Slow lower", "focus": "Hypertrophy" },
        { "name": "DB Shrugs", "sets": "2×12–15", "tempo": "Lower 2s, pause 1s, lift 1s, pause 1s", "cue": "Full trap squeeze", "focus": "Isolation" },
        { "name": "Incline Prone DB Pullover", "sets": "2×12–15", "tempo": "Lower 2s, lift 1s, pause 1s", "cue": "Arms straight", "focus": "Isolation" }
      ]
    },
    {
      "dayKey": "Wed",
      "title": "Wednesday – Recovery / Mobility",
      "blocks": [
        { "name": "Rice Bucket", "sets": "follow along", "tempo": "", "cue": "", "focus": "Rehab" },
        { "name": "Easy Stretching (neck/pec/lat/hip)", "sets": "10–15 min", "tempo": "", "cue": "Gentle, pain-free", "focus": "Rehab" },
        { "name": "Mobility Flow (shoulders/hips/T-spine)", "sets": "10–15 min", "tempo": "", "cue": "Slow breathing", "focus": "Rehab" }
      ]
    },
    {
      "dayKey": "Thu",
      "title": "Thursday – Push Hypertrophy (Biceps Lead)",
      "blocks": [
        { "name": "Lean-Back DB Curl", "sets": "3×10–12", "tempo": "Lower 2s, pause 1s, lift 1s", "cue": "Elbows back", "focus": "Hypertrophy" },
        { "name": "Spider Curl", "sets": "3×12–15", "tempo": "Lower 2s, pause 1s, lift 2s", "cue": "No shoulder movement", "focus": "Isolation" },
        { "name": "Flat DB Press", "sets": "3×8–10", "tempo": "Lower 2s, lift 1s", "cue": "Controlled lower", "focus": "Hypertrophy" },
        { "name": "DB Fly (flat)", "sets": "3×12–15", "tempo": "Lower 2s, lift 1s, pause 1s", "cue": "Soft elbows", "focus": "Isolation" },
        { "name": "Lateral Raises", "sets": "3×15–20", "tempo": "Lower 2s, lift 2s", "cue": "Lead with elbows", "focus": "Isolation" },
        { "name": "Arnold Press", "sets": "3×10–12", "tempo": "Lower 2s, lift 1s", "cue": "Rotate palms in to out, press up", "focus": "Hypertrophy" }
      ]
    },
    {
      "dayKey": "Fri",
      "title": "Friday – Legs + Isolation",
      "blocks": [
        { "name": "Goblet Squat", "sets": "3×8–10", "tempo": "Lower 2s, pause 1s, lift 1s", "cue": "Depth first", "focus": "Hypertrophy" },
        { "name": "Romanian Deadlift", "sets": "3×8–10", "tempo": "Lower 2s, pause 1s, lift 1s", "cue": "Hips back", "focus": "Hypertrophy" },
        { "name": "Walking Lunge", "sets": "2×20 steps", "tempo": "Lower 2s, lift 1s", "cue": "Heel drive", "focus": "Isolation" },
        { "name": "Calf Raises", "sets": "3×15–20", "tempo": "Lower 2s, pause 1s, lift 2s, pause 1s", "cue": "Full ROM", "focus": "Isolation" },
        { "name": "Incline Curl", "sets": "2×10–12", "tempo": "Lower 2s, pause 1s, lift 1s", "cue": "Elbows pinned", "focus": "Hypertrophy" },
        { "name": "Overhead Triceps Extension", "sets": "2×10–12", "tempo": "Lower 2s, lift 1s", "cue": "Stretch bottom", "focus": "Hypertrophy" },
        { "name": "Prone Rear Delt Raise", "sets": "2×15–20", "tempo": "Lower 2s, pause 1s, lift 2s, pause 1s", "cue": "Elbows high", "focus": "Isolation" }
      ]
    },
    {
      "dayKey": "Sat",
      "title": "Saturday – Upper Pump (PowerBlocks + Bands)",
      "blocks": [
        { "name": "Incline DB Press", "sets": "3×12–15", "tempo": "Lower 2s, pause 1s, lift 1s", "cue": "Shoulders down/back", "focus": "Hypertrophy" },
        { "name": "DB Fly (flat)", "sets": "2×12–15", "tempo": "Lower 2s, lift 1s", "cue": "Deep stretch, soft elbows", "focus": "Isolation" },
        { "name": "One-Arm DB Row", "sets": "3×12–15", "tempo": "Lower 2s, pause 1s, lift 1s", "cue": "Elbow to hip", "focus": "Hypertrophy" },
        { "name": "Band Straight-Arm Pulldown", "sets": "2×15–20", "tempo": "Lower 2s, lift 2s", "cue": "Squeeze lats", "focus": "Isolation" },
        { "name": "DB Lateral Raise", "sets": "4×15–20", "tempo": "Lower 2s, lift 2s", "cue": "Lead with elbows", "focus": "Isolation" },
        { "name": "Band Face Pull", "sets": "2×15–20", "tempo": "Lower 2s, pause 1s, lift 2s", "cue": "Pull to eyes", "focus": "Isolation" },
        { "name": "DB Curl", "sets": "3×12–15", "tempo": "Lower 2s, pause 1s, lift 1s", "cue": "Supinate hard", "focus": "Hypertrophy" },
        { "name": "DB Hammer Curl", "sets": "2×12–15", "tempo": "Lower 2s, lift 1s", "cue": "Neutral wrist", "focus": "Hypertrophy" },
        { "name": "DB Overhead Extension or Band Pushdown", "sets": "3×12–15", "tempo": "Lower 2s, lift 1s", "cue": "Full stretch", "focus": "Hypertrophy" },
        { "name": "Finisher: Push-Ups + Band Curls", "sets": "2 rounds", "tempo": "", "cue": "To near-failure", "focus": "Isolation" }
      ]
    },
    {
      "dayKey": "Sun",
      "title": "Sunday – Rest",
      "blocks": [
        { "name": "Rest Day", "sets": "", "tempo": "", "cue": "Walk, hydrate", "focus": "Rehab" }
      ]
    }
  ];