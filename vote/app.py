import os
import uuid
import json
import logging
from flask import Flask, render_template, request, make_response, jsonify
from confluent_kafka import Producer
from dotenv import load_dotenv

# Load environment variables from .env file if it exists (for local development)
load_dotenv()

app = Flask(__name__)

# --- Configuration ---
KAFKA_BROKERS = os.environ.get('KAFKA_BROKERS', 'kafka:9092')
KAFKA_TOPIC = os.environ.get('KAFKA_TOPIC', 'votes')
# --- REMOVED: CONTAINER_ID_DISPLAY ---

# --- Logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Kafka Producer Setup ---
kafka_config = {
    'bootstrap.servers': KAFKA_BROKERS,
    # Use a generic client ID or remove if not needed
    'client.id': 'voting-app-producer'
}
try:
    producer = Producer(kafka_config)
    logger.info(f"Kafka Producer initialized with brokers: {KAFKA_BROKERS}")
except Exception as e:
    logger.error(f"Failed to initialize Kafka producer: {e}")
    producer = None

def delivery_report(err, msg):
    if err is not None:
        logger.error(f'Message delivery failed: {err}')
    else:
        logger.info(f'Message delivered to {msg.topic()} [{msg.partition()}] @ offset {msg.offset()}')

# --- Routes ---

@app.route('/', methods=['GET'])
def index():
    voter_id = request.cookies.get('voter_id')
    last_vote = request.cookies.get('last_vote') # Read last vote from cookie

    if not voter_id:
        voter_id = str(uuid.uuid4())
        logger.info(f"New voter identified, assigning ID: {voter_id}")
        # If it's a new voter, there's no last vote yet
        last_vote = None

    # Render the template, passing the last known vote
    # REMOVED: hostname=... from render_template call
    resp = make_response(render_template('index.html', last_vote=last_vote))

    # Set (or reset) the voter_id cookie (we still need this ID)
    resp.set_cookie('voter_id', voter_id, max_age=60*60*24*365*2) # 2 years expiration

    # If last_vote exists, ensure its cookie is also refreshed (optional but good practice)
    # If we didn't read one, don't set an empty cookie here. It will be set on the first vote.
    # The main setting happens in the /vote endpoint after a successful vote.

    return resp

@app.route('/vote', methods=['POST'])
def vote():
    if not producer:
        logger.error("Kafka producer is not available.")
        return jsonify({"status": "error", "message": "System error: Kafka not connected"}), 500

    voter_id = request.cookies.get('voter_id')
    if not voter_id:
        logger.warning("Vote attempt without voter_id cookie.")
        # Regenerate ID and instruct user to retry - could also try redirecting to '/'
        voter_id = str(uuid.uuid4())
        resp = make_response(jsonify({"status": "error", "message": "Voter ID missing. Please try voting again."}), 400)
        resp.set_cookie('voter_id', voter_id, max_age=60*60*24*365*2)
        return resp


    vote_choice = request.form.get('vote')
    if vote_choice not in ['Cats', 'Dogs']:
        logger.warning(f"Invalid vote choice received: {vote_choice}")
        return jsonify({"status": "error", "message": "Invalid vote option."}), 400

    try:
        message = {
            'voter_id': voter_id,
            'vote': vote_choice
        }
        message_json = json.dumps(message).encode('utf-8')

        logger.info(f"Producing vote: {message}")
        producer.produce(
            KAFKA_TOPIC,
            key=voter_id.encode('utf-8'),
            value=message_json,
            callback=delivery_report
        )
        producer.flush(timeout=5) # Ensure message is sent

        logger.info(f"Vote '{vote_choice}' for voter '{voter_id}' sent to Kafka topic '{KAFKA_TOPIC}'.")

        # --- Set cookies on successful vote ---
        resp = make_response(jsonify({"status": "success", "message": "Vote submitted successfully!"}))
        # Ensure voter_id cookie is set/refreshed
        resp.set_cookie('voter_id', voter_id, max_age=60*60*24*365*2)
        # Set the last_vote cookie
        resp.set_cookie('last_vote', vote_choice, max_age=60*60*24*365*2)
        return resp

    except BufferError as e:
         logger.error(f"Kafka producer queue is full: {e}.")
         return jsonify({"status": "error", "message": "System busy, please try again later."}), 503
    except Exception as e:
        logger.error(f"Error sending vote to Kafka: {e}")
        return jsonify({"status": "error", "message": "Failed to submit vote due to system error."}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=False)