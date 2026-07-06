class ProfileBuilder:
    def __init__(self, questions_data):
        self.questions_data = questions_data
        self.profile = {}
        # Dynamically initialize all possible attributes to 0
        for q in self.questions_data.values():
            for opt in q.get("options", []):
                for attr in opt.get("modifiers", {}):
                    self.profile[attr] = 0

    def build_profile(self, answers_map):
        """
        Converts raw answers into hidden User Profile scores.
        answers_map: dict of Question ID -> Option Selected
        """
        for q_id, answer_text in answers_map.items():
            if q_id not in self.questions_data:
                continue
                
            q_node = self.questions_data[q_id]
            for option in q_node.get("options", []):
                if option["text"] == answer_text:
                    modifiers = option.get("modifiers", {})
                    for attr, val in modifiers.items():
                        self.profile[attr] += val
                    break
                    
        return self.profile
