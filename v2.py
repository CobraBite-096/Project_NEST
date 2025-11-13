import os, json, requests

#import serial
from flask import Flask, request, jsonify
from flask_cors import CORS
#from deepface import DeepFace
#import paho.mqtt.publish as mqtt
import threading
#import streamlit as st
import datetime
#import pyfirmata2 as pyfirmata
import time as T

ESP32_ENROLL_URL = "http://192.168.1.50/enroll"
MQTT_HOST = "localhost"

#-=-=-=-=-=-=-=

import serial
import time

class ArduinoController:
    """
    Manages the serial connection and communication with the Arduino.
    """
    def __init__(self, port='/dev/ttyACM0', baudrate=9600, timeout=1):
        """
        Initializes the serial port connection.
        
        Note: The 'port' needs to be adjusted based on your OS and Arduino setup:
              - Windows: 'COM3', 'COM4', etc.
              - Linux: '/dev/ttyACM0' or '/dev/ttyUSB0'
              - Mac: '/dev/cu.usbmodemXXXX'
        """
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self.ser = None

    def connect(self):
        """Establishes the serial connection."""
        try:
            self.ser = serial.Serial(
                self.port, 
                self.baudrate, 
                timeout=self.timeout
            )
            # Give the Arduino time to reset after the connection is opened
            time.sleep(2) 
            print(f"Successfully connected to Arduino on {self.port}")
            return True
        except serial.SerialException as e:
            print(f"Error connecting to Arduino on port {self.port}: {e}")
            self.ser = None
            return False
    def send_command(self, device_pin, state):
        """
        Sends a command to control a specific device (pin).
        
        Args:
            device_pin (int): The Arduino digital pin number (e.g., 7 or 8).
            state (str): 'ON' or 'OFF'.
        """
        if not self.ser or not self.ser.is_open:
            # Reconnect logic here...
            pass 
        # Construct the command string: "D[PIN]:[STATE]"
        command_str = f"D{device_pin}:{state.upper()}"
        print(command_str)
        # Encode and add the newline terminator
        full_command = (command_str + '\n').encode('utf-8')
        print(full_command)
        try:
            self.ser.write(full_command)
            response = self.ser.readline().decode('utf-8').strip()
            print("Response: ", response)
            return response
        except Exception as e:
            return f"ERR:SEND_FAILED: {e}"

# --- Example of Integration with Flask Logic ---
# (Assuming you have a Flask app set up)

# 1. Instantiate the controller (do this once when your Flask app starts)
 # <-- **CHANGE THIS TO YOUR ARDUINO PORT**





app = Flask(__name__)
CORS(app)
os.makedirs("profiles", exist_ok=True)
os.makedirs("schedules", exist_ok=True)
os.makedirs("images", exist_ok=True)


#def loop():
#    while True:
#        for profiles in os.listdir("schedules"):
#            with open(profile, "r") as profileFile:
#                file = json.load(profileFile)
#                if datetime.time() == file["time"]:
#                    # Send to arduinos
#                    pass

#tickThread = threading.Thread()
#def arduinoFetcherLoop():
#    #board = pyfirmata.Arduino('COM4')
#    print("sigma")
#    try:
#        ser = serial.Serial("COM4", 9600, timeout=1.0)
#        T.sleep(2)
#        while True:
#            line = ser.readline().decode('utf-8').strip()
#            if line:
#                try:
#                    data = json.loads(line)
#                    print("Received JSON:", data)
#                    # Access data like a dictionary: data['sensor'], data['value']
##                except json.JSONDecodeError:
 #                   print("Invalid JSON received:", line)
 #           T.sleep(0.1)  # Small delay to prevent busy-waiting
 #   except KeyboardInterrupt:
 #       board.exit()

#arduinoFetcherThread = threading.Thread(target=arduinoFetcherLoop )
#arduinoFetcherThread.start()

