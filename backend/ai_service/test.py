
import joblib, pandas as pd, numpy as np
from sklearn.preprocessing import StandardScaler

# حمّل الـ feature store وعمل re-fit
df = pd.read_parquet('data/feature_store.parquet') if __import__('os').path.exists('data/feature_store.parquet') else None
if df is not None:
    scaler = StandardScaler()
    SCALE = ['retrieval_score','career_alignment','user_skill_density','job_skill_difficulty','learning_gap_score','company_popularity','industry_similarity','salary_score']
    scaler.fit(df[SCALE].fillna(0))
    joblib.dump(scaler, 'models/feature_scaler.pkl')
    print('✅ Scaler updated to sklearn 1.7.2')
else:
    print('⚠️  feature_store.parquet مش موجود')
