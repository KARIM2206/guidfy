export const questionTree = {
  "Q_ROOT": {
    "text": "What is your main goal in learning software engineering?",
    "options": [
      {
        "text": "Build consumer products and startups",
        "modifiers": {
          "Frontend Interest": 5,
          "Mobile Interest": 5,
          "Business Mindset": 10
        },
        "next": "Q_WEB_1"
      },
      {
        "text": "Handle massive data and architecture",
        "modifiers": {
          "Backend Interest": 5,
          "Cloud Interest": 5,
          "Data Mindset": 10
        },
        "next": "Q_BACK_1"
      },
      {
        "text": "Research and advanced algorithms",
        "modifiers": {
          "AI & Data Interest": 5,
          "Data Science Interest": 5,
          "Research Interest": 10
        },
        "next": "Q_AI_1"
      },
      {
        "text": "Secure systems from hackers",
        "modifiers": {
          "Security Interest": 5,
          "Security Mindset": 10
        },
        "next": "Q_SEC_1"
      },
      {
        "text": "I want to do a little bit of everything",
        "modifiers": {
          "Full Stack Interest": 5,
          "Curiosity": 10
        },
        "next": "Q_FULL_1"
      }
    ]
  },
  "Q_WEB_1": {
    "text": "Frontend/Web Scenario 1: Do you prefer visual aesthetics over abstract logic?",
    "options": [
      {
        "text": "Yes, visual aesthetics are crucial",
        "modifiers": {
          "Visual Creativity": 10,
          "Frontend Interest": 8,
          "Backend Interest": -5
        },
        "next": "Q_WEB_2"
      },
      {
        "text": "No, I prefer abstract logic",
        "modifiers": {
          "Logical Thinking": 10,
          "Backend Interest": 8,
          "Frontend Interest": -5
        },
        "next": "Q_WEB_2"
      },
      {
        "text": "I like both equally",
        "modifiers": {
          "Full Stack Interest": 8
        },
        "next": "Q_WEB_2"
      }
    ]
  },
  "Q_WEB_2": {
    "text": "Frontend/Web Scenario 2: Do you prefer visual aesthetics over abstract logic?",
    "options": [
      {
        "text": "Yes, visual aesthetics are crucial",
        "modifiers": {
          "Visual Creativity": 10,
          "Frontend Interest": 8,
          "Backend Interest": -5
        },
        "next": "Q_WEB_3"
      },
      {
        "text": "No, I prefer abstract logic",
        "modifiers": {
          "Logical Thinking": 10,
          "Backend Interest": 8,
          "Frontend Interest": -5
        },
        "next": "Q_WEB_3"
      },
      {
        "text": "I like both equally",
        "modifiers": {
          "Full Stack Interest": 8
        },
        "next": "Q_WEB_3"
      }
    ]
  },
  "Q_WEB_3": {
    "text": "Frontend/Web Scenario 3: Do you prefer visual aesthetics over abstract logic?",
    "options": [
      {
        "text": "Yes, visual aesthetics are crucial",
        "modifiers": {
          "Visual Creativity": 10,
          "Frontend Interest": 8,
          "Backend Interest": -5
        },
        "next": "Q_WEB_4"
      },
      {
        "text": "No, I prefer abstract logic",
        "modifiers": {
          "Logical Thinking": 10,
          "Backend Interest": 8,
          "Frontend Interest": -5
        },
        "next": "Q_WEB_4"
      },
      {
        "text": "I like both equally",
        "modifiers": {
          "Full Stack Interest": 8
        },
        "next": "Q_WEB_4"
      }
    ]
  },
  "Q_WEB_4": {
    "text": "Frontend/Web Scenario 4: Do you prefer visual aesthetics over abstract logic?",
    "options": [
      {
        "text": "Yes, visual aesthetics are crucial",
        "modifiers": {
          "Visual Creativity": 10,
          "Frontend Interest": 8,
          "Backend Interest": -5
        },
        "next": "Q_WEB_5"
      },
      {
        "text": "No, I prefer abstract logic",
        "modifiers": {
          "Logical Thinking": 10,
          "Backend Interest": 8,
          "Frontend Interest": -5
        },
        "next": "Q_WEB_5"
      },
      {
        "text": "I like both equally",
        "modifiers": {
          "Full Stack Interest": 8
        },
        "next": "Q_WEB_5"
      }
    ]
  },
  "Q_WEB_5": {
    "text": "Frontend/Web Scenario 5: Do you prefer visual aesthetics over abstract logic?",
    "options": [
      {
        "text": "Yes, visual aesthetics are crucial",
        "modifiers": {
          "Visual Creativity": 10,
          "Frontend Interest": 8,
          "Backend Interest": -5
        },
        "next": "Q_WEB_6"
      },
      {
        "text": "No, I prefer abstract logic",
        "modifiers": {
          "Logical Thinking": 10,
          "Backend Interest": 8,
          "Frontend Interest": -5
        },
        "next": "Q_WEB_6"
      },
      {
        "text": "I like both equally",
        "modifiers": {
          "Full Stack Interest": 8
        },
        "next": "Q_WEB_6"
      }
    ]
  },
  "Q_WEB_6": {
    "text": "Frontend/Web Scenario 6: Do you prefer visual aesthetics over abstract logic?",
    "options": [
      {
        "text": "Yes, visual aesthetics are crucial",
        "modifiers": {
          "Visual Creativity": 10,
          "Frontend Interest": 8,
          "Backend Interest": -5
        },
        "next": "Q_WEB_7"
      },
      {
        "text": "No, I prefer abstract logic",
        "modifiers": {
          "Logical Thinking": 10,
          "Backend Interest": 8,
          "Frontend Interest": -5
        },
        "next": "Q_WEB_7"
      },
      {
        "text": "I like both equally",
        "modifiers": {
          "Full Stack Interest": 8
        },
        "next": "Q_WEB_7"
      }
    ]
  },
  "Q_WEB_7": {
    "text": "Frontend/Web Scenario 7: Do you prefer visual aesthetics over abstract logic?",
    "options": [
      {
        "text": "Yes, visual aesthetics are crucial",
        "modifiers": {
          "Visual Creativity": 10,
          "Frontend Interest": 8,
          "Backend Interest": -5
        },
        "next": "Q_WEB_8"
      },
      {
        "text": "No, I prefer abstract logic",
        "modifiers": {
          "Logical Thinking": 10,
          "Backend Interest": 8,
          "Frontend Interest": -5
        },
        "next": "Q_WEB_8"
      },
      {
        "text": "I like both equally",
        "modifiers": {
          "Full Stack Interest": 8
        },
        "next": "Q_WEB_8"
      }
    ]
  },
  "Q_WEB_8": {
    "text": "Frontend/Web Scenario 8: Do you prefer visual aesthetics over abstract logic?",
    "options": [
      {
        "text": "Yes, visual aesthetics are crucial",
        "modifiers": {
          "Visual Creativity": 10,
          "Frontend Interest": 8,
          "Backend Interest": -5
        },
        "next": "Q_WEB_9"
      },
      {
        "text": "No, I prefer abstract logic",
        "modifiers": {
          "Logical Thinking": 10,
          "Backend Interest": 8,
          "Frontend Interest": -5
        },
        "next": "Q_WEB_9"
      },
      {
        "text": "I like both equally",
        "modifiers": {
          "Full Stack Interest": 8
        },
        "next": "Q_WEB_9"
      }
    ]
  },
  "Q_WEB_9": {
    "text": "Frontend/Web Scenario 9: Do you prefer visual aesthetics over abstract logic?",
    "options": [
      {
        "text": "Yes, visual aesthetics are crucial",
        "modifiers": {
          "Visual Creativity": 10,
          "Frontend Interest": 8,
          "Backend Interest": -5
        },
        "next": "Q_WEB_10"
      },
      {
        "text": "No, I prefer abstract logic",
        "modifiers": {
          "Logical Thinking": 10,
          "Backend Interest": 8,
          "Frontend Interest": -5
        },
        "next": "Q_WEB_10"
      },
      {
        "text": "I like both equally",
        "modifiers": {
          "Full Stack Interest": 8
        },
        "next": "Q_WEB_10"
      }
    ]
  },
  "Q_WEB_10": {
    "text": "Frontend/Web Scenario 10: Do you prefer visual aesthetics over abstract logic?",
    "options": [
      {
        "text": "Yes, visual aesthetics are crucial",
        "modifiers": {
          "Visual Creativity": 10,
          "Frontend Interest": 8,
          "Backend Interest": -5
        },
        "next": "Q_WEB_11"
      },
      {
        "text": "No, I prefer abstract logic",
        "modifiers": {
          "Logical Thinking": 10,
          "Backend Interest": 8,
          "Frontend Interest": -5
        },
        "next": "Q_WEB_11"
      },
      {
        "text": "I like both equally",
        "modifiers": {
          "Full Stack Interest": 8
        },
        "next": "Q_WEB_11"
      }
    ]
  },
  "Q_WEB_11": {
    "text": "Frontend/Web Scenario 11: Do you prefer visual aesthetics over abstract logic?",
    "options": [
      {
        "text": "Yes, visual aesthetics are crucial",
        "modifiers": {
          "Visual Creativity": 10,
          "Frontend Interest": 8,
          "Backend Interest": -5
        },
        "next": "Q_WEB_12"
      },
      {
        "text": "No, I prefer abstract logic",
        "modifiers": {
          "Logical Thinking": 10,
          "Backend Interest": 8,
          "Frontend Interest": -5
        },
        "next": "Q_WEB_12"
      },
      {
        "text": "I like both equally",
        "modifiers": {
          "Full Stack Interest": 8
        },
        "next": "Q_WEB_12"
      }
    ]
  },
  "Q_WEB_12": {
    "text": "Frontend/Web Scenario 12: Do you prefer visual aesthetics over abstract logic?",
    "options": [
      {
        "text": "Yes, visual aesthetics are crucial",
        "modifiers": {
          "Visual Creativity": 10,
          "Frontend Interest": 8,
          "Backend Interest": -5
        },
        "next": "Q_WEB_13"
      },
      {
        "text": "No, I prefer abstract logic",
        "modifiers": {
          "Logical Thinking": 10,
          "Backend Interest": 8,
          "Frontend Interest": -5
        },
        "next": "Q_WEB_13"
      },
      {
        "text": "I like both equally",
        "modifiers": {
          "Full Stack Interest": 8
        },
        "next": "Q_WEB_13"
      }
    ]
  },
  "Q_WEB_13": {
    "text": "Frontend/Web Scenario 13: Do you prefer visual aesthetics over abstract logic?",
    "options": [
      {
        "text": "Yes, visual aesthetics are crucial",
        "modifiers": {
          "Visual Creativity": 10,
          "Frontend Interest": 8,
          "Backend Interest": -5
        },
        "next": "Q_WEB_14"
      },
      {
        "text": "No, I prefer abstract logic",
        "modifiers": {
          "Logical Thinking": 10,
          "Backend Interest": 8,
          "Frontend Interest": -5
        },
        "next": "Q_WEB_14"
      },
      {
        "text": "I like both equally",
        "modifiers": {
          "Full Stack Interest": 8
        },
        "next": "Q_WEB_14"
      }
    ]
  },
  "Q_WEB_14": {
    "text": "Frontend/Web Scenario 14: Do you prefer visual aesthetics over abstract logic?",
    "options": [
      {
        "text": "Yes, visual aesthetics are crucial",
        "modifiers": {
          "Visual Creativity": 10,
          "Frontend Interest": 8,
          "Backend Interest": -5
        },
        "next": "Q_WEB_15"
      },
      {
        "text": "No, I prefer abstract logic",
        "modifiers": {
          "Logical Thinking": 10,
          "Backend Interest": 8,
          "Frontend Interest": -5
        },
        "next": "Q_WEB_15"
      },
      {
        "text": "I like both equally",
        "modifiers": {
          "Full Stack Interest": 8
        },
        "next": "Q_WEB_15"
      }
    ]
  },
  "Q_WEB_15": {
    "text": "Frontend/Web Scenario 15: Do you prefer visual aesthetics over abstract logic?",
    "options": [
      {
        "text": "Yes, visual aesthetics are crucial",
        "modifiers": {
          "Visual Creativity": 10,
          "Frontend Interest": 8,
          "Backend Interest": -5
        },
        "next": "Q_BEHAVIOR_1"
      },
      {
        "text": "No, I prefer abstract logic",
        "modifiers": {
          "Logical Thinking": 10,
          "Backend Interest": 8,
          "Frontend Interest": -5
        },
        "next": "Q_BEHAVIOR_1"
      },
      {
        "text": "I like both equally",
        "modifiers": {
          "Full Stack Interest": 8
        },
        "next": "Q_BEHAVIOR_1"
      }
    ]
  },
  "Q_BACK_1": {
    "text": "Backend/Cloud Scenario 1: Do you enjoy designing scalable databases?",
    "options": [
      {
        "text": "Yes, I love database design",
        "modifiers": {
          "Data Mindset": 10,
          "Backend Interest": 8
        },
        "next": "Q_BACK_2"
      },
      {
        "text": "I prefer automating deployments",
        "modifiers": {
          "Automation Preference": 10,
          "Cloud Interest": 8
        },
        "next": "Q_BACK_2"
      },
      {
        "text": "I don't like backend logic",
        "modifiers": {
          "Backend Interest": -10,
          "Frontend Interest": 5
        },
        "next": "Q_BACK_2"
      }
    ]
  },
  "Q_BACK_2": {
    "text": "Backend/Cloud Scenario 2: Do you enjoy designing scalable databases?",
    "options": [
      {
        "text": "Yes, I love database design",
        "modifiers": {
          "Data Mindset": 10,
          "Backend Interest": 8
        },
        "next": "Q_BACK_3"
      },
      {
        "text": "I prefer automating deployments",
        "modifiers": {
          "Automation Preference": 10,
          "Cloud Interest": 8
        },
        "next": "Q_BACK_3"
      },
      {
        "text": "I don't like backend logic",
        "modifiers": {
          "Backend Interest": -10,
          "Frontend Interest": 5
        },
        "next": "Q_BACK_3"
      }
    ]
  },
  "Q_BACK_3": {
    "text": "Backend/Cloud Scenario 3: Do you enjoy designing scalable databases?",
    "options": [
      {
        "text": "Yes, I love database design",
        "modifiers": {
          "Data Mindset": 10,
          "Backend Interest": 8
        },
        "next": "Q_BACK_4"
      },
      {
        "text": "I prefer automating deployments",
        "modifiers": {
          "Automation Preference": 10,
          "Cloud Interest": 8
        },
        "next": "Q_BACK_4"
      },
      {
        "text": "I don't like backend logic",
        "modifiers": {
          "Backend Interest": -10,
          "Frontend Interest": 5
        },
        "next": "Q_BACK_4"
      }
    ]
  },
  "Q_BACK_4": {
    "text": "Backend/Cloud Scenario 4: Do you enjoy designing scalable databases?",
    "options": [
      {
        "text": "Yes, I love database design",
        "modifiers": {
          "Data Mindset": 10,
          "Backend Interest": 8
        },
        "next": "Q_BACK_5"
      },
      {
        "text": "I prefer automating deployments",
        "modifiers": {
          "Automation Preference": 10,
          "Cloud Interest": 8
        },
        "next": "Q_BACK_5"
      },
      {
        "text": "I don't like backend logic",
        "modifiers": {
          "Backend Interest": -10,
          "Frontend Interest": 5
        },
        "next": "Q_BACK_5"
      }
    ]
  },
  "Q_BACK_5": {
    "text": "Backend/Cloud Scenario 5: Do you enjoy designing scalable databases?",
    "options": [
      {
        "text": "Yes, I love database design",
        "modifiers": {
          "Data Mindset": 10,
          "Backend Interest": 8
        },
        "next": "Q_BACK_6"
      },
      {
        "text": "I prefer automating deployments",
        "modifiers": {
          "Automation Preference": 10,
          "Cloud Interest": 8
        },
        "next": "Q_BACK_6"
      },
      {
        "text": "I don't like backend logic",
        "modifiers": {
          "Backend Interest": -10,
          "Frontend Interest": 5
        },
        "next": "Q_BACK_6"
      }
    ]
  },
  "Q_BACK_6": {
    "text": "Backend/Cloud Scenario 6: Do you enjoy designing scalable databases?",
    "options": [
      {
        "text": "Yes, I love database design",
        "modifiers": {
          "Data Mindset": 10,
          "Backend Interest": 8
        },
        "next": "Q_BACK_7"
      },
      {
        "text": "I prefer automating deployments",
        "modifiers": {
          "Automation Preference": 10,
          "Cloud Interest": 8
        },
        "next": "Q_BACK_7"
      },
      {
        "text": "I don't like backend logic",
        "modifiers": {
          "Backend Interest": -10,
          "Frontend Interest": 5
        },
        "next": "Q_BACK_7"
      }
    ]
  },
  "Q_BACK_7": {
    "text": "Backend/Cloud Scenario 7: Do you enjoy designing scalable databases?",
    "options": [
      {
        "text": "Yes, I love database design",
        "modifiers": {
          "Data Mindset": 10,
          "Backend Interest": 8
        },
        "next": "Q_BACK_8"
      },
      {
        "text": "I prefer automating deployments",
        "modifiers": {
          "Automation Preference": 10,
          "Cloud Interest": 8
        },
        "next": "Q_BACK_8"
      },
      {
        "text": "I don't like backend logic",
        "modifiers": {
          "Backend Interest": -10,
          "Frontend Interest": 5
        },
        "next": "Q_BACK_8"
      }
    ]
  },
  "Q_BACK_8": {
    "text": "Backend/Cloud Scenario 8: Do you enjoy designing scalable databases?",
    "options": [
      {
        "text": "Yes, I love database design",
        "modifiers": {
          "Data Mindset": 10,
          "Backend Interest": 8
        },
        "next": "Q_BACK_9"
      },
      {
        "text": "I prefer automating deployments",
        "modifiers": {
          "Automation Preference": 10,
          "Cloud Interest": 8
        },
        "next": "Q_BACK_9"
      },
      {
        "text": "I don't like backend logic",
        "modifiers": {
          "Backend Interest": -10,
          "Frontend Interest": 5
        },
        "next": "Q_BACK_9"
      }
    ]
  },
  "Q_BACK_9": {
    "text": "Backend/Cloud Scenario 9: Do you enjoy designing scalable databases?",
    "options": [
      {
        "text": "Yes, I love database design",
        "modifiers": {
          "Data Mindset": 10,
          "Backend Interest": 8
        },
        "next": "Q_BACK_10"
      },
      {
        "text": "I prefer automating deployments",
        "modifiers": {
          "Automation Preference": 10,
          "Cloud Interest": 8
        },
        "next": "Q_BACK_10"
      },
      {
        "text": "I don't like backend logic",
        "modifiers": {
          "Backend Interest": -10,
          "Frontend Interest": 5
        },
        "next": "Q_BACK_10"
      }
    ]
  },
  "Q_BACK_10": {
    "text": "Backend/Cloud Scenario 10: Do you enjoy designing scalable databases?",
    "options": [
      {
        "text": "Yes, I love database design",
        "modifiers": {
          "Data Mindset": 10,
          "Backend Interest": 8
        },
        "next": "Q_BACK_11"
      },
      {
        "text": "I prefer automating deployments",
        "modifiers": {
          "Automation Preference": 10,
          "Cloud Interest": 8
        },
        "next": "Q_BACK_11"
      },
      {
        "text": "I don't like backend logic",
        "modifiers": {
          "Backend Interest": -10,
          "Frontend Interest": 5
        },
        "next": "Q_BACK_11"
      }
    ]
  },
  "Q_BACK_11": {
    "text": "Backend/Cloud Scenario 11: Do you enjoy designing scalable databases?",
    "options": [
      {
        "text": "Yes, I love database design",
        "modifiers": {
          "Data Mindset": 10,
          "Backend Interest": 8
        },
        "next": "Q_BACK_12"
      },
      {
        "text": "I prefer automating deployments",
        "modifiers": {
          "Automation Preference": 10,
          "Cloud Interest": 8
        },
        "next": "Q_BACK_12"
      },
      {
        "text": "I don't like backend logic",
        "modifiers": {
          "Backend Interest": -10,
          "Frontend Interest": 5
        },
        "next": "Q_BACK_12"
      }
    ]
  },
  "Q_BACK_12": {
    "text": "Backend/Cloud Scenario 12: Do you enjoy designing scalable databases?",
    "options": [
      {
        "text": "Yes, I love database design",
        "modifiers": {
          "Data Mindset": 10,
          "Backend Interest": 8
        },
        "next": "Q_BACK_13"
      },
      {
        "text": "I prefer automating deployments",
        "modifiers": {
          "Automation Preference": 10,
          "Cloud Interest": 8
        },
        "next": "Q_BACK_13"
      },
      {
        "text": "I don't like backend logic",
        "modifiers": {
          "Backend Interest": -10,
          "Frontend Interest": 5
        },
        "next": "Q_BACK_13"
      }
    ]
  },
  "Q_BACK_13": {
    "text": "Backend/Cloud Scenario 13: Do you enjoy designing scalable databases?",
    "options": [
      {
        "text": "Yes, I love database design",
        "modifiers": {
          "Data Mindset": 10,
          "Backend Interest": 8
        },
        "next": "Q_BACK_14"
      },
      {
        "text": "I prefer automating deployments",
        "modifiers": {
          "Automation Preference": 10,
          "Cloud Interest": 8
        },
        "next": "Q_BACK_14"
      },
      {
        "text": "I don't like backend logic",
        "modifiers": {
          "Backend Interest": -10,
          "Frontend Interest": 5
        },
        "next": "Q_BACK_14"
      }
    ]
  },
  "Q_BACK_14": {
    "text": "Backend/Cloud Scenario 14: Do you enjoy designing scalable databases?",
    "options": [
      {
        "text": "Yes, I love database design",
        "modifiers": {
          "Data Mindset": 10,
          "Backend Interest": 8
        },
        "next": "Q_BACK_15"
      },
      {
        "text": "I prefer automating deployments",
        "modifiers": {
          "Automation Preference": 10,
          "Cloud Interest": 8
        },
        "next": "Q_BACK_15"
      },
      {
        "text": "I don't like backend logic",
        "modifiers": {
          "Backend Interest": -10,
          "Frontend Interest": 5
        },
        "next": "Q_BACK_15"
      }
    ]
  },
  "Q_BACK_15": {
    "text": "Backend/Cloud Scenario 15: Do you enjoy designing scalable databases?",
    "options": [
      {
        "text": "Yes, I love database design",
        "modifiers": {
          "Data Mindset": 10,
          "Backend Interest": 8
        },
        "next": "Q_BEHAVIOR_1"
      },
      {
        "text": "I prefer automating deployments",
        "modifiers": {
          "Automation Preference": 10,
          "Cloud Interest": 8
        },
        "next": "Q_BEHAVIOR_1"
      },
      {
        "text": "I don't like backend logic",
        "modifiers": {
          "Backend Interest": -10,
          "Frontend Interest": 5
        },
        "next": "Q_BEHAVIOR_1"
      }
    ]
  },
  "Q_AI_1": {
    "text": "AI/Data Scenario 1: How do you feel about heavy statistical analysis?",
    "options": [
      {
        "text": "I love statistics and math",
        "modifiers": {
          "Analytical Score": 10,
          "Data Science Interest": 8,
          "AI & Data Interest": 5
        },
        "next": "Q_AI_2"
      },
      {
        "text": "I tolerate it, but prefer building models",
        "modifiers": {
          "AI & Data Interest": 10,
          "Analytical Score": 5
        },
        "next": "Q_AI_2"
      },
      {
        "text": "I hate math and statistics",
        "modifiers": {
          "Analytical Score": -15,
          "AI & Data Interest": -15,
          "Data Science Interest": -15
        },
        "next": "Q_AI_2"
      }
    ]
  },
  "Q_AI_2": {
    "text": "AI/Data Scenario 2: How do you feel about heavy statistical analysis?",
    "options": [
      {
        "text": "I love statistics and math",
        "modifiers": {
          "Analytical Score": 10,
          "Data Science Interest": 8,
          "AI & Data Interest": 5
        },
        "next": "Q_AI_3"
      },
      {
        "text": "I tolerate it, but prefer building models",
        "modifiers": {
          "AI & Data Interest": 10,
          "Analytical Score": 5
        },
        "next": "Q_AI_3"
      },
      {
        "text": "I hate math and statistics",
        "modifiers": {
          "Analytical Score": -15,
          "AI & Data Interest": -15,
          "Data Science Interest": -15
        },
        "next": "Q_AI_3"
      }
    ]
  },
  "Q_AI_3": {
    "text": "AI/Data Scenario 3: How do you feel about heavy statistical analysis?",
    "options": [
      {
        "text": "I love statistics and math",
        "modifiers": {
          "Analytical Score": 10,
          "Data Science Interest": 8,
          "AI & Data Interest": 5
        },
        "next": "Q_AI_4"
      },
      {
        "text": "I tolerate it, but prefer building models",
        "modifiers": {
          "AI & Data Interest": 10,
          "Analytical Score": 5
        },
        "next": "Q_AI_4"
      },
      {
        "text": "I hate math and statistics",
        "modifiers": {
          "Analytical Score": -15,
          "AI & Data Interest": -15,
          "Data Science Interest": -15
        },
        "next": "Q_AI_4"
      }
    ]
  },
  "Q_AI_4": {
    "text": "AI/Data Scenario 4: How do you feel about heavy statistical analysis?",
    "options": [
      {
        "text": "I love statistics and math",
        "modifiers": {
          "Analytical Score": 10,
          "Data Science Interest": 8,
          "AI & Data Interest": 5
        },
        "next": "Q_AI_5"
      },
      {
        "text": "I tolerate it, but prefer building models",
        "modifiers": {
          "AI & Data Interest": 10,
          "Analytical Score": 5
        },
        "next": "Q_AI_5"
      },
      {
        "text": "I hate math and statistics",
        "modifiers": {
          "Analytical Score": -15,
          "AI & Data Interest": -15,
          "Data Science Interest": -15
        },
        "next": "Q_AI_5"
      }
    ]
  },
  "Q_AI_5": {
    "text": "AI/Data Scenario 5: How do you feel about heavy statistical analysis?",
    "options": [
      {
        "text": "I love statistics and math",
        "modifiers": {
          "Analytical Score": 10,
          "Data Science Interest": 8,
          "AI & Data Interest": 5
        },
        "next": "Q_AI_6"
      },
      {
        "text": "I tolerate it, but prefer building models",
        "modifiers": {
          "AI & Data Interest": 10,
          "Analytical Score": 5
        },
        "next": "Q_AI_6"
      },
      {
        "text": "I hate math and statistics",
        "modifiers": {
          "Analytical Score": -15,
          "AI & Data Interest": -15,
          "Data Science Interest": -15
        },
        "next": "Q_AI_6"
      }
    ]
  },
  "Q_AI_6": {
    "text": "AI/Data Scenario 6: How do you feel about heavy statistical analysis?",
    "options": [
      {
        "text": "I love statistics and math",
        "modifiers": {
          "Analytical Score": 10,
          "Data Science Interest": 8,
          "AI & Data Interest": 5
        },
        "next": "Q_AI_7"
      },
      {
        "text": "I tolerate it, but prefer building models",
        "modifiers": {
          "AI & Data Interest": 10,
          "Analytical Score": 5
        },
        "next": "Q_AI_7"
      },
      {
        "text": "I hate math and statistics",
        "modifiers": {
          "Analytical Score": -15,
          "AI & Data Interest": -15,
          "Data Science Interest": -15
        },
        "next": "Q_AI_7"
      }
    ]
  },
  "Q_AI_7": {
    "text": "AI/Data Scenario 7: How do you feel about heavy statistical analysis?",
    "options": [
      {
        "text": "I love statistics and math",
        "modifiers": {
          "Analytical Score": 10,
          "Data Science Interest": 8,
          "AI & Data Interest": 5
        },
        "next": "Q_AI_8"
      },
      {
        "text": "I tolerate it, but prefer building models",
        "modifiers": {
          "AI & Data Interest": 10,
          "Analytical Score": 5
        },
        "next": "Q_AI_8"
      },
      {
        "text": "I hate math and statistics",
        "modifiers": {
          "Analytical Score": -15,
          "AI & Data Interest": -15,
          "Data Science Interest": -15
        },
        "next": "Q_AI_8"
      }
    ]
  },
  "Q_AI_8": {
    "text": "AI/Data Scenario 8: How do you feel about heavy statistical analysis?",
    "options": [
      {
        "text": "I love statistics and math",
        "modifiers": {
          "Analytical Score": 10,
          "Data Science Interest": 8,
          "AI & Data Interest": 5
        },
        "next": "Q_AI_9"
      },
      {
        "text": "I tolerate it, but prefer building models",
        "modifiers": {
          "AI & Data Interest": 10,
          "Analytical Score": 5
        },
        "next": "Q_AI_9"
      },
      {
        "text": "I hate math and statistics",
        "modifiers": {
          "Analytical Score": -15,
          "AI & Data Interest": -15,
          "Data Science Interest": -15
        },
        "next": "Q_AI_9"
      }
    ]
  },
  "Q_AI_9": {
    "text": "AI/Data Scenario 9: How do you feel about heavy statistical analysis?",
    "options": [
      {
        "text": "I love statistics and math",
        "modifiers": {
          "Analytical Score": 10,
          "Data Science Interest": 8,
          "AI & Data Interest": 5
        },
        "next": "Q_AI_10"
      },
      {
        "text": "I tolerate it, but prefer building models",
        "modifiers": {
          "AI & Data Interest": 10,
          "Analytical Score": 5
        },
        "next": "Q_AI_10"
      },
      {
        "text": "I hate math and statistics",
        "modifiers": {
          "Analytical Score": -15,
          "AI & Data Interest": -15,
          "Data Science Interest": -15
        },
        "next": "Q_AI_10"
      }
    ]
  },
  "Q_AI_10": {
    "text": "AI/Data Scenario 10: How do you feel about heavy statistical analysis?",
    "options": [
      {
        "text": "I love statistics and math",
        "modifiers": {
          "Analytical Score": 10,
          "Data Science Interest": 8,
          "AI & Data Interest": 5
        },
        "next": "Q_AI_11"
      },
      {
        "text": "I tolerate it, but prefer building models",
        "modifiers": {
          "AI & Data Interest": 10,
          "Analytical Score": 5
        },
        "next": "Q_AI_11"
      },
      {
        "text": "I hate math and statistics",
        "modifiers": {
          "Analytical Score": -15,
          "AI & Data Interest": -15,
          "Data Science Interest": -15
        },
        "next": "Q_AI_11"
      }
    ]
  },
  "Q_AI_11": {
    "text": "AI/Data Scenario 11: How do you feel about heavy statistical analysis?",
    "options": [
      {
        "text": "I love statistics and math",
        "modifiers": {
          "Analytical Score": 10,
          "Data Science Interest": 8,
          "AI & Data Interest": 5
        },
        "next": "Q_AI_12"
      },
      {
        "text": "I tolerate it, but prefer building models",
        "modifiers": {
          "AI & Data Interest": 10,
          "Analytical Score": 5
        },
        "next": "Q_AI_12"
      },
      {
        "text": "I hate math and statistics",
        "modifiers": {
          "Analytical Score": -15,
          "AI & Data Interest": -15,
          "Data Science Interest": -15
        },
        "next": "Q_AI_12"
      }
    ]
  },
  "Q_AI_12": {
    "text": "AI/Data Scenario 12: How do you feel about heavy statistical analysis?",
    "options": [
      {
        "text": "I love statistics and math",
        "modifiers": {
          "Analytical Score": 10,
          "Data Science Interest": 8,
          "AI & Data Interest": 5
        },
        "next": "Q_AI_13"
      },
      {
        "text": "I tolerate it, but prefer building models",
        "modifiers": {
          "AI & Data Interest": 10,
          "Analytical Score": 5
        },
        "next": "Q_AI_13"
      },
      {
        "text": "I hate math and statistics",
        "modifiers": {
          "Analytical Score": -15,
          "AI & Data Interest": -15,
          "Data Science Interest": -15
        },
        "next": "Q_AI_13"
      }
    ]
  },
  "Q_AI_13": {
    "text": "AI/Data Scenario 13: How do you feel about heavy statistical analysis?",
    "options": [
      {
        "text": "I love statistics and math",
        "modifiers": {
          "Analytical Score": 10,
          "Data Science Interest": 8,
          "AI & Data Interest": 5
        },
        "next": "Q_AI_14"
      },
      {
        "text": "I tolerate it, but prefer building models",
        "modifiers": {
          "AI & Data Interest": 10,
          "Analytical Score": 5
        },
        "next": "Q_AI_14"
      },
      {
        "text": "I hate math and statistics",
        "modifiers": {
          "Analytical Score": -15,
          "AI & Data Interest": -15,
          "Data Science Interest": -15
        },
        "next": "Q_AI_14"
      }
    ]
  },
  "Q_AI_14": {
    "text": "AI/Data Scenario 14: How do you feel about heavy statistical analysis?",
    "options": [
      {
        "text": "I love statistics and math",
        "modifiers": {
          "Analytical Score": 10,
          "Data Science Interest": 8,
          "AI & Data Interest": 5
        },
        "next": "Q_AI_15"
      },
      {
        "text": "I tolerate it, but prefer building models",
        "modifiers": {
          "AI & Data Interest": 10,
          "Analytical Score": 5
        },
        "next": "Q_AI_15"
      },
      {
        "text": "I hate math and statistics",
        "modifiers": {
          "Analytical Score": -15,
          "AI & Data Interest": -15,
          "Data Science Interest": -15
        },
        "next": "Q_AI_15"
      }
    ]
  },
  "Q_AI_15": {
    "text": "AI/Data Scenario 15: How do you feel about heavy statistical analysis?",
    "options": [
      {
        "text": "I love statistics and math",
        "modifiers": {
          "Analytical Score": 10,
          "Data Science Interest": 8,
          "AI & Data Interest": 5
        },
        "next": "Q_BEHAVIOR_1"
      },
      {
        "text": "I tolerate it, but prefer building models",
        "modifiers": {
          "AI & Data Interest": 10,
          "Analytical Score": 5
        },
        "next": "Q_BEHAVIOR_1"
      },
      {
        "text": "I hate math and statistics",
        "modifiers": {
          "Analytical Score": -15,
          "AI & Data Interest": -15,
          "Data Science Interest": -15
        },
        "next": "Q_BEHAVIOR_1"
      }
    ]
  },
  "Q_SEC_1": {
    "text": "Security Scenario 1: Do you enjoy finding loopholes in systems?",
    "options": [
      {
        "text": "Yes, it's my favorite thing",
        "modifiers": {
          "Security Mindset": 10,
          "Security Interest": 8,
          "Curiosity": 5
        },
        "next": "Q_SEC_2"
      },
      {
        "text": "No, I prefer building systems",
        "modifiers": {
          "Security Interest": -5,
          "Backend Interest": 8
        },
        "next": "Q_SEC_2"
      }
    ]
  },
  "Q_SEC_2": {
    "text": "Security Scenario 2: Do you enjoy finding loopholes in systems?",
    "options": [
      {
        "text": "Yes, it's my favorite thing",
        "modifiers": {
          "Security Mindset": 10,
          "Security Interest": 8,
          "Curiosity": 5
        },
        "next": "Q_SEC_3"
      },
      {
        "text": "No, I prefer building systems",
        "modifiers": {
          "Security Interest": -5,
          "Backend Interest": 8
        },
        "next": "Q_SEC_3"
      }
    ]
  },
  "Q_SEC_3": {
    "text": "Security Scenario 3: Do you enjoy finding loopholes in systems?",
    "options": [
      {
        "text": "Yes, it's my favorite thing",
        "modifiers": {
          "Security Mindset": 10,
          "Security Interest": 8,
          "Curiosity": 5
        },
        "next": "Q_SEC_4"
      },
      {
        "text": "No, I prefer building systems",
        "modifiers": {
          "Security Interest": -5,
          "Backend Interest": 8
        },
        "next": "Q_SEC_4"
      }
    ]
  },
  "Q_SEC_4": {
    "text": "Security Scenario 4: Do you enjoy finding loopholes in systems?",
    "options": [
      {
        "text": "Yes, it's my favorite thing",
        "modifiers": {
          "Security Mindset": 10,
          "Security Interest": 8,
          "Curiosity": 5
        },
        "next": "Q_SEC_5"
      },
      {
        "text": "No, I prefer building systems",
        "modifiers": {
          "Security Interest": -5,
          "Backend Interest": 8
        },
        "next": "Q_SEC_5"
      }
    ]
  },
  "Q_SEC_5": {
    "text": "Security Scenario 5: Do you enjoy finding loopholes in systems?",
    "options": [
      {
        "text": "Yes, it's my favorite thing",
        "modifiers": {
          "Security Mindset": 10,
          "Security Interest": 8,
          "Curiosity": 5
        },
        "next": "Q_SEC_6"
      },
      {
        "text": "No, I prefer building systems",
        "modifiers": {
          "Security Interest": -5,
          "Backend Interest": 8
        },
        "next": "Q_SEC_6"
      }
    ]
  },
  "Q_SEC_6": {
    "text": "Security Scenario 6: Do you enjoy finding loopholes in systems?",
    "options": [
      {
        "text": "Yes, it's my favorite thing",
        "modifiers": {
          "Security Mindset": 10,
          "Security Interest": 8,
          "Curiosity": 5
        },
        "next": "Q_SEC_7"
      },
      {
        "text": "No, I prefer building systems",
        "modifiers": {
          "Security Interest": -5,
          "Backend Interest": 8
        },
        "next": "Q_SEC_7"
      }
    ]
  },
  "Q_SEC_7": {
    "text": "Security Scenario 7: Do you enjoy finding loopholes in systems?",
    "options": [
      {
        "text": "Yes, it's my favorite thing",
        "modifiers": {
          "Security Mindset": 10,
          "Security Interest": 8,
          "Curiosity": 5
        },
        "next": "Q_SEC_8"
      },
      {
        "text": "No, I prefer building systems",
        "modifiers": {
          "Security Interest": -5,
          "Backend Interest": 8
        },
        "next": "Q_SEC_8"
      }
    ]
  },
  "Q_SEC_8": {
    "text": "Security Scenario 8: Do you enjoy finding loopholes in systems?",
    "options": [
      {
        "text": "Yes, it's my favorite thing",
        "modifiers": {
          "Security Mindset": 10,
          "Security Interest": 8,
          "Curiosity": 5
        },
        "next": "Q_SEC_9"
      },
      {
        "text": "No, I prefer building systems",
        "modifiers": {
          "Security Interest": -5,
          "Backend Interest": 8
        },
        "next": "Q_SEC_9"
      }
    ]
  },
  "Q_SEC_9": {
    "text": "Security Scenario 9: Do you enjoy finding loopholes in systems?",
    "options": [
      {
        "text": "Yes, it's my favorite thing",
        "modifiers": {
          "Security Mindset": 10,
          "Security Interest": 8,
          "Curiosity": 5
        },
        "next": "Q_SEC_10"
      },
      {
        "text": "No, I prefer building systems",
        "modifiers": {
          "Security Interest": -5,
          "Backend Interest": 8
        },
        "next": "Q_SEC_10"
      }
    ]
  },
  "Q_SEC_10": {
    "text": "Security Scenario 10: Do you enjoy finding loopholes in systems?",
    "options": [
      {
        "text": "Yes, it's my favorite thing",
        "modifiers": {
          "Security Mindset": 10,
          "Security Interest": 8,
          "Curiosity": 5
        },
        "next": "Q_SEC_11"
      },
      {
        "text": "No, I prefer building systems",
        "modifiers": {
          "Security Interest": -5,
          "Backend Interest": 8
        },
        "next": "Q_SEC_11"
      }
    ]
  },
  "Q_SEC_11": {
    "text": "Security Scenario 11: Do you enjoy finding loopholes in systems?",
    "options": [
      {
        "text": "Yes, it's my favorite thing",
        "modifiers": {
          "Security Mindset": 10,
          "Security Interest": 8,
          "Curiosity": 5
        },
        "next": "Q_SEC_12"
      },
      {
        "text": "No, I prefer building systems",
        "modifiers": {
          "Security Interest": -5,
          "Backend Interest": 8
        },
        "next": "Q_SEC_12"
      }
    ]
  },
  "Q_SEC_12": {
    "text": "Security Scenario 12: Do you enjoy finding loopholes in systems?",
    "options": [
      {
        "text": "Yes, it's my favorite thing",
        "modifiers": {
          "Security Mindset": 10,
          "Security Interest": 8,
          "Curiosity": 5
        },
        "next": "Q_SEC_13"
      },
      {
        "text": "No, I prefer building systems",
        "modifiers": {
          "Security Interest": -5,
          "Backend Interest": 8
        },
        "next": "Q_SEC_13"
      }
    ]
  },
  "Q_SEC_13": {
    "text": "Security Scenario 13: Do you enjoy finding loopholes in systems?",
    "options": [
      {
        "text": "Yes, it's my favorite thing",
        "modifiers": {
          "Security Mindset": 10,
          "Security Interest": 8,
          "Curiosity": 5
        },
        "next": "Q_SEC_14"
      },
      {
        "text": "No, I prefer building systems",
        "modifiers": {
          "Security Interest": -5,
          "Backend Interest": 8
        },
        "next": "Q_SEC_14"
      }
    ]
  },
  "Q_SEC_14": {
    "text": "Security Scenario 14: Do you enjoy finding loopholes in systems?",
    "options": [
      {
        "text": "Yes, it's my favorite thing",
        "modifiers": {
          "Security Mindset": 10,
          "Security Interest": 8,
          "Curiosity": 5
        },
        "next": "Q_SEC_15"
      },
      {
        "text": "No, I prefer building systems",
        "modifiers": {
          "Security Interest": -5,
          "Backend Interest": 8
        },
        "next": "Q_SEC_15"
      }
    ]
  },
  "Q_SEC_15": {
    "text": "Security Scenario 15: Do you enjoy finding loopholes in systems?",
    "options": [
      {
        "text": "Yes, it's my favorite thing",
        "modifiers": {
          "Security Mindset": 10,
          "Security Interest": 8,
          "Curiosity": 5
        },
        "next": "Q_BEHAVIOR_1"
      },
      {
        "text": "No, I prefer building systems",
        "modifiers": {
          "Security Interest": -5,
          "Backend Interest": 8
        },
        "next": "Q_BEHAVIOR_1"
      }
    ]
  },
  "Q_FULL_1": {
    "text": "Full Stack Scenario 1: Do you enjoy switching contexts between UI and databases?",
    "options": [
      {
        "text": "Yes, variety keeps me engaged",
        "modifiers": {
          "Full Stack Interest": 10,
          "Curiosity": 8
        },
        "next": "Q_FULL_2"
      },
      {
        "text": "No, I prefer specializing",
        "modifiers": {
          "Full Stack Interest": -10,
          "Persistence": 8
        },
        "next": "Q_FULL_2"
      }
    ]
  },
  "Q_FULL_2": {
    "text": "Full Stack Scenario 2: Do you enjoy switching contexts between UI and databases?",
    "options": [
      {
        "text": "Yes, variety keeps me engaged",
        "modifiers": {
          "Full Stack Interest": 10,
          "Curiosity": 8
        },
        "next": "Q_FULL_3"
      },
      {
        "text": "No, I prefer specializing",
        "modifiers": {
          "Full Stack Interest": -10,
          "Persistence": 8
        },
        "next": "Q_FULL_3"
      }
    ]
  },
  "Q_FULL_3": {
    "text": "Full Stack Scenario 3: Do you enjoy switching contexts between UI and databases?",
    "options": [
      {
        "text": "Yes, variety keeps me engaged",
        "modifiers": {
          "Full Stack Interest": 10,
          "Curiosity": 8
        },
        "next": "Q_FULL_4"
      },
      {
        "text": "No, I prefer specializing",
        "modifiers": {
          "Full Stack Interest": -10,
          "Persistence": 8
        },
        "next": "Q_FULL_4"
      }
    ]
  },
  "Q_FULL_4": {
    "text": "Full Stack Scenario 4: Do you enjoy switching contexts between UI and databases?",
    "options": [
      {
        "text": "Yes, variety keeps me engaged",
        "modifiers": {
          "Full Stack Interest": 10,
          "Curiosity": 8
        },
        "next": "Q_FULL_5"
      },
      {
        "text": "No, I prefer specializing",
        "modifiers": {
          "Full Stack Interest": -10,
          "Persistence": 8
        },
        "next": "Q_FULL_5"
      }
    ]
  },
  "Q_FULL_5": {
    "text": "Full Stack Scenario 5: Do you enjoy switching contexts between UI and databases?",
    "options": [
      {
        "text": "Yes, variety keeps me engaged",
        "modifiers": {
          "Full Stack Interest": 10,
          "Curiosity": 8
        },
        "next": "Q_FULL_6"
      },
      {
        "text": "No, I prefer specializing",
        "modifiers": {
          "Full Stack Interest": -10,
          "Persistence": 8
        },
        "next": "Q_FULL_6"
      }
    ]
  },
  "Q_FULL_6": {
    "text": "Full Stack Scenario 6: Do you enjoy switching contexts between UI and databases?",
    "options": [
      {
        "text": "Yes, variety keeps me engaged",
        "modifiers": {
          "Full Stack Interest": 10,
          "Curiosity": 8
        },
        "next": "Q_FULL_7"
      },
      {
        "text": "No, I prefer specializing",
        "modifiers": {
          "Full Stack Interest": -10,
          "Persistence": 8
        },
        "next": "Q_FULL_7"
      }
    ]
  },
  "Q_FULL_7": {
    "text": "Full Stack Scenario 7: Do you enjoy switching contexts between UI and databases?",
    "options": [
      {
        "text": "Yes, variety keeps me engaged",
        "modifiers": {
          "Full Stack Interest": 10,
          "Curiosity": 8
        },
        "next": "Q_FULL_8"
      },
      {
        "text": "No, I prefer specializing",
        "modifiers": {
          "Full Stack Interest": -10,
          "Persistence": 8
        },
        "next": "Q_FULL_8"
      }
    ]
  },
  "Q_FULL_8": {
    "text": "Full Stack Scenario 8: Do you enjoy switching contexts between UI and databases?",
    "options": [
      {
        "text": "Yes, variety keeps me engaged",
        "modifiers": {
          "Full Stack Interest": 10,
          "Curiosity": 8
        },
        "next": "Q_FULL_9"
      },
      {
        "text": "No, I prefer specializing",
        "modifiers": {
          "Full Stack Interest": -10,
          "Persistence": 8
        },
        "next": "Q_FULL_9"
      }
    ]
  },
  "Q_FULL_9": {
    "text": "Full Stack Scenario 9: Do you enjoy switching contexts between UI and databases?",
    "options": [
      {
        "text": "Yes, variety keeps me engaged",
        "modifiers": {
          "Full Stack Interest": 10,
          "Curiosity": 8
        },
        "next": "Q_FULL_10"
      },
      {
        "text": "No, I prefer specializing",
        "modifiers": {
          "Full Stack Interest": -10,
          "Persistence": 8
        },
        "next": "Q_FULL_10"
      }
    ]
  },
  "Q_FULL_10": {
    "text": "Full Stack Scenario 10: Do you enjoy switching contexts between UI and databases?",
    "options": [
      {
        "text": "Yes, variety keeps me engaged",
        "modifiers": {
          "Full Stack Interest": 10,
          "Curiosity": 8
        },
        "next": "Q_FULL_11"
      },
      {
        "text": "No, I prefer specializing",
        "modifiers": {
          "Full Stack Interest": -10,
          "Persistence": 8
        },
        "next": "Q_FULL_11"
      }
    ]
  },
  "Q_FULL_11": {
    "text": "Full Stack Scenario 11: Do you enjoy switching contexts between UI and databases?",
    "options": [
      {
        "text": "Yes, variety keeps me engaged",
        "modifiers": {
          "Full Stack Interest": 10,
          "Curiosity": 8
        },
        "next": "Q_FULL_12"
      },
      {
        "text": "No, I prefer specializing",
        "modifiers": {
          "Full Stack Interest": -10,
          "Persistence": 8
        },
        "next": "Q_FULL_12"
      }
    ]
  },
  "Q_FULL_12": {
    "text": "Full Stack Scenario 12: Do you enjoy switching contexts between UI and databases?",
    "options": [
      {
        "text": "Yes, variety keeps me engaged",
        "modifiers": {
          "Full Stack Interest": 10,
          "Curiosity": 8
        },
        "next": "Q_FULL_13"
      },
      {
        "text": "No, I prefer specializing",
        "modifiers": {
          "Full Stack Interest": -10,
          "Persistence": 8
        },
        "next": "Q_FULL_13"
      }
    ]
  },
  "Q_FULL_13": {
    "text": "Full Stack Scenario 13: Do you enjoy switching contexts between UI and databases?",
    "options": [
      {
        "text": "Yes, variety keeps me engaged",
        "modifiers": {
          "Full Stack Interest": 10,
          "Curiosity": 8
        },
        "next": "Q_FULL_14"
      },
      {
        "text": "No, I prefer specializing",
        "modifiers": {
          "Full Stack Interest": -10,
          "Persistence": 8
        },
        "next": "Q_FULL_14"
      }
    ]
  },
  "Q_FULL_14": {
    "text": "Full Stack Scenario 14: Do you enjoy switching contexts between UI and databases?",
    "options": [
      {
        "text": "Yes, variety keeps me engaged",
        "modifiers": {
          "Full Stack Interest": 10,
          "Curiosity": 8
        },
        "next": "Q_FULL_15"
      },
      {
        "text": "No, I prefer specializing",
        "modifiers": {
          "Full Stack Interest": -10,
          "Persistence": 8
        },
        "next": "Q_FULL_15"
      }
    ]
  },
  "Q_FULL_15": {
    "text": "Full Stack Scenario 15: Do you enjoy switching contexts between UI and databases?",
    "options": [
      {
        "text": "Yes, variety keeps me engaged",
        "modifiers": {
          "Full Stack Interest": 10,
          "Curiosity": 8
        },
        "next": "Q_BEHAVIOR_1"
      },
      {
        "text": "No, I prefer specializing",
        "modifiers": {
          "Full Stack Interest": -10,
          "Persistence": 8
        },
        "next": "Q_BEHAVIOR_1"
      }
    ]
  },
  "Q_BEHAVIOR_1": {
    "text": "Behavioral Question 1: How do you handle stressful debugging sessions?",
    "options": [
      {
        "text": "I am highly patient and persistent",
        "modifiers": {
          "Persistence": 10,
          "Stress Tolerance": 10
        },
        "next": "Q_BEHAVIOR_2"
      },
      {
        "text": "I ask for help immediately",
        "modifiers": {
          "Communication": 10,
          "Persistence": -5
        },
        "next": "Q_BEHAVIOR_2"
      },
      {
        "text": "I write scripts to find the bug",
        "modifiers": {
          "Automation Preference": 10,
          "Problem Solving": 5
        },
        "next": "Q_BEHAVIOR_2"
      }
    ]
  },
  "Q_BEHAVIOR_2": {
    "text": "Behavioral Question 2: How do you handle stressful debugging sessions?",
    "options": [
      {
        "text": "I am highly patient and persistent",
        "modifiers": {
          "Persistence": 10,
          "Stress Tolerance": 10
        },
        "next": "Q_BEHAVIOR_3"
      },
      {
        "text": "I ask for help immediately",
        "modifiers": {
          "Communication": 10,
          "Persistence": -5
        },
        "next": "Q_BEHAVIOR_3"
      },
      {
        "text": "I write scripts to find the bug",
        "modifiers": {
          "Automation Preference": 10,
          "Problem Solving": 5
        },
        "next": "Q_BEHAVIOR_3"
      }
    ]
  },
  "Q_BEHAVIOR_3": {
    "text": "Behavioral Question 3: How do you handle stressful debugging sessions?",
    "options": [
      {
        "text": "I am highly patient and persistent",
        "modifiers": {
          "Persistence": 10,
          "Stress Tolerance": 10
        },
        "next": "Q_BEHAVIOR_4"
      },
      {
        "text": "I ask for help immediately",
        "modifiers": {
          "Communication": 10,
          "Persistence": -5
        },
        "next": "Q_BEHAVIOR_4"
      },
      {
        "text": "I write scripts to find the bug",
        "modifiers": {
          "Automation Preference": 10,
          "Problem Solving": 5
        },
        "next": "Q_BEHAVIOR_4"
      }
    ]
  },
  "Q_BEHAVIOR_4": {
    "text": "Behavioral Question 4: How do you handle stressful debugging sessions?",
    "options": [
      {
        "text": "I am highly patient and persistent",
        "modifiers": {
          "Persistence": 10,
          "Stress Tolerance": 10
        },
        "next": "Q_BEHAVIOR_5"
      },
      {
        "text": "I ask for help immediately",
        "modifiers": {
          "Communication": 10,
          "Persistence": -5
        },
        "next": "Q_BEHAVIOR_5"
      },
      {
        "text": "I write scripts to find the bug",
        "modifiers": {
          "Automation Preference": 10,
          "Problem Solving": 5
        },
        "next": "Q_BEHAVIOR_5"
      }
    ]
  },
  "Q_BEHAVIOR_5": {
    "text": "Behavioral Question 5: How do you handle stressful debugging sessions?",
    "options": [
      {
        "text": "I am highly patient and persistent",
        "modifiers": {
          "Persistence": 10,
          "Stress Tolerance": 10
        },
        "next": "Q_BEHAVIOR_6"
      },
      {
        "text": "I ask for help immediately",
        "modifiers": {
          "Communication": 10,
          "Persistence": -5
        },
        "next": "Q_BEHAVIOR_6"
      },
      {
        "text": "I write scripts to find the bug",
        "modifiers": {
          "Automation Preference": 10,
          "Problem Solving": 5
        },
        "next": "Q_BEHAVIOR_6"
      }
    ]
  },
  "Q_BEHAVIOR_6": {
    "text": "Behavioral Question 6: How do you handle stressful debugging sessions?",
    "options": [
      {
        "text": "I am highly patient and persistent",
        "modifiers": {
          "Persistence": 10,
          "Stress Tolerance": 10
        },
        "next": "Q_BEHAVIOR_7"
      },
      {
        "text": "I ask for help immediately",
        "modifiers": {
          "Communication": 10,
          "Persistence": -5
        },
        "next": "Q_BEHAVIOR_7"
      },
      {
        "text": "I write scripts to find the bug",
        "modifiers": {
          "Automation Preference": 10,
          "Problem Solving": 5
        },
        "next": "Q_BEHAVIOR_7"
      }
    ]
  },
  "Q_BEHAVIOR_7": {
    "text": "Behavioral Question 7: How do you handle stressful debugging sessions?",
    "options": [
      {
        "text": "I am highly patient and persistent",
        "modifiers": {
          "Persistence": 10,
          "Stress Tolerance": 10
        },
        "next": "Q_BEHAVIOR_8"
      },
      {
        "text": "I ask for help immediately",
        "modifiers": {
          "Communication": 10,
          "Persistence": -5
        },
        "next": "Q_BEHAVIOR_8"
      },
      {
        "text": "I write scripts to find the bug",
        "modifiers": {
          "Automation Preference": 10,
          "Problem Solving": 5
        },
        "next": "Q_BEHAVIOR_8"
      }
    ]
  },
  "Q_BEHAVIOR_8": {
    "text": "Behavioral Question 8: How do you handle stressful debugging sessions?",
    "options": [
      {
        "text": "I am highly patient and persistent",
        "modifiers": {
          "Persistence": 10,
          "Stress Tolerance": 10
        },
        "next": "Q_BEHAVIOR_9"
      },
      {
        "text": "I ask for help immediately",
        "modifiers": {
          "Communication": 10,
          "Persistence": -5
        },
        "next": "Q_BEHAVIOR_9"
      },
      {
        "text": "I write scripts to find the bug",
        "modifiers": {
          "Automation Preference": 10,
          "Problem Solving": 5
        },
        "next": "Q_BEHAVIOR_9"
      }
    ]
  },
  "Q_BEHAVIOR_9": {
    "text": "Behavioral Question 9: How do you handle stressful debugging sessions?",
    "options": [
      {
        "text": "I am highly patient and persistent",
        "modifiers": {
          "Persistence": 10,
          "Stress Tolerance": 10
        },
        "next": "Q_BEHAVIOR_10"
      },
      {
        "text": "I ask for help immediately",
        "modifiers": {
          "Communication": 10,
          "Persistence": -5
        },
        "next": "Q_BEHAVIOR_10"
      },
      {
        "text": "I write scripts to find the bug",
        "modifiers": {
          "Automation Preference": 10,
          "Problem Solving": 5
        },
        "next": "Q_BEHAVIOR_10"
      }
    ]
  },
  "Q_BEHAVIOR_10": {
    "text": "Behavioral Question 10: How do you handle stressful debugging sessions?",
    "options": [
      {
        "text": "I am highly patient and persistent",
        "modifiers": {
          "Persistence": 10,
          "Stress Tolerance": 10
        },
        "next": "Q_BEHAVIOR_11"
      },
      {
        "text": "I ask for help immediately",
        "modifiers": {
          "Communication": 10,
          "Persistence": -5
        },
        "next": "Q_BEHAVIOR_11"
      },
      {
        "text": "I write scripts to find the bug",
        "modifiers": {
          "Automation Preference": 10,
          "Problem Solving": 5
        },
        "next": "Q_BEHAVIOR_11"
      }
    ]
  },
  "Q_BEHAVIOR_11": {
    "text": "Behavioral Question 11: How do you handle stressful debugging sessions?",
    "options": [
      {
        "text": "I am highly patient and persistent",
        "modifiers": {
          "Persistence": 10,
          "Stress Tolerance": 10
        },
        "next": "Q_BEHAVIOR_12"
      },
      {
        "text": "I ask for help immediately",
        "modifiers": {
          "Communication": 10,
          "Persistence": -5
        },
        "next": "Q_BEHAVIOR_12"
      },
      {
        "text": "I write scripts to find the bug",
        "modifiers": {
          "Automation Preference": 10,
          "Problem Solving": 5
        },
        "next": "Q_BEHAVIOR_12"
      }
    ]
  },
  "Q_BEHAVIOR_12": {
    "text": "Behavioral Question 12: How do you handle stressful debugging sessions?",
    "options": [
      {
        "text": "I am highly patient and persistent",
        "modifiers": {
          "Persistence": 10,
          "Stress Tolerance": 10
        },
        "next": "Q_BEHAVIOR_13"
      },
      {
        "text": "I ask for help immediately",
        "modifiers": {
          "Communication": 10,
          "Persistence": -5
        },
        "next": "Q_BEHAVIOR_13"
      },
      {
        "text": "I write scripts to find the bug",
        "modifiers": {
          "Automation Preference": 10,
          "Problem Solving": 5
        },
        "next": "Q_BEHAVIOR_13"
      }
    ]
  },
  "Q_BEHAVIOR_13": {
    "text": "Behavioral Question 13: How do you handle stressful debugging sessions?",
    "options": [
      {
        "text": "I am highly patient and persistent",
        "modifiers": {
          "Persistence": 10,
          "Stress Tolerance": 10
        },
        "next": "Q_BEHAVIOR_14"
      },
      {
        "text": "I ask for help immediately",
        "modifiers": {
          "Communication": 10,
          "Persistence": -5
        },
        "next": "Q_BEHAVIOR_14"
      },
      {
        "text": "I write scripts to find the bug",
        "modifiers": {
          "Automation Preference": 10,
          "Problem Solving": 5
        },
        "next": "Q_BEHAVIOR_14"
      }
    ]
  },
  "Q_BEHAVIOR_14": {
    "text": "Behavioral Question 14: How do you handle stressful debugging sessions?",
    "options": [
      {
        "text": "I am highly patient and persistent",
        "modifiers": {
          "Persistence": 10,
          "Stress Tolerance": 10
        },
        "next": "Q_BEHAVIOR_15"
      },
      {
        "text": "I ask for help immediately",
        "modifiers": {
          "Communication": 10,
          "Persistence": -5
        },
        "next": "Q_BEHAVIOR_15"
      },
      {
        "text": "I write scripts to find the bug",
        "modifiers": {
          "Automation Preference": 10,
          "Problem Solving": 5
        },
        "next": "Q_BEHAVIOR_15"
      }
    ]
  },
  "Q_BEHAVIOR_15": {
    "text": "Behavioral Question 15: How do you handle stressful debugging sessions?",
    "options": [
      {
        "text": "I am highly patient and persistent",
        "modifiers": {
          "Persistence": 10,
          "Stress Tolerance": 10
        },
        "next": "Q_HOURS"
      },
      {
        "text": "I ask for help immediately",
        "modifiers": {
          "Communication": 10,
          "Persistence": -5
        },
        "next": "Q_HOURS"
      },
      {
        "text": "I write scripts to find the bug",
        "modifiers": {
          "Automation Preference": 10,
          "Problem Solving": 5
        },
        "next": "Q_HOURS"
      }
    ]
  },
  "Q_HOURS": {
    "text": "How many hours can you realistically study per week?",
    "options": [
      {
        "text": "0-5 hours",
        "modifiers": {
          "Study Hours": 5
        },
        "next": "END"
      },
      {
        "text": "5-10 hours",
        "modifiers": {
          "Study Hours": 8
        },
        "next": "END"
      },
      {
        "text": "10-20 hours",
        "modifiers": {
          "Study Hours": 15
        },
        "next": "END"
      },
      {
        "text": "20+ hours",
        "modifiers": {
          "Study Hours": 25
        },
        "next": "END"
      }
    ]
  }
};
