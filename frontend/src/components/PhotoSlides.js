import React from 'react';

function PhotoSlides(props) {
    const { photos, photoPerSlide, maxSlides } = props;
    const totalPhotos = photos.length;
    const slidesNum = Math.ceil(totalPhotos / photoPerSlide);
    const numSlides = slidesNum > maxSlides ? maxSlides : slidesNum;

    if (totalPhotos < 1) {
        return null
    } else {
        let photoList = [];
        for (let i = 0; i < photos.length; i++) {
            photoList.push(
                <img key={photos[i].id} className='d-block' src={`../assets/${photos[i].filename}`} alt={photos[i].filename} />
            )
        };

        let slides = []
        for (let i = 0; i < numSlides; i++) {
            slides.push(
                <div key={i} className='carousel-item active'>
                    <div className={`row row-cols-2 row-cols-sm-${photoPerSlide}`}>
                        {photoList.slice(photoPerSlide * i, photoPerSlide * (i + 1))}
                    </div>
                </div>
            )
        }

        return (
            <div className='carousel-inner'>
                {slides}
            </div>
        )
    }
}

export default PhotoSlides