import React, { Component } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './views/Navbar';
import LandingView from './views/LandingView';
import SearchView from './views/SearchView';
import SearchResultsView from './views/SearchResultsView';
import PhotographerDetailView from './views/PhotographerDetailView';
import PhotographerAccountView from './views/PhotographerAccountView';
import PhotographerEditView from './views/PhotographerEditView';

class App extends Component {
  render() {
    return (
      <div className='App'>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Navbar />}>
              <Route index element={<LandingView />} />
              <Route path='/search' element={<SearchView />} />
              <Route path='/searchresults' element={<SearchResultsView />} />
              <Route path='/photographers'>
                <Route path=':photographerId' element={<PhotographerDetailView />} />
              </Route>
              <Route path='/account'>
                <Route index element={<PhotographerAccountView />} />
                <Route path=':photographerId/edits' element={<PhotographerEditView />} />
                {/* <Route path=':photographerId/photos' element={} /> */}
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
