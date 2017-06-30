/**
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var SpotifyWebApi = require("./src/server");
var https = require('https');

var app = express();

var noiseArr = [
    '(',
    ')',
    'new',
    '[',
    ']',
    'brand',
    ',',
    '.',
    '-',
    'cd',
    'explicit',
    'version',
    'vinyl',
    '!',
    'atlantic',
    'republic',
    'import',
    'uk',
    'portugal',
    'discs',
    'disc',
    '2cd',
    '3cd',
    'cds',
    '2discs',
    '-',
    ':',
    'deluxe',
    'edition',
    'track',
    'tracks',
    'rare',
    'single'
];

var albumArr = [
    {title:'24k magic',artist:'Bruno Mars'},
    {title:'1989',artist:'Taylor Swift'},
    {title:'joanne',artist:'Lady Gaga'},
    {title:'man of steel',artist:'Hans Zimmer'},
    {title:'interstellar',artist:'Hans Zimmer'},
    {title:'the fame',artist:'Lady Gaga'},
    {title:'band of gypsys',artist:'Jimi Hendrix'},
    {title:'promised land',artist:'Elvis Presley'},
    {title:'infinite',artist:'Eminem'},
    {title:'lemonade',artist:'Beyonce'},
    {title:'to pimp a butterfly',artist:'Kendrick Lamar'},
    {title:'more life',artist:'Drake'},
    {title:'the dark side of the moon',artist:'Pink Floyd'},
    {title:'the wall',artist:'Pink Floyd'},
    {title:'ghost stories',artist:'Coldplay'},
    {title:'starboy',artist:'The Weekend'},
    {title:'25',artist:'Adele'},
    {title:'my world',artist:'Justin bieber'},
    {title:'bye bye bye',artist:'NSYNC'}
];

app.get('/getAlbum', function(req, res) {
    var spotifyApi = new SpotifyWebApi({
        clientId : '704692a639c8490589eb5dc935948f55',
        clientSecret : 'f3d071d48b9843a7844557115357875e'
    });
    let searchString = req.query.name;
    let queryStr;
    console.log('Input Title:', searchString);
    const matchAlbum = function (album) {
        if(searchString.toLowerCase().includes(album.title)) {
            queryStr = `${album.title} - ${album.artist}`;
            return queryStr;
        }
    }

    const cleanupTitle = function (noise) {
        searchString = searchString.toLowerCase().replace(noise, '');
        queryStr = searchString;
    }

    function spotifyApiCall(queryStr) {
        // Spotofy API call
            spotifyApi.clientCredentialsGrant()
            .then(function(data) {
                // Set the access token on the API object so that it's used in all future requests
                spotifyApi.setAccessToken(data.body['access_token']);

                console.log('Input query string:', queryStr);
                return spotifyApi.search(queryStr, ['album'], { limit : 1, offset : 0 });
                
            }).then(function(data) {
                let response = {};
                if(data.body && data.body.albums && data.body.albums.items[0] && data.body.albums.items[0].uri) {
                    response.spotifyUri = data.body.albums.items[0].uri;
                    response.albumName = data.body.albums.items[0].name;
                    response.albumType = data.body.albums.items[0].type;
                    response.spotifyWidget = `<iframe src="https://open.spotify.com/embed?uri=${response.spotifyUri}&theme=white" width="300" height="380" frameborder="0" allowtransparency="true"></iframe>`;
                    console.log(JSON.stringify(response));
                }
                res.setHeader('Content-Type', 'application/json');
                res.jsonp(response);

            }).catch(function(err) {
                console.log('Unfortunately, something has gone wrong.', err.message);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(err.message));
            });
    }

    albumArr.map(matchAlbum);

    if(!queryStr) {
        noiseArr.map(cleanupTitle);
        https.get('https://www.googleapis.com/customsearch/v1?key=AIzaSyC_Op2V-yZgUOSUploEv9pWQVmXO1yYJpc&cx=011622329136333875612:1zpnlgc8xqe&q='+ queryStr,  (resp) => {
            let data = '';
            resp.on('data', function(chunk){
                data += chunk;
            });

            resp.on('end', () => {
                var result = JSON.parse(data);
                // console.log(result);
                if(result && result.items && result.items[0] && result.items[0].link) {
                    console.log(result.items[0].link);
                    let link = result.items[0].link.split('/');
                    let album = link.pop().replace(/-/g," ");
                    let artist = link.pop().replace(/-/g," ");
                    queryStr = `${album} - ${artist}`;
                    console.log(queryStr);
                }
                spotifyApiCall(queryStr);
            })
        }).on('error', (e) => {
            console.error(e);
            spotifyApiCall(queryStr);
        });
    } else {
        spotifyApiCall(queryStr);
    }

});

console.log('Listening on 8888');
app.listen(8888);