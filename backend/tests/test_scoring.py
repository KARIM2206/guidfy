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
        # Suppose Max Possible is 140
        raw_scores = {"Frontend": 35, "Backend": 140, "Cyber Security": -10}
        profile = {"Study Hours": 20}
        top = self.se.calculate_scores(raw_scores, profile)
        
        self.assertEqual(top[0]["name"], "Backend")
        self.assertEqual(top[0]["compatibility"], 100) # 140/140
        
        self.assertEqual(top[1]["name"], "Frontend")
        self.assertEqual(top[1]["compatibility"], 25)  # 35/140
        
        self.assertEqual(top[2]["name"], "Cyber Security")
        self.assertEqual(top[2]["compatibility"], 0)   # bounded to 0

if __name__ == '__main__':
    unittest.main()
