import React, { Component } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './views/Navbar';
import LandingView from './views/LandingView';
import SearchView from './views/SearchView';
import SearchResultsView from './views/SearchResultsView';
import PhotographerDetailView from './views/PhotographerDetailView';
import AccountView from './views/AccountView';
// import AccountLoggedinView from './views/AccountLoggedinView';
import EditProfileView from './views/EditProfileView';
import InitializeProfileView from './views/InitializeProfileView';
import EditPhotosView from './views/EditPhotosView';
import ExceptionPage from './views/ExceptionPage';
import NotFoundPage from './views/NotFoundPage';

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
                <Route index element={<AccountView />} />
                {/* <Route path=':photographerId' element={<AccountLoggedinView />} /> */}
                <Route path=':photographerId/edits' element={<EditProfileView />} />
                <Route path=':photographerId/initialize' element={<InitializeProfileView />} />
                <Route path=':photographerId/photos' element={<EditPhotosView />} />
              </Route>
              <Route path='/exception' element={<ExceptionPage />} />
              <Route path='*' element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
