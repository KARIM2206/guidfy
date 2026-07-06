import os
import re
import argparse

def extract_features_from_lgb(model_path):
    if not os.path.exists(model_path):
        print(f"Model file not found: {model_path}")
        return

    with open(model_path, 'r', encoding='utf-8') as f:
        content = f.read()

    features_match = re.search(r'feature_names=(.*)', content)
    if not features_match:
        print("Could not find feature_names in the model file.")
        return
    
    features = features_match.group(1).strip().split()
    
    splits = set()
    for line in content.split('\n'):
        if line.startswith('split_feature='):
            indices = line.replace('split_feature=', '').split()
            for idx in indices:
                splits.add(int(idx))

    used_features = [f for i, f in enumerate(features) if i in splits]
    zero_features = [f for i, f in enumerate(features) if i not in splits]

    print(f"--- Analysis for {os.path.basename(model_path)} ---")
    print(f"Total Features: {len(features)}")
    
    print("\nUsed Features (>0 importance):")
    for f in used_features:
        print(f" - {f}")
        
    print("\nZero Importance Features (0 importance):")
    if zero_features:
        for f in zero_features:
            print(f" - {f}")
    else:
        print(" - None (All features are used)")
    print("-" * 40 + "\n")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Check default model
    default_model = os.path.join(base_dir, 'models', 'lambdamart_model.txt')
    extract_features_from_lgb(default_model)
    
    # Check v2 model
    v2_model = os.path.join(base_dir, 'models', 'lambdamart_v2.txt')
    extract_features_from_lgb(v2_model)
