import './App.css';
import Amplify, { API } from 'aws-amplify';
import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import aws from "./aws-exports";
import { useSnackbar } from 'notistack';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import ImageList from './ImageList';


const testAPI = "test";
const path = "/test";

const imageAPI = 'images';
const imgaePath = '/images';

function App() {
  const [isUploading, setIsUploading] = useState(false);
  const [value, setValue] = useState('1');
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const { enqueueSnackbar } = useSnackbar();
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
    const file = input.current.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
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
    setIsUploading(false);
  }

  return (
    <div className="App">
      <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange}>
            <Tab label="Загрузить" value="1" />
            <Tab label="Просмотреть" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <div>
            <input type="file" accept="image/png, image/jpeg" onChange={onChange} ref={input} />
            <button onClick={onClick} disabled={isUploading} >Загрузить</button>
          </div>
          <img ref={img} alt=''/>
        </TabPanel>
        <TabPanel value="2">
          <ImageList />
        </TabPanel>
      </TabContext>
    </Box>
    </div>
  );
}

export default App;
