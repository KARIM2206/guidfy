from flask import Flask, request, jsonify
import tensorflow as tf
import pickle
import numpy as np
import json

app = Flask(__name__)

nn_model = tf.keras.models.load_model("ai/learning_path_nn_model.keras")
with open("ai/rf_model.pkl",      "rb") as f: rf_model      = pickle.load(f)
with open("ai/scaler.pkl",        "rb") as f: scaler        = pickle.load(f)
with open("ai/label_encoder.pkl", "rb") as f: label_encoder = pickle.load(f)
with open("ai/metadata.json",     "r")  as f: metadata      = json.load(f)

ALL_SKILLS     = metadata["all_skills"]
ALIASES        = metadata["aliases"]
SKILL_WEIGHTS  = metadata["skill_weights"]
PATHS          = metadata["paths"]

def get_skill_weight(skill: str) -> float:
    return SKILL_WEIGHTS.get(skill.lower(), 1.0)

def preprocess_input(data: dict):
    # 1. Experience
    exp_map = {"beginner":0.0,"intermediate":1.0,"advanced":2.0}
    exp     = exp_map.get(str(data.get("experience","beginner")).lower().strip(), 1.0)

    # 2. Education
    ed_keywords = [("primary",0.0),("elementary",0.0),("some",1.0),
                   ("secondary",1.0),("associate",2.0),("bachelor",3.0),
                   ("master",4.0),("professional",4.0),("doctoral",5.0),("phd",5.0)]
    education = str(data.get("education","bachelor")).lower()
    ed = 3.0
    for kw,val in ed_keywords:
        if kw in education: ed = val; break

    # 3. Weighted skill vector  ← KEY FIX
    raw_skills   = [s.lower().strip() for s in data.get("skills",[])]
    user_skills  = {ALIASES.get(s,s) for s in raw_skills}
    skill_vec    = [get_skill_weight(sk) if sk.lower() in user_skills else 0.0
                    for sk in ALL_SKILLS]

    # 4. Assemble
    vector        = [exp, ed] + skill_vec   # 2 + 42 = 44
    user_interest = str(data.get("interest","")).lower().strip()
    arr           = np.array(vector, dtype=np.float32).reshape(1,-1)

    assert arr.shape[1] == 44, f"Expected 44 features, got {arr.shape[1]}"
    return arr, user_interest


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        if not data:
            return jsonify({"error":"Empty request body"}), 400

        features, user_interest = preprocess_input(data)
        features_scaled         = scaler.transform(features)

        nn_probs    = nn_model.predict(features_scaled, verbose=0)[0]
        rf_probs    = rf_model.predict_proba(features_scaled)[0]
        final_probs = 0.55*nn_probs + 0.45*rf_probs

        # Soft interest boost
        interest_norm = user_interest.replace(" ","").replace("/","").replace("-","")
        for i, path in enumerate(PATHS):
            path_norm = path.lower().replace(" ","").replace("/","").replace("-","")
            if interest_norm in path_norm or path_norm in interest_norm:
                final_probs[i] *= 1.15   # خفضنا من 1.20 لـ 1.15
                break
        final_probs /= final_probs.sum()

        idx       = int(final_probs.argmax())
        path_name = label_encoder.inverse_transform([idx])[0]
        ranked    = sorted(enumerate(final_probs), key=lambda x:-x[1])
        top_paths = [{"path": label_encoder.inverse_transform([i])[0],
                      "confidence": round(float(p),4)}
                     for i,p in ranked[:3]]

        return jsonify({"recommended_path": path_name, "top_paths": top_paths})

    except AssertionError as e:
        return jsonify({"error": str(e)}), 422
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def self_test():
    tests = [
        ("html+react+node.js+sql → Frontend/Backend (NOT DS)",
         ["html","css","react","node.js","sql"], "AI/ML"),
        ("tensorflow+pytorch      → AI/ML",
         ["python","tensorflow","pytorch"],       "Frontend"),
        ("docker+k8s+aws          → Cloud/DevOps",
         ["docker","kubernetes","aws"],            "Data Science"),
    ]
    print("\n" + "="*55 + "\n  SELF TEST\n" + "="*55)
    for label, skills, interest in tests:
        vec, _ = preprocess_input({
            "experience":"Intermediate",
            "skills":skills,
            "interest":interest
        })
        vec_s = scaler.transform(vec)
        nn_p  = nn_model.predict(vec_s, verbose=0)[0]
        rf_p  = rf_model.predict_proba(vec_s)[0]
        probs = 0.55*nn_p + 0.45*rf_p

        best = label_encoder.inverse_transform([int(probs.argmax())])[0]

        print(f"\n  {label}")
        print(f"  → {best}")
self_test()

if __name__ == "__main__":
    app.run(port=5050, debug=False)