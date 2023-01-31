import React, { Component } from 'react';
import ServiceCategory from '../components/ServiceCategory';
import axios from "axios";

class SearchView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            services: [],
            selectedService: null,
            location: null,
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

    changeCategory = (id) => {
        this.setState(
            prevState => ({
                selectedService: prevState.selectedService == id ? null : id
            })
        )
    }

    submitSearch = () => {
        this.navTo('/searchresults')
    }

    render() {
        return (
            <div className='search-view'>
                <div className='container text-center'>
                    <h3>Find photographers for</h3>
                    <div className='row row-cols-2 row-cols-sm-3 row-cols-lg-5 align-items-center'>
                        {this.state.services.map((category) => (
                            <ServiceCategory
                                key={category.id}
                                name={category.name}
                                image={category.image_link}
                                selected={this.state.selectedService == category.id ? true : false}
                                changeCategory={this.changeCategory.bind(this, category.id)}
                            />
                        ))}
                    </div>
                    <h3>Near</h3>
                    <div className='row'>
                        <div className='col'>
                            <div className='input-group'>
                                <span className='input-group-text'>City or zip code</span>
                                <input type='text' className='form-control' id='city' placeholder='City' aria-label='City' />
                                <input type='text' className='form-control' id='zipcode' placeholder='Zip Code' aria-label='City' />
                            </div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col'>
                            <button type='button' className='btn btn-primary' onClick={this.submitSearch}>Search</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default SearchView