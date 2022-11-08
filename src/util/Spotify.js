
let userAccessToken;
const clientID =  '196a6e81bcb247c6a702f8a790c6be27';
const redirectURI = 'http://localhost:3000/';
const spotifyBaseURL = 'https://api.spotify.com/v1';

const Spotify = {

    getAccessToken() {
        if(userAccessToken) {
            return userAccessToken;
        }

        // check for access token match
        let accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        let experationMatch = window.location.href.match(/expires_in([^&]*)/);
        
        if(accessTokenMatch && experationMatch) {
            userAccessToken = accessTokenMatch[1];
            const expiresIn = Number(experationMatch[1]);
            // This clears the parameters and allows us to get a new access
            // token when it expires.
            window.setTimeout(() => accessTokenMatch = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return userAccessToken;
        }
        else {
            window.location = `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientID}&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
            
        }
    },



    search (term) {
        const accessToken = Spotify.getAccessToken();

        return fetch(`${spotifyBaseURL}/search?type=track&q=${term}`,
            {headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        .then((response) => response.json())
        .then((jsonResponse) => {
            if (!jsonResponse.tracks) {
                return [];
            }
            return jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
            }));
        })       

        .catch((error) => {
            console.log('Search error')
        })
    },

    savePlaylist(name, trackUris) {
        // if there is no name or no uris then exit the function
        if(!name || !trackUris) {
            return;
        }
        // get users access token
        const accessToken = Spotify.getAccessToken();
        // check to see if the user is authorised
        const headers = {Authorization: `Bearer ${accessToken}`};
        let userId;
        // make a request that returns the users spotify username.
        // Then convert the username to json and save the response id to 
        // the users id variable 
        // fetch using the profile endpoint 
        return fetch('https://api.spotify.com/v1/me/', {headers: headers}
        // result from fetch gets passed to response param
        ).then(response => response.json()
        // result from response.json() gets passed to jsonResponse
        ).then(jsonResponse => {
            // assign jsonResponse.id to userId
            userId = jsonResponse.id;
            // using the returned userId we make a POST request that creates a new
            // playlist in the users account and returns a playlistID.
            // fetch using the playlist endpoint as the first param
            // fetch returns a promise
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`,
            {
                // second param uses the POST head, method and body
                method: 'POST',
                headers: {
                    headers,
                    'content-Type': 'application/json'
                },
                body: JSON.stringify({name: name})// name is the user created name for there playlist
                // our fetch result is passed to response
            }).then(response => response.json()
            // response.json() result is passed to jsonResponse 
            ).then(jsonResponse => {
                const playlistID = jsonResponse.id;

                // this will be used to add tracks to the users playlist
                // 
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistID}/tracks`,
                {
                    method: 'POST',
                    headers: {
                        headers,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({uris: trackUris})
                });
            })
            .then((response) => {
                console.log('songs added to your playlist');
            })
        })
        .catch ((error) => {
            console.log('save playlist error');
        });
    }

};

export default Spotify;