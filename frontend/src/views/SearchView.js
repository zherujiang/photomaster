import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import ErrorBoundary from '../components/ErrorBoundary';
import '../stylesheets/PhotoGrid.css'

function SearchView(props) {
    const [axiosError, setAxiosError] = useState(null);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [nearLocation, setNearLocation] = useState('');
    const [queryErrors, setQueryErrors] = useState({});

    const navigate = useNavigate();

    function getServices() {
        axios.get('/services')
            .then(response => {
                const data = response.data;
                setServices(data['services']);
            })
            .catch(function (error) {
                setAxiosError(error);
                console.log(error);
            })
    }

    function handleSelectCategory(id) {
        setSelectedService(selectedService === id ? null : id);
        // reset query error for the current field
        if (queryErrors['selectedService']) {
            setQueryErrors({
                ...queryErrors,
                ['selectedService']: null
            })
        }
    }

    function handleLocationChange(event) {
        setNearLocation(event.target.value);
        // reset query error for the current field
        if (queryErrors['nearLocation']) {
            setQueryErrors({
                ...queryErrors,
                ['nearLocation']: null
            })
        }
    }

    function validateSearchQuery() {
        const newErrors = {};
        if (!selectedService) {
            newErrors.selectedService = 'Please select a type of photography'
        }
        if (!nearLocation || nearLocation === '') {
            newErrors.nearLocation = 'Please enter a city or zip code'
        }
        return newErrors;
    }

    function submitSearch(e) {
        e.preventDefault();
        const queryValidationErrors = validateSearchQuery();

        if (Object.keys(queryValidationErrors).length > 0) {
            setQueryErrors(queryValidationErrors);
            console.log('queryErrors:', queryErrors);
            console.log('service error:', queryErrors.selectedService);
            console.log('location error:', queryErrors.nearLocation);
        } else {
            navigate('/searchresults', {
                state: {
                    'selectedService': selectedService,
                    'nearLocation': nearLocation
                }
            })
        }
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

    function ServiceCategory(props) {
        const { id, name, imageURL, selected } = props;
        return (
            <div className="col mb-3">
                <div className={`card border-2 ${selected ? 'border-primary' : 'border-light-subtle'}`}
                    onClick={() => { handleSelectCategory(id) }}>
                    <img src={imageURL} className='card-img-top square-image object-fit-cover' alt={`image of service category ${name}`} />
                    <div className='card-body'>
                        <h6 className='card-title'>{titleCase(name)}</h6>
                    </div>
                </div>
            </div>
        )
    }

    useEffect(() => {
        getServices();
    }, [])

    // when there is an axios error, throw the error to be handled by ErrorBoundary
    const AxiosError = () => {
        if (axiosError) {
            throw axiosError;
        }
        return null
    };

    return (
        <div id='search-view'>
            <div className='container text-center py-4'>
                <ErrorBoundary>
                    <AxiosError />
                    <h4 className='my-4'>Find photographers for</h4>
                    <div className='my-3 text-danger'>{queryErrors.selectedService}</div>
                    <div className='row row-cols-2 row-cols-sm-3 row-cols-lg-5 align-items-center mb-3'>
                        {services.map((category) => (
                            <ServiceCategory
                                key={category.id}
                                id={category.id}
                                name={category.name}
                                imageURL={category.image_link}
                                selected={selectedService === category.id ? true : false}
                            />
                        ))}
                    </div>
                    <form>
                        <h4>Near</h4>
                        <div className='my-4 row justify-content-center'>
                            <div className='col col-12 col-md-6'>
                                <div className='input-group'>
                                    <span className='input-group-text'>Location</span>
                                    <input type='text' className='form-control' id='city' placeholder='City or zip code' aria-label='City'
                                        value={nearLocation} onChange={handleLocationChange} />
                                    <button type='submit' className='btn btn-primary' onClick={submitSearch}>Search</button>
                                </div>
                                <div className='mt-3 text-danger'>{queryErrors.nearLocation}</div>
                            </div>
                        </div>
                    </form>
                </ErrorBoundary>
            </div>
        </div >
    )
}

export default SearchView