import React from 'react';
import '../stylesheets/PhotoGrid.css'

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
                <img key={photos[i].id} className='square-image d-block' src={photos[i].file_location} alt='photo by photographer' />
            )
        };

        let slides = []
        for (let i = 0; i < numSlides; i++) {
            slides.push(
                <div key={i} className='carousel-item active'>
                    <div className={`row row-cols-2 row-cols-sm-${photoPerSlide} gx-3 gy-3`}>
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