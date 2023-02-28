import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";

function PhotographerEditView(props) {
    const navigate = useNavigate();
    const location = useLocation();

    const [photographerId, setPhotographerId] = useState(location.state.photographerId);
    const [photographerDetails, setPhotographerDetails] = useState(undefined);
    const [allServices, setAllServices] = useState([]);
    const [priceData, setPriceData] = useState(undefined);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [canTravel, setCanTravel] = useState(false);
    const [address, setAddress] = useState('');
    const [profilePhoto, setProfilePhoto] = useState('');
    const [portfolioLink, setPortfolioLink] = useState('');
    const [bio, setBio] = useState('');
    const [offeredServices, setOfferedServices] = useState([]);
    const [prices, setPrices] = useState([]);
    const [priceTypes, setPriceTypes] = useState([]);

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

    // server request to get photographer information to render the form
    function getPhotographerForm(photographer_id = photographerId) {
        axios.get(`/photographer-edits/${photographerId}`)
            .then(response => {
                const data = response.data;
                setPhotographerDetails(data['photographer']);
                setPriceData(data['prices']);
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    // initial render
    useEffect(() => {
        getServices();
        getPhotographerForm();
    }, [])

    // update information after edits
    useEffect(() => {
        if (photographerDetails) {
            setName(photographerDetails.name);
            setEmail(photographerDetails.email);
            setCity(photographerDetails.city);
            setCanTravel(photographerDetails.can_travel);
            setAddress(photographerDetails.address);
            setProfilePhoto(photographerDetails.profile_photo);
            setPortfolioLink(photographerDetails.portfolio_link);
            setBio(photographerDetails.bio);
            setOfferedServices(photographerDetails.services);
        }
        if (priceData) {
            setPrices(priceData.prices);
            setPriceTypes(priceData.price_types);
        }
    }, [photographerDetails, priceData])

    // server request to submit photographer information updates
    function submitProfileUpdate() {
        axios.patch(`/photographer-edits/${photographerId}`, {
            'name': name,
            'city': city,
            'can_travel': canTravel,
            'address': address,
            'services': offeredServices,
            'profile_photo': profilePhoto,
            'portfolio_link': portfolioLink,
            'bio': bio,
            'prices': prices,
            'price_types': priceTypes
        })
            .then(response => {
                const data = response.data;
                setPhotographerDetails(data['photographer']);
                setPriceData(data['prices']);

                navigateBackToAccount();
            })
            .catch(error => {
                console.log(error);
            })
    }

    function navigateBackToAccount() {
        navigate('/my-account', {
            state: {
                'photographerId': photographerId
            }
        })
    }

    function handleInputChange(event) {
        switch (event.target.name) {
            case 'name':
                setName(event.target.value);
                break;
            case 'city':
                setCity(event.target.value);
                break;
            case 'travel':
                setCanTravel(event.target.checked);
                break;
            case 'address':
                setAddress(event.target.value);
                break;
            case 'portfolioLink':
                setPortfolioLink(event.target.value);
                break;
            case 'bio':
                setBio(event.target.value);
                break;
        }
    }

    function handleToggleServices(event) {
        const serviceId = parseInt(event.target.id);

        if (offeredServices.includes(serviceId)) {
            // remove service from offered services list
            let checkedServices = [...offeredServices];
            const index = offeredServices.indexOf(serviceId);
            checkedServices.splice(index, 1);
            setOfferedServices(checkedServices);

            // reset price to 0 for the removed service
            let newPrice = [...prices];
            newPrice[serviceId - 1] = 0;
            setPrices(newPrice);

            // reset price type for the removed service
            let newPriceTypes = [...priceTypes];
            newPriceTypes[serviceId - 1] = 0;
            setPriceTypes(newPriceTypes);

        } else {
            let checkedServices = offeredServices.slice();
            checkedServices.push(serviceId);
            setOfferedServices(checkedServices);
        }
    }

    function handlePriceChange(event) {
        const elementId = event.target.id.split('-');
        const priceId = parseInt(elementId[2]);

        if (elementId[1] == 'price') {
            let newPrice = [...prices];
            newPrice[priceId - 1] = parseFloat(event.target.value);
            setPrices(newPrice);
        } else {
            let newPriceTypes = [...priceTypes];
            newPriceTypes[priceId - 1] = parseInt(event.target.value);
            setPriceTypes(newPriceTypes);
        }
    }

    function AlertSaveSuccessful(response_status) {
        if (response_status = true) {
            return (
                <div className='col'>
                    <div className='alert alert-success alert-dismissible' role='alert'>
                        <div>Profile changes saved</div>
                        <button type='button' className='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>
                    </div>
                </div>
            )
        } else {
            return null
        }
    }

    // helper function to capitalize names
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return (
        <div id='photographer-detail-view' className='container py-4'>
            <div id='alert-placeholder' className='row'>
                {/* <AlertSaveSuccessful /> */}
            </div>
            <div id='page-contents' className='row align-items-start my-3'>
                <div id='profile-info' className='col col-12 col-lg-8'>
                    <div id='photographer-details' className='row mb-3'>
                        <div className='col'>
                            <div className='row align-items-center mb-3'>
                                <div className='col col-12 col-md-3'>
                                    <label className='form-label' htmlFor='nameInput'>Name</label>
                                </div>
                                <div className='col col-12 col-md-9'>
                                    <input className='form-control' type='text' id='nameInput'
                                        name='name' value={capitalizeFirstLetter(name)} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className='row mb-3'>
                                <div className='col col-12 col-md-3'>
                                    <label className='form-label' htmlFor='emailInput'>Email</label>
                                </div>
                                <div className='col col-12 col-md-9'>
                                    <input className='form-control' type='email' value={email} id='emailInput' readOnly disabled />
                                    <div className='form-text' id='emailHelp'>Your email is your userID and we will never share it directly with customers.</div>
                                </div>
                            </div>
                            <div className='row mb-3'>
                                <div className='col col-12 col-md-3'>
                                    <label className='form-label' htmlFor='cityInput'>City</label>
                                </div>
                                <div className='col col-12 col-md-9'>
                                    <input className='form-control' type='text' id='cityInput'
                                        name='city' value={city} onChange={handleInputChange} />
                                    <div className='form-check my-2'>
                                        <input className='form-check-input' type='checkbox' id='travelCheckbox'
                                            name='travel' checked={canTravel ? true : false} onChange={handleInputChange} />
                                        <label className='form-check-label' htmlFor='travelCheckbox'>Able to travel</label>
                                    </div>
                                </div>
                            </div>
                            <div className='row align-items-center mb-3'>
                                <div className='col col-12 col-md-3'>
                                    <label className='form-label' htmlFor='addressInput'>Business Address</label>
                                </div>
                                <div className='col col-12 col-md-9'>
                                    <input className='form-control' type='text' id='addressInput' placeholder={address ? '' : 'Business address, if you have one'}
                                        name='address' value={address ? address : ''} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className='row align-items-center mb-3'>
                                <div className='col col-12 col-md-3'>
                                    <label className='form-label' htmlFor='portfolioInput'>Portfolio Website</label>
                                </div>
                                <div className='col col-12 col-md-9'>
                                    <input className='form-control' type='text' id='portfolioInput' placeholder={portfolioLink ? '' : 'https://'}
                                        name='portfolioLink' value={portfolioLink ? portfolioLink : ''} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className='row align-items-center mb-3'>
                                <div className='col col-12 col-md-3'>
                                    <label className='form-label' htmlFor='bioInput'>Bio</label>
                                    <div className='form-text' id='bioHelp'>A brief intro about yourself.</div>
                                </div>
                                <div className='col col-12 col-md-9'>
                                    <textarea className='form-control' type='text' id='bioInput'
                                        name='bio' value={bio ? bio : ''} onChange={handleInputChange}></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id='service-prices' className='row mb-3'>
                        <div className='col'>
                            <h5 className='my-3'>Service and fees</h5>
                            {allServices.map((category) => (
                                <div key={`service-category-${category.id}`} className='row mb-2'>
                                    <div className='col col-12 col-md-4'>
                                        <div className='form-check form-switch'>
                                            <input className='form-check-input' type='checkbox' role='switch' id={category.id}
                                                checked={offeredServices.includes(category.id) ? true : false} onChange={handleToggleServices} />
                                            <label className='form-check-label' htmlFor={category.id}>{category.name}</label>
                                        </div>
                                    </div>
                                    <div className='col col-12 col-md-8'>
                                        <div className={`input-group ${offeredServices.includes(category.id) ? 'visible' : 'invisible'}`}>
                                            <span className='input-group-text'>Price $</span>
                                            <input className='form-control' type='number' id={`service-price-${category.id}`}
                                                value={prices[category.id - 1]} onChange={handlePriceChange} />
                                            <select className='form-select' id={`price-model-${category.id}`}
                                                value={priceTypes[category.id - 1]} onChange={handlePriceChange}>
                                                <option value='0'>Select a price model</option>
                                                <option value='1'>Total</option>
                                                <option value='2'>Per hour</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div id='profile-photo' className='col col-12 col-md-4 col-lg-2 text-center'>
                    <img src='../assets/profile.jpg' className='rounded img-fluid object-fit-contain' alt='photographer profile image' />
                    <button type='button' className='btn btn-link my-2'>Update photo</button>
                </div>
            </div>
            <div id='page-actions' className='row justify-content-center mb-3'>
                <div className='col col-auto'>
                    <button className='btn btn-outline-primary' onClick={navigateBackToAccount}>Cancel</button>
                </div>
                <div className='col col-auto'>
                    <button className='btn btn-primary' onClick={submitProfileUpdate}>Save profile</button>
                </div>
            </div>
        </div >
    )
}

export default PhotographerEditView