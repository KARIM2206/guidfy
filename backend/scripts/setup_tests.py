import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")

# 1. Simulate Users
simulate_users_code = """
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import random
from engine.knowledge_loader import KnowledgeLoader
from engine.profile_builder import ProfileBuilder
from engine.rule_engine import RuleEngine
from engine.scoring_engine import ScoringEngine

def run_simulation(num_users=100):
    kb = KnowledgeLoader(base_path="knowledge")
    pb = ProfileBuilder(kb.questions)
    re = RuleEngine(kb.rules)
    se = ScoringEngine(kb.paths)
    
    path_wins = {p["name"]: 0 for p in kb.paths}
    rule_fires = {r["RuleID"]: 0 for r in kb.rules}
    
    print(f"--- Simulating {num_users} Users ---")
    
    for i in range(num_users):
        # Randomly pick answers
        answers_map = {}
        # Start at Q_ROOT
        curr_q = "Q_ROOT"
        while curr_q and curr_q != "END":
            q_node = kb.questions.get(curr_q)
            if not q_node: break
            opts = q_node.get("options", [])
            if not opts: break
            choice = random.choice(opts)
            answers_map[curr_q] = choice["text"]
            curr_q = choice.get("next", "END")
            
        profile = pb.build_profile(answers_map)
        raw_scores, _, triggered_rules = re.evaluate(profile)
        top_paths = se.calculate_scores(raw_scores, profile)
        
        # Track wins
        if top_paths:
            path_wins[top_paths[0]["name"]] += 1
            
        # Track rules
        for tr in triggered_rules:
            rule_fires[tr["RuleID"]] += 1
            
    print("\\n=== Coverage Analysis ===")
    print("Path Wins:")
    for p, wins in path_wins.items():
        print(f"  {p}: {wins} wins")
        
    dead_rules = [r for r, fires in rule_fires.items() if fires == 0]
    print(f"\\nRule Coverage: {len(kb.rules) - len(dead_rules)}/{len(kb.rules)} rules fired.")
    if dead_rules:
        print("Dead Rules (Never fired):", dead_rules)
    else:
        print("All rules fired successfully at least once!")

if __name__ == "__main__":
    run_simulation(100)
"""

# 2. Test Scoring Engine
test_scoring_code = """
import unittest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from engine.scoring_engine import ScoringEngine

class TestScoringEngine(unittest.TestCase):
    def setUp(self):
        self.paths = [{"name": "Frontend"}, {"name": "Backend"}]
        self.se = ScoringEngine(self.paths)
        
    def test_real_normalization(self):
        # Suppose Max Possible is 70
        raw_scores = {"Frontend": 35, "Backend": 70, "Cyber Security": -10}
        profile = {"Study Hours": 20}
        top = self.se.calculate_scores(raw_scores, profile)
        
        self.assertEqual(top[0]["name"], "Backend")
        self.assertEqual(top[0]["compatibility"], 100) # 70/70
        
        self.assertEqual(top[1]["name"], "Frontend")
        self.assertEqual(top[1]["compatibility"], 50)  # 35/70
        
        self.assertEqual(top[2]["name"], "Cyber Security")
        self.assertEqual(top[2]["compatibility"], 0)   # bounded to 0

if __name__ == '__main__':
    unittest.main()
"""

# 3. Test Confidence Engine
test_confidence_code = """
import unittest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from engine.confidence_engine import ConfidenceEngine

class TestConfidenceEngine(unittest.TestCase):
    def setUp(self):
        self.ce = ConfidenceEngine()
        
    def test_confidence_levels(self):
        # Difference = 2
        low = self.ce.detect_confidence([{"compatibility": 60}, {"compatibility": 58}])
        self.assertEqual(low, "LOW")
        
        # Difference = 25
        high = self.ce.detect_confidence([{"compatibility": 90}, {"compatibility": 65}])
        self.assertEqual(high, "HIGH")
        
        # Difference = 10
        med = self.ce.detect_confidence([{"compatibility": 80}, {"compatibility": 70}])
        self.assertEqual(med, "MEDIUM")

if __name__ == '__main__':
    unittest.main()
"""

# 4. Run All Script
run_all_code = """
import os
import subprocess

def run():
    print("Running Validator...")
    subprocess.run(["python", "../engine/validator.py"], cwd=os.path.dirname(__file__))
    
    print("\\nRunning Unit Tests...")
    subprocess.run(["python", "-m", "unittest", "discover", "-s", "."], cwd=os.path.dirname(__file__))
    
    print("\\nRunning 100 User Simulation...")
    subprocess.run(["python", "simulate_users.py"], cwd=os.path.dirname(__file__))

if __name__ == "__main__":
    run()
"""

if __name__ == "__main__":
    write_file("c:/final-project/backend/tests/simulate_users.py", simulate_users_code)
    write_file("c:/final-project/backend/tests/test_scoring.py", test_scoring_code)
    write_file("c:/final-project/backend/tests/test_confidence.py", test_confidence_code)
    write_file("c:/final-project/backend/tests/run_all.py", run_all_code)
    print("Tests generated successfully in backend/tests/")
