# Contributing Guidelines
## Introduction
Thanks for contributing to Playlist Converter! :collision: 

In order for the code to look coherent and not a patchy mess of lines, I have put some guidelines into place.

## What contributions can I make?
Contributions small and large are welcome!   
This is just one of my side projects, and there are many services that you can add as well as refactoring, test coverage 
and improved documentation. If you're wondering where to start, try checking the issue tracker for
issues marked as `help wanted`.

If you're considering contributing a new feature, check whether it has already 
been raised on the issue tracker as an enhancement. If not, please add it to the board and we can 
discuss whether it would be appropriate to add to the app.

## First line of defense :point_up:
 * Are considerate and respectful to other contributors.
 * Cover your code with tests (this project uses [nyc](https://github.com/istanbuljs/nyc) for code coverage).   
 Make sure your contribution doesn't reduce coverage. In general, make sure that coverage for your files is above 85%.
 * Ensure that the linter and tests are passing before submitting. (Husky will run these automatically when you commit).
 * Write clear commit messages in the style described [here](https://chris.beams.io/posts/git-commit/), like these:
   * `Add Deezer authentication`
   * `Make docs more appealing`
   * `Add more tests in X service`

## How do I contribute?
* Fork the repo :fork_and_knife:
* Open a PR :pray:
* PR is reviewed and merged :eyes:
* GREAT SUCCESS! :moneybag:

## And now for some coding specifics
* Create a folder for the service you're implementing in the `services` folder.   
 All lowercase, no special chars.
 * Edit `config.json` and add your service to the `services` array.
    ```js
    {
        "services": [
            {
                "name": "awesomeStreamingService", // No spaces!!!
                "path": "./relative/path/to/the/directory",
                "clientSecretFileName": "my_client_secret_file.json"
            }
        ]
    }
    ```
 * Your folder should have an `index.js` file that will expose the main interface   
 and a `commands.js` file that will contain all the Vorpal commands for the service.   
 Something like this:
    ```
    root
    | - services
    | - | - myawesomeservice
    | - | - | - index.js
    | - | - | - commands.js
    ```
 * Your `index.js` file should expose the following interface:
    ```js
    // `cli` is a Vorpal CommandInterface instance
    module.exports = cli => ({
        name: () => 'awesomeStreamingService',
        commands: (cli) => {}, // Populates Vorpal's commands with your service
        getSourceItems: () => {}, // Returns [String]
        generate: () => {},
    });
    ```
 * Look at the `services/youtube` directory as a sample for the rest of the things :smile_cat:
 
# Thanks again!
