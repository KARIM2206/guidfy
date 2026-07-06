class RoadmapGenerator:
    def __init__(self, roadmaps_data):
        self.roadmaps_data = roadmaps_data

    def generate(self, path_name, study_hours, experience):
        """
        Generate dynamic roadmaps based on Study Hours and Experience.
        """
        # Find the base roadmap for the path
        base_roadmap = next((r for r in self.roadmaps_data if r.get("path") == path_name), {})
        
        if not base_roadmap:
            return {"error": "No roadmap found for this path."}
            
        modules = base_roadmap.get("modules", [])
        
        monthly_plan = []
        current_month_modules = []
        current_month_hours = 0
        
        # Assume 4 weeks in a month
        monthly_hours_capacity = study_hours * 4 if study_hours > 0 else 40
        
        for mod in modules:
            mod_hours = mod.get("estimated_hours", 10)
            
            # Skip basic modules if experienced
            if experience.lower() in ["intermediate", "advanced"] and mod.get("level") == "beginner":
                continue
                
            if current_month_hours + mod_hours > monthly_hours_capacity and current_month_modules:
                monthly_plan.append({
                    "month": len(monthly_plan) + 1,
                    "modules": current_month_modules
                })
                current_month_modules = []
                current_month_hours = 0
                
            current_month_modules.append(mod)
            current_month_hours += mod_hours
            
        if current_month_modules:
            monthly_plan.append({
                "month": len(monthly_plan) + 1,
                "modules": current_month_modules
            })
            
        return {
            "path": path_name,
            "estimated_months": len(monthly_plan),
            "monthly_plan": monthly_plan
        }
