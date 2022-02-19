import logo from './logo.svg';
import './App.css';
import Amplify, { API } from 'aws-amplify';
import { useState, useEffect } from 'react';

const testAPI = "api63d26777";
const path = "/test";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get(testAPI, path)
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {!data ? "Loading..." : data}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
