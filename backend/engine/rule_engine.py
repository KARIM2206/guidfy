import re

class RuleEngine:
    def __init__(self, rules):
        self.rules = rules  # List of rule dicts from rules.json
        
        self.category_map = {
            "INT": "Interest",
            "PRS": "Personality",
            "SKL": "Skills",
            "TIME": "Study Time",
            "GOAL": "Career Goal",
            "STYLE": "Learning Style",
            "NEG": "Exclusions"
        }

    def evaluate(self, profile):
        path_scores = {
            "Frontend": 0,
            "Backend": 0,
            "Full Stack": 0,
            "AI & Data": 0,
            "Data Science": 0,
            "Cloud": 0,
            "Cyber Security": 0,
            "Mobile": 0
        }
        
        # Breakdown: path -> {category -> score}
        score_breakdown = {p: {cat: 0 for cat in self.category_map.values()} for p in path_scores.keys()}
        
        triggered_rules = []

        # Sort rules by priority (Critical > High > Medium > Low)
        priority_map = {"Critical": 4, "High": 3, "Medium": 2, "Low": 1}
        sorted_rules = sorted(self.rules, key=lambda r: priority_map.get(r.get("Priority", "Low"), 1), reverse=True)

        for rule in sorted_rules:
            if self._check_conditions(rule.get("Conditions", {}), profile):
                rule_id = rule.get("RuleID", "UNK")
                # Extract prefix like 'INT' from 'INT001'
                match = re.match(r"([A-Za-z]+)\d+", rule_id)
                prefix = match.group(1).upper() if match else "UNK"
                category_name = self.category_map.get(prefix, "Other")
                
                # Apply score changes
                for path, score_change in rule.get("ScoreChanges", {}).items():
                    if path in path_scores:
                        path_scores[path] += score_change
                        if category_name not in score_breakdown[path]:
                            score_breakdown[path][category_name] = 0
                        score_breakdown[path][category_name] += score_change
                
                triggered_rules.append({
                    "RuleID": rule_id,
                    "Explanation": rule.get("Explanation"),
                    "Paths": list(rule.get("ScoreChanges", {}).keys())
                })

        return path_scores, score_breakdown, triggered_rules

    def _check_conditions(self, conditions, profile):
        """
        Check if all conditions in the rule match the profile.
        """
        for attr, op_val in conditions.items():
            profile_val = profile.get(attr, 0)
            for op, val in op_val.items():
                if op == ">=" and not (profile_val >= val): return False
                if op == ">" and not (profile_val > val): return False
                if op == "<=" and not (profile_val <= val): return False
                if op == "<" and not (profile_val < val): return False
                if op == "==" and not (profile_val == val): return False
        return True
