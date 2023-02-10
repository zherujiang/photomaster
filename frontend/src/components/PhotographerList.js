import React from 'react';
import PhotoSlides from './PhotoSlides';

function PhotographerList(props) {
    const { id, name, city, offeredServices, address, profilePhoto, photos, allServices } = props;

    // helper function to format photographer names
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    function capitalizeName(string) {
        const words = string.split(' ');
        let photographerName = '';
        for (let i = 0; i < words.length; i++) {
            photographerName += capitalizeFirstLetter(words[i])
        }
        return photographerName;
    }

    // helper function to get service category names
    function findServiceName(id, allServices) {
        const service = allServices.find(element => element.id == id);
        return service.name;
    }

    return (
        <div className='container-fluid border border-seconday mb-3'>
            <div className='row my-3'>
                <div className='col col-4 col-sm-2'>
                    {/* <img src={`../assets/${profilePhoto}`} className='rounded img-fluid' alt='photographer profile image' /> */}
                    <img src='../assets/profile.jpg' className='rounded img-fluid' alt='photographer profile image' />
                </div>
                <div className='col col-8 col-sm-8'>
                    <div className='row justify-content-start'>
                        <h5>{capitalizeName(name)}</h5>
                    </div>
                    <div className='row justify-content-start'>
                        <div className='col col-auto'>{city}</div>
                        <div className='col col-auto'>{`Address:${address}`}</div>
                    </div>
                    <div className='row justify-content-start'>
                        {offeredServices.map((category_id) => {
                            return (
                                <div key={category_id} className='col-auto'>
                                    <span key={category_id} className='badge bg-info badge-info'>
                                        {findServiceName(category_id, allServices)}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className='col col-12 col-sm-2'>
                    <div className='row text-end'><h6>Price Range</h6></div>
                    <div className='row'>
                        <a href='#' className='btn btn-sm btn-primary w-100'>View Details</a>
                    </div>
                </div>
            </div>
            <div className='row mb-3'>
                <div id={`carousel-${id}`} className='carousel slide'>
                    <PhotoSlides
                        photos={photos}
                        photoPerSlide={4}
                        maxSlides={2}
                    />
                    <button className='carousel-control-prev' type='button' data-bs-target={`#carousel-${id}`} data-bs-slide='prev'>
                        <span className='carousel-control-prev-icon' aria-hidden='true'></span>
                        <span className='visually-hidden'>Previous</span>
                    </button>
                    <button className='carousel-control-next' type='button' data-bs-target={`#carousel-${id}`} data-bs-slide='next'>
                        <span className='carousel-control-next-icon' aria-hidden='true'></span>
                        <span className='visually-hidden'>Next</span>
                    </button>
                </div>
            </div>
        </div>
    )

}

export default PhotographerList