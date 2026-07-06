import json
import os

def generate_questions():
    # We will generate a linear/branching mix of ~80 questions.
    # To avoid writing 80 questions manually, we will define templates
    # for behavioral, technical, and general traits.
    
    questions = {}
    
    # Phase 1: Initial Direction (Low weights to avoid early bias)
    questions["Q_ROOT"] = {
        "text": "What is your main goal in learning software engineering?",
        "options": [
            {"text": "Build consumer products and startups", "modifiers": {"Frontend Interest": 5, "Mobile Interest": 5, "Business Mindset": 10}, "next": "Q_WEB_1"},
            {"text": "Handle massive data and architecture", "modifiers": {"Backend Interest": 5, "Cloud Interest": 5, "Data Mindset": 10}, "next": "Q_BACK_1"},
            {"text": "Research and advanced algorithms", "modifiers": {"AI & Data Interest": 5, "Data Science Interest": 5, "Research Interest": 10}, "next": "Q_AI_1"},
            {"text": "Secure systems from hackers", "modifiers": {"Security Interest": 5, "Security Mindset": 10}, "next": "Q_SEC_1"},
            {"text": "I want to do a little bit of everything", "modifiers": {"Full Stack Interest": 5, "Curiosity": 10}, "next": "Q_FULL_1"}
        ]
    }
    
    # Generate 15 Web/Frontend Questions
    for i in range(1, 16):
        next_q = f"Q_WEB_{i+1}" if i < 15 else "Q_BEHAVIOR_1"
        questions[f"Q_WEB_{i}"] = {
            "text": f"Frontend/Web Scenario {i}: Do you prefer visual aesthetics over abstract logic?",
            "options": [
                {"text": "Yes, visual aesthetics are crucial", "modifiers": {"Visual Creativity": 10, "Frontend Interest": 8, "Backend Interest": -5}, "next": next_q},
                {"text": "No, I prefer abstract logic", "modifiers": {"Logical Thinking": 10, "Backend Interest": 8, "Frontend Interest": -5}, "next": next_q},
                {"text": "I like both equally", "modifiers": {"Full Stack Interest": 8}, "next": next_q}
            ]
        }
        
    # Generate 15 Backend/Cloud Questions
    for i in range(1, 16):
        next_q = f"Q_BACK_{i+1}" if i < 15 else "Q_BEHAVIOR_1"
        questions[f"Q_BACK_{i}"] = {
            "text": f"Backend/Cloud Scenario {i}: Do you enjoy designing scalable databases?",
            "options": [
                {"text": "Yes, I love database design", "modifiers": {"Data Mindset": 10, "Backend Interest": 8}, "next": next_q},
                {"text": "I prefer automating deployments", "modifiers": {"Automation Preference": 10, "Cloud Interest": 8}, "next": next_q},
                {"text": "I don't like backend logic", "modifiers": {"Backend Interest": -10, "Frontend Interest": 5}, "next": next_q}
            ]
        }
        
    # Generate 15 AI/Data Questions
    for i in range(1, 16):
        next_q = f"Q_AI_{i+1}" if i < 15 else "Q_BEHAVIOR_1"
        questions[f"Q_AI_{i}"] = {
            "text": f"AI/Data Scenario {i}: How do you feel about heavy statistical analysis?",
            "options": [
                {"text": "I love statistics and math", "modifiers": {"Analytical Score": 10, "Data Science Interest": 8, "AI & Data Interest": 5}, "next": next_q},
                {"text": "I tolerate it, but prefer building models", "modifiers": {"AI & Data Interest": 10, "Analytical Score": 5}, "next": next_q},
                {"text": "I hate math and statistics", "modifiers": {"Analytical Score": -15, "AI & Data Interest": -15, "Data Science Interest": -15}, "next": next_q}
            ]
        }
        
    # Generate 15 Security Questions
    for i in range(1, 16):
        next_q = f"Q_SEC_{i+1}" if i < 15 else "Q_BEHAVIOR_1"
        questions[f"Q_SEC_{i}"] = {
            "text": f"Security Scenario {i}: Do you enjoy finding loopholes in systems?",
            "options": [
                {"text": "Yes, it's my favorite thing", "modifiers": {"Security Mindset": 10, "Security Interest": 8, "Curiosity": 5}, "next": next_q},
                {"text": "No, I prefer building systems", "modifiers": {"Security Interest": -5, "Backend Interest": 8}, "next": next_q}
            ]
        }
        
    # Generate 15 FullStack Questions
    for i in range(1, 16):
        next_q = f"Q_FULL_{i+1}" if i < 15 else "Q_BEHAVIOR_1"
        questions[f"Q_FULL_{i}"] = {
            "text": f"Full Stack Scenario {i}: Do you enjoy switching contexts between UI and databases?",
            "options": [
                {"text": "Yes, variety keeps me engaged", "modifiers": {"Full Stack Interest": 10, "Curiosity": 8}, "next": next_q},
                {"text": "No, I prefer specializing", "modifiers": {"Full Stack Interest": -10, "Persistence": 8}, "next": next_q}
            ]
        }

    # Generate 15 Behavioral Questions
    for i in range(1, 16):
        next_q = f"Q_BEHAVIOR_{i+1}" if i < 15 else "Q_HOURS"
        questions[f"Q_BEHAVIOR_{i}"] = {
            "text": f"Behavioral Question {i}: How do you handle stressful debugging sessions?",
            "options": [
                {"text": "I am highly patient and persistent", "modifiers": {"Persistence": 10, "Stress Tolerance": 10}, "next": next_q},
                {"text": "I ask for help immediately", "modifiers": {"Communication": 10, "Persistence": -5}, "next": next_q},
                {"text": "I write scripts to find the bug", "modifiers": {"Automation Preference": 10, "Problem Solving": 5}, "next": next_q}
            ]
        }

    # Final Constraints
    questions["Q_HOURS"] = {
        "text": "How many hours can you realistically study per week?",
        "options": [
            {"text": "0-5 hours", "modifiers": {"Study Hours": 5}, "next": "END"},
            {"text": "5-10 hours", "modifiers": {"Study Hours": 8}, "next": "END"},
            {"text": "10-20 hours", "modifiers": {"Study Hours": 15}, "next": "END"},
            {"text": "20+ hours", "modifiers": {"Study Hours": 25}, "next": "END"}
        ]
    }
    
    return questions

