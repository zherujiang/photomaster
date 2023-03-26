import React, { useState, useEffect } from 'react';
import axios from "axios";

function PhotographerContactForm(props) {
    const { selectedService, offeredServices, photographerEmail, photographerName } = props;
    const [axiosError, setAxiosError] = useState(null);
    const [emailDeliverySuccessful, setEmailDeliverySuccessful] = useState(false);

    const [formStatus, setFormStatus] = useState('Submit');
    const [formData, setFormData] = useState({});
    const [formErrors, setFormErrors] = useState({});

    // formData['requestedService'] = selectedService;

    function handleFormInput(field, value) {
        setFormData({
            ...formData,
            [field]: value
        });

        // reset form error for the current field
        if (!!formErrors[field]) {
            setFormErrors({
                ...formErrors,
                [field]: null
            })
        }
    }

    function validateForm() {
        const newErrors = {};
        const { customerFirstName, customerLastName, customerEmail, customerPhone, requestedService, customMessage } = formData;
        if (!customerFirstName || customerFirstName === '') {
            newErrors.customerFirstName = 'Please enter your first name'
        };
        if (!customerLastName || customerLastName === '') {
            newErrors.customerLastName = 'Please enter your last name'
        };
        if (!customerEmail || customerEmail === '') {
            newErrors.customerEmail = 'Please enter your email'
        };
        if (!customerPhone || customerPhone === '') {
            newErrors.customerPhone = 'Please enter your email'
        };
        if (!requestedService) {
            newErrors.requestedService = 'Please select a photography service'
        };
        return newErrors;
    }

    function handleSubmitForm(event) {
        event.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
        } else {
            setFormStatus('Sending...');
            const customerName = formData.customerFirstName + ' ' + formData.customerLastName;
            const selectedServiceType = offeredServices.filter((element) => element.id === formData.requestedService)[0];
            const serviceName = selectedServiceType.name;
            const emailDetails = {
                'customer_name': titleCase(customerName),
                'customer_email': formData.customerEmail,
                'customer_phone': formData.customerPhone,
                'service_name': titleCase(serviceName),
                'custom_message': formData.customMessage,
            }
            sendContactEmail(emailDetails);
            setFormStatus('Submit');
        }
    }

    function sendContactEmail(emailDetails) {
        axios.post(
            '/emails',
            {
                recipient: photographerEmail,
                recipient_name: photographerName,
                email_details: emailDetails,
            })
            .then(response => {
                const data = response.data;
                setEmailDeliverySuccessful(true);
                setTimeout(() => {
                    setEmailDeliverySuccessful(false);
                }, 2000);
                console.log(data);
            })
            .catch(function (error) {
                setAxiosError(error);
                console.log(error);
            })
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

    function EmailDeliverySuccessfulAlert() {
        if (emailDeliverySuccessful) {
            return (
                <div className='row'>
                    <div className='alert alert-success alert-dismissible' role='alert'>
                        <div>Email sent</div>
                        <button type='button' className='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>
                    </div>
                </div>
            )
        } else {
            return null
        }
    }

    useEffect(() => {
        formData['requestedService'] = selectedService;
    }, [])

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
            <EmailDeliverySuccessfulAlert />
            <form className='border rounded p-4 mb-3'>
                <div className='row mb-3'>
                    <div className='col'>
                        <h5>Contact Photographer</h5>
                    </div>
                </div>
                <div className='row g-3 mb-3'>
                    <div className='col'>
                        <input type='text' placeholder='First name' className={`form-control ${formErrors.customerFirstName ? 'is-invalid' : ''}`} aria-label='First name'
                            value={formData.customerFirstName} onChange={(e) => handleFormInput('customerFirstName', e.target.value)} />
                        <div className='invalid-feedback'>{formErrors.customerFirstName}</div>
                    </div>
                    <div className='col'>
                        <input type='text' placeholder='Last name' className={`form-control ${formErrors.customerLastName ? 'is-invalid' : ''}`} aria-label='Last name'
                            value={formData.customerLastName} onChange={(e) => handleFormInput('customerLastName', e.target.value)} />
                        <div className='invalid-feedback'>{formErrors.customerLastName}</div>
                    </div>
                </div>
                <div className='row mb-3'>
                    <div className='col'>
                        <input type='email' placeholder='Your email' className={`form-control ${formErrors.customerEmail ? 'is-invalid' : ''}`} aria-label='email'
                            value={formData.customerEmail} onChange={(e) => handleFormInput('customerEmail', e.target.value)} />
                        <div className='invalid-feedback'>{formErrors.customerEmail}</div>
                    </div>
                </div>
                <div className='row mb-3'>
                    <div className='col'>
                        <input type='text' placeholder='Phone' className={`form-control ${formErrors.customerPhone ? 'is-invalid' : ''}`} aria-label='phone'
                            value={formData.customerPhone} onChange={(e) => handleFormInput('customerPhone', e.target.value)} />
                        <div className='invalid-feedback'>{formErrors.customerPhone}</div>
                    </div>
                </div>
                <div className='row mb-3'>
                    <div className='col'>
                        <select className={`form-select ${formErrors.requestedService ? 'is-invalid' : ''}`} value={formData.requestedService}
                            onChange={(selected) => handleFormInput('requestedService', selected)}>
                            {offeredServices.map((category) => (
                                <option key={`service-option-${category.id}`} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                        <div className='invalid-feedback'>{formErrors.requestedService}</div>
                    </div>
                </div>
                <div className='row mb-3'>
                    <div className='col'>
                        <label htmlFor='custom-message' className='form-label'>Message</label>
                        <textarea id='custom-message' className='form-control' rows='3' name='customMessage'
                            value={formData.customMessage} onChange={(e) => handleFormInput('customMessage', e.target.value)}></textarea>
                    </div>
                </div>
                <div className='row mb-3'>
                    <div className='col'>
                        <button type='submit' onClick={handleSubmitForm} className='btn btn-primary w-100'>{formStatus}</button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default PhotographerContactForm