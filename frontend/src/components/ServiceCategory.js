import React, { Component } from 'react';

function ServiceCategory(props) {

    const { id, name, image, selected, changeCategory } = props;
    return (
        <div className="col">
            <div className={`card border-2 ${selected ? 'border-primary' : 'border-light-subtle'}`}
                onClick={() => { changeCategory(id) }}>
                <img src={`../assets/${image}`} className='card-img-top' alt={`${image}`} />
                <div className='card-body'>
                    <h6 className='card-title'>{name.toLowerCase()}</h6>
                </div>
            </div>
        </div>
    )
}

export default ServiceCategory