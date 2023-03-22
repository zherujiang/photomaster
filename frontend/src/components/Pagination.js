import React from 'react';
import { Link } from 'react-router-dom';

function Pagination(props) {
    const { totalPhotographers, resultsPerPage, currentPage, handleSelectPage, handlePreviousPage, handleNextPage } = props;

    if (totalPhotographers == 0) {
        return null
    };

    const pages = [];
    const totalPages = Math.ceil(totalPhotographers / resultsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        pages.push(
            <li key={i} className={`page-item ${currentPage == i ? 'active' : ''}`}>
                <Link className='page-link' to='#' onClick={handleSelectPage}>{i}</Link>
            </li>
        );
    };

    return (
        <div aria-label='Page navigation'>
            <ul className='pagination justify-content-center'>
                <li className={`page-item ${currentPage == 1 ? 'disabled' : ''}`}>
                    <Link className='page-link' href='#' aria-label='Previous' onClick={handlePreviousPage}>
                        <span aria-hidden='true'>&laquo;</span>
                    </Link>
                </li>
                {pages}
                <li className={`page-item ${currentPage == totalPages ? 'disabled' : ''}`}>
                    <Link className='page-link' href='#' aria-label='Next' onClick={handleNextPage}>
                        <span aria-hidden='true'>&raquo;</span>
                    </Link>
                </li>
            </ul>
        </div>
    );
}

export default Pagination