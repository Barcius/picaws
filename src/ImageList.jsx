import { useState, useEffect, useRef } from 'react';
import { API } from 'aws-amplify';
import { useSnackbar } from 'notistack';
import CircularProgress from '@mui/material/CircularProgress';
import aws from "./aws-exports";

const bucketBaseUrl = `https://${aws.aws_user_files_s3_bucket}.s3.${aws.aws_user_files_s3_bucket_region}.amazonaws.com/public/`

const ImageList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [images, setImages] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('images', '/images');
        setImages(res);
      } catch (e) {
        enqueueSnackbar(e.message, {variant: 'error'})
      }
    })();
  }, [])
  return (
    <div>
      {images.length ? (
        images.map((img) => {
          const link = bucketBaseUrl + img.s3path;
          return (
            <a href={link} key={img.id}>
              <img src={link} alt="" />
            </a>
          )
        })
      ) : (
        <CircularProgress />
      )}
    </div>
  );
}

export default ImageList;