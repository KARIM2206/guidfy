import requests
import json

# URL السيرفر البايثون
url = "http://127.0.0.1:5050/predict"

# مثال على البيانات اللي هنبعتها
# مثال سريع لو features اتعملها scaler قبل
data = {
    "features": [
        0.0, 1.0, 0.5, 0.3, 0.0, 1.2,  # مجرد قيم تجريبية عددية
        0.1, 0.0
    ]
}

# إرسال POST request
try:
    response = requests.post(url, json=data)
    response.raise_for_status()  # هيرمي error لو response مش 200
    result = response.json()
    print("Recommended Path:", result["recommended_path"])
except requests.exceptions.RequestException as e:
    print("Error calling AI server:", e)