def generate_rules():
    rules = []
    rule_idx = 1
    
    paths = ["Frontend", "Backend", "Full Stack", "AI & Data", "Data Science", "Cloud", "Cyber Security", "Mobile"]
    
    # 1. Base Interest Rules (Threshold >= 60)
    for path in paths:
        attr_name = path + " Interest" if "Interest" not in path else path
        rules.append({
            "RuleID": f"INT{rule_idx:03d}",
            "Priority": "High",
            "Conditions": {attr_name: {">=": 60}},
            "ScoreChanges": {path: 15},
            "Explanation": f"You showed a highly consistent and sustained interest in {path} throughout the questionnaire."
        })
        rule_idx += 1
        
    # 2. Negative/Elimination Rules
    for path in paths:
        attr_name = path + " Interest" if "Interest" not in path else path
        rules.append({
            "RuleID": f"NEG{rule_idx:03d}",
            "Priority": "Critical",
            "Conditions": {attr_name: {"<": 0}},
            "ScoreChanges": {path: -20},
            "Explanation": f"Your answers strongly indicated a dislike for {path} tasks, so we deprioritized it."
        })
        rule_idx += 1

    # Math Elimination
    rules.append({
        "RuleID": f"NEG{rule_idx:03d}", "Priority": "Critical",
        "Conditions": {"Analytical Score": {"<": 0}},
        "ScoreChanges": {"AI & Data": -20, "Data Science": -20},
        "Explanation": "You indicated a strong dislike for mathematics, which is heavily required for AI and Data Science."
    })
    rule_idx += 1

    # 3. Synergy Rules (Combinations)
    synergies = [
        ({"Frontend Interest": {">=": 50}, "Backend Interest": {">=": 50}}, {"Full Stack": 20}, "You showed strong interest in both visual interfaces and server logic, making Full Stack ideal."),
        ({"Automation Preference": {">=": 30}, "Cloud Interest": {">=": 40}}, {"Cloud": 20}, "Your preference for scripting and automation aligns perfectly with DevOps and Cloud Architecture."),
        ({"Analytical Score": {">=": 40}, "Data Science Interest": {">=": 40}}, {"Data Science": 20}, "Your strong analytical skills combined with data interest make Data Science a perfect fit."),
        ({"Logical Thinking": {">=": 40}, "Problem Solving": {">=": 40}}, {"Backend": 20}, "Your pure logical problem-solving approach is exactly what is needed for Backend Engineering."),
        ({"Security Interest": {">=": 40}, "Curiosity": {">=": 30}}, {"Cyber Security": 20}, "Your suspicious nature and intense curiosity are key traits of an elite Cyber Security expert."),
        ({"Creative Score": {">=": 40}, "Visual Creativity": {">=": 30}}, {"Frontend": 20}, "Your highly creative mindset and focus on visual aesthetics are ideal for Frontend Development.")
    ]
    
    for cond, scores, expl in synergies:
        rules.append({
            "RuleID": f"SYN{rule_idx:03d}", "Priority": "Critical",
            "Conditions": cond, "ScoreChanges": scores, "Explanation": expl
        })
        rule_idx += 1

    # 4. Generate ~300 granular rules for all combinations of traits
    traits = ["Logical Thinking", "Problem Solving", "Persistence", "Communication", "Curiosity", "Business Mindset", "Data Mindset", "Security Mindset", "Automation Preference", "Visual Creativity", "Analytical Score", "Research Interest", "Stress Tolerance"]
    for trait in traits:
        for path in paths:
            # Add Critical priority rules for very strong traits
            rules.append({
                "RuleID": f"TRT{rule_idx:03d}",
                "Priority": "Critical",
                "Conditions": {trait: {">=": 40}, f"{path} Interest" if "Interest" not in path else path: {">=": 30}},
                "ScoreChanges": {path: 20},
                "Explanation": f"Your exceptional {trait.lower()} strongly supports a career in {path}."
            })
            rule_idx += 1
            
            # Add High priority rules
            rules.append({
                "RuleID": f"TRT{rule_idx:03d}",
                "Priority": "High",
                "Conditions": {trait: {">=": 30}, f"{path} Interest" if "Interest" not in path else path: {">=": 20}},
                "ScoreChanges": {path: 15},
                "Explanation": f"Your strong {trait.lower()} is a great asset for {path}."
            })
            rule_idx += 1

            # Add Medium priority rules
            rules.append({
                "RuleID": f"TRT{rule_idx:03d}",
                "Priority": "Medium",
                "Conditions": {trait: {">=": 20}},
                "ScoreChanges": {path: 8},
                "Explanation": f"Your {trait.lower()} is beneficial for {path}."
            })
            rule_idx += 1

    # 5. Time Constraints
    rules.append({
        "RuleID": f"TIME{rule_idx:03d}", "Priority": "Critical",
        "Conditions": {"Study Hours": {"<=": 5}},
        "ScoreChanges": {"Frontend": 10, "Full Stack": -20, "AI & Data": -20, "Cyber Security": -20, "Cloud": -15},
        "Explanation": "Given your limited weekly study time, we strongly deprioritized highly complex paths like AI, Security, or Full Stack."
    })
    rule_idx += 1

    return rules

def main():
    questions = generate_questions()
    rules = generate_rules()
    
    kb_dir = os.path.join(os.path.dirname(__file__), '../knowledge')
    os.makedirs(kb_dir, exist_ok=True)
    
    # Write Python JSON
    with open(os.path.join(kb_dir, 'questions.json'), 'w') as f:
        json.dump(questions, f, indent=4)
        
    with open(os.path.join(kb_dir, 'rules.json'), 'w') as f:
        json.dump(rules, f, indent=4)

    # Write React JS
    react_file = os.path.join(os.path.dirname(__file__), '../../guidfy/app/components/learning-path/questionTree.js')
    
    js_content = "export const questionTree = " + json.dumps(questions, indent=2) + ";\n"
    
    # Convert JSON to JS object format roughly
    with open(react_file, 'w') as f:
        f.write(js_content)
        
    print(f"Generated {len(questions)} questions and {len(rules)} rules successfully!")
    print("Files synced to backend JSON and frontend JS.")

if __name__ == "__main__":
    main()
