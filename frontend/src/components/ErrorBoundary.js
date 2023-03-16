import { Component } from "react";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        // logErrorToMyService(error, errorInfo);
    }

    render() {
        const { hasError, error } = this.state;

        if (hasError) {
            console.log('error', error)
            if (error.name == 'AxiosError') {
                const errorStatusCode = error.response.data.error;
                const errorMessage = error.response.data.message;

                console.log('error message', errorMessage);

                // fallback UI for axios error
                return (
                    <div className='row mb-3'>
                        <div className='col'>
                            <h3>{errorStatusCode}</h3>
                            <p>Something went wrong.</p>
                            <ErrorMessage errorMessage={errorMessage} />
                        </div>
                    </div>
                )
            } else {
                // custom fallback UI for other types of error
                return (
                    <div className='row mb-3'>
                        <div className='col'>
                            <p>Something went wrong.</p>
                        </div>
                    </div>
                )
            }
        }

        return this.props.children;
    }
}

function ErrorMessage(props) {
    const { errorMessage } = props;
    if (errorMessage && typeof errorMessage === 'string') {
        return <h5>Error Message: <span>{errorMessage}</span></h5>
    } else if (errorMessage && errorMessage.code) {
        return (
            <div>
                <h5>Error: <span>{errorMessage.code}</span></h5>
                <p>Description: <span>{errorMessage.description}</span></p>
            </div>
        )
    } else {
        return null;
    }
}

export default ErrorBoundary