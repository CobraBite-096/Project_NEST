from flask import Flask, request, render_template_string, jsonify
import os, json, requests
import paho.mqtt.publish as mqtt
from deepface import DeepFace

app = Flask(__name__)
ESP32_ENROLL_URL = "http://192.168.1.50/enroll"
MQTT_HOST = "localhost"

# Ensure data folders exist
os.makedirs("profiles", exist_ok=True)
os.makedirs("schedules", exist_ok=True)
os.makedirs("images", exist_ok=True)

# 🖼️ HTML UI
HTML_FORM = """
<h2>Smart Home Registration</h2>
<form method="POST" action="/register" enctype="multipart/form-data">
  Name: <input type="text" name="name"><br>
  Room: 
  <select name="room">
    <option value="bedroom">Bedroom</option>
    <option value="study">Study</option>
    <option value="living_room">Living Room</option>
  </select><br>
  Time-based Actions:<br>
  Time: <input type="time" name="time"><br>
  <label><input type="checkbox" name="devices" value="light"> Light</label>
  <label><input type="checkbox" name="devices" value="fan"> Fan</label>
  <label><input type="checkbox" name="devices" value="computer"> Computer</label><br>
  Upload Face Image: <input type="file" name="image"><br>
  <input type="submit" value="Register">
</form>
"""

@app.route('/')
def index():
    return render_template_string(HTML_FORM)

# 🧠 Registration Handler
@app.route('/register', methods=['POST'])
def register():
    name = request.form['name']
    room = request.form['room']
    time = request.form['time']
    devices = request.form.getlist('devices')
    image = request.files['image']

    # Save image
    image_path = f"images/{name}.jpg"
    image.save(image_path)

    # Extract embedding using DeepFace
    try:
        embedding_obj = DeepFace.represent(img_path=image_path, model_name="Facenet", enforce_detection=True)
        embedding = embedding_obj[0]["embedding"]
    except Exception as e:
        return f"Face processing failed: {e}", 400

    face_id = abs(hash(name)) % 10000

    # Save profile
    profile = {"name": name, "room": room, "face_id": face_id}
    with open(f"profiles/{face_id}.json", "w") as f:
        json.dump(profile, f)

    # Save schedule
    schedule = {"face_id": face_id, "room": room, "time": time, "devices": devices}
    with open(f"schedules/{room}_{face_id}.json", "w") as f:
        json.dump(schedule, f)

    # Send vector to ESP32
    payload = {"face_id": face_id, "vector": embedding}
    try:
        requests.post(ESP32_ENROLL_URL, json=payload)
    except Exception as e:
        print("ESP32 enrollment failed:", e)

    # Send schedule to Arduino via MQTT
    mqtt.single("home/schedule", json.dumps(schedule), hostname=MQTT_HOST)

    return f"Registered {name} with face_id {face_id}"

# 📡 ESP32 Recognition Callback
@app.route('/recognition', methods=['POST'])
def recognition():
    data = request.get_json()
    face_id = data.get("face_id")
    room = data.get("room", "unknown")

    try:
        with open(f"schedules/{room}_{face_id}.json") as f:
            schedule = json.load(f)
    except:
        return jsonify({"status": "No schedule found"}), 404

    mqtt.single("home/presence", json.dumps({
        "face_id": face_id,
        "room": room,
        "devices": schedule["devices"]
    }), hostname=MQTT_HOST)

    return jsonify({"status": "Presence trigger sent", "devices": schedule["devices"]})

# 🕒 Time-based Trigger (optional endpoint for cron jobs)
@app.route('/trigger_time', methods=['GET'])
def trigger_time():
    from datetime import datetime
    now = datetime.now().strftime("%H:%M")
    triggered = []

    for file in os.listdir("schedules"):
        with open(f"schedules/{file}") as f:
            schedule = json.load(f)
            if schedule["time"] == now:
                mqtt.single("home/schedule", json.dumps(schedule), hostname=MQTT_HOST)
                triggered.append(schedule)

    return jsonify({"triggered": triggered})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8888)