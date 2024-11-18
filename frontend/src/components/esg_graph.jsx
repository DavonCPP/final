import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import '../styles/ESGDetails.css'; 

const ESGMetricsCharts = () => {
  const { perm_id } = useParams();
  console.log(perm_id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState({
    environmental: [],
    social: [],
    governance: []
  });
  const [companyInfo, setCompanyInfo] = useState({
    company_name: '',
    headquarter_country: '',
    industry: ''
  });

  const years = ['2019', '2020', '2021', '2022', '2023'];
  const pillars = {
    'E': 'environmental',
    'S': 'social',
    'G': 'governance'
  };

  const handleBackClick = () => {
    navigate(`/esgdetails/${perm_id}`);
  };

  const handleSearchClick = () => navigate('/search');
  // const handleCompareClick = () => navigate('/compare');
  const handleFrameworkClick = () => navigate('/frameworks');

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


  // get ESG data and create as chart format
  useEffect(() => {
    const fetchAllMetricsData = async () => {
      setLoading(true);
      try {
        const data = {
          environmental: {},
          social: {},
          governance: {}
        };

        for (const [pillar, category] of Object.entries(pillars)) {
          for (const year of years) {
            const response = await fetch(
              `http://127.0.0.1:5000/api/query_data?perm_id=${perm_id}&pillar=${pillar}&year=${year}&limit=1000`
            );
            const result = await response.json();

            if (result.data) {
              result.data.forEach(metric => {
                const value = parseFloat(metric.metric_value);
                if (!isNaN(value)) { // only add valid values
                  if (!data[category][metric.metric_name]) {
                    data[category][metric.metric_name] = {
                      name: metric.metric_name,
                      unit: metric.metric_unit,
                      yearlyData: []
                    };
                  }
                  
                  data[category][metric.metric_name].yearlyData.push({
                    year,
                    value: value
                  });
                }
              });
            }
          }
        }


        // change into array format
        const formattedData = {};
        for (const category in data) {
          formattedData[category] = Object.values(data[category]).filter(
            metric => metric.yearlyData.length > 0 // only remain the metrics with data
          );
        }

        setMetricsData(formattedData);
      } catch (error) {
        console.error('Error fetching metrics data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (perm_id) {
      fetchAllMetricsData();
    }
  }, [perm_id]);

  const renderMetricChart = (metric) => (
    <div key={metric.name} className="card p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">{metric.name}</h3>
      <div style={{ height: '300px', width: '100%' }}>
        <ResponsiveContainer>
          <BarChart data={metric.yearlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis 
              label={{ 
                value: metric.unit, 
                angle: -90, 
                position: 'insideLeft',
                offset: -5
              }}
            />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="value"
              fill="#3b82f6"
              name={metric.name}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

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
    <div className="min-h-screen">
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
          className="action-button download-button mb-8"

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
          <div className="loading">Loading metrics data...</div>
        ) : (
          <div className="space-y-8">
            {Object.entries(metricsData).map(([category, metrics]) => (
              metrics.length > 0 && (
                <div key={category}>
                  <h2 className="text-xl font-bold mb-4">
                    {category.charAt(0).toUpperCase() + category.slice(1)} Metrics
                  </h2>
                  <div className="grid grid-cols-1 gap-6">
                    {metrics.map(renderMetricChart)}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ESGMetricsCharts;