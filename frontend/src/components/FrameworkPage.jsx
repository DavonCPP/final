import React, { useState, useEffect } from 'react';
import Select from 'react-select'; 
import "../styles/Compare.css"; 
import '../styles/index.css';
import styles from '../styles/ESGDetails.css';
import { useNavigate } from 'react-router-dom';

const FrameworkPage = ({framework, setFramework, customizedWeightLocal, setCustomizedWeightLocal}) => {
    const email = localStorage.getItem("email");
    const [weightTemp, setWeightTemp] = useState({
        ew: "",
        sw: "",
        gw: ""
    });

    let [customizedWeightList, setCustomizedWeightList] = useState([]);

    console.log(email);

    useEffect(() => {
        const customizedWeightListTemp = localStorage.getItem(`${email}_customizedWeightListLocal`);
        if (customizedWeightListTemp) {
          try {
            setCustomizedWeightList(JSON.parse(customizedWeightListTemp) || []);
          } catch (error) {
            console.error("Parse error:", error);
            setCustomizedWeightList([]);
          }
        }
      }, []);

    const updateInputChange = (e) => {
        const {name, value} = e.target;
        setWeightTemp((prev_dict) => ({...prev_dict, [name]: value || ""}));
    };

    const clickCustomizeButton = () => {
        console.log(weightTemp.ew);
        setCustomizedWeightList(prevCustomizedWeightList => {
            let newList = [];
            if (prevCustomizedWeightList) {
                if (Array.isArray(prevCustomizedWeightList)) {
                    newList = [...prevCustomizedWeightList, {...weightTemp}];
                }
                else {
                    // if not yet
                    newList = [{...weightTemp}];
                }
            }
            console.log("new list: ", newList);
            localStorage.setItem(`${email}_customizedWeightListLocal`, JSON.stringify(newList)); 
            return newList;
        });
    };

    useEffect(() => {
        console.log(customizedWeightList);
    }, [customizedWeightList]);

    const navigate = useNavigate();

    const handleFrameworkClick = () => {
        navigate('/frameworks');
    }
    
    const handleSearchClick = () => {
        navigate('/search');
    }
    
    const handleCompareClick = () => {
        console.log({framework, customizedWeightLocal});
        navigate('/compare', {
            state: { framework, customizedWeightLocal: customizedWeightLocal || { ew: '', sw: '', gw: '' } }
        });
    }

    const handleSubmitCustomizedWeight = (ew, sw, gw) => {
        setCustomizedWeightLocal({
            ew: ew,
            sw: sw,
            gw: gw
        });
        console.log(customizedWeightLocal);
    };

    const handleLogout = () => {
        addToJson(); 
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
        <div>
            <header className="header">
                <div className="header-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <span className="logo">ecoM</span>
                        <nav>
                        <ul className="nav-menu">
                            <li><a href="#" onClick={handleSearchClick} className={styles.navLink}>SEARCH</a></li>
                            <li><a href="#" onClick={handleFrameworkClick} className={styles.navLink}>FRAMEWORK</a></li>
                            <li><a href="#" onClick={handleCompareClick} className={styles.navLink}>COMPARE</a></li>
                        </ul>
                        </nav>
                    </div>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </div>
            </header>
            <div className='flex justify-center items-center'>
                <div className='bg-white w-3/5 mt-20 rounded-2xl'>
                    <div className='framework'> 
                        <label>Framework</label>
                        <Select
                        id='select-framework'
                        value={framework}
                        onChange={setFramework}
                        options={[
                            { label: "IFRS S1", value: "IFRS S1" },
                            { label: "IFRS S2", value: "IFRS S2" },
                            { label: "TCFD", value: "TCFD" },
                            { label: "CUSTOMIZE", value: "CUSTOMIZE" },
                        ]}
                        isSearchable
                        placeholder="Please Select Framework"
                        />
                    </div>
                    { framework && (framework.value === 'CUSTOMIZE') &&
                    (<div className='bg-white rounded px-2 py-4 flex flex-col justify-center items-center'>
                        <div className='mb-10 flex justify-center items-center'>
                            <label>Environmental: </label>
                            <input 
                            className='input-weight'
                            type="text"
                            name="ew"
                            value={weightTemp.ew}
                            onChange={updateInputChange}
                            />
                            <label>Social: </label>
                            <input
                            className='input-weight'
                            type="text"
                            name="sw"
                            value={weightTemp.sw}
                            onChange={updateInputChange}
                            />
                            <label>Governance: </label>
                            <input
                            className='input-weight'
                            type="text"
                            name="gw"
                            value={weightTemp.gw}
                            onChange={updateInputChange}
                            />
                        </div>
                        <button onClick={clickCustomizeButton} className='bg-blue-500 text-white hover:text-blue-500 hover:bg-white border-blue-500 hover:border-blue-500 rounded cursor-pointer px-1 py-2 w-1/3'>
                            Submit Customize Framework
                        </button>
                        <div className="grid grid-cols-4 gap-2 p-2">
                            {Array.isArray(customizedWeightList) && customizedWeightList.map((item, index) => (
                                <div
                                key={index}
                                className="bg-white min-w-[80px] aspect-w-16 aspect-h-9 border border-gray-400 rounded p-3"
                                >
                                <button onClick={() => handleSubmitCustomizedWeight(item.ew, item.sw, item.gw)}>
                                    E: {item.ew}
                                    S: {item.sw}
                                    G: {item.gw}
                                </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    )}
                </div>
            </div>
            
        </div>
    );
}

export default FrameworkPage;