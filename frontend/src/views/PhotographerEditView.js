import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";

function PhotographerEditView(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const [photographerId, setPhotographerId] = useState(location.state.photographerId);
    const [photographerDetails, setPhotographerDetails] = useState(location.state.photographerDetails);
    const [allServices, setAllServices] = useState([]);

    const name = photographerDetails.name;
    const email = photographerDetails.email;
    const city = photographerDetails.city;
    const address = photographerDetails.address;
    const portfolio_link = photographerDetails.portfolio_link;
    const social_media = photographerDetails.social_media;
    const bio = photographerDetails.bio;
    const services = photographerDetails.services;

    // console.log('services', services);
    // console.log('services type', typeof services[0]);

    // server request to get all service categories
    function getServices() {
        axios.get('/services')
            .then(response => {
                const data = response.data;
                setAllServices(data['services']);
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    function handleToggleServices(event) {
        console.log(event.target);
        console.log(event.target.checked);
        event.target.checked = !event.target.checked;
    }

    function handleBackToAccount() {
        navigate(-1);
    }

    // helper function to capitalize names
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // draw service category & prices components
    function ServiceCategory(props) {
        const { serviceId, name } = props;
        return (
            <div className='row mb-2'>
                <div className='col col-12 col-md-4'>
                    <div className='form-check form-switch'>
                        <input className='form-check-input' type='checkbox' role='switch' id={`service-category-${serviceId}`}
                            checked={services.includes(serviceId) ? true : false} onChange={handleToggleServices} />
                        <label className='form-check-label' htmlFor={`service-category-${serviceId}`}>{name}</label>
                    </div>
                </div>
                <div className='col col-12 col-md-8'>
                    <div className='input-group'>
                        <span className='input-group-text'>Price</span>
                        <input className='form-control' type='text' id='service-price' placeholder='Enter price in USD' />
                    </div>
                </div>
            </div>
        )
    }

    // initial render
    useEffect(() => {
        getServices();
    }, [])

    return (
        <div id='photographer-detail-view' className='container py-4'>
            <div className='row'>
                <div className='col col-auto'>
                    <button role='button' className='btn btn-link' onClick={handleBackToAccount}>&lsaquo; Back</button>
                </div>
            </div>
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
                        {allServices.map((category) => (
                            <ServiceCategory
                                key={`service-category-${category.id}`}
                                serviceId={category.id}
                                name={category.name}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PhotographerEditView