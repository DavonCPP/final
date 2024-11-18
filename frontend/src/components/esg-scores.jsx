import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ESGDetails.css';

const ESGScores = () => {
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState({
    company_name: '',
    headquarter_country: '',
    industry: ''
  });
  const [scoreData, setScoreData] = useState([]);
  const navigate = useNavigate();
  const { perm_id } = useParams();


  // navigate function
  const handleSearchClick = () => navigate('/search');
  // const handleCompareClick = () => navigate('/compare');
  const handleFrameworkClick = () => navigate('/frameworks');
  const handleBackClick = () => navigate(`/esgdetails/${perm_id}`);

  // get company information
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/api/query_data?perm_id=${perm_id}&limit=1`
        );
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          setCompanyInfo({
            company_name: result.data[0].company_name || '',
            headquarter_country: result.data[0].headquarter_country || '',
            industry: result.data[0].industry || ''
          });
        }
      } catch (error) {
        console.error('Error fetching company info:', error);
      }
    };
    
    if (perm_id) {
      fetchCompanyInfo();
    }
  }, [perm_id]);


  // get ESG score data
  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/api/query_data?perm_id=${perm_id}&limit=1000`
        );
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
          // handle score data
          const years = ['2016', '2017', '2018', '2019', '2020', '2021','2022','2023','2024'];
          const processedData = years.map(year => {
            const yearData = result.data[0] || {};
            return {
              year,
              E: yearData[`${year}_E_Marks`] || 0,
              S: yearData[`${year}_S_Marks`] || 0,
              G: yearData[`${year}_G_Marks`] || 0,
              total: (
                (yearData[`${year}_E_Marks`] || 0) +
                (yearData[`${year}_S_Marks`] || 0) +
                (yearData[`${year}_G_Marks`] || 0)
              ) / 3
            };
          });
          setScoreData(processedData);
        }
      } catch (error) {
        console.error('Error fetching score data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (perm_id) {
      fetchScores();
    }
  }, [perm_id]);

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
    <div>
      <header className="header">
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span className="logo">ecoM</span>
            <nav>
              <ul className="nav-menu">
                <li><a href="#" onClick={handleSearchClick}>SEARCH</a></li>
                {/* <li><a href="#" onClick={handleCompareClick}>COMPARE</a></li> */}
                <li><a href="#" onClick={handleFrameworkClick}>FRAMEWORK</a></li>
              </ul>
            </nav>
          </div>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="main-content p-6">
        <button 
          onClick={handleBackClick}
          className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to Details
        </button>

        <div className="card mb-6">
          <div className="card-header">
            <h2 className="company-name">{companyInfo.company_name}</h2>
          </div>
          <div className="company-info">
            <span>Headquarter Country: {companyInfo.headquarter_country}</span> | 
            <span>Industry: {companyInfo.industry}</span>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading score data...</div>
        ) : (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">ESG Scores by Year</h2>
            <div className="overflow-x-auto">
              <table className="metrics-table w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2">Year</th>
                    <th className="px-4 py-2 text-green-600">Environmental Score</th>
                    <th className="px-4 py-2 text-blue-600">Social Score</th>
                    <th className="px-4 py-2 text-purple-600">Governance Score</th>
                    <th className="px-4 py-2 text-gray-700">Average Score</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreData.map((row) => (
                    <tr key={row.year} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{row.year}</td>
                      <td className="px-4 py-2 text-green-600">
                        {row.E.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-blue-600">
                        {row.S.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-purple-600">
                        {row.G.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 font-medium">
                        {row.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ESGScores;
