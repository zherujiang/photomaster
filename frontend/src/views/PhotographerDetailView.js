import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import ErrorBoundary from '../components/ErrorBoundary';
import PhotographerContactForm from '../components/PhotographerContactForm';
import PhotoSlides from '../components/PhotoSlides';

function PhotographerDetailView(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const [axiosError, setAxiosError] = useState(null);

    const { photographerId } = useParams();
    const [allServices, setAllServices] = useState(location.state.allServices);
    const selectedService = location.state.selectedService;

    const [photographerDetails, setPhotographerDetails] = useState(undefined);
    const [prices, setPrices] = useState(undefined);
    const [photos, setPhotos] = useState([]);

    // server request to get details about the selected photographer
    function getPhotographerDetails(photographer_id = photographerId) {
        axios.get(`/photographers/${photographerId}`)
            .then(response => {
                const data = response.data;
                setPhotographerDetails(data['photographer_details']);
                setPrices(data['prices'])
                setPhotos(data['photos'])
            })
            .catch(function (error) {
                setAxiosError(error);
                console.log(error);
            })
    }

    function handleBackToSearch() {
        navigate(-1);
    }

    // helper function to format words into title case
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    function titleCase(string) {
        const words = string.split(' ');
        let titleCasedString = '';
        for (let i = 0; i < words.length; i++) {
            titleCasedString += capitalizeFirstLetter(words[i])
            if (i < words.length - 1) {
                titleCasedString += ' '
            }
        }
        return titleCasedString;
    }

    // draw service category & prices components
    function ServiceCategory(props) {
        const { name, imageURL, priceValue, priceType } = props;
        const priceModels = ['', 'Total', 'Per hour']
        return (
            <div className="col">
                <img src={imageURL} className='card-img-top rounded-circle' alt={`image of service category ${name}`} />
                <div className='card-body text-center py-2'>
                    <h6>{capitalizeFirstLetter(name.toLowerCase())}</h6>
                    <p className='m-0'>{`$ ${priceValue}`}</p>
                    <p><small>{priceModels[priceType]}</small></p>
                </div>
            </div>
        )
    }

    // draw photographer details components
    function PhotographerInfo(props) {
        if (photographerDetails) {
            // parse details information from the server response
            const name = photographerDetails.name;
            const email = photographerDetails.email;
            const city = photographerDetails.city;
            const address = photographerDetails.address;
            const canTravel = photographerDetails.can_travel;
            const profilePhotoURL = photographerDetails.profile_photo;
            const portfolioLink = photographerDetails.portfolio_link;
            const bio = photographerDetails.bio;
            const services = photographerDetails.services;
            const offeredServices = allServices.filter(
                (element) => services.includes(element.id)
            );
            const priceValues = prices.price_values;
            const priceTypes = prices.price_types;

            return (
                <div id='photographer-info' className='row justify-content-between align-items-start my-3'>
                    <div className='col col-12 col-lg-8'>
                        <div id='profile-info' className='row justify-content-start mb-3'>
                            <div className='col col-4 col-md-3'>
                                <img src={profilePhotoURL} className='rounded img-fluid object-fit-contain' alt='photographer profile image' />
                            </div>
                            <div className='col col-8 col-md-9'>
                                <div className='row'>
                                    <div className='col col-auto'>
                                        <h5>{titleCase(name)}</h5>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col col-auto'>
                                        <h6>{titleCase(city)}</h6>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col col-auto'>
                                        <span>Business Address: {address}</span>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col col-auto'>
                                        <span>Travel </span>
                                        <span className={canTravel ? 'visible' : 'invisible'}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16">
                                                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
                                            </svg>
                                        </span>
                                        <span className={canTravel ? 'invisible' : 'visible'}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col col-auto'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-globe" viewBox="0 0 16 16">
                                            <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5a6.959 6.959 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z" />
                                        </svg>
                                        <span> Portfolio website: {portfolioLink}</span>
                                    </div>
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
                                        imageURL={category.image_link}
                                        priceValue={priceValues[parseInt(category.id) - 1]}
                                        priceType={priceTypes[parseInt(category.id) - 1]}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <PhotographerContactForm
                        selectedService={selectedService}
                        offeredServices={offeredServices}
                        photographerEmail={email}
                        photographerName={name} />
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

    // when there is an axios error, throw the error to be handled by ErrorBoundary
    const AxiosError = () => {
        if (axiosError) {
            throw axiosError;
        }
        return null
    };

    return (
        <div id='photographer-detail-view' className='container py-4'>
            <ErrorBoundary>
                <AxiosError />
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
            </ErrorBoundary>
        </div>
    )
}

export default PhotographerDetailView