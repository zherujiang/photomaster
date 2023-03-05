import AWS from 'aws-sdk';
import { useEffect, useState } from 'react';
import { Image } from '@chakra-ui/react';

const BUCKET_NAME = 'photomasterbucket'

AWS.config.update({
    accessKeyId: 'AKIAQRJG34B24IU25SOJ',
    secretAccessKey: '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',
    region: 'us-west-2',
    signatureVersion: 'v4',
})

function ImageUploader() {
    const s3 = new AWS.S3();
    const [imgURLs, setImgURLs] = useState([]);
    const [uploadStatus, setUploadStatus] = useState("Upload photos");
    const [deleteStatus, setDeleteStatus] = useState('Delete selected photos');
    const [selected, setSelected] = useState([]);
    let newPhotoList = [];
    const IMGPERROW = 6;

    const getPhotos = () => {
        // axios.get('/photos')
        //     .then(response => {
        //         const data = response.data;
        //         setImgURLs(data['photos']);
        //     })
        //     .catch(function (error) {
        //         console.log(error);
        //     })
        console.log("Get existing photos from database");
    }

    const addPhotos = () => {
        // Add photos in newPhotoList to database
    }

    const deletePhotos = () => {
        // Delete photos in selected from database
    }
    
    useEffect(() => {
        getPhotos();
    }, [])

    const uploadToS3 = async (file) => {
        if (!file) {
            return;
        }
        const params = {
            Bucket: BUCKET_NAME,
            Key: `${Date.now()}.${file.name}`,
            Body: file
        }
        const { Location } = await s3.upload(params).promise();
        newPhotoList.push(Location);
        console.log('uploading to s3', Location);
    }

    const deleteFromS3 = async (photoURL) => {
        if (!photoURL) {
            return;
        }
        const params = {
            Bucket: BUCKET_NAME,
            Key: photoURL.slice(photoURL.lastIndexOf('/') + 1),
        }
        s3.deleteObject(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
            }  // error
            else {                // deleted
                console.log("deleted", photoURL);
            }
        });
    };

    const handleUpload = async (e) => {
        if (e.target.files.length == 0) {
            return;
        }
        newPhotoList = [];
        setUploadStatus("Uploading");
        console.log("uploading", e.target.files);
        for (const file of e.target.files) {
            await uploadToS3(file);
        }
        console.log(newPhotoList);
        addPhotos();
        setImgURLs(imgURLs.concat(newPhotoList));
        setUploadStatus("Upload photos");
    };
    
    const handleDelete = async (e) => {
        if (selected.length == 0) {
            return;
        }
        setDeleteStatus('Deleting');
        for (const photoURL of selected) {
            await deleteFromS3(photoURL);
        }
        deletePhotos();
        setImgURLs(imgURLs.filter(function(url) {
            return !selected.includes(url);
        }));
        setSelected([]);
        setDeleteStatus('Delete selected photos');
    }

    const changeSelected = (e) => {
        const url = e.target.src;
        if (selected.includes(url)) {
            setSelected(selected.filter(function(photoURL) { 
                return photoURL !== url;
            }));
        } else {
            console.log("add", url)
            setSelected([...selected, url]);
        }
    }

    const rows = [];
    const numRows = Math.ceil(imgURLs.length / IMGPERROW);
    for (let i=0; i < numRows; i++) {
        const cols = [];
        for (let j=0; j < IMGPERROW; j++) {
            if (IMGPERROW * i + j < imgURLs.length) {
                const url = imgURLs[IMGPERROW * i + j];
                cols.push(
                    <div className='col-2' key={j}>
                        <Image objectFit='cover' boxSize={200} src={url} key={url} borderRadius={5} onClick={changeSelected} className={`${selected.includes(url) ? "border border-danger" : undefined}`} />
                        {/* <img src={url} key={url} onClick={changeSelected} className={`w-100 rounded square ${selected.includes(url) ? "border border-danger" : ""}`} /> */}
                    </div>
                )
            }
        }
        rows.push(
            <div className='row my-3' key={i}>
                {cols}
            </div>
        )
    }

    return (
        <div>
            <div className='container text-center'>
                <h3 className='my-4'>Edit your photos</h3>
                <div className='my-4'>
                    <label htmlFor="file-upload" className="btn btn-primary">
                        {uploadStatus}
                    </label>
                    <input id="file-upload" type='file' hidden onChange={handleUpload} multiple="multiple"/>
                </div>
                <div className='container overflow-hidden'>
                    {rows}
                </div>
                {selected?.length > 0 &&
                    <div>
                        <button className="btn btn-danger" onClick={handleDelete}>{deleteStatus}</button>
                    </div>
                }
            </div>
        </div>
    )
}

export default ImageUploader
