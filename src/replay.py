import csv
import time
import argparse
import os
from datetime import datetime
import api

def read_csv(filename):
    """Reads the CSV file and returns a list of messages sorted by timestamp."""
    with open(filename, mode="r", encoding="utf-8") as file:
        return [{
            "roomId": row["roomId"],
            "name": row["name"],
            "email": row["email"],
            "content": row["content"],
            "timestamp": datetime.strptime(row["timestamp"], "%d/%m/%Y %H:%M:%S"),
        } for row in csv.DictReader(file)]

def process_messages(messages, speedup_factor):
    """Sends messages in order while respecting timestamps, adjusted by speedup_factor."""
    if not messages:
        print("No messages to send.")
        return
    
    KEYS = ["roomId", "name", "email", "content"]

    start_time = time.time()  # Reference point for waiting
    base_timestamp = messages[0]["timestamp"]  # Reference timestamp

    for message in messages:
        time_offset = (message["timestamp"] - base_timestamp).total_seconds() / speedup_factor
        message_time = start_time + time_offset

        time.sleep(max(0, message_time - time.time()))
        api.send_message({k: message[k] for k in KEYS})

def main():
    parser = argparse.ArgumentParser(description="Process a CSV file and send messages with timing.")
    parser.add_argument("file_path", help="Path to the CSV file")
    parser.add_argument("--speedup", type=float, default=1.0, help="Speedup factor (default: 1.0)")

    args = parser.parse_args()

    # Validate file extension
    if not args.file_path.lower().endswith(".csv"):
        print("Error: The input file must be a CSV.")
        return

    if not os.path.exists(args.file_path):
        print(f"Error: File '{args.file_path}' not found.")
        return

    messages = read_csv(args.file_path)
    process_messages(messages, args.speedup)

if __name__ == "__main__":
    main()
