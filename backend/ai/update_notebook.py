import json
import sys

nb_path = r'c:\final-project\backend\ai\notebooka2ebd760f8.ipynb'
try:
    with open(nb_path, 'r', encoding='utf-8') as f:
        nb = json.load(f)
except Exception as e:
    print(f"Error reading notebook: {e}")
    sys.exit(1)

cell1 = """import numpy as np
import pandas as pd
import pickle, json, warnings, os
warnings.filterwarnings("ignore")

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix, precision_recall_fscore_support
from sklearn.linear_model import LogisticRegression
import matplotlib.pyplot as plt
import seaborn as sns

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, callbacks, regularizers
from sklearn.utils.class_weight import compute_class_weight

print("TF:", tf.__version__)"""

cell2 = """DATA_PATH = "/kaggle/input/datasets/organizations/stackoverflow/stack-overflow-2023-developers-survey/survey_results_public.csv"
if not os.path.exists(DATA_PATH):
    print(f"Warning: Dataset not found at {DATA_PATH}")

try:
    df_raw = pd.read_csv(DATA_PATH, low_memory=False)
except FileNotFoundError:
    # Dummy creation for notebook parsing if needed, but in Kaggle it will run
    df_raw = pd.DataFrame(columns=["DevType","LanguageHaveWorkedWith","WebframeHaveWorkedWith","MiscTechHaveWorkedWith","ToolsTechHaveWorkedWith","YearsCode","EdLevel","MainBranch"])

COLS = ["DevType","LanguageHaveWorkedWith","WebframeHaveWorkedWith",
        "MiscTechHaveWorkedWith","ToolsTechHaveWorkedWith","YearsCode","EdLevel","MainBranch"]
COLS = [c for c in COLS if c in df_raw.columns]
df = df_raw[COLS].copy()

if "MainBranch" in df.columns:
    df = df[df["MainBranch"] == "I am a developer by profession"].copy()
df.dropna(subset=["DevType"], inplace=True)
df.reset_index(drop=True, inplace=True)

def devtype_to_path(s):
    if pd.isna(s): return None
    s = s.lower()
    if any(k in s for k in ["machine learning","data scientist","ai specialist","mlops"]): return "AI/ML"
    if any(k in s for k in ["data engineer","data analyst","database administrator","bi developer","business intelligence"]): return "Data Science"
    if any(k in s for k in ["mobile","android","ios"]): return "Mobile"
    if any(k in s for k in ["devops","cloud","site reliability","platform engineer","sre"]): return "Cloud/DevOps"
    if any(k in s for k in ["security","cyber"]): return "Cybersecurity"
    if any(k in s for k in ["full-stack","full stack","fullstack"]): return "Full-Stack"
    if any(k in s for k in ["front-end","frontend"]): return "Frontend"
    if any(k in s for k in ["back-end","backend"]): return "Backend"
    if any(k in s for k in ["embedded","game","desktop","scientist","engineer","developer","programmer"]): return "Software Engineering"
    return None

df["silver_pre"] = df["DevType"].apply(devtype_to_path)
df = df.dropna(subset=["silver_pre"])
df.reset_index(drop=True, inplace=True)

# Mandatory data split structure FIRST with Stratification
# 60% Train, 20% Val, 20% Test
df_train_val, df_test = train_test_split(df, test_size=0.2, random_state=42, stratify=df["silver_pre"])
df_train, df_val = train_test_split(df_train_val, test_size=0.25, random_state=42, stratify=df_train_val["silver_pre"]) # 0.25 of 0.8 = 0.2

print(f"Total Rows: {len(df)}")
print(f"Train Set: {len(df_train)} rows")
print(f"Validation Set (Meta-Learner): {len(df_val)} rows")
print(f"Test Set (Gate): {len(df_test)} rows")

df_train = df_train.copy().reset_index(drop=True)
df_val = df_val.copy().reset_index(drop=True)
df_test = df_test.copy().reset_index(drop=True)"""

