from flask import Blueprint, jsonify, request
import os
import json
import shutil
from datetime import datetime

admin_bp = Blueprint('admin', __name__, url_prefix='/admin/api')
KNOWLEDGE_DIR = "knowledge"
BACKUP_DIR = "knowledge_backups"

def load_json(filename):
    with open(os.path.join(KNOWLEDGE_DIR, filename), 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filename, data):
    with open(os.path.join(KNOWLEDGE_DIR, filename), 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)

@admin_bp.route('/knowledge/<filename>', methods=['GET'])
def get_knowledge(filename):
    try:
        return jsonify(load_json(f"{filename}.json"))
    except Exception as e:
        return jsonify({"error": str(e)}), 404

@admin_bp.route('/knowledge/<filename>', methods=['POST'])
def update_knowledge(filename):
    try:
        data = request.json
        save_json(f"{filename}.json", data)
        return jsonify({"message": "Successfully updated!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/backup', methods=['POST'])
def backup_knowledge():
    try:
        os.makedirs(BACKUP_DIR, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = os.path.join(BACKUP_DIR, timestamp)
        shutil.copytree(KNOWLEDGE_DIR, backup_path)
        return jsonify({"message": "Backup created successfully!", "path": backup_path})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
