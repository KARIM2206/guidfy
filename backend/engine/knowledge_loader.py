import json
import os

class KnowledgeLoader:
    def __init__(self, base_path="knowledge"):
        self.base_path = base_path
        self.rules = self._load_json("rules.json")
        self.paths = self._load_json("paths.json")
        self.technologies = self._load_json("technologies.json")
        self.roadmaps = self._load_json("roadmaps.json")
        self.questions = self._load_json("questions.json")

    def _load_json(self, filename):
        path = os.path.join(self.base_path, filename)
        if not os.path.exists(path):
            return {}
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