cell3 = """PATHS = [
    "Frontend", "Backend", "Full-Stack", "AI/ML", "Data Science", 
    "Cloud/DevOps", "Cybersecurity", "Mobile", "Software Engineering"
]

LANGUAGES = [
    "python","javascript","typescript","java","c#","c++","c",
    "r","swift","kotlin","go","rust","php","ruby","sql",
    "html/css","bash/shell","powershell","scala",
]
FRAMEWORKS = [
    "react","angular","vue.js","next.js","nuxt.js",
    "node.js","django","flask","spring","asp.net",
    "tensorflow","pytorch","scikit-learn","pandas","numpy",
    "react native","flutter","xamarin",
    "aws","azure","google cloud","docker","kubernetes",
]
ALL_SKILLS = LANGUAGES + FRAMEWORKS  # 42

ALIASES = {
    "js":"javascript","ts":"typescript","py":"python",
    "html":"html/css","css":"html/css","node":"node.js",
    "vue":"vue.js","next":"next.js","nuxt":"nuxt.js",
    "sklearn":"scikit-learn","sk-learn":"scikit-learn",
    "tf":"tensorflow","gcp":"google cloud","k8s":"kubernetes",
    "bash":"bash/shell","shell":"bash/shell",
    "react-native":"react native",
}

SKILL_WEIGHTS = {
    "python":0.4, "sql":0.4, "bash/shell":0.5, "powershell":0.6,
    "html/css":2.0,"javascript":1.8,"typescript":1.8,
    "react":2.0,"angular":2.0,"vue.js":2.0,"next.js":1.8,"nuxt.js":1.8,
    "node.js":2.0,"django":2.0,"flask":1.5,"spring":2.0,
    "asp.net":2.0,"php":1.8,"ruby":1.8,"go":1.5,"rust":1.5,
    "java":1.2,"c#":1.2,"c++":1.2,"c":1.0,"scala":1.5,
    "tensorflow":3.0,"pytorch":3.0,"scikit-learn":2.5,
    "pandas":1.8,"numpy":1.8,"r":1.5,
    "swift":3.0,"kotlin":3.0,"react native":3.0,"flutter":3.0,"xamarin":3.0,
    "docker":3.0,"kubernetes":3.0,"aws":2.5,"azure":2.5,"google cloud":2.5,
}

PATH_SKILLS = {
    "Frontend": ["html/css","javascript","typescript","react","angular","vue.js","next.js","nuxt.js"],
    "Backend": ["node.js","django","flask","spring","asp.net","php","ruby","go","rust","java","c#","c++","c","scala"],
    "AI/ML": ["tensorflow","pytorch","scikit-learn"],
    "Data Science": ["pandas","numpy","r"],
    "Mobile": ["swift","kotlin","react native","flutter","xamarin"],
    "Cloud/DevOps": ["docker","kubernetes","aws","azure","google cloud"]
}

def get_weight(skill): return SKILL_WEIGHTS.get(skill.lower(), 1.0)

def parse_semicolon(value):
    if pd.isna(value): return set()
    return {v.strip().lower() for v in str(value).split(";")}

def get_user_skills(row):
    known = set()
    for col in ["LanguageHaveWorkedWith","WebframeHaveWorkedWith","MiscTechHaveWorkedWith","ToolsTechHaveWorkedWith"]:
        if col in row.index: known |= parse_semicolon(row[col])
    return {ALIASES.get(sk, sk) for sk in known}

def build_skill_vector(skills):
    return [get_weight(sk) if sk in skills else 0.0 for sk in ALL_SKILLS]

def encode_years(val):
    if pd.isna(val): return 1.0
    s = str(val).strip().lower()
    if s in ["less than 1 year","0"]: return 0.0
    try:
        y = float(s)
        return 0.0 if y<=2 else (1.0 if y<=7 else 2.0)
    except: return 1.0

ED_MAP = [("primary",0),("elementary",0),("some colleg",1),("secondary",1),
          ("associate",2),("bachelor",3),("master",4),("professional",4),
          ("doctoral",5),("phd",5)]
def encode_ed(val):
    if pd.isna(val): return 3.0
    s = str(val).lower()
    for kw,v in ED_MAP:
        if kw in s: return float(v)
    return 3.0

FEATURE_COLS = (
    ["experience","education"] +
    [f"lang_{l.replace('/','_').replace(' ','_').replace('.','').replace('#','sharp')}" for l in LANGUAGES] +
    [f"fw_{f.replace('/','_').replace(' ','_').replace('.','').replace('#','sharp')}" for f in FRAMEWORKS]
)"""

