import React from 'react';

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
                <a className='page-link' href='#' onClick={handleSelectPage}>{i}</a>
            </li>
        );
    };

    return (
        <div aria-label='Page navigation'>
            <ul className='pagination justify-content-center'>
                <li className={`page-item ${currentPage == 1 ? 'disabled' : ''}`}>
                    <a className='page-link' href='#' aria-label='Previous' onClick={handlePreviousPage}>
                        <span aria-hidden='true'>&laquo;</span>
                    </a>
                </li>
                {pages}
                <li className={`page-item ${currentPage == totalPages ? 'disabled' : ''}`}>
                    <a className='page-link' href='#' aria-label='Next' onClick={handleNextPage}>
                        <span aria-hidden='true'>&raquo;</span>
                    </a>
                </li>
            </ul>
        </div>
    );
}

export default Pagination