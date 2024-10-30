import asyncio
from enum import Enum
import time
from typing import List, Dict
import json
import utils

class ChatState(Enum):
    IDLE = 0
    READING = 1
    AWAITING_WRITE = 2
    AWAITING_RECEIVE = 3

class ChatHistoryInteractionManager:
    def __init__(self, name: str, chatroom: str, logger):
        # Initialize the chat state machine with user info and settings
        self.name = name
        self.chatroom = chatroom
        self.logger = logger

        # Initialize state and history
        self.state = ChatState.IDLE
        self.history: List[Dict] = []
        self.unreceived_sent_messages: set[str] = set()

        # Initialize locks for thread-safe operations
        self.history_lock = asyncio.Lock()
        self.state_lock = asyncio.Lock()

        # Initialize counters
        self.total_chars = 0
        self.last_read_index = 0

    def log(self, msg):
        if self.logger: self.logger.info(msg)
        else: print(msg)

    async def sleep(self, time_s, reason):
        async with self.sleep_lock:
            self.log(f'Going to sleep for {time_s}s due to {reason}')
            await utils.bot_sleep(time_s, self.logger)
            self.log(f'Completed sleeping for {time_s}s due to {reason}')

    # Assumes lock is already in place
    def check_state_is_expected(self, expected_state):
        if self.state != expected_state:
            self.logger.error(f'Unexpected state {self.state}, expected {expected_state}')

    # Assumes lock is already in place
    def update_state(self, new_state):
        self.log(f'Updating state from {self.state} to {new_state}')
        self.state = new_state

    async def update_messages(self, messages) -> None:
        """
        Update the conversation history with new messages.
        This method is called by an external library with the complete JSON of the conversation history.
        """
        try:
            async with self.history_lock:
                # Update unreceived_sent_messages
                for msg in messages:
                    if msg['name'] == self.name and msg['roomId'] == self.chatroom:
                        self.unreceived_sent_messages.discard(msg['content'])

                async with self.state_lock:
                    if len(self.unreceived_sent_messages) == 0 and self.state == ChatState.AWAITING_RECEIVE:
                        self.update_state(ChatState.IDLE)

                # Update the history
                self.history = [
                    utils.build_message(
                        'assistant' if msg['name'] == self.name else 'user',
                        f"Message from {msg['name']}: {msg['content']}",
                        msg['name'])
                    for msg in messages if msg['roomId'] == self.chatroom]

            # Trigger the reading process if there are new messages
            return await self._process_new_messages()
        except Exception as err:
            self.logger.error(f"Unexpected {err=}, {type(err)=} for update_messages()")

    async def _process_new_messages(self) -> bool:
        """
        Process new messages in the history, simulating reading time.
        Returns true if any new messages have been processed
        """
        async with self.state_lock:
            if self.state != ChatState.IDLE:
                return False # We're already processing something else

            self.update_state(ChatState.READING)

        total_read_chars = 0
        while True:
            async with self.history_lock:
                # Calculate new characters to read
                new_total_chars = sum(len(msg['content']) for msg in self.history if msg['name'] != self.name)
                chars_to_read = new_total_chars - self.total_chars

                assert(chars_to_read >= 0, f'Negative chars to read? {chars_to_read}')
                if chars_to_read == 0:
                    break  # No new content to read

                # Simulate reading time
                read_time = chars_to_read / utils.READ_SPEED
                self.total_chars = new_total_chars
                self.last_read_index = len(self.history)
                total_read_chars += chars_to_read

            # Release the lock while "reading"
            await utils.bot_sleep(read_time, self.logger)

        # Return whether we processed any new messages and update the state accordingly
        async with self.state_lock:
            if total_read_chars == 0:
                self.update_state(ChatState.IDLE)
                return False
            else:
                self.update_state(ChatState.AWAITING_WRITE)
                return True

    async def write_message(self, msg: str, greeting) -> None:
        """
        Simulate writing a message and add it to unreceived sent messages.
        """
        async with self.state_lock:
            if not greeting and self.state != ChatState.AWAITING_WRITE:
                raise ValueError("Not in the correct state to write a message")

            self.update_state(ChatState.AWAITING_RECEIVE)

        # Simulate writing time
        write_time = len(msg) / utils.READ_SPEED
        await utils.bot_sleep(write_time, self.logger)

        async with self.history_lock:
            self.unreceived_sent_messages.add(msg)

    async def abort_sending_message(self):
        async with self.history_lock:
            async with self.state_lock:
                if self.history:
                    self.check_state_is_expected(ChatState.AWAITING_WRITE)
                self.update_state(ChatState.IDLE)

    async def get_relevant_history(self, system_prompt):
        self.log("get_relevant_history")
        async with self.history_lock:
            return [utils.build_message('system', system_prompt)] + \
                self.history[:self.last_read_index]

    async def get_state(self) -> ChatState:
        """
        Get the current state of the chat state machine.
        """
        async with self.state_lock:
            return self.state

    async def wait_until_idle(self) -> None:
        """
        Wait until the state machine returns to the IDLE state.
        """
        while True:
            state = await self.get_state()
            if state == ChatState.IDLE:
                break
            await utils.bot_sleep(0.1, self.logger)

# Example usage
async def main():
    chat = ChatHistoryInteractionManager("Alice", "test")
    
    # Simulate receiving new messages
    await chat.update_messages(json.dumps([
        {"name": "Bob", "content": "Hello Alice!"},
        {"name": "Charlie", "content": "How are you doing?"}
    ]))

    # Wait until the chat is ready for writing
    while await chat.get_state() != ChatState.AWAITING_WRITE:
        await utils.bot_sleep(0.1)

    # Simulate writing a message
    await chat.write_message("Hi Bob and Charlie! I'm doing great, thanks!")

    # Simulate receiving our own message
    await chat.update_messages(json.dumps([
        {"name": "Bob", "content": "Hello Alice!"},
        {"name": "Charlie", "content": "How are you doing?"},
        {"name": "Alice", "content": "Hi Bob and Charlie! I'm doing great, thanks!"}
    ]))

    # Wait until the chat returns to IDLE state
    await chat.wait_until_idle()

    print("Chat interaction completed")

if __name__ == "__main__":
    asyncio.run(main())