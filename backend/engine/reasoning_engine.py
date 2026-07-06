class ReasoningEngine:
    def generate_explanation(self, recommended_path, triggered_rules):
        """
        Generates concrete bullet points based directly on the rules that fired
        for the recommended path.
        """
        explanations = []
        for rule in triggered_rules:
            # Only include explanations for rules that actually contributed to the recommended path
            if recommended_path in rule.get("Paths", []):
                expl = rule.get("Explanation")
                if expl and expl not in explanations:
                    explanations.append(f"✓ {expl}")
                    
        if not explanations:
            explanations.append("✓ Your combination of interests aligns best with this path.")
            
        return explanations
