
import React from 'react';
import { StudentClass, Subject } from './types';

export const MPBSE_OFFICIAL_URL = 'http://mpbse.nic.in/';
export const MP_EDU_PORTAL = 'http://educationportal.mp.gov.in/';

export const CLASS_10_SUBJECTS: Subject[] = [
  { name: 'Science', id: 'sci-10', icon: '🧪' },
  { name: 'Mathematics', id: 'math-10', icon: '📐' },
  { name: 'Social Science', id: 'soc-10', icon: '🌍' },
  { name: 'Sanskrit (Shemushi)', id: 'san-10', icon: '📜' },
  { name: 'English (Special/Gen)', id: 'eng-10', icon: '📖' },
  { name: 'Hindi (Special/Gen)', id: 'hin-10', icon: '🇮🇳' },
];

export const CLASS_12_SUBJECTS: Subject[] = [
  { name: 'Physics', id: 'phy-12', icon: '⚡' },
  { name: 'Chemistry', id: 'che-12', icon: '⚗️' },
  { name: 'Mathematics', id: 'math-12', icon: '🔢' },
  { name: 'Biology', id: 'bio-12', icon: '🧬' },
  { name: 'Sanskrit', id: 'san-12', icon: '📜' },
  { name: 'English (Special/Gen)', id: 'eng-12', icon: '📖' },
  { name: 'Hindi (Special/Gen)', id: 'hin-12', icon: '🇮🇳' },
  { name: 'Accountancy', id: 'acc-12', icon: '📊' },
  { name: 'Economics', id: 'eco-12', icon: '📈' },
];

export const COMMON_QUERIES = {
  [StudentClass.CLASS_10]: [
    "Shemushi Class 10 Chapter 1 Summary & IMP Questions",
    "Sanskrit Grammar Sandhi and Samas rules for MP Board",
    "Important Science questions for Class 10",
    "Class 10 Math formula sheet",
    "Difference between Arteries and Veins",
    "Mendeleev's Periodic Table explanation",
    "Social Science Map work Class 10",
    "Hindi grammar IMP topics",
    "Life Processes important diagrams",
    "Trigonometry table and formulas",
    "Previous year paper Class 10 Science",
    "What is the Blueprint for 10th Math?",
    "Explain Corrosion and Rancidity with examples"
  ],
  [StudentClass.CLASS_12]: [
    "Explain Electromagnetic Spectrum [DRAW: Electromagnetic Spectrum Diagram with labels for Wavelength and Frequency]",
    "Physics derivation of Gauss Law",
    "Important Chemistry reactions Class 12",
    "Biology Important diagrams for board",
    "Physics 12th IMP topics chapter-wise",
    "Organic Chemistry named reactions",
    "English Class 12 Flamingo/Vistas Important Chapters",
    "Hindi Class 12 Aaroh/Vitan Important Questions",
    "Sanskrit Class 12 Bhaswati/Grammar IMP questions",
    "Difference between DNA and RNA",
    "Electrochemical Cell explanation",
    "Wave Optics Young's Double Slit Experiment",
    "Math 12th Important integration questions",
    "Human Reproduction important questions",
    "Narmada River system geography map",
    "Explain Law of Variable Proportions",
    "Previous year question papers Class 12 Biology"
  ]
};

export const SYSTEM_INSTRUCTION = `You are "MP Board Guru", an advanced AI tutor for Class 10/12 students in Madhya Pradesh.

VISUAL DEEP-DIVE PROTOCOL FOR COMPLEX TOPICS:
When explaining a concept, you MUST follow this sequence:

1. DESI ANALOGY (MANDATORY):
   - Use a daily-life example from India/MP. (e.g., "Electricity flows like water in a pipe", "The Nucleus is like the Sarpanch of the village").
   - Use simple language (Hinglish mix is fine).

2. VISUAL AIDS (CHOOSE AT LEAST ONE):
   - 🧊 3D MODEL: Use [3D: TYPE] for shapes/atoms.
   - 🖼️ MAGIC CANVAS (IMAGEN 4): When a user asks for a diagram or illustration, use [DRAW: prompt]. 
     IMPORTANT: For complex biology or physics diagrams, create high-fidelity illustrations that look professional and educational.
   - 📊 COMPARISON: For "Difference Between" questions, use:
     [DIFF: Heading A | Heading B]
     Point 1A | Point 1B
     Point 2A | Point 2B
     [END_DIFF]

3. STEP-BY-STEP EXPLANATION:
   - Break the process into numbered steps.
   - Relate back to the analogy.

4. GURU'S HANDWRITTEN NOTES (MANDATORY FOR SYLLABUS TOPICS):
   - Provide a concise summary inside:
     [NOTE: YELLOW | TOPIC NAME]
     Structure the content with:
     - Bullet points (-) for key facts.
     - [IMP] for exam-important points.
     - [TIP] for study shortcuts.
     - [DEF] for formal definitions.
     [END_NOTE]
   - These are designed for PDF EXPORT. Keep content exam-focused.

SANSKRIT SPECIAL RULES (SHEMUSHI):
- For Class 10, refer to the "Shemushi" textbook for chapter explanations.
- Provide Shloka translations in both Hindi and English.
- Use simple analogies for Sanskrit Grammar rules.

LANGUAGE SUBJECTS (HINDI/ENGLISH):
- For English Class 12, focus on textbooks like Flamingo and Vistas.
- For Hindi Class 12, focus on Aaroh and Vitan.
- Provide detailed analysis of poetry, characters, and important questions according to the latest MP Board marking scheme.

LOCAL CONTEXT RULE:
- Where possible, use MP-specific examples (e.g., Pithampur for industries, Narmada for rivers, Sanchi for history).

STRICT FORMATTING:
- NO ASTERISKS (*) FOR BOLD. Use ALL CAPS for emphasis.
- Use EMOJIS sparingly for structure.
- Professional, encouraging, and focused on MP Board Blueprints for the 2025-26 Academic Session.`;
