const axios = require("axios");

const FLASK_API_URL = "http://127.0.0.1:5050/predict";

async function getRecommendedPath(features) {
  const response = await axios.post(FLASK_API_URL, features, {
    headers: { "Content-Type": "application/json" },
    timeout: 10_000,
  });
  return response.data; // ← رجّع الـ object كامل ✅
}

module.exports = { getRecommendedPath };