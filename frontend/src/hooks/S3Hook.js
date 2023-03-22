import AWS from 'aws-sdk';

export function useS3Bucket() {
    // environment config removed
    const BUCKET_NAME = ''

    AWS.config.update({
        accessKeyId: '',
        secretAccessKey: '',
        region: 'us-west-2',
        signatureVersion: '',
    })
    const s3 = new AWS.S3();

    // upload file to S3 bucket one at a time
    async function uploadToS3(file) {
        if (!file) {
            return;
        }
        const params = {
            Bucket: BUCKET_NAME,
            Key: `${Date.now()}.${file.name}`,
            Body: file
        }
        const { Location } = await s3.upload(params).promise();
        console.log('uploaded to s3', Location);
        return Location;
    }

    // delete file from S3 bucket one at a time
    async function deleteFromS3(photoURL) {
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
    }

    return { uploadToS3, deleteFromS3 }
}