import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import random
from engine.knowledge_loader import KnowledgeLoader
from engine.profile_builder import ProfileBuilder
from engine.rule_engine import RuleEngine
from engine.scoring_engine import ScoringEngine

def run_simulation(num_users=100):
    kb_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../knowledge'))
    kb = KnowledgeLoader(base_path=kb_path)
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
            
    print("\n=== Coverage Analysis ===")
    print("Path Wins:")
    for p, wins in path_wins.items():
        print(f"  {p}: {wins} wins")
        
    dead_rules = [r for r, fires in rule_fires.items() if fires == 0]
    print(f"\nRule Coverage: {len(kb.rules) - len(dead_rules)}/{len(kb.rules)} rules fired.")
    if dead_rules:
        print("Dead Rules (Never fired):", dead_rules)
    else:
        print("All rules fired successfully at least once!")

if __name__ == "__main__":
    run_simulation(100)
