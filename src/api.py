import requests
import json
from datetime import datetime, timezone

BASE_API_URL = "http://localhost:3000/api/messages"  # Replace with your actual URL when deployed

def get_messages(room_id):
    response = requests.get(f"{BASE_API_URL}?roomId={room_id}")
    return response.json()

def send_message(message):
    message["timestamp"] = datetime.now(timezone.utc).isoformat()
    response = requests.post(BASE_API_URL, json=message)
    return response.json()

# Example usage
if __name__ == "__main__":
    room_id = "test"  # Specify the room ID
    bot_name = "PythonBot"
    bot_email = "pythonbot@example.com"  # Add an email for the bot

    # Get all messages
    messages = get_messages(room_id)
    print(f"Current messages in {room_id}:")
    for msg in messages:
        print(f"{msg['name']}: {msg['content']}")

    # Send a new message
    new_message = send_message({
        "roomId": room_id,
        "name": bot_name,
        "email": bot_email,
        "content": "Hello from Python!",
    })
    print(f"Sent message: {new_message}")

    # Get updated messages
    updated_messages = get_messages(room_id)
    print(f"\nUpdated messages in {room_id}:")
    for msg in updated_messages:
        print(f"{msg['name']}: {msg['content']}")