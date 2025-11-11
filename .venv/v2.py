import os, json, requests

import serial
from flask import Flask, request, jsonify
from deepface import DeepFace
import paho.mqtt.publish as mqtt
import threading
import streamlit as st
import datetime
import pyfirmata2 as pyfirmata
import time as T

ESP32_ENROLL_URL = "http://192.168.1.50/enroll"
MQTT_HOST = "localhost"

app = Flask(__name__)
os.makedirs("profiles", exist_ok=True)
os.makedirs("schedules", exist_ok=True)
os.makedirs("images", exist_ok=True)


def loop():
    while True:
        for profiles in os.listdir("schedules"):
            with open(profile, "r") as profileFile:
                file = json.load(profileFile)
                if datetime.time() == file["time"]:
                    # Send to arduinos
                    pass

#tickThread = threading.Thread()
def arduinoFetcherLoop():
    #board = pyfirmata.Arduino('COM4')
    print("sigma")
    try:
        ser = serial.Serial("COM4", 9600, timeout=1.0)
        T.sleep(2)
        while True:
            line = ser.readline().decode('utf-8').strip()
            if line:
                try:
                    data = json.loads(line)
                    print("Received JSON:", data)
                    # Access data like a dictionary: data['sensor'], data['value']
                except json.JSONDecodeError:
                    print("Invalid JSON received:", line)
            T.sleep(0.1)  # Small delay to prevent busy-waiting
    except KeyboardInterrupt:
        board.exit()

arduinoFetcherThread = threading.Thread(target=arduinoFetcherLoop )
arduinoFetcherThread.start()





@app.route('/register', methods=['POST'])
def register():
    name = request.form['name']
    room = request.form['room']
    time = request.form['time']
    devices = request.form.getlist('devices')
    image = request.files['image']

    image_path = f"images/{name}.jpg"
    image.save(image_path)

    try:
        embedding_obj = DeepFace.represent(img_path=image_path, model_name="Facenet", enforce_detection=True)
        embedding = embedding_obj[0]["embedding"]
    except Exception as e:
        return f"Face processing failed: {e}", 400

    face_id = abs(hash(name)) % 10000

    profile = {"name": name, "room": room, "face_id": face_id}
    with open(f"profiles/{face_id}.json", "w") as f:
        json.dump(profile, f)

    schedule = {"face_id": face_id, "room": room, "time": time, "devices": devices}
    with open(f"schedules/{room}_{face_id}.json", "w") as f:
        json.dump(schedule, f)

    payload = {"face_id": face_id, "vector": embedding}
    try:
        requests.post(ESP32_ENROLL_URL, json=payload)
    except Exception as e:
        print("ESP32 enrollment failed:", e)

    mqtt.single("home/schedule", json.dumps(schedule), hostname=MQTT_HOST)

    return f"Registered {name} with face_id {face_id}"

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

def run_flask():
    app.run(host='0.0.0.0', port=8888)

threading.Thread(target=run_flask, daemon=True).start()

st.title("Smart Home Registration")

name = st.text_input("Name")
room = st.selectbox("Room", ["bedroom", "study", "living_room"])
time = st.time_input("Time-based Action")
devices = st.multiselect("Devices:", ["light", "fan", "computer"])
#detectionDev = st.multiselect("Devices to turn on when entered:", ["light", "fan", "computer"])
image = st.file_uploader("Upload Face Image", type=["jpg", "jpeg", "png"])

if st.button("Register"):
    if not all([name, room, time, devices, image]):
        st.error("Please fill all fields and upload an image.")
    else:
        files = {"image": image}
        data = {
            "name": name,
            "room": room,
            "time": time.strftime("%H:%M"),
            "devices": devices
        }
        response = requests.post("http://localhost:8888/register", data=data, files=files)
        if response.ok:
            st.success(response.text)
        else:
            st.error(response.text)