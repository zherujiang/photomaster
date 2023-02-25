import React from 'react';
import { useNavigate } from 'react-router-dom';
import PhotoSlides from './PhotoSlides';

function PhotographerSearchDisplay(props) {
    const { id, name, city, can_travel, address, services, profilePhoto, photos, allServices, selectedService } = props;

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
                    <div className='row justify-content-start mb-1'>
                        <div className='col col-auto'>{city}</div>
                        <div className='col col-auto'>
                            <span className={address ? 'visible' : 'invisible'}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                                </svg>
                                {address}
                            </span>
                        </div>
                    </div>
                    <div className='row justify-content-start mb-1'>
                        <div className='col col-auto'>
                            <span>Travel </span>
                            <span className={can_travel ? 'visible' : 'invisible'}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
                                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
                                </svg>
                            </span>
                            <span className={can_travel ? 'invisible' : 'visible'}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                                </svg>
                            </span>
                        </div>
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
                    <div className='row text-end mb-2'><h6>Price Range</h6></div>
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