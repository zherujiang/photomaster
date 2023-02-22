import React, { Component } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './views/Layout';
import LandingView from './views/LandingView';
import SignUp from './views/SignUp';
import LogIn from './views/LogIn';
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
            <Route path='/' element={<Layout />}>
              <Route index element={<LandingView />} />
              <Route path='/login' element={<LogIn />} />
              <Route path='/join' element={<SignUp />} />
              <Route path='/search' element={<SearchView />} />
              <Route path='/searchresults' element={<SearchResultsView />} />
              <Route path='/photographer' element={<PhotographerDetailView />} />
              <Route path='/my-account' element={<PhotographerAccountView />} />
              <Route path='/photographer-edit' element={<PhotographerEditView />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
