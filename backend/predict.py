from flask import Flask, request, jsonify
from engine.knowledge_loader import KnowledgeLoader
from engine.profile_builder import ProfileBuilder
from engine.rule_engine import RuleEngine
from engine.scoring_engine import ScoringEngine
from engine.confidence_engine import ConfidenceEngine
from engine.reasoning_engine import ReasoningEngine
from engine.roadmap_generator import RoadmapGenerator
from admin_api import admin_bp

app = Flask(__name__)
from flask_cors import CORS
CORS(app) # Allow frontend to call admin API

app.register_blueprint(admin_bp)

# Phase 2: Load Knowledge Base into memory once on startup
kb = KnowledgeLoader(base_path="knowledge")

# Instantiate Engines
rule_engine = RuleEngine(kb.rules)
scoring_engine = ScoringEngine(kb.paths)
confidence_engine = ConfidenceEngine()
reasoning_engine = ReasoningEngine()
roadmap_generator = RoadmapGenerator(kb.roadmaps)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Empty request body"}), 400

        answers_map = data.get("answers_map", {})
        experience = data.get("experience", "Beginner")
        
        # 1. Profile Builder
        pb = ProfileBuilder(kb.questions)
        user_profile = pb.build_profile(answers_map)

        # 2. Rule Engine (now returns breakdown)
        raw_scores, score_breakdown, triggered_rules = rule_engine.evaluate(user_profile)

        # 3. Scoring Engine (Real Normalization, no artificial inflation)
        top_paths = scoring_engine.calculate_scores(raw_scores, user_profile)
            
        # 4. Confidence Engine
        confidence_level = confidence_engine.detect_confidence(top_paths, len(triggered_rules))
        for p in top_paths:
            p["confidence"] = confidence_level

        # 5. Reasoning Engine
        recommended_path = top_paths[0]["name"] if top_paths else "Frontend"
        explanation = reasoning_engine.generate_explanation(recommended_path, triggered_rules)

        # 6. Roadmap Generator
        roadmap = roadmap_generator.generate(recommended_path, user_profile.get("Study Hours", 10), experience)

        # Return exactly the JSON format requested
        result = {
            "recommended_path": recommended_path,
            "top_paths": top_paths,
            "user_profile": user_profile,
            "triggered_rules": [r["RuleID"] for r in triggered_rules],
            "score_breakdown": score_breakdown,
            "explanation": explanation,
            "roadmap": roadmap
        }

        return jsonify(result)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5050, debug=False)