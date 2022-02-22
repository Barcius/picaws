import './App.css';
import Amplify, { API } from 'aws-amplify';
import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import aws from "./aws-exports";
import { useSnackbar } from 'notistack';

const bucketUrl = `https://${aws.aws_user_files_s3_bucket}.s3.${aws.aws_user_files_s3_bucket_region}.amazonaws.com/`

const testAPI = "test";
const path = "/test";

const imageAPI = 'images';
const imgaePath = '/images';

function App() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const input = useRef();
  const img = useRef();

  const onChange = async (e) => {
    let reader = new FileReader();
    reader.onloadend = function() {
      img.current.src = reader.result;
    }
    reader.readAsDataURL(e.target.files[0]);
  }

  const onClick = async (e) => {
    try {
      const file = input.current.files[0];
      const res = await Amplify.Storage.put(`images/${uuidv4()}`, file, { acl: 'public-read' });
      const fres = await API.post(imageAPI, imgaePath, { body: {
        name: file.name,
        bucket: aws.aws_user_files_s3_bucket,
        path: res.key,
      }});
      console.log(fres);
      img.current.src = '';
      input.current.value = null;
    } catch (e) {
      enqueueSnackbar(e.message, {variant: 'error'})
    }
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
