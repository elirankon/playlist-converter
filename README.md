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

 ## What supports what?
| Service | Load Items (as source) | Generate Playlists (as target) |
| :-----: | :--------------------: | :----------------------------: |
| Youtube | :white_check_mark:     |       :white_check_mark:       |
| Spotify |    :white_check_mark:  |       :white_check_mark:       |

 ## Setup client credentials and stuff
 You need to make sure you have setup the environment for services you want to use:
 * [YouTube Setup](https://github.com/elirankon/playlist-converter/blob/master/docs/youtube.md)
 * [Spotify Setup](https://github.com/elirankon/playlist-converter/blob/master/docs/spotify.md)

 ## Issues?
 Log them in the issue tracker please. If you want to add a service, you're more than welcome to implement it yourself!

### Big shout out to [Vorpal](http://vorpal.js.org/) for being super awesome!
