import json
import logging
import random
import re
import asyncio

def print_json(data, force_print = False):
    if force_print:
        print(json.dumps(data, indent=2))

# Convert JSON object to a beautified string
def beautified_json_string(json_data) -> str:
    return json.dumps(json_data, indent=4, sort_keys=True)

def clean_text_start(message: str) -> str:
    # Regular expression to match "Message from [NAME]:" (including multiple occurrences)
    pattern = r"(Message from [^:]+:)+"

    # Substitute all occurrences of the pattern with an empty string
    clean_text = re.sub(pattern, '', message).strip()

    return clean_text

def get_api_key(name):
    with open('api_keys.json', 'r') as file:
        return json.load(file)[name]

def build_message(role, content, name = None):
    assert(role in ['system', 'user', 'assistant'])
    if name is None:
        return {'role' : role, 'content' : content}
    else:
        return {'role' : role, 'content' : content, 'name' : name}

SPEED_UP_FACTOR = 1.0

async def bot_sleep(time_s, logger=None):
    if logger:
        logger.info(f'Going to sleep for {time_s/SPEED_UP_FACTOR}s')
    await asyncio.sleep(time_s/SPEED_UP_FACTOR)

S_TO_MS = 10**3
READ_SPEED = 30 # Characters per second
MIN_IDLE_READ_TIME_MS = 0
MAX_IDLE_READ_TIME_MS = 1000
WRITE_SPEED = 5 # Characters per second
MIN_IDLE_WRITE_TIME_MS = 2000
MAX_IDLE_WRITE_TIME_MS = 7000

def get_reading_time(message_len: int):
    return (message_len/READ_SPEED + random.randint(MIN_IDLE_READ_TIME_MS, MAX_IDLE_READ_TIME_MS)/S_TO_MS)/SPEED_UP_FACTOR

def get_writing_time(message):
    return (len(message)/WRITE_SPEED + random.randint(MIN_IDLE_WRITE_TIME_MS, MAX_IDLE_WRITE_TIME_MS)/S_TO_MS)/SPEED_UP_FACTOR

# Set logging up

def get_logger(name):
    # Create a custom logger
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    # Create handlers
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)

    file_handler = logging.FileHandler(f'logs/{name}.log')
    file_handler.setLevel(logging.INFO)

    # Create formatters and add them to handlers
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    file_handler.setFormatter(formatter)

    # Add handlers to the logger
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return logger
