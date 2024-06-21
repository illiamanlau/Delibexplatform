from llm_client import *

client = LLMClient({"model" : "llama3-8b-8192"})
print(client.complete_from_message("Hello, how are you?"))