DEVICESCOORESPONDENCE_ARD1 = {
    "Dining": [2],
    "Kitchen":[3],
    "Lighting": [4],
    "Door": [5]
}

DEVICESCOORESPONDENCE_ARD2 = {
    "Bathroom": [2],
    "Bedroom": [3] ,
    "Living Area": [4]}



@app.route("/componentControl", methods=["POST"])
def componentControl():
    data = request.json
    print(data)
    ARDUINO = None
    DBToUse = DEVICESCOORESPONDENCE_ARD1
    if data["room"] in DEVICESCOORESPONDENCE_ARD1.keys():
        ARDUINO = ArduinoController(port='COM3')
    else:
        DBToUse = DEVICESCOORESPONDENCE_ARD2
        ARDUINO = ArduinoController(port="COM4")
    ARDUINO.connect()
    for i in DBToUse[data["room"]]:
        ARDUINO.send_command(i, data["command"])

    return jsonify({'status': 'received'})

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    #room = data['room']
    #time = data['time']
    rooms = data["rooms"]

    #try:
        #embedding_obj = DeepFace.represent(img_path=image_path, model_name="Facenet", enforce_detection=True)
        #embedding = embedding_obj[0]["embedding"]
    #except Exception as e:
     #   return f"Face processing failed: {e}", 400

    #face_id = abs(hash(name)) % 10000

    profile = {"name": "Likhith", "rooms": rooms}
    with open(f"profiles/{profile["name"]}.json", "w") as f:
        json.dump(profile, f)
    return jsonify({"status":"received"})
    #schedule = {"face_id": face_id, "room": room, "time": time, "devices": devices}
    #with open(f"schedules/{room}_{face_id}.json", "w") as f:
    #    json.dump(schedule, f)

    #payload = {"face_id": face_id, "vector": embedding}
    #try:
    #    requests.post(ESP32_ENROLL_URL, json=payload)
    #except Exception as e:
    #    print("ESP32 enrollment failed:", e)

    #mqtt.single("home/schedule", json.dumps(schedule), hostname=MQTT_HOST)

    return f"Registered {name} with face_id {face_id}"

@app.route('/recognition', methods=['POST'])
def recognition():
    data = request.get_json()
    face_id = data.get("face_id")
    rooms = None
    with open(f"profiles/{face_id}.json", "r") as f:
        rooms= json.load(f)
    print(rooms)

    #try:
    #    with open(f"schedules/{room}_{face_id}.json") as f:
    #        schedule = json.load(f)
    #except:
    #    return jsonify({"status": "No schedule found"}), 404

    #mqtt.single("home/presence", json.dumps({
    #    "face_id": face_id,
    #    "room": room,
    #    "devices": schedule["devices"]
    #}), hostname=MQTT_HOST)

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
                #mqtt.single("home/schedule", json.dumps(schedule), hostname=MQTT_HOST)
                triggered.append(schedule)

    return jsonify({"triggered": triggered})

def run_flask():
    app.run(host='0.0.0.0', port=8888)

threading.Thread(target=run_flask).start()

#st.title("Smart Home Registration")

#name = st.text_input("Name")
#room = st.selectbox("Room", ["bedroom", "study", "living_room"])
#time = st.time_input("Time-based Action")
#devices = st.multiselect("Devices:", ["light", "fan", "computer"])
#detectionDev = st.multiselect("Devices to turn on when entered:", ["light", "fan", "computer"])
#image = st.file_uploader("Upload Face Image", type=["jpg", "jpeg", "png"])

#if st.button("Register"):
#    if not all([name, room, time, devices, image]):
#        st.error("Please fill all fields and upload an image.")
#    else:
#        files = {"image": image}
#        data = {
#            "name": name,
#            "room": room,
#            "time": time.strftime("%H:%M"),
#            "devices": devices
#        }
#        response = requests.post("http://localhost:8888/register", data=data, files=files)
#        if response.ok:
#            st.success(response.text)
#        else:
#            st.error(response.text)