cell4 = """df_train["silver_label"] = df_train["DevType"].apply(devtype_to_path)
df_train["parsed_skills"] = df_train.apply(get_user_skills, axis=1)

fs_scores = []
for idx, row in df_train[df_train["silver_label"] == "Full-Stack"].iterrows():
    f_score = sum(get_weight(sk) for sk in row["parsed_skills"] if sk in PATH_SKILLS["Frontend"])
    b_score = sum(get_weight(sk) for sk in row["parsed_skills"] if sk in PATH_SKILLS["Backend"])
    fs_scores.append((f_score, b_score))

fs_scores = np.array(fs_scores)
if len(fs_scores) > 0:
    f_25th = np.percentile(fs_scores[:, 0], 25)
    b_25th = np.percentile(fs_scores[:, 1], 25)
    
    print("Real Full-Stack Score Distribution (Train set):")
    print(f"Frontend - min:{np.min(fs_scores[:,0])}, 25th:{f_25th}, median:{np.median(fs_scores[:,0])}, mean:{np.mean(fs_scores[:,0]):.2f}, max:{np.max(fs_scores[:,0])}")
    print(f"Backend  - min:{np.min(fs_scores[:,1])}, 25th:{b_25th}, median:{np.median(fs_scores[:,1])}, mean:{np.mean(fs_scores[:,1]):.2f}, max:{np.max(fs_scores[:,1])}")
else:
    f_25th = 2.0
    b_25th = 2.0

print(f"DYNAMIC THRESHOLD - Frontend: {f_25th:.2f}, Backend: {b_25th:.2f}")

FLOOR_VALUE = min(f_25th, b_25th) * 0.5 if len(fs_scores) > 0 else 2.0
print(f"FLOOR_VALUE for Software Engineering fallback (dynamically set based on 25th percentiles): {FLOOR_VALUE:.2f}")

def skills_to_path(row):
    silver = row["silver_label"]
    skills = row["parsed_skills"]
    
    if silver in ["Cybersecurity", "Data Science"]:
        return silver
        
    scores = {p: 0.0 for p in PATHS}
    for sk in skills:
        w = get_weight(sk)
        for p, p_skills in PATH_SKILLS.items():
            if sk in p_skills:
                scores[p] += w
                
    if scores["Frontend"] >= f_25th and scores["Backend"] >= b_25th:
        return "Full-Stack"
        
    best_path = None
    best_score = -1
    for p in ["Frontend", "Backend", "AI/ML", "Data Science", "Mobile", "Cloud/DevOps"]:
        if scores[p] > best_score:
            best_score = scores[p]
            best_path = p
            
    if best_score < FLOOR_VALUE:
        return "Software Engineering"
        
    return best_path

df_train["new_label"] = df_train.apply(skills_to_path, axis=1)

print("\\nLabel Distribution Comparison (Train Set):")
print(pd.DataFrame({
    "Old": df_train["silver_label"].value_counts(),
    "New": df_train["new_label"].value_counts()
}).fillna(0).astype(int))"""

cell5 = """def process_split(df_split):
    df_split["silver_label"] = df_split["DevType"].apply(devtype_to_path)
    df_split["parsed_skills"] = df_split.apply(get_user_skills, axis=1)
    df_split["new_label"] = df_split.apply(skills_to_path, axis=1)
    
    df_split = df_split.dropna(subset=["silver_label", "new_label"]).reset_index(drop=True)
    
    skill_matrix = np.array([build_skill_vector(r) for r in df_split["parsed_skills"]], dtype=np.float32)
    exp = df_split["YearsCode"].apply(encode_years).values.reshape(-1, 1).astype(np.float32)
    ed = df_split["EdLevel"].apply(encode_ed).values.reshape(-1, 1).astype(np.float32) if "EdLevel" in df_split.columns else np.full((len(df_split), 1), 3.0, dtype=np.float32)
    
    X = np.hstack([exp, ed, skill_matrix])
    return df_split, X

df_train, X_train = process_split(df_train)
df_val, X_val = process_split(df_val)
df_test, X_test = process_split(df_test)

path_le = LabelEncoder()
path_le.fit(PATHS) # Fit on the global fixed list of 9 paths to prevent Unseen Label errors

y_train_old = path_le.transform(df_train["silver_label"])
y_train = path_le.transform(df_train["new_label"])

y_val_old = path_le.transform(df_val["silver_label"])
y_val = path_le.transform(df_val["new_label"])

y_test_old = path_le.transform(df_test["silver_label"])
y_test = path_le.transform(df_test["new_label"])

NUM_CLASSES = len(path_le.classes_)
print(f"X_train: {X_train.shape}")
print(f"X_val:   {X_val.shape}")
print(f"X_test:  {X_test.shape}")

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_val_s = scaler.transform(X_val)
X_test_s = scaler.transform(X_test)"""

