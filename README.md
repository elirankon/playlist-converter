# Playlist Converter
_An open source offering for migrating playlists between different streaming services_  

[![Build Status](https://travis-ci.org/elirankon/playlist-converter.svg?branch=master)](https://travis-ci.org/elirankon/playlist-converter)
[![Coverage Status](https://coveralls.io/repos/github/elirankon/playlist-converter/badge.svg)](https://coveralls.io/github/elirankon/playlist-converter)

## How to use?
 ```sh
 $ git clone git@github.com:elirankon/playlist-converter.git
 $ cd playlist-converter
 $ npm i
 $ npm start
 $ pConverter:> services list
 $ pConverter:> set [service_name] -s
 $ pConverter:> set [service_name] -t
 ... init and load stuff here
 $ pConverter:> start -t "my converted playlist title"
 ```

 Make sure you `init` source and target services and that you   
 `load` the source playlist before hitting `start`.

 ## Client secret files
 You need to make sure you have secret files for each service you want to use:

 * [YouTube](https://developers.google.com/youtube/v3/quickstart/nodejs) - Follow Step 1 of the "Getting Started" page.

 * [Spotify Setup](https://github.com/elirankon/playlist-converter/blob/master/docs/spotify.md)
 
 Place each client file inside respective service directory. E.g., put the YouTube   
 secret file inside the `youtube` folder.

 ## Issues?
 Log them in the issue tracker please. If you want to add a service, you're more than welcome to implement it yourself!

### Big shout out to [Vorpal](http://vorpal.js.org/) for being super awesome!
