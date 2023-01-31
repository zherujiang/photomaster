import React, { Component } from 'react';

class PhotographerList extends Component {
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    capitalizeName(string) {
        const words = string.split(' ');
        let photographerName = '';
        for (let i = 0; i < words.length; i++) {
            photographerName += this.capitalizeFirstLetter(words[i])
        }
        return photographerName;
    }
    getServiceName(id, allServices) {
        const service = allServices.find(element => element.id == id);
        return service.name;
    }
    render() {
        const { id, name, city, offeredServices, address, profilePhoto, allServices } = this.props;
        return (
            <div className='container-fluid border border-seconday mb-3'>
                <div className='row my-3'>
                    <div className='col col-4 col-sm-2'>
                        <img src='../assets/profile.jpg' className='rounded img-fluid' alt='photographer profile image' />
                    </div>
                    <div className='col col-8 col-sm-8'>
                        <div className='row justify-content-start'>
                            <h5>{this.capitalizeName(name)}</h5>
                        </div>
                        <div className='row justify-content-start'>
                            <div className='col col-auto'>{city}</div>
                            <div className='col col-auto'>{`Address:${address}`}</div>
                        </div>
                        <div className='row justify-content-start'>
                            {offeredServices.map((category_id) => {
                                return (
                                    <div key={category_id} className='col-auto'>
                                        <span key={category_id} className='badge bg-info badge-info'>
                                            {this.getServiceName(category_id, allServices)}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className='col col-12 col-sm-2'>
                        <div className='row text-end'><h6>Price Range</h6></div>
                        <div className='row'>
                            <button type='button' className='btn btn-sm btn-primary'>View Details</button>
                        </div>
                    </div>
                </div>
                <div className='row mb-3'>
                    <div id={`carousel-${id}`} className='carousel slide' data-ride='carousel'>
                        <div className='carousel-inner'>
                            <div className='carousel-item active'>
                                <div className='row row-cols-2 row-cols-sm-4'>
                                    <img className='d-block' src='../assets/family.jpg' alt='first slide' />
                                    <img className='d-block' src='../assets/fashion.jpg' alt='second slide' />
                                    <img className='d-block' src='../assets/wedding.jpg' alt='third slide' />
                                    <img className='d-block' src='../assets/portrait.jpg' alt='fourth slide' />
                                </div>
                            </div>
                            <div className='carousel-item'>
                                <img className='d-block' src='../assets/fashion.jpg' alt='second slide' />
                                <img className='d-block' src='../assets/wedding.jpg' alt='third slide' />
                                <img className='d-block' src='../assets/portrait.jpg' alt='fourth slide' />
                            </div>
                            <div className='carousel-item'></div>
                        </div>
                        <a className='carousel-control-prev' href={`#carousel-${id}`} role='button' data-slide='prev'>
                            <span className='carousel-control-prev-icon' aria-hidden='true'></span>
                            <span className='sr-only'>Previous</span>
                        </a>
                        <a className='carousel-control-next' href={`#carousel-${id}`} role='button' data-slide='next'>
                            <span className='carousel-control-next-icon' aria-hidden='true'></span>
                            <span className='sr-only'>Next</span>
                        </a>
                    </div>
                </div>
            </div>
        )
    }

}

export default PhotographerList