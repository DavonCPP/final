import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/ESGDetails.css';
import '../styles/ESGDetails.css';
import 'reactjs-popup/dist/index.css';
import Modal from 'react-modal';
import '../styles/index.css';

Modal.setAppElement('#root');

const SearchPage = () => {

    /* page navigate */
    const navigate = useNavigate();
    const handleSearchClick = () => {
        navigate('/search');
    }
    const handleFrameworkClick = () => {
        navigate('/frameworks');
    }

    const [industry, setIndustry] = useState('');
    const [region, setRegion] = useState('');
    const [corporationList, setCorporationList] = useState([]);
    const [corporationName, setCorporationName] = useState(null);
    const [corporationFiltered, setCorporationFiltered] = useState(null);
    const [page, setPage] = useState(1); 
    const [showPopup, setShowPopup] = useState(false); 
    const [totalPages, setTotalPages] = useState(1); 
    const [userInput, setUserInput] = useState('');

    /* handle input */
    const handleIndustryChange = (e) => {
        setIndustry(e.target.value);
    };
    const handleRegionChange = async (e) => {
        setRegion(e.target.value);
    };
    const handleCorporationChange = async (e) => {
        setUserInput(e.target.value);
    };

    const handleSubmit = async (e) => {
        if (industry && region) {
            try {
                console.log(page);
                const response = await fetch(`http://127.0.0.1:5000/api/query_data_2?industry=${encodeURIComponent(industry)}&headquarter_country=${encodeURIComponent(region)}&company_name=.*${encodeURIComponent(userInput)}.*&page=${page}`);
                console.log(response);
                const result = await response.json();
                console.log(result)
                if (result.data && result.data.length > 0) {
                    let company_list = [];
                    for (const item of result.data) {
                        const company_data = {
                            company_name: item.company_name || '',
                            perm_id: item.perm_id || ''
                        };
                        console.log(company_data);
                        company_list.push(company_data);
                    }
                    setCorporationList(company_list);
                    setTotalPages(Math.ceil(result.pagination.total_items / 10));
                } else {
                    alert(`There is no such company in industry ${industry} in area ${region}`);
                }
            } catch (error) {
                console.error(`Error fetching corporation:`, error);
            }
        }
    };

    useEffect (() => {
        if (corporationList.length > 0) {
            setShowPopup(true);
        }
    }, [corporationList]);

    useEffect (() => {
        console.log(page);
        handleSubmit();
    }, [page]);

    const handlePageChange = (curr_page) => {
        if (curr_page >= 1 && curr_page <= totalPages) {
            setPage(curr_page);
        }
    };

    const handleClickCorporation = (perm_id, company_name) => {
        setCorporationFiltered(perm_id);
        setCorporationName(company_name);
        setShowPopup(false);
    };

    const handleViewDetails = () => {
        if (corporationFiltered) {
          navigate(`/esgdetails/${corporationFiltered}`);  
        } else {
          console.error('No corporation selected');
        }
    };

    const handleLogout = () => {
        addToJson(); 
        localStorage.clear();
        navigate("/login"); 
      };

    const addToJson = async () => {
        const json_data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key === "email" || key === "corporationShowList") continue; 
            const data = localStorage.getItem(key);
            json_data[key] = JSON.parse(data); 
        }

        try {
            const response = await fetch('http://localhost:5000/api/add_to_json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(json_data)
            });

            const result = await response.json();
            if (!response.ok) {
                console.error(result); 
            } 
            console.log(result); 
        } catch (error) {
            console.error('Error add data to json:', error);
        }
    };
    

    return (
        <>
            <header className="header">
                <div className="header-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <span className="logo">ecoM</span>
                        <nav>
                        <ul className="nav-menu">
                            <li><a href="#" onClick={handleSearchClick} className={styles.navLink}>SEARCH</a></li>
                            <li><a href="#" onClick={handleFrameworkClick} className={styles.navLink}>FRAMEWORK</a></li>
                        </ul>
                        </nav>
                    </div>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </div>
            </header>
            <div className="main-container">
                <div className='search-form'>
                    <div className="input-area">
                        <label htmlFor="industry" className="text-gray-900 text-md">Industry: </label>
                        <input 
                        type="text"
                        id="industry"
                        value={industry}
                        onChange={handleIndustryChange}
                        className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
                        placeholder="Please Enter Industry"/>
                    </div>
                    <div className="input-area">
                        <label htmlFor="region" className="text-gray-900 text-md">Region: </label>
                        <input 
                        type="text"
                        id="region"
                        value={region}
                        onChange={handleRegionChange}
                        className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
                        placeholder="Please Enter Region"/>
                    </div>
                    <div className='input-area'>
                        <label className='text-gray-900 text-md'>Corporation: </label>
                        <input
                            className='border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-400'
                            type="text"
                            placeholder="Please enter corporation name"
                            value={userInput}
                            onChange={handleCorporationChange}
                        />
                    </div>
                    <div className='button-container' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '15px', marginBottom: '15px' }}>
                        <button 
                        onClick={handleSubmit} 
                        className="action-button view-scores-button"
                        style={{ backgroundColor: '#3b82f6' }} 
                        >
                        submit
                        </button>
                    </div>
                    
                    <Modal
                    isOpen={showPopup}
                    contentLabel="Corporation"
                    className="relative bg-white mr-auto ml-auto mt-20 p-1 w-1/3 h-4/5 shadow rounded "
                    onRequestClose={() => setShowPopup(false)} 
                    >
                        <div className="popup" id="popup-corporation" style={{padding: '0.5rem', background: '#ffffff'}}>
                            <div>
                                {corporationList.map((company) => (
                                    <div key={company.perm_id} onClick={() => handleClickCorporation(company.perm_id, company.company_name)}>
                                        <div className='bg-gray-100 hover:bg-gray-300 p-2 mt-2 mb-2 '>{company.company_name}</div>
                                    </div>
                                ))}
                            </div>

                            <div className='flex'>
                                <button 
                                className="flex justify-center items-center bg-gray-400 hover:bg-gray-600 text-white font-bold px-2.5 py-1 rounded mr-2"
                                onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
                                    prev
                                </button>
                                <span className='mr-2'>page: {page} / {totalPages} </span>
                                <button 
                                className="flex justify-center items-center bg-gray-400 hover:bg-gray-600 text-white font-bold px-2.5 py-1 rounded mr-2"
                                onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}>
                                    next
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPopup(false)}
                            className="flex justify-center items-center bg-blue-400 hover:bg-blue-600 text-white font-bold px-2 py-0.5 rounded mr-2 absolute top-2 right-2"
                        >✕</button>
                    </Modal>
                    
                    {corporationName && (<div style={{ textAlign: 'center', marginTop: '15px', marginBottom: '15px' }}>
                        <span>The corporation you selected is</span> <span className='font font-bord text-xl'>{corporationName}</span>
                    </div>)}
                    <div className='button-container' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '15px', marginBottom: '15px' }}>
                        <button 
                            onClick={handleViewDetails} 
                            className="action-button view-scores-button"
                            style={{ backgroundColor: '#3b82f6' }} 
                        >
                        View Details
                        </button></div>
                    
                    </div>
                </div>
        </>
    );
};

export default SearchPage;


