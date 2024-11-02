import groq, openai
import time

import utils

MODEL_NAME = None

def get_client(model):
    if any(substr in model for substr in ["llama", "distil", "gemma", "mixtral"]):
        return groq.Groq(api_key=utils.get_api_key("GROQ"))
    else:
        return openai.OpenAI(api_key=utils.get_api_key("OPENAI"))

class LLMClient():
    def __init__(self, settings, logger = None):
        self.settings = settings
        self.logger = logger
        self.client = get_client(settings["model"])
        self.log(f'Created LLMClient: Model: {settings["model"]}')

    def log(self, msg):
        if self.logger: self.logger.info(msg)
        else: print(msg)

    def get_response_from_completion(self, completion_settings):
        self.log(f'Completion settings {completion_settings}')
        if utils.OFFLINE: return "Lorem ipsum"
        completion_response = self.client.chat.completions.create(**completion_settings)
        response = completion_response.choices[0].message.content.strip()
        if len(response) == 0:
            raise Exception("Returned empty response")
        return response

    def complete_from_message(self, message, system_prompt = None):
        start_time = time.time()
        
        completion_settings = self.settings.copy()
        completion_settings["messages"] = [{"role": "user", "content": message}]
        if system_prompt: completion_settings["messages"].append({"role": "system", "content": system_prompt})
        
        response_text = self.get_response_from_completion(completion_settings)
        
        end_time = time.time()
        execution_time = end_time - start_time
        
        self.log(f'Completed message ending in {message[-100:]}, response starts with {response_text[:100]}')
        self.log(f'Execution time: {execution_time:.2f} seconds')
        
        return response_text

    def continue_conversation(self, messages):
        self.log(f'Continuing conversation ending in {messages[-1]["content"][-100:]}')
        completion_settings = self.settings
        completion_settings["messages"] = messages
        try:
            response_text = self.get_response_from_completion(completion_settings)
        except Exception as err:
            utils.print_json(completion_settings, True)
            self.logger.error(f"Unexpected {err=}, {type(err)=} when requesting LLM completion")
            return None
        self.log(f'Response starts with {response_text[:100]}')
        return response_text

