import unittest
from engine.profile_builder import ProfileBuilder
from engine.rule_engine import RuleEngine
from engine.scoring_engine import ScoringEngine
import json
import os

class TestExpertSystem(unittest.TestCase):
    def setUp(self):
        # Load the newly generated knowledge JSONs
        base = os.path.join(os.path.dirname(__file__), "knowledge")
        with open(os.path.join(base, "questions.json"), "r", encoding="utf-8") as f:
            self.questions = json.load(f)
        with open(os.path.join(base, "rules.json"), "r", encoding="utf-8") as f:
            self.rules = json.load(f)
        with open(os.path.join(base, "paths.json"), "r", encoding="utf-8") as f:
            self.paths = json.load(f)
            
    def test_frontend_profile(self):
        pb = ProfileBuilder(self.questions)
        answers = {
            "Q_ROOT": "Websites",
            "Q_WEB_1": "Yes, very much",
            "Q_WEB_2": "Yes"
        }
        profile = pb.build_profile(answers)
        self.assertGreater(profile.get("Visual Preference", 0), 20)
        self.assertGreater(profile.get("Frontend Interest", 0), 20)
        
        re = RuleEngine(self.rules)
        scores, triggered = re.evaluate(profile)
        self.assertGreater(scores.get("Frontend", 0), 0)
        
    def test_ai_profile(self):
        pb = ProfileBuilder(self.questions)
        answers = {
            "Q_ROOT": "AI & Data",
            "Q_AI_1": "Yes, absolutely",
            "Q_AI_2": "Very comfortable"
        }
        profile = pb.build_profile(answers)
        self.assertGreater(profile.get("Analytical Score", 0), 30)
        
        re = RuleEngine(self.rules)
        scores, triggered = re.evaluate(profile)
        self.assertGreater(scores.get("AI & Data", 0), 0)
        
        se = ScoringEngine(self.paths)
        top_paths, conf = se.calculate_scores(scores, profile)
        self.assertEqual(top_paths[0]["name"], "AI & Data")

if __name__ == "__main__":
    unittest.main()
