import {config} from './config'


let userAccessToken;

const redirectURI = 'http://jamminapp.surge.sh';
const spotifyBaseURL = 'https://api.spotify.com/v1';

export const Spotify = {

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
            window.location = `https://accounts.spotify.com/authorize?response_type=token&client_id=${config.clientID}&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
            
        }
    },



    search (term) {
        // get our access token when making a search
        const accessToken = Spotify.getAccessToken();

        // GET information from spotify
        return fetch(`${spotifyBaseURL}/search?type=track&q=${term}`,
            {headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })

        // .then waits for the fetch to complete before running this code
        // assign the response to .json format
        .then((response) => response.json())
        .then((jsonResponse) => {
            // if there are no tracks return an empty array
            if (!jsonResponse.tracks) {
                return [];
            }
            // 
            return jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
            }));
        })       

        .catch((error) => {
            alert('Search error');
        })
    },

    savePlaylist(name, trackUris) {
        // if there is no name or no uris then exit the function
        if(!name || !trackUris.length) {
            return;
        }
        // get users access token
        const accessToken = Spotify.getAccessToken();
        // check to see if the user is authorised
        let userId;
         
        return fetch(`${spotifyBaseURL}/me`, {headers: {Authorization: `Bearer ${accessToken}`}}
        ).then(response => response.json()
        
        ).then(jsonResponse => {
            
            userId = jsonResponse.id;
            
            return fetch(`${spotifyBaseURL}/users/${userId}/playlists`,
            {
                // second param uses the POST head, method and body
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
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
                return fetch(`${spotifyBaseURL}/users/${userId}/playlists/${playlistID}/tracks`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({uris: trackUris})
                });
            })
            .catch((error) => {
                alert('Error saving your playlist');
            })
        })
        
    }

};

