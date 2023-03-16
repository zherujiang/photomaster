import AWS from 'aws-sdk';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccessToken } from '../hooks/AuthHook'
import axios from "axios";
import ErrorBoundary from '../components/ErrorBoundary';
import '../stylesheets/PhotoGrid.css'

// environment config
const BUCKET_NAME = 'photomasterbucket'

AWS.config.update({
    accessKeyId: 'AKIAQRJG34B24IU25SOJ',
    secretAccessKey: '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',
    region: 'us-west-2',
    signatureVersion: 'v4',
})

function EditPhotosView() {
    const { photographerId } = useParams();
    const s3 = new AWS.S3();
    const [axiosError, setAxiosError] = useState(null);

    const [existingPhotoURLs, setExistingPhotoURLs] = useState([]);
    const [uploadStatus, setUploadStatus] = useState('Upload photos');
    const [deleteStatus, setDeleteStatus] = useState('Delete selected photos');
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    let newPhotosList = [];

    const { loadLocalJWT, JWTReady, buildAuthHeader } = useAccessToken();

    // Server request to get all existing photos from the database
    function getPhotosFromDatabase() {
        axios.get(`/photos/${photographerId}`, buildAuthHeader())
            .then(response => {
                const data = response.data;
                setExistingPhotoURLs(data['photo_urls']);
            })
            .catch(error => {
                setAxiosError(error);
                console.log(error);
            })
    }

    // Add photos in newPhotosList to database
    function addPhotosToDatabase() {
        axios.post(
            `/photos/${photographerId}`,
            {
                new_photos_list: newPhotosList
            },
            buildAuthHeader()
        )
            .then(response => {
                const data = response.data;
                setExistingPhotoURLs(data['photo_urls'])
            })
            .catch(error => {
                setAxiosError(error);
                console.log(error);
            })
    }

    // Delete photos in selected from database
    const deletePhotosFromDatabase = () => {
        axios.delete(
            `/photos/${photographerId}`,
            {
                data: { selected_photos_list: selectedPhotos },
                headers: {
                    'Authorization': `Bearer ${loadLocalJWT()}`
                }
            }
        )
            .then(response => {
                const data = response.data;
                setExistingPhotoURLs(data['photo_urls'])
            })
            .catch(error => {
                setAxiosError(error);
                console.log(error);
            })
    }

    useEffect(() => {
        if (JWTReady) {
            getPhotosFromDatabase();
        }
    }, [JWTReady])

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
        newPhotosList.push(Location);
        // console.log('uploading to s3', Location);
    }

    const deleteFromS3 = async (photoURL) => {
        if (!photoURL) {
            return;
        }
        const params = {
            Bucket: BUCKET_NAME,
            Key: photoURL.slice(photoURL.lastIndexOf('/') + 1),
        }
        s3.deleteObject(params, (err, data) => {
            if (err) {
                console.log(err, err.stack);
            }
            else {
                console.log("deleted from s3", photoURL);
            }
        });
    };

    const handleUpload = async (e) => {
        if (e.target.files.length == 0) {
            return;
        }

        newPhotosList = [];
        setUploadStatus('Uploading');
        // console.log('uploading', e.target.files);
        for (const file of e.target.files) {
            await uploadToS3(file);
        }

        addPhotosToDatabase();
        setUploadStatus('Upload photos');
    };

    const handleDelete = async (e) => {
        if (selectedPhotos.length == 0) {
            return;
        }

        setDeleteStatus('Deleting');
        for (const photoURL of selectedPhotos) {
            await deleteFromS3(photoURL);
        }

        deletePhotosFromDatabase();
        setSelectedPhotos([]);
        setDeleteStatus('Delete selected photos');
    }

    const changeSelectedPhotos = (e) => {
        const photoURL = e.target.src;
        if (selectedPhotos.includes(photoURL)) {
            setSelectedPhotos(selectedPhotos.filter((url) => {
                return url !== photoURL;
            }));
        } else {
            setSelectedPhotos([...selectedPhotos, photoURL]);
        }
    }

    function PhotoGrid() {
        return (
            <div className='row row-cols-2 row-cols-sm-3 row-cols-lg-6 g-3'>
                {existingPhotoURLs.map((url) => (
                    <div className='col' key={url}>
                        <img className={`w-100 square-image object-fit-cover 
                        ${selectedPhotos.includes(url) ? 'border border-2 border-danger' : ''}`}
                            src={url} onClick={changeSelectedPhotos} />
                    </div>
                ))}
            </div>
        )
    }

    // when there is an axios error, throw the error to be handled by ErrorBoundary
    const AxiosError = () => {
        if (axiosError) {
            throw axiosError;
        }
        return null
    };

    return (
        <div id='edit-photos-view' className='container py-4'>
            <ErrorBoundary>
                <AxiosError />
                <div className='row'>
                    <div className='col col-auto'>
                        <Link to='/account'>&lsaquo; Back to Account</Link>
                    </div>
                </div>
                <div className='row mb-3 text-center'>
                    <h3>Edit your photos</h3>
                    <div className='my-3'>
                        <label htmlFor="file-upload" className="btn btn-primary">
                            {uploadStatus}
                        </label>
                        <input id="file-upload" type='file' hidden onChange={handleUpload} multiple="multiple" />
                    </div>
                </div>
                <PhotoGrid />
                <div className='row mt-3 text-center'>
                    <div className='col my-3'>
                        <button className='btn btn-danger' onClick={handleDelete}
                            disabled={selectedPhotos.length > 0 ? false : true}>{deleteStatus}</button>
                    </div>
                </div>
            </ErrorBoundary>
        </div>
    )
}

export default EditPhotosView
