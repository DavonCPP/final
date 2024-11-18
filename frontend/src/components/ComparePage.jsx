import React, { useState, useEffect, useRef } from 'react';
import "../styles/Compare.css"; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { calculateTotalScore } from "./calculateScore";
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import '../styles/index.css';
import styles from '../styles/ESGDetails.css';
import '../styles/index.css';


const ComparePage = ({ framework, customizedWeightLocal }) => {
    console.log({framework, customizedWeightLocal});
    const navigate = useNavigate();
    const [corporationInfoDict, setCorporationInfoDict] = useState({});
    const [chart, setChart] = useState([]);
    const [totalScoreDict, setTotalScoreDict] = useState({});
    const [chart2, setChart2] = useState([]);
    const chartRef = useRef(null);
    const chart2Ref = useRef(null);

    const [userInput, setUserInput] = useState(''); 
    const [corporationList, setCorporationList] = useState([]);
    const [page, setPage] = useState(1); 
    const [showPopup, setShowPopup] = useState(false); 
    const [totalPages, setTotalPages] = useState(1); 
    const [corporationShowList, setCorporationShowList] = useState([]);
    const [flag, setFlag] = useState(false);
    const [yearSelected, setYearSelected] = useState(0);
    console.log(corporationInfoDict);
    
    /* Solve the problem that when user back to Framework page and select another framework then come back, the corporations selected still keep the same one */
    useEffect(() => {
        const localList = localStorage.getItem('corporationShowList');
        if (localList) {
            try {
                setCorporationShowList(JSON.parse(localList) || []);
            } catch (error) {
                console.error('Parse error: ', error);
                setCorporationShowList([]);
            }
        }
    }, []);

    /* If there is user input from the blank area, the fuzzy search will be triggered */
    const handleSearch = async (e) => {
        if (userInput) {
            try {
                console.log(page);
                const response = await fetch(`http://127.0.0.1:5000/api/query_data_2?company_name=.*${encodeURIComponent(userInput)}.*&page=${page}&limit=10`);
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
                    alert(`There is no such company`);
                }
            // })    
            } catch (error) {
                console.error(`Error fetching corporation:`, error);
            }
        }
    };

    /* When users click the "Reset" button, the showed list will be set as empty and the page for paginated search becomes 1 again */
    const handleReset = async () => {
        setCorporationShowList([]);
        setPage(1);
    };

    /* to handle async isssues */
    useEffect (() => {
        if (corporationList.length > 0) {
            setShowPopup(true);
        }
    }, [corporationList]);


    const handlePageChange = (curr_page) => {
        if (curr_page >= 1 && curr_page <= totalPages) {
            setPage(curr_page);
        }
    };

    /* if the page changes, the fuzzy search continues */
    useEffect(() => {
        handleSearch();
    }, [page]);

    const handleClickCorporation = (perm_id, company_name) => {
        if (!corporationShowList.some(company => company.perm_id === perm_id)) {
            const new_list = [...corporationShowList,  { perm_id, company_name }];
            setCorporationShowList(new_list);

            localStorage.setItem('corporationShowList', JSON.stringify(new_list));
        }
    };

    /* for each selected corporation, calculate its ESG Marks, and then generate corporationInfoDict */
    useEffect(() => {
        if (corporationShowList && corporationShowList.length > 0 && yearSelected !== 0) {
            const corporationInfo = {}; 
            console.log(corporationShowList);
            const getCorporationsInfo = async () => {
                for (const corporation of corporationShowList) {
                    const request = { 
                        perm_id: corporation[Object.keys(corporation)[0]],
                        year: yearSelected
                    };
                    const formData = new URLSearchParams();
                    for (const key in request) {
                        formData.append(key, request[key]);
                    }
                    try {
                        const response = await fetch('http://localhost:5000/api/query_data', {
                            method: 'POST', 
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded', 
                            },
                            body: formData.toString()
                        });
                        
                        const data = await response.json();
                        console.log(data);
                        console.log(data.data[0]);
                        console.log(corporation[Object.keys(corporation)[0]]);
                        const e_value = data.data[0][`${yearSelected}_E_Marks`] || 0;
                        const s_value = data.data[0][`${yearSelected}_S_Marks`] || 0;
                        const g_value = data.data[0][`${yearSelected}_G_Marks`] || 0;

                        corporationInfo[corporation[Object.keys(corporation)[1]]] = {
                            "year": `${yearSelected}`,
                            "E": e_value,
                            "S": s_value,
                            "G": g_value
                        };
                        console.log(corporationInfo);
                    } catch (error) {
                        console.error('Error fetching data:', error);
                        continue;
                    }
                }
                console.log(corporationInfo);
                setCorporationInfoDict(corporationInfo);
                setFlag(true);
            };

            getCorporationsInfo();
        }
    }, [corporationShowList, yearSelected]);

    /* download ESG Marks' graph */
    const downloadChartPDF = async () => {
        const pdf = new jsPDF();
        pdf.text('ESG Performance In Different Corporations', 10, 10);
        try {
            const img = await htmlToImage.toPng(chartRef.current); 
            pdf.addImage(img, 'PNG', 10, 20, 200, 100); 
            const img2 = await htmlToImage.toPng(chart2Ref.current); 
            pdf.addImage(img2, 'PNG', 10, 130, 200, 100); 
            pdf.save(' Comparison Report.pdf');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    /* generate ESG Marks chart data */
    let chartData = {};
    useEffect(() => {
        console.log(corporationInfoDict);
        chartData = Object.entries(corporationInfoDict).map(([corporation, values]) => ({
            corporation,
            year: values.year,
            E: values.E || 0,
            S: values.S || 0,
            G: values.G || 0,
        }));
    
        console.log(chartData);
        setChart(chartData);
    }, [corporationInfoDict]);
    console.log(chart);

    /* generate total score chart data */
    let chart2Data = {};
    useEffect(() => {
        console.log(totalScoreDict);
        chart2Data = Object.entries(totalScoreDict).map(([corporation, values]) => ({
            corporation,
            score: values.score || 0
        }));
    
        console.log(chart2Data);
        setChart2(chart2Data);
    }, [totalScoreDict]);
    console.log(chart2);

    /* calculate total score */
    useEffect(() => {
        if (Object.keys(corporationInfoDict).length > 0) {
            console.log(customizedWeightLocal);
            console.log(framework);
            const totalScore = {};
            for (const [corporation, values] of Object.entries(corporationInfoDict)) {
                console.log(corporation);
                const esg = {
                    e: values.E,
                    s: values.S,
                    g: values.G
                };
                console.log(esg);
                console.log(calculateTotalScore(esg, framework, customizedWeightLocal));
                totalScore[corporation] = calculateTotalScore(esg, framework, customizedWeightLocal);
            }
            setTotalScoreDict(totalScore);
        }
    }, [framework, corporationInfoDict, customizedWeightLocal]);

    const handleFrameworkClick = () => {
        navigate('/frameworks');
    }
    
    const handleSearchClick = () => {
        navigate('/search');
    }
    
    const handleCompareClick = () => {
        navigate('/compare');
    }

    const handleLogout = () => {
        addToJson(); 
        localStorage.clear();
        navigate("/login"); 
    };

    /* store weights to json file in backend */
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
        <div>
            <header className="header">
                <div className="header-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <span className="logo">ecoM</span>
                        <nav>
                        <ul className="nav-menu">
                            <li><a href="#" onClick={handleSearchClick} className={styles.navLink}>SEARCH</a></li>
                            <li><a href="#" onClick={handleCompareClick} className={styles.navLink}>COMPARE</a></li>
                            <li><a href="#" onClick={handleFrameworkClick} className={styles.navLink}>FRAMEWORK</a></li>
                        </ul>
                        </nav>
                    </div>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </div>
            </header>
            
            <div className='container'>
                <div>
                    <div className='bg-white rounded-xl w-3/5 mt-10 mr-auto ml-auto flex flex-col justify-center items-center'>
                        <div className='flex w-full justify-center items-center mt-10 mb-5'>
                            <label className='text-black text-lg text-xl mr-3 font font-bold '>Please Enter Corporation: </label>
                            <input
                                className='border border-gray-300 w-1/2 rounded mb-2 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                type="text"
                                placeholder="Please enter corporation name"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                            />
                        </div>
                        <div className='flex mb-10'>
                            <button className='flex justify-center items-center bg-blue-400 hover:bg-white text-white hover:text-gray-400 font-bold border border-blue-400 py-2 px-4 rounded mr-2' onClick={handleSearch}>Search</button>
                            <button className='flex justify-center items-center bg-blue-400 hover:bg-white text-white hover:text-gray-400 font-bold border border-blue-400 py-2 px-4 rounded mr-2' onClick={handleReset}>Reset</button>
                        </div>
                    </div>
                    <Modal
                    isOpen={showPopup}
                    contentLabel="Corporation"
                    className="relative bg-white mr-auto ml-auto mt-30 p-2 w-1/3 h-3/5 mt-20 shadow rounded"
                    onRequestClose={() => setShowPopup(false)} 
                    >
                        <div className="popup" id="popup-corporation" style={{padding: '0.5rem', background: '#ffffff'}}>
                            <div>
                                {corporationList.map((company) => (
                                    <div key={company.perm_id} onClick={() => handleClickCorporation(company.perm_id, company.company_name)}>
                                        <div className='bg-gray-100 hover:bg-gray-300 p-1 mt-2 mb-2 text-sm'>{company.company_name}</div>
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
                            className="flex justify-center items-center bg-blue-400 hover:bg-blue-600 text-white font-bold  px-2 py-0.5 rounded mr-2"
                        >submit</button>
                    </Modal>
                    {!showPopup && corporationShowList.length !== 0 && (
                        <div className='mt-10 bg-white w-3/5 rounded mr-auto ml-auto p-10'> 
                            <p className='text-xl font font-bold '>Selected Corporation List: </p>
                            <ul className='text-xl'>
                                {corporationShowList.map((item, index) => (
                                <li key={item[Object.keys(item)[1]]}>{index+1}. {item[Object.keys(item)[1]]}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div> 
                
                <div>
                    <div className='flex rounded-md p-2 px-4 w-3/5 ml-auto mr-auto mt-10'> 
                        <p className='font font-bold text-xl mr-3'>Year: </p>
                        <button
                            className="flex justify-center items-center bg-blue-400 hover:bg-white text-white hover:text-blue-600 border border-blue-600 font-bold py-0.5 px-2 rounded mr-2"
                            onClick={() => setYearSelected(2016)}
                        >
                            2016
                        </button>
                        <button
                            className="flex justify-center items-center bg-blue-400 hover:bg-white text-white hover:text-blue-600 border border-blue-600 font-bold py-0.5 px-2 rounded mr-2"
                            onClick={() => setYearSelected(2017)}
                        >
                            2017
                        </button>
                        <button
                            className="flex justify-center items-center bg-blue-400 hover:bg-white text-white hover:text-blue-600 border border-blue-600 font-bold py-0.5 px-2 rounded mr-2"
                            onClick={() => setYearSelected(2018)}
                        >
                            2018
                        </button>
                        <button
                            className="flex justify-center items-center bg-blue-400 hover:bg-white text-white hover:text-blue-600 border border-blue-600 font-bold py-0.5 px-2 rounded mr-2"
                            onClick={() => setYearSelected(2019)}
                        >
                            2019
                        </button>
                        <button
                            className="flex justify-center items-center bg-blue-400 hover:bg-white text-white hover:text-blue-600 border border-blue-600 font-bold py-0.5 px-2 rounded mr-2"
                            onClick={() => setYearSelected(2020)}
                        >
                            2020
                        </button>
                        <button
                            className="flex justify-center items-center bg-blue-400 hover:bg-white text-white hover:text-blue-600 border border-blue-600 font-bold py-0.5 px-2 rounded mr-2"
                            onClick={() => setYearSelected(2021)}
                        >
                            2021
                        </button>
                        <button
                            className="flex justify-center items-center bg-blue-400 hover:bg-white text-white hover:text-blue-600 border border-blue-600 font-bold py-0.5 px-2 rounded mr-2"
                            onClick={() => setYearSelected(2022)}
                        >
                            2022
                        </button>
                        <button
                            className="flex justify-center items-center bg-blue-400 hover:bg-white text-white hover:text-blue-600 border border-blue-600 font-bold py-0.5 px-2 rounded mr-2"
                            onClick={() => setYearSelected(2023)}
                        >
                            2023
                        </button>
                        <button
                            className="flex justify-center items-center bg-blue-400 hover:bg-white text-white hover:text-blue-600 border border-blue-600 font-bold py-0.5 px-2 rounded mr-2"
                            onClick={() => setYearSelected(2024)}
                        >
                            2024
                        </button>
                    </div>
                    { flag && (
                        <div className='relative'>
                            <div className='compare-chart' ref={chartRef}>
                                <BarChart width={800} height={500} data={chart}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="corporation" /> 
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="E" fill="#6a7ee2" name="E Marks" />
                                    <Bar dataKey="S" fill="#e46c68" name="S Marks" />
                                    <Bar dataKey="G" fill="#47bcae" name="G Marks" />
                                </BarChart>
                            </div>
                            <div className='compare-chart'ref={chart2Ref}>
                                <BarChart width={800} height={500} data={chart2}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="corporation" /> 
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="score" fill="#0a855b" name="Total Score" barSize={20}/>
                                </BarChart>
                            </div>
                            <p className='text-md font font-bold'>If there is no corresponding corporation shown above, it means there is no data for this corporation in this year.</p>
                            <button className='flex justify-center items-center bg-blue-400 hover:bg-white text-white hover:text-gray-400 font-bold border border-blue-400 py-2 px-4 rounded absolute right-20 bottom-20' onClick={downloadChartPDF}>Download</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ComparePage;
