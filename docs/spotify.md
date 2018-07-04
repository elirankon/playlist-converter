# Setting up Spotify
Here's the complete guide for setting up Spotify...

![Feeling lucky, punk?!](https://media.giphy.com/media/RvX10zYKZyPfi/giphy-downsized.gif)

## Setup an app in Spotify Developers
1. Go to https://developer.spotify.com/dashboard
![Login screen](https://raw.githubusercontent.com/elirankon/playlist-converter/master/docs/spotifyLogin.png)
2. Login to your Spotify account
3. Create a new **Web API** app.
![createApp](https://raw.githubusercontent.com/elirankon/playlist-converter/master/docs/createApp.png)
4. Go to the app's dashboard.
![dashboard](https://raw.githubusercontent.com/elirankon/playlist-converter/master/docs/dashboard.png)
You will find your **Client ID** on the left hand side.

5. Create a new file named `client_secret.json` in `/services/spotify`.
The file should look like this:
    ```js
    {
        "client_id": "..." // your client ID
    }
    ```

6. Start the application using `npm start`.

7. Initialize the authentication process by typing `spotify init`.

8. You will see this message:
![ngrok](https://raw.githubusercontent.com/elirankon/playlist-converter/master/docs/spotifyInit.png)
Copy the URL in the message to clipboard.

9. Back in the app dashboard on Spotify, click on **Edit Settings**
![ngrok](https://raw.githubusercontent.com/elirankon/playlist-converter/master/docs/editSettings.png)

10. Paste the URL from step 8 in **Redirect URIs**, click *ADD*, then **SAVE** at the bottom of the page.

11. Go back to the terminal and hit *enter*. A browser window will open up to get your approval for the needed scopes to read your playlists. Once you approve, the app will callback and will authorize your app.

12. To load a playlist for conversion:
    ```
    pConverter:> spotify load
    ```


## Good luck!