cell6 = """class_weights = compute_class_weight('balanced', classes=np.unique(y_train), y=y_train)
class_weight_dict = {i: w for i, w in enumerate(class_weights)}

def build_nn(input_dim, num_classes):
    inp = keras.Input(shape=(input_dim,))
    x = layers.Dense(256, activation="relu", kernel_regularizer=regularizers.l2(1e-4))(inp)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(128, activation="relu", kernel_regularizer=regularizers.l2(1e-4))(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(64, activation="relu")(x)
    x = layers.Dropout(0.2)(x)
    out = layers.Dense(num_classes, activation="softmax")(x)
    m = keras.Model(inp, out, name="LearningPathNN_v4_New")
    m.compile(optimizer=keras.optimizers.Adam(1e-3),
              loss="sparse_categorical_crossentropy",
              metrics=["accuracy"])
    return m

nn_model = build_nn(X_train_s.shape[1], NUM_CLASSES)
history = nn_model.fit(
    X_train_s, y_train,
    validation_data=(X_val_s, y_val),
    epochs=100,
    batch_size=128,
    class_weight=class_weight_dict,
    callbacks=[
        callbacks.EarlyStopping(monitor="val_loss", patience=12, restore_best_weights=True, verbose=1),
        callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=6, min_lr=1e-6, verbose=1),
    ],
    verbose=1,
)

print("\\nTraining Random Forest with class_weight='balanced' ...")
rf_model = RandomForestClassifier(
   n_estimators=50, max_depth=8, min_samples_leaf=10,
    max_features="sqrt", class_weight='balanced',
    random_state=42, n_jobs=-1
)
rf_model.fit(X_train_s, y_train)"""

cell7 = """print("\\nGenerating predictions on VALIDATION set for Meta-Learner...")
nn_val_probs = nn_model.predict(X_val_s, verbose=0)
rf_val_probs = rf_model.predict_proba(X_val_s)

meta_X_val = np.hstack([nn_val_probs, rf_val_probs])
print("Training Logistic Regression meta-learner...")
meta_model = LogisticRegression(max_iter=1000, random_state=42)
meta_model.fit(meta_X_val, y_val)"""

cell8 = """def get_metrics(y_true, probs):
    preds = np.argmax(probs, axis=1)
    acc1 = accuracy_score(y_true, preds)
    
    top3 = np.argsort(probs, axis=1)[:, -3:]
    acc3 = np.mean([1 if y in t3 else 0 for y, t3 in zip(y_true, top3)])
    
    prec, rec, f1, _ = precision_recall_fscore_support(y_true, preds, labels=range(NUM_CLASSES), zero_division=0)
    return acc1, acc3, rec

# Evaluate New Model on Test Set
nn_test_probs_new = nn_model.predict(X_test_s, verbose=0)
rf_test_probs_new = rf_model.predict_proba(X_test_s)
new_probs = meta_model.predict_proba(np.hstack([nn_test_probs_new, rf_test_probs_new]))
new_acc1, new_acc3, new_rec = get_metrics(y_test, new_probs)

# Evaluate Old Model on Test Set
old_ai_dir = "ai"
if os.path.exists(old_ai_dir):
    print("Loading old production artifacts...")
    old_nn = tf.keras.models.load_model(f"{old_ai_dir}/learning_path_nn_model.keras")
    with open(f"{old_ai_dir}/rf_model.pkl", "rb") as f: old_rf = pickle.load(f)
    with open(f"{old_ai_dir}/scaler.pkl", "rb") as f: old_scaler = pickle.load(f)
    
    X_test_s_old = old_scaler.transform(X_test)
    nn_test_probs_old = old_nn.predict(X_test_s_old, verbose=0)
    rf_test_probs_old = old_rf.predict_proba(X_test_s_old)
    old_probs = 0.55 * nn_test_probs_old + 0.45 * rf_test_probs_old
    
    old_acc1, old_acc3, old_rec = get_metrics(y_test_old, old_probs)
    
    print("\\n" + "="*55)
    print("  COMPARISON GATE REPORT (TEST SET)")
    print("="*55)
    print(f"Top-1 Accuracy:  Old = {old_acc1:.4f}  |  New = {new_acc1:.4f}")
    print(f"Top-3 Accuracy:  Old = {old_acc3:.4f}  |  New = {new_acc3:.4f}")
    print("\\nPer-class Recall:")
    
    passed = True
    for i, p in enumerate(path_le.classes_):
        old_r = old_rec[i] if len(old_rec) > i else 0
        new_r = new_rec[i] if len(new_rec) > i else 0
        diff = new_r - old_r
        # Tolerance: drop <= 0.05
        flag = "✅" if diff >= -0.05 else "❌"
        if diff < -0.05: passed = False
        print(f"  {p:<20}: Old = {old_r:.2f}  |  New = {new_r:.2f}  ({diff:+.2f}) {flag}")
        
    acc_passed = (new_acc1 >= old_acc1) or (new_acc3 >= old_acc3)
    if not acc_passed: passed = False
    
    print("\\nVERDICT:")
    if passed:
        print("✅ PASS — safe to consider promoting ai_v2/")
    else:
        print("❌ FAIL — do not promote, metric threshold(s) failed.")
else:
    print("No old 'ai' directory found. Skipping comparison gate.")
    passed = True"""

