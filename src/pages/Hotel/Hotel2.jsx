import React from 'react';
import Sidebar from '../../components/sidebar/Sidebar';
import './hotel.scss'
const Hotel = () => {
    return (
        <div>
            <h1>hotela</h1>
            <div className="container">
                <div className="sidebar">
                    <Sidebar />
                </div>
                <div className="content">
                    <h2>gfhgfhfg</h2>
                    <div className="add-new">
                        <a className='float-end d-flex-row btn-success' href='/addhotel'>add new Hotel</a>
                        <a className='float-end d-flex-row btn-success' href='/add-user'>add new user</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Hotel;
