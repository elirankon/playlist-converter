# Playlist Converter
_Essentially what you see in other websites, but for free and in CLI._  


## How to use?
 ```sh
 $ git clone git@github.com:elirankon/playlist-converter.git
 $ cd playlist-converter
 $ npm i
 $ npm start
 pConverter:> help
 ```

 ## Client secret files
 You need to make sure you have secret files for each service you want to use:

 * [YouTube](https://developers.google.com/youtube/v3/quickstart/nodejs) - Follow Step 1.
 * Place each client file inside respective service directory. E.g., put the YouTube   
 secret file inside the `youtube` folder.

 ## Issues?
 Log them in the issue tracker please. If you want to add a service, you're more than welcome to implement it yourself!   
 _"But how do you do that?"_   
 Well, scroll right down! :point_down:

 ## How to contribute?
  * Fork the repo :fork_and_knife:
  * Open a PR :pray:
  * PR is reviewed and merged :eyes:
  * GREAT SUCCESS! :moneybag:

## Contributing Guidelines
 * Create a folder for the service you're implementing in the project root.   
 All lowercase, no special chars.
 * Edit `config.json` and add your service to the `services` array.
    ```json
    {
        "services": [
            {
                "name": "MyAwesomeService", // No spaces!!!
                "path": "./relative/path/to/the/directory"
            }
        ]
    }
    ```
 * Your folder should have an `index.js` file that will expose the main interface   
 and a `commands.js` file that will contain all the Vorpal commands for the service.   
 Something like this:
    ```
    root
    | - myawesomeservice
    | - | - index.js
    | - | - commands.js
    ```
 * Your `index.js` file should expose the following interface:
    ```js
    // `cli` is a Vorpal CommandInterface instance
    module.exports = cli => ({
        name: () => 'MyAwesomeService',
        commands: (cli) => {}, // Populates Vorpal's commands with your service
        getSourceItems: () => {}, // Returns [String]
        generate: () => {},
    });
    ```
 * Look at the `youtube` directory as a sample for the rest of the things :smile_cat:

### Big shout out to [Vorpal](http://vorpal.js.org/) for being super awesome!
