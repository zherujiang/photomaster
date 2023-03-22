import React, { useState } from 'react';
import axios from "axios";

function PhotographerContactForm(props) {
    const { selectedService, offeredServices, photographerEmail } = props;
    const [axiosError, setAxiosError] = useState(null);

    const [formStatus, setFormStatus] = useState('Submit');
    const [requestedService, setRequestedService] = useState(selectedService);
    const [customerFirstName, setCustomerFirstName] = useState(undefined);
    const [customerLastName, setCustomerLastName] = useState(undefined);
    const [customerEmail, setCustomerEmail] = useState(undefined);
    const [customerPhone, setCustomerPhone] = useState(undefined);
    const [customMessage, setCustomMessage] = useState(undefined);

    function handleSubmitForm(event) {
        // event.preventDefaut();
        setFormStatus('Sending...');
        const customerName = customerFirstName + ' ' + customerLastName;
        const serviceName = offeredServices.filter((element) => element.id === requestedService)[0].name;
        const emailDetails = {
            'customer_name': customerName,
            'customer_email': customerEmail,
            'customer_phone': customerPhone,
            'service_name': serviceName,
            'custom_message': customMessage,
        }
        // console.log(emailDetails);
        sendContactForm(emailDetails);
        setFormStatus('Submit');
    }

    function sendContactForm(emailDetails) {
        axios.post(
            '/emails',
            {
                recipient: photographerEmail,
                email_details: emailDetails
            })
            .then(response => {
                const data = response.data;
                console.log(data);
            })
            .catch(function (error) {
                setAxiosError(error);
                console.log(error);
            })
    }

    function handleInputChange(event) {
        switch (event.target.name) {
            case 'firstName':
                setCustomerFirstName(event.target.value);
                break;
            case 'lastName':
                setCustomerLastName(event.target.value);
                break;
            case 'customerEmail':
                setCustomerEmail(event.target.value);
                break;
            case 'customerPhone':
                setCustomerPhone(event.target.value);
                break;
            case 'customMessage':
                setCustomMessage(event.target.value);
                break;
        }
    }

    function handleSetRequestedService(event) {
        setRequestedService(event.target.value);
    }

    // when there is an axios error, throw the error to be handled by ErrorBoundary
    const AxiosError = () => {
        if (axiosError) {
            throw axiosError;
        }
        return null
    };

    return (
        <div id='contact-form' className='col col-12 col-lg-3'>
            <AxiosError />
            <form className='border rounded p-4'>
                <div className='row mb-3'>
                    <div className='col'>
                        <h5>Contact Photographer</h5>
                    </div>
                </div>
                <div className='row g-3 mb-3'>
                    <div className='col'>
                        <input type='text' placeholder='First name' className='form-control' aria-label='First name'
                            name='firstName' value={customerFirstName} onChange={handleInputChange} />
                    </div>
                    <div className='col'>
                        <input type='text' placeholder='Last name' className='form-control' aria-label='Last name'
                            name='lastName' value={customerLastName} onChange={handleInputChange} />
                    </div>
                </div>
                <div className='row mb-3'>
                    <div className='col'>
                        <input type='text' placeholder='Your email' className='form-control' aria-label='email'
                            name='customerEmail' value={customerEmail} onChange={handleInputChange} />
                    </div>
                </div>
                <div className='row mb-3'>
                    <div className='col'>
                        <input type='text' placeholder='Phone' className='form-control' aria-label='phone'
                            name='customerPhone' value={customerPhone} onChange={handleInputChange} />
                    </div>
                </div>
                <div className='row mb-3'>
                    <div className='col'>
                        <select className='form-select' value={requestedService}
                            onChange={handleSetRequestedService}>
                            {offeredServices.map((category) => (
                                <option key={`service-option-${category.id}`} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className='row mb-3'>
                    <div className='col'>
                        <label htmlFor='custom-message' className='form-label'>Message</label>
                        <textarea id='custom-message' className='form-control' rows='3' name='customMessage' onChange={handleInputChange}>{customMessage}</textarea>
                    </div>
                </div>
                <div className='row mb-3'>
                    <div className='col'>
                        <button type='button' onClick={handleSubmitForm} className='btn btn-primary w-100'>{formStatus}</button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default PhotographerContactForm