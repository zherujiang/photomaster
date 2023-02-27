import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";
import PhotoSlides from '../components/PhotoSlides';

function PhotographerDetailView(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const [photographerId, setPhotographerId] = useState(location.state.photographerId);
    const [allServices, setAllServices] = useState(location.state.allServices);
    const [requestService, setRequestService] = useState(location.state.selectedService);

    const [photographerDetails, setPhotographerDetails] = useState(undefined);
    const [priceData, setPriceData] = useState(undefined);
    const [photos, setPhotos] = useState([]);

    const [customerFirstName, setCustomerFirstName] = useState(undefined);
    const [customerLastName, setCustomerLastName] = useState(undefined);
    const [customerEmail, setCustomerEmail] = useState(undefined);
    const [customerPhone, setCustomerPhone] = useState(undefined);
    const [customerInterestedService, setCustomerInterestedService] = useState(undefined);
    const [customerMessage, setCustomerMessage] = useState(undefined);

    // server request to get details about the selected photographer
    function getPhotographerDetails(photographer_id = photographerId) {
        axios.get(`/photographer-details/${photographerId}`)
            .then(response => {
                const data = response.data;
                setPhotographerDetails(data['photographer']);
                setPriceData(data['prices'])
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    // server request to get photos by this photographer
    function getPhotographerPhotos(photographer_id = photographerId) {
        axios.get(`/photographers/${photographerId}/photos`)
            .then(response => {
                const data = response.data;
                setPhotos(data['photos']);
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    function handleBackToSearch() {
        navigate(-1);
    }

    function handleRequestService(event) {
        setRequestService(event.target.value);
    }

    // helper function to capitalize names
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // draw service category & prices components
    function ServiceCategory(props) {
        const { name, image, price, priceType } = props;
        const priceModels = ['', 'Total', 'Per hour']
        return (
            <div className="col">
                <img src={`../assets/${image}`} className='card-img-top rounded-circle' alt={`${image}`} />
                <div className='card-body text-center py-2'>
                    <h6>{capitalizeFirstLetter(name.toLowerCase())}</h6>
                    <p className='m-0'>{`$ ${price}`}</p>
                    <p><small>{priceModels[priceType]}</small></p>
                </div>
            </div>
        )
    }

    // draw photographer details components
    function PhotographerInfo(props) {
        if (photographerDetails) {
            const name = photographerDetails.name;
            const city = photographerDetails.city;
            const address = photographerDetails.address;
            const canTravel = photographerDetails.can_travel;
            const portfolio_link = photographerDetails.portfolio_link;
            const social_media = photographerDetails.social_media;
            const bio = photographerDetails.bio;
            const services = photographerDetails.services;
            const offeredServices = allServices.filter(
                (element) => services.includes(element.id)
            );
            const prices = priceData.prices;
            const priceTypes = priceData.price_types;

            return (
                <div id='photographer-info' className='row justify-content-between align-items-start my-3'>
                    <div className='col col-12 col-lg-8'>
                        <div id='profile-info' className='row justify-content-start mb-3'>
                            <div className='col col-4 col-md-3'>
                                <img src='../assets/profile.jpg' className='rounded img-fluid object-fit-contain' alt='photographer profile image' />
                            </div>
                            <div className='col col-8 col-md-9'>
                                <div className='row'>
                                    <div className='col col-auto'>
                                        <h5>{capitalizeFirstLetter(name)}</h5>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col col-auto'>
                                        <h6>{city}</h6>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col col-auto'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-geo-alt" viewBox="0 0 16 16">
                                            <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z" />
                                            <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                                        </svg>
                                        <span>{address}</span>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col col-auto'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-globe" viewBox="0 0 16 16">
                                            <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5a6.959 6.959 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z" />
                                        </svg>
                                        <span>{portfolio_link}</span>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col col-auto'>{social_media}</div>
                                </div>
                            </div>
                        </div>
                        <div id='bio' className='row mb-3'>
                            <div className='col col-12'>
                                <blockquote className="blockquote p-4 border rounded bg-light">
                                    <h5>Bio</h5>
                                    <p>{bio}</p>
                                </blockquote>
                            </div>
                        </div>
                        <div id='services-prices' className='row mb-3'>
                            <h5>Service and fees</h5>
                            <div className='row row-cols-3 row-cols-md-5 mt-3'>
                                {offeredServices.map((category) => (
                                    <ServiceCategory
                                        key={`service-category-${category.id}`}
                                        name={category.name}
                                        image={category.image_link}
                                        price={prices[parseInt(category.id) - 1]}
                                        priceType={priceTypes[parseInt(category.id) - 1]}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div id='contact-form' className='col col-12 col-lg-3'>
                        <form className='border rounded p-4'>
                            <div className='row mb-3'>
                                <div className='col'>
                                    <h5>Contact Photographer</h5>
                                </div>
                            </div>
                            <div className='row g-3 mb-3'>
                                <div className='col'>
                                    <input type="text" placeholder='First name' className="form-control" aria-label="First name" />
                                </div>
                                <div className='col'>
                                    <input type="text" placeholder='Last name' className="form-control" aria-label="Last name" />
                                </div>
                            </div>
                            <div className='row mb-3'>
                                <div className='col'>
                                    <input type="text" placeholder='Your email' className="form-control" aria-label="email" />
                                </div>
                            </div>
                            <div className='row mb-3'>
                                <div className='col'>
                                    <input type="text" placeholder='Phone' className="form-control" aria-label="phone" />
                                </div>
                            </div>
                            <div className='row mb-3'>
                                <div className='col'>
                                    <select className='form-select' value={requestService}
                                        onChange={handleRequestService}>
                                        {offeredServices.map((category) => (
                                            <option key={`service-option-${category.id}`} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className='row mb-3'>
                                <div className='col'>
                                    <label htmlFor="custom-message" className="form-label">Message</label>
                                    <textarea id='custom-message' className="form-control" rows="3"></textarea>
                                </div>
                            </div>
                            <div className='row mb-3'>
                                <div className='col'>
                                    <button type='submit' className='btn btn-primary w-100'>Send</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )
        } else {
            return null
        }
    }

    // initial render
    useEffect(() => {
        getPhotographerDetails();
    }, [])

    useEffect(() => {
        getPhotographerPhotos();
    }, [photographerDetails])

    return (
        <div id='photographer-detail-view' className='container py-4'>
            <div className='row'>
                <div className='col col-auto'>
                    <button role='button' className='btn btn-link' onClick={handleBackToSearch}>&lsaquo; Back to Search</button>
                </div>
            </div>
            <PhotographerInfo />
            <div id='photographer-gallery' className='row mb-3'>
                <div className='col col-12'>
                    <h5>Featured Gallery</h5>
                    <div className='border rounded'>
                        <div id='photo-carousel' className='carousel slide'>
                            <PhotoSlides
                                photos={photos}
                                photoPerSlide={5}
                                maxSlides={4}
                            />
                            <button className='carousel-control-prev' type='button' data-bs-target='photo-carousel' data-bs-slide='prev'>
                                <span className='carousel-control-prev-icon' aria-hidden='true'></span>
                                <span className='visually-hidden'>Previous</span>
                            </button>
                            <button className='carousel-control-next' type='button' data-bs-target='photo-carousel' data-bs-slide='next'>
                                <span className='carousel-control-next-icon' aria-hidden='true'></span>
                                <span className='visually-hidden'>Next</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PhotographerDetailView