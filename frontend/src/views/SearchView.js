import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

    function handleSelectCategory(id) {
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

    function ServiceCategory(props) {
        const { id, name, image, selected } = props;
        return (
            <div className="col">
                <div className={`card border-2 ${selected ? 'border-primary' : 'border-light-subtle'}`}
                    onClick={() => { handleSelectCategory(id) }}>
                    <img src={`../assets/${image}`} className='card-img-top' alt={`${image}`} />
                    <div className='card-body'>
                        <h6 className='card-title'>{name.toLowerCase()}</h6>
                    </div>
                </div>
            </div>
        )
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
                        />
                    ))}
                </div>
                <h3>Near</h3>
                <div className='row'>
                    <div className='col'>
                        <div className='input-group'>
                            <span className='input-group-text'>Location</span>
                            <input type='text' className='form-control' id='city' placeholder='City or zip code' aria-label='City'
                                onChange={handleCityChange} />
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