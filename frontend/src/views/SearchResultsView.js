import React, { Component } from 'react';
import PhotographerList from '../components/PhotographerList';
import axios from "axios";

class SearchResultsView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            services: [],
            selectedService: 2,
            location: null,
            totalPhotographers: 0,
            page: 1,
            photographers: [],
            maxPrice: 1000
        }
    }

    navTo(uri) {
        window.location.href = window.location.origin + uri;
    }

    componentDidMount() {
        this.getServices();
    }

    getServices = () => {
        axios.get('/services')
            .then(response => {
                const data = response.data;
                this.setState({
                    services: data['services'],
                })
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    handleServiceChange = (event) => {
        this.setState({
            selectedService: event.target.value
        })
    }

    handleLocationChange = (event) => {
        this.setState({
            location: event.target.value
        })
    }

    handlePriceChange = (event) => {
        this.setState({
            maxPrice: event.target.value
        })
    }

    findPhotographers = () => {
        console.log(this.state.selectedService);
        console.log(this.state.location);
        axios.get('/photographers', {
            params: {
                service: this.state.selectedService,
                location: this.state.location,
                page: this.state.page
            }
        })
            .then(response => {
                const data = response.data;
                console.log(data);
                this.setState({
                    photographers: data['photographers'],
                    totalPhotographers: data['photographers'].length
                })
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    render() {
        return (
            <div className='search-results-view'>
                <div className='search-query container'>
                    <form className='py-4'>
                        <div className='row align-items-center justify-content-center'>
                            <div className='col col-6 col-sm-5  mb-3'>
                                <div className='input-group'>
                                    <label className='input-group-text' htmlFor='serviceCategory'>Photo Service</ label>
                                    <select className='form-select' id='serviceCategory'
                                        value={this.state.selectedService} onChange={this.handleServiceChange}>
                                        {this.state.services.map((category) => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className='col col-6 col-sm-5 mb-3'>
                                <div className='input-group'>
                                    <label className='input-group-text' htmlFor='location'>Near</label>
                                    <input type='text' className='form-control' id='location'
                                        placeholder={this.state.location} onChange={this.handleLocationChange} aria-label='Location' />
                                </div>
                            </div>
                            <div className='col col-12 col-sm-2 mb-3 d-grid'>
                                <button type='button' className='btn btn-primary' onClick={this.findPhotographers}>Search</button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className='search-display container'>
                    <div className='row align-items-start'>
                        <div className='filter col col-12 col-md-3'>
                            <h5>Filters</h5>
                            <div className='border border-seconday'>
                                <div className='slidecontainer'>
                                    <label htmlFor='priceRange'>Price Range</label>
                                    <input type='range' min='1' max='100' value='50' onChange={this.handlePriceChange}
                                        className='slider' id='priceRange' />
                                </div>
                            </div>
                        </div>
                        <div className='search-results col col-12 col-md-9 text-start'>
                            <h3>{this.state.totalPhotographers} Photographers in your area</h3>
                            <div className='results-list'>
                                {this.state.photographers.map((photographer) => (
                                    <PhotographerList
                                        key={photographer.id}
                                        id={photographer.id}
                                        name={photographer.name}
                                        city={photographer.city}
                                        offeredServices={photographer.services}
                                        address={photographer.address}
                                        profilePhoto={photographer.profile_photo}
                                        allServices={this.state.services}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default SearchResultsView