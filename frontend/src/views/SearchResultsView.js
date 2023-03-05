import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PhotographerSearchDisplay from '../components/PhotographerSearchDisplay';
import Pagination from '../components/Pagination'
import axios from "axios";

function SearchResultsView(props) {
    const location = useLocation();
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(undefined);
    const [selectedCity, setSelectedCity] = useState('');
    const [totalPhotographers, setTotalPhotographers] = useState(0);
    const [photographers, setPhotographers] = useState([]);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [resultsPerPage, setResultsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState(1);

    // server request to get all service categories
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

    // server request to search photographers
    function findPhotographers(service = selectedService, city = selectedCity) {
        axios.get('/photographers', {
            params: {
                service: service,
                location: city,
                results_per_page: resultsPerPage,
                current_page: currentPage
            }
        })
            .then(response => {
                const data = response.data;
                setTotalPhotographers(data['total_photographers']);
                setPhotographers(data['photographers']);
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    // handle user interactions to control search criteria
    function handleSelectService(event) {
        setSelectedService(event.target.value);
    }

    function handleCityChange(event) {
        setSelectedCity(event.target.value);
    }

    function submitSearch() {
        findPhotographers();
    }

    function handleSelectPriceRange(event) {
        setMaxPrice(event.target.value);
    }

    function handleSelectSortBy(event) {
        setSortBy(event.target.value);
    }

    function handleSelectResultsPerPage(event) {
        setResultsPerPage(event.target.value);
        setCurrentPage(1);
    }

    // pagination functions
    function handleSelectPage(event) {
        setCurrentPage(parseInt(event.target.innerHTML));
    }

    function handlePreviousPage() {
        setCurrentPage(currentPage - 1);
    }

    function handleNextPage() {
        setCurrentPage(currentPage + 1);
    }

    // initialization, load all service categories, set selected service and city, load search results if redirected from the SearchView
    useEffect(() => {
        getServices();
        if (location.state) {
            setSelectedService(location.state.selectedService);
            setSelectedCity(location.state.selectedCity);
            findPhotographers(location.state.selectedService, location.state.selectedCity);
        }
    }, [])

    //reload search results when user selects page or change results per page
    useEffect(() => {
        if (selectedService && selectedCity) {
            findPhotographers();
        }
    }, [currentPage, resultsPerPage])

    return (
        <div id='search-results-view' className='py-3'>
            <div className='search-query container my-3'>
                <form>
                    <div className='row align-items-center justify-content-center'>
                        <div className='col col-6 col-sm-5  mb-3'>
                            <div className='input-group'>
                                <label className='input-group-text' htmlFor='serviceCategory'>Photo Service</ label>
                                <select className='form-select' id='serviceCategory'
                                    value={selectedService} onChange={handleSelectService}>
                                    {services.map((category) => (
                                        <option key={`service-option-${category.id}`} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className='col col-6 col-sm-5 mb-3'>
                            <div className='input-group'>
                                <label className='input-group-text' htmlFor='city'>Near</label>
                                <input type='text' className='form-control' id='city'
                                    placeholder='Enter city or zip code' value={selectedCity} onChange={handleCityChange} aria-label='City' />
                            </div>
                        </div>
                        <div className='col col-12 col-sm-2 mb-3 d-grid'>
                            <button type='button' className='btn btn-primary' onClick={submitSearch}>Search</button>
                        </div>
                    </div>
                </form>
            </div>
            <div id='search-display' className='container pt-3'>
                <div className='row align-items-start'>
                    <div id='search-filter' className='col col-12 col-md-3 mb-4'>
                        <h5>Filters</h5>
                        <div className='border border-seconday p-3'>
                            <div id='travel-option' className='mb-3 py-2'>
                                <div className='form-check'>
                                    <input className='form-check-input' type='checkbox' id='flexibleLocation' />
                                    <label className='form-check-label' htmlFor='flexibleLocation'>Accept travel (photographers)</label>
                                </div>
                            </div>
                            <div id='slide-container' className='mb-3'>
                                <label htmlFor='priceRange'>Price Range</label>
                                <input type='range' min='1' max='100' value='50' onChange={handleSelectPriceRange}
                                    className='slider d-block w-100 mt-2' id='priceRange' />
                            </div>
                        </div>
                    </div>
                    <div id='search-results' className='col col-12 col-md-9 text-start mb-4'>
                        <div className='row align-items-end mb-3'>
                            <div className='col col-8'>
                                <h3>{totalPhotographers} Photographers in your area</h3>
                            </div>
                            <div className='col col-4'>
                                <div className='input-group'>
                                    <label className='input-group-text' htmlFor='sortBy'>Sort by</ label>
                                    <select value={1} className='form-select' id='sortBy' onChange={handleSelectSortBy}>
                                        <option value={1}>A to Z</option>
                                        <option value={2}>price low to high</option>
                                        <option value={3}>price high to low</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div id='results-list' className='row'>
                            <div className='col'>
                                {photographers.map((photographer) => (
                                    <PhotographerSearchDisplay
                                        key={`photographer-${photographer.id}`}
                                        id={photographer.id}
                                        name={photographer.name}
                                        city={photographer.city}
                                        canTravel={photographer.can_travel}
                                        address={photographer.address}
                                        services={photographer.services}
                                        price={photographer.price}
                                        profilePhoto={photographer.profile_photo}
                                        photos={photographer.photos}
                                        allServices={services}
                                        selectedService={selectedService}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className='row justify-content-between'>
                            <div className='col col-12 col-sm-4'>
                                <div className='input-group'>
                                    <label className='input-group-text' htmlFor='resultsPerPage'>Results per page</ label>
                                    <select className='form-select' id='resultsPerPage'
                                        value={resultsPerPage} onChange={handleSelectResultsPerPage}>
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={15}>15</option>
                                        <option value={20}>20</option>
                                    </select>
                                </div>
                            </div>
                            <div className='col col-12 col-sm-8'>
                                <Pagination
                                    totalPhotographers={totalPhotographers}
                                    resultsPerPage={resultsPerPage}
                                    currentPage={currentPage}
                                    handleSelectPage={handleSelectPage}
                                    handlePreviousPage={handlePreviousPage}
                                    handleNextPage={handleNextPage}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SearchResultsView