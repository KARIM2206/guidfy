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
        high = self.ce.detect_confidence([{"compatibility": 90}, {"compatibility": 65}], 10)
        self.assertEqual(high, "HIGH")
        
        # Difference = 10
        med = self.ce.detect_confidence([{"compatibility": 80}, {"compatibility": 70}], 15)
        self.assertEqual(med, "MEDIUM")

if __name__ == '__main__':
    unittest.main()
