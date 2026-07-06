import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from engine.knowledge_loader import KnowledgeLoader
from engine.profile_builder import ProfileBuilder
from engine.rule_engine import RuleEngine
from engine.scoring_engine import ScoringEngine
from engine.confidence_engine import ConfidenceEngine
from engine.reasoning_engine import ReasoningEngine

def run_test_cases():
    kb = KnowledgeLoader(base_path="knowledge")
    pb = ProfileBuilder(kb.questions)
    re = RuleEngine(kb.rules)
    se = ScoringEngine(kb.paths)
    ce = ConfidenceEngine()
    reasoning = ReasoningEngine()

    print("=========================================================")
    print("STEP 10 — Validate with Test Cases")
    print("=========================================================")

    # Case 1: AI (Math, AI, 20 Hours)
    # Profile attributes that would be set by these answers
    profile1 = {
        "AI Interest": 30,
        "Analytical Score": 30,
        "Study Hours": 25
    }
    raw1, bd1, rules1 = re.evaluate(profile1)
    top1 = se.calculate_scores(raw1, profile1)
    print("Case 1 Expected: AI & Data")
    print("Actual Recommended:", top1[0]["name"] if top1 else "None")
    print("Scores:")
    for p in top1: print(f"  - {p['name']}: {p['compatibility']}%")
    print("--------------------------------")

    # Case 2: Frontend (Design, Creativity, 10 Hours)
    profile2 = {
        "Frontend Interest": 35,
        "Creative Score": 30,
        "Visual Preference": 25,
        "Study Hours": 15
    }
    raw2, bd2, rules2 = re.evaluate(profile2)
    top2 = se.calculate_scores(raw2, profile2)
    print("Case 2 Expected: Frontend")
    print("Actual Recommended:", top2[0]["name"] if top2 else "None")
    print("Scores:")
    for p in top2: print(f"  - {p['name']}: {p['compatibility']}%")
    print("--------------------------------")

    # Case 3: Cyber Security (Networking, Security, 15 Hours)
    profile3 = {
        "Security Interest": 40,
        "Curiosity": 25,
        "Study Hours": 15
    }
    raw3, bd3, rules3 = re.evaluate(profile3)
    top3 = se.calculate_scores(raw3, profile3)
    print("Case 3 Expected: Cyber Security")
    print("Actual Recommended:", top3[0]["name"] if top3 else "None")
    print("Scores:")
    for p in top3: print(f"  - {p['name']}: {p['compatibility']}%")
    print("--------------------------------")

    # Case 4: Backend (APIs, Databases, Backend)
    profile4 = {
        "Backend Interest": 45,
        "Problem Solving": 30,
        "Study Hours": 25
    }
    raw4, bd4, rules4 = re.evaluate(profile4)
    top4 = se.calculate_scores(raw4, profile4)
    print("Case 4 Expected: Backend")
    print("Actual Recommended:", top4[0]["name"] if top4 else "None")
    print("Scores:")
    for p in top4: print(f"  - {p['name']}: {p['compatibility']}%")
    print("=========================================================")

if __name__ == "__main__":
    run_test_cases()