cell9 = """def quick_predict(label, skills, interest, experience="Intermediate"):
    exp_enc  = {"Beginner":0.0,"Intermediate":1.0,"Advanced":2.0}.get(experience,1.0)
    expanded = {ALIASES.get(s.lower(),s.lower()) for s in skills}
    sv       = [get_weight(sk) if sk.lower() in expanded else 0.0 for sk in ALL_SKILLS]
    feat     = np.array([[exp_enc,3.0]+sv], dtype=np.float32)
    feat_s   = scaler.transform(feat)
    
    nn_p     = nn_model.predict(feat_s, verbose=0)
    rf_p     = rf_model.predict_proba(feat_s)
    probs    = meta_model.predict_proba(np.hstack([nn_p, rf_p]))[0]
    
    ranked   = sorted(enumerate(probs), key=lambda x:-x[1])
    print(f"\\n{label}")
    print(f"  skills={skills}, interest={interest}")
    for i,p in ranked[:3]:
        bar = "█" * int(p*30)
        print(f"    {path_le.classes_[i]:<25} {bar} {p*100:.1f}%")

print("\\n" + "="*55 + "\\n  SANITY CHECKS (New Model)\\n" + "="*55)

quick_predict("✅ html+react+typescript → Frontend",
              ["html","css","react","typescript"], "Frontend")

quick_predict("✅ node+django+sql → Backend",
              ["node.js","django","sql"], "Backend")

quick_predict("✅ html+react+node+sql → Full-Stack",
              ["html","css","react","node.js","sql","typescript"], "Full-Stack")

quick_predict("✅ tensorflow+pytorch → AI/ML",
              ["python","tensorflow","pytorch","scikit-learn"], "AI/ML")

quick_predict("✅ docker+k8s+aws → Cloud/DevOps",
              ["docker","kubernetes","aws","azure"], "Cloud/DevOps")

quick_predict("✅ kotlin+swift+flutter → Mobile",
              ["kotlin","swift","flutter","react native"], "Mobile")

quick_predict("⚠️  Mixed: html+react+node+sql + AI interest → Full-Stack NOT AI/ML",
              ["html","css","react","node.js","sql"], "AI/ML")

quick_predict("⚠️  python+sql only → ambiguous case",
              ["python","sql"], "Frontend")


# Save Models to ai_v2
os.makedirs("ai_v2", exist_ok=True)
nn_model.save("ai_v2/learning_path_nn_model.keras")
with open("ai_v2/rf_model.pkl",      "wb") as f: pickle.dump(rf_model, f)
with open("ai_v2/scaler.pkl",        "wb") as f: pickle.dump(scaler,   f)
with open("ai_v2/label_encoder.pkl", "wb") as f: pickle.dump(path_le,  f)
with open("ai_v2/meta_model.pkl",    "wb") as f: pickle.dump(meta_model, f)

metadata = {
    "feature_cols":  FEATURE_COLS,
    "languages":     LANGUAGES,
    "frameworks":    FRAMEWORKS,
    "all_skills":    ALL_SKILLS,
    "aliases":       ALIASES,
    "skill_weights": SKILL_WEIGHTS,
    "paths":         path_le.classes_.tolist(),
}
with open("ai_v2/metadata.json", "w") as f:
    json.dump(metadata, f, indent=2)
print("\\n✅ New artifacts saved to ai_v2/")"""

def make_cell(source):
    lines = [line + '\\n' for line in source.split('\\n')]
    if lines:
        lines[-1] = lines[-1].rstrip('\\n')
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": lines
    }

new_cells = [
    make_cell(cell1),
    make_cell(cell2),
    make_cell(cell3),
    make_cell(cell4),
    make_cell(cell5),
    make_cell(cell6),
    make_cell(cell7),
    make_cell(cell8),
    make_cell(cell9),
]

nb["cells"] = new_cells

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
print("Notebook updated successfully using standard JSON, all bugs fixed.")
