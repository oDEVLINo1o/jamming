import './App.css';
import React from 'react';

import {SearchBar} from '../SearchBar/SearchBar';
import {SearchResults} from '../SearchResults/SearchResults';
import {Playlist} from '../Playlist/Playlist';
import {Spotify} from '../../util/Spotify';


export class App extends React.Component {
  constructor(props) {
    super(props);
    // SearchResults will be filled when the user makes a Search
    this.state = {SearchResults: [],
      // user will be able to change the playlistName
      playlistName: '', 
      // playlistTracks will  be filled with the tracks the user adds
      playlistTracks: []};
      // we bind each of our meathods so they can be passed down to child components
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  addTrack(track) {
    let tracks = this.state.playlistTracks;
    if(tracks.find(savedTrack => savedTrack.id ===
      track.id)) {
      return;
    }
    
    tracks.push(track);
    this.setState({playlistTracks: tracks});
  }

  removeTrack(track) {
    let tracks = this.state.playlistTracks;
    tracks = tracks.filter(savedTrack => {
      return savedTrack.id !== track.id });
    this.setState({playlistTracks: tracks});
  }

  updatePlaylistName(name) {
    this.setState({playlistName: name});
  }

  // 
  savePlaylist() {
    alert('saved');
    let trackUris = this.state.playlistTracks.map(track => track.uri);
    Spotify.savePlaylist(this.state.playlistName, trackUris).then(() => {
      this.setState({ 
        playlistName: 'New Playlist',
        playlistTracks: [] 
      })
    })
  }

  search(term) {
    Spotify.search(term).then(searchResults => {
      this.setState({SearchResults: searchResults})
    }) 
  }

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>in</h1>
        <div className="App">

          <SearchBar onSearch={this.search} />
          
          <div className="App-playlist">

            <SearchResults searchResults={this.state.SearchResults} 
            onAdd={this.addTrack} />

            <Playlist playlistName={this.state.playlistName} 
            playlistTracks={this.state.playlistTracks}
            onRemove={this.removeTrack}
            onNameChange={this.updatePlaylistName}
            onSave={this.savePlaylist} />
          </div>
        </div>
      </div>
    );
  }
};


