How to build a new Bot:

- Go to [Discord's developer portal](https://discord.com/developers/applications)
- Click on New Application, name the bot, accept terms, and click create. You might add a profile picture as well.
- Go to the Bot tab:
    - Click on Reset token, and copy and save the new token. You may need to confirm with your password
    - Paste the token in `api_keys.json`, using the bot's name and following the given format
    - Enable "Message content intent" so that the bot can see all messages
- Go to Oauth2:
    - On the "OAuth2 URL Generator" select `bot` and `applications.commands`
    - Select Administrator permissions, for simplicity
        - It's probably worth going through the only needed options in the future, so far this is done to avoid the bot from having unexpected restrictions when developing
    - Copy and paste the generated URL on the URL bar, and follow the straightforward instructions to add the bot to the server
- Ideally, right-click on the profile, go to roles, and set the "Bot" role.
- If you want to add a system prompt for the bot, `descriptions.json` is the place to do that. Just follow the same format.
- We are ready to use the bot!