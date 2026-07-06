class ScoringEngine:
    def __init__(self, paths_data):
        self.paths_data = paths_data
        
        # Max theoretical score based on the massive KB (336+ rules)
        self.max_possible = 140  

    def calculate_scores(self, raw_path_scores, profile):
        """
        Calculates true compatibility using realistic normalization.
        No artificial inflation.
        """
        normalized_paths = []
        for path_name, score in raw_path_scores.items():
            # Real Normalization (0 to 100)
            comp = int((score / self.max_possible) * 100)
            comp = min(100, max(0, comp))
            
            # Apply study hours penalty if path requires more hours than user has
            path_info = next((p for p in self.paths_data if p["name"] == path_name), {})
            min_hours = path_info.get("Learning Duration", {}).get("min_hours_week", 0)
            
            if profile.get("Study Hours", 0) > 0 and profile.get("Study Hours", 0) < min_hours:
                comp = int(comp * 0.7) # 30% realistic penalty
                
            normalized_paths.append({
                "name": path_name,
                "compatibility": comp,
                "confidence": "PENDING"  # To be calculated by ConfidenceEngine
            })
            
        # Sort descending by compatibility
        normalized_paths.sort(key=lambda x: x["compatibility"], reverse=True)
        top_3 = normalized_paths[:3]
        
        return top_3
