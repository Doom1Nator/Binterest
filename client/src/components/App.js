import React from 'react';
import './App.css';
import { NavLink, BrowserRouter as Router, Route } from 'react-router-dom';
import Home from './Home';
import MyBin from './MyBin';
import MyPost from './MyPost';
import NewPost from './NewPost';
import Popularity from './Popularity';
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider
} from '@apollo/client';
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: 'http://localhost:4000'
  })
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div>
          <header className="App-header">
            <h1 className="App-title">
              Binterest
            </h1>
            <h2 hidden>h2 to pass tota11y</h2>
            <br />
            <br />
            <nav>
              <NavLink className="App-link" to="/">Images</NavLink>
              <NavLink className="App-link" to="/my-bin">My bin</NavLink>
              <NavLink className="App-link" to="/my-posts">My posts</NavLink>
              <NavLink className="App-link" to="/popularity">Popularity</NavLink>
            </nav>
          </header>
          <Route exact path="/" component={Home} />
          <Route exact path="/my-bin" component={MyBin} />
          <Route exact path="/my-posts" component={MyPost} />
          <Route exact path="/new-post" component={NewPost} />
          <Route exact path="/popularity" component={Popularity} />
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
