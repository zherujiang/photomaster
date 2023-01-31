import React, { Component } from 'react';

class ServiceCategory extends Component {

    render() {
        const { id, name, image, selected } = this.props;
        return (
            <div className="col">
                <div className={`card border-2 ${selected ? 'border-primary' : 'border-light-subtle'}`}
                    onClick={this.props.changeCategory}>
                    <img src={`../assets/${image}`} className='card-img-top' alt={`${image}`} />
                    <div className='card-body'>
                        <h6 className='card-title'>{name.toLowerCase()}</h6>
                    </div>
                </div>
            </div>
        )
    }
}

export default ServiceCategory