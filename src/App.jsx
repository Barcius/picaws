import logo from './logo.svg';
import './App.css';
import Amplify, { API } from 'aws-amplify';
import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

const testAPI = "test";
const path = "/test";

const imageAPI = 'images';
const imgaePath = '/images';

function App() {
  const input = useRef();
  const img = useRef();
  const [file, setFile] = useState();

  const onChange = async (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
    let reader = new FileReader();
    reader.onloadend = function() {
      img.current.src = reader.result;
    }
    reader.readAsDataURL(e.target.files[0]);
  }

  const onClick = async (e) => {
    // const res = await Amplify.Storage.put(`images/${uuidv4()}`, file, { acl: 'public-read' });
    // console.log(res);
    input.current.value = null;
    img.current.src = '';
    setFile(null);

  }

  return (
    <div className="App">
      <div>
        <input type="file" accept="image/png, image/jpeg" onChange={onChange} ref={input} />
        <button onClick={onClick}>загрузить</button>
      </div>
      <img ref={img} />
    </div>
  );
}

export default App;
