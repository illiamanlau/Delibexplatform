# Bot messaging app documentation

## Information for the researcher:

### Main commands:

- `npm dev run`: Starts the server. Might need a few dependencies to be installed first if ran for the first time
- `python3 hate_speech_generator.py --freq 10`. Run the script to send predefined phrases from `hate_speech.txt`. The `--freq` argument is optional, it says every how many seconds to send the message (if not specified, that will be every 10s)
- `python3 main.py`. Run main program to load the bots, read messages from the chat, and make the bots add their own. Optional argument `--start` will send a greeting message right away when the bot is initialized, and optional message `--speedup 10` will speed up the bots a factor of 10x (or by any other given number. If no number is given but the argument is provided, 10x is the default).

### Interesting files to know about

- `logs/*.log`: Contains debug info for each of the bots, (e.g. `logs/ElonMusk.log`). If the word `ERROR` appears, that signals an error (some times the bot will crash, some it will continue but it might not work properly, for example it might not generate a response)
- `pages/[roomId].tsx`. This will describe the chats. Feel free to change this small block of code, or add new lines:

```js
const chatRooms = {
  chat1: {
    title: "Chat Room 1",
    description: "Welcome to the first chat room!",
  },
  chat2: { title: "Chat Room 2", description: "This is the second chat room." },
  // Add more chat rooms as needed
};
```

This gives a list of rooms. For example, the first one says that going to the URL `.../chat1` there will be a chat with the given `title` and `description`.

- `api_keys.json` contains all API keys for the LLMs and the (deprecated) discord bots
- `constants.py`. List of constants used. Feel free to modify the ones for reading and writing to make the bot read/write faster or spend a different random idle time before reading or writing.
- `conversations.csv`. As messages are added to the chats, messages will be appended here as a CSV. The columns of the CSV are the following: `roomId,name,email,content,timestamp,mentions`
- `hate_speech_generator.py`. This will add random hate messages to the chat via HaterBot3000 (provisional name :D). Instructions on how to execute provided in this README file
- `hate_speech.txt`: Every line will contain one hate message. To be loaded and sent by executing `hate_speech_generator.py`
- `main.py`. Main program to load the bots, read messages from the chat, and make the bots add their own. Instructions on how to execute provided in this README file

## File info

Here’s a breakdown of the files in the project, separated into several categories.

---

### **Frontend Files**

| **File**                  | **Description**                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| `components/ChatRoom.tsx` | A React component in TypeScript for rendering the chat room interface.                                 |
| `lib/types.ts`            | Contains TypeScript type definitions, typically used to enforce typing across the frontend.            |
| `next.config.js`          | Configuration file for Next.js, used to modify the default behavior of the framework.                  |
| `package-lock.json`       | Locks the exact versions of dependencies for consistent installs.                                      |
| `package.json`            | Defines project dependencies and scripts, crucial for managing the project’s Node.js packages.         |
| `pages/[roomId].tsx`      | Dynamic Next.js route for chat rooms, rendering pages based on the `roomId` parameter.                 |
| `pages/_app.tsx`          | Custom Next.js `_app` component, used to initialize pages and inject global styles or settings.        |
| `pages/api/messages.ts`   | API route in Next.js, handles requests related to chat messages (e.g., saving or retrieving messages). |
| `pages/index.tsx`         | The homepage of the application, written in TypeScript and rendered by Next.js.                        |
| `postcss.config.js`       | Configuration file for PostCSS, a tool used for processing and transforming CSS.                       |
| `styles/globals.css`      | Global styles for the application. Imported in `_app.tsx` to apply across all pages.                   |
| `tailwind.config.ts`      | Configuration file for TailwindCSS, used to customize the utility-first CSS framework.                 |
| `tsconfig.json`           | TypeScript configuration file, defining how TypeScript should compile the project’s code.              |

---

### **Backend Files**

(**TODO:** Need to update the descriptions)
| **File** | **Description** |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `api.py` | Backend API file, likely handling HTTP requests and responses for the application. |
| `chatbot.py` | Manages chatbot logic, potentially the main interface between users and the chatbot system. |
| `conversation_manager.py` | Handles conversations, possibly managing the state and flow of user dialogues. |
| `hate_speech_generator.py` | Script for generating hate speech examples, likely for testing or training models. |
| `llm_client.py` | Client interface for interacting with a large language model (LLM), handling communication with the model. |
| `llm_test.py` | Testing script for ensuring proper functionality of the LLM integration or chatbot. |
| `main.py` | Main entry point for the backend application. It initializes the bots, |
| `message_monitor.py` | Monitors and manages messages, possibly for filtering or logging purposes. |
| `utils.py` | Contains utility functions for the backend, typically used across various modules. |

---

### **Other files**

| **File**            | **Description**                                                                                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.gitignore`        | Specifies which files and directories should be ignored by Git version control.                                                                                                                    |
| `descriptions.json` | JSON file containing a `general_system_prompt` for the bots in general, plus specific descriptions for each of them: `name`, `bot` (whether it's active), and specific `system_prompt` of the bot. |
| `hate_speech.txt`   | File containing examples of hate speech phrases, one per line.                                                                                                                                     |
| `README.md`         | Documentation (this file)                                                                                                                                                                          |
