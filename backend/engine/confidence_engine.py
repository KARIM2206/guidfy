class ConfidenceEngine:
    def detect_confidence(self, top_paths, triggered_rules_count=0):
        if len(top_paths) < 2:
            return "LOW"
        
        score_1 = top_paths[0].get("compatibility", 0)
        score_2 = top_paths[1].get("compatibility", 0)
        
        diff = score_1 - score_2
        
        # Base logic on diff
        if diff <= 5:
            # Tie breaker: if many rules fired, there's enough evidence to call it MEDIUM
            if triggered_rules_count >= 15:
                return "MEDIUM"
            return "LOW"
            
        elif diff >= 15:
            # If high difference and solid evidence, call it HIGH
            if triggered_rules_count >= 10:
                return "HIGH"
            return "MEDIUM"
            
        else:
            return "MEDIUM"
