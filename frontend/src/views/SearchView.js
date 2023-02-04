import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ServiceCategory from '../components/ServiceCategory';
import axios from "axios";

function SearchView(props) {
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    function getServices() {
        axios.get('/services')
            .then(response => {
                const data = response.data;
                setServices(data['services']);
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    function changeCategory(id) {
        setSelectedService(selectedService === id ? null : id)
    }

    function handleCityChange(event) {
        setSelectedCity(event.target.value);
    }

    function submitSearch() {
        navigate('/searchresults', {
            state: {
                'selectedService': selectedService,
                'selectedCity': selectedCity
            }
        })
    }

    useEffect(() => {
        getServices();
    }, [])

    return (
        <div className='search-view'>
            <div className='container text-center'>
                <h3>Find photographers for</h3>
                <div className='row row-cols-2 row-cols-sm-3 row-cols-lg-5 align-items-center'>
                    {services.map((category) => (
                        <ServiceCategory
                            key={category.id}
                            id={category.id}
                            name={category.name}
                            image={category.image_link}
                            selected={selectedService === category.id ? true : false}
                            changeCategory={changeCategory}
                        />
                    ))}
                </div>
                <h3>Near</h3>
                <div className='row'>
                    <div className='col'>
                        <div className='input-group'>
                            <span className='input-group-text'>City or zip code</span>
                            <input type='text' className='form-control' id='city' placeholder='City' aria-label='City' onChange={handleCityChange} />
                            <input type='text' className='form-control' id='zipcode' placeholder='Zip Code' aria-label='City' />
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col'>
                        <button type='button' className='btn btn-primary' onClick={submitSearch}>Search</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SearchView