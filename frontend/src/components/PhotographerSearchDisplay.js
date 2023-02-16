import React from 'react';
import { useNavigate } from 'react-router-dom';
import PhotoSlides from './PhotoSlides';

function PhotographerSearchDisplay(props) {
    const { id, name, city, address, services, profilePhoto, photos, allServices, selectedService } = props;

    // format services offered by this photographer
    let offeredServices = allServices.filter(
        (element) => services.includes(element.id)
    );

    const navigate = useNavigate();
    function viewPhotographerDetails() {
        navigate('/photographer', {
            state: {
                'photographerId': id,
                'allServices': allServices,
                'selectedService': selectedService,
            }
        })
    }

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

    return (
        <div className='container-fluid border border-seconday mb-3'>
            <div className='row my-3'>
                <div className='col col-4 col-sm-2'>
                    {/* <img src={`../assets/${profilePhoto}`} className='rounded img-fluid' alt='photographer profile image' /> */}
                    <img src='../assets/profile.jpg' className='rounded img-fluid' alt='photographer profile image' />
                </div>
                <div className='col col-8 col-sm-7'>
                    <div className='row justify-content-start'>
                        <h5>{capitalizeName(name)}</h5>
                    </div>
                    <div className='row justify-content-start'>
                        <div className='col col-auto'>{city}</div>
                        <div className='col col-auto'>{`Address:${address}`}</div>
                    </div>
                    <div className='row justify-content-start'>
                        {offeredServices.map((category) => {
                            return (
                                <div key={`service-badge-${category.id}`} className='col-auto'>
                                    <span className='badge bg-info badge-info'>
                                        {category.name}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className='col col-12 col-sm-3'>
                    <div className='row text-end'><h6>Price Range</h6></div>
                    <div className='row'>
                        <div className='col'>
                            <button className='btn btn-sm btn-primary w-100' onClick={viewPhotographerDetails}>View Details</button>
                        </div>
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

export default PhotographerSearchDisplay