import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/styles.css';
import start_logo from './images/picodetect_logo_empty.png';
import icon from './images/picopals_icon.png';
import logo from './images/picodetect_logo.png';
import CustomFileUpload from './components/CustomFileUpload.jsx';

const App = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const cols = Array.from({ length: 12 }, (_, i) => i + 1);
    const [selectedWell, setSelectedWell] = useState('');
    const [time, setTime] = useState('');
    const [concentration, setConcentration] = useState('');
    const [antibioticType, setAntibioticType] = useState('');
    const [percentage, setPercentage] = useState(null);
    const [wellData, setWellData] = useState({});
    const [results, setResults] = useState({});
    const [isViewingResults, setIsViewingResults] = useState(false);
    const [wellConcentration, setWellConcentration] = useState({});
    const [isStarted, setIsStarted] = useState(false); 

    const handleWellClick = (well) => {
        if (!isViewingResults) {
            setSelectedWell(well);
            setTime('');
            setConcentration('');
            setPercentage(null);

            if (wellData[well]) {
                setAntibioticType(wellData[well][0].antibioticType);
                setConcentration(wellConcentration[well] || '');
            } else {
                setAntibioticType('');
                setConcentration('');
            }
        }
    };

    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('well', selectedWell);
        formData.append('antibioticType', antibioticType);

        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.data && response.data.percentage !== undefined) {
                setPercentage(response.data.percentage);
            } else {
                console.error('No percentage data in response');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const handleSave = () => {
        if (selectedWell && time && concentration && percentage !== null) {
            const newEntry = { time, concentration, percentage, antibioticType };

            if (!wellConcentration[selectedWell]) {
                setWellConcentration((prev) => ({
                    ...prev,
                    [selectedWell]: concentration,
                }));
            }

            setWellData((prev) => ({
                ...prev,
                [selectedWell]: prev[selectedWell]
                    ? [...prev[selectedWell], newEntry]
                    : [{ ...newEntry }],
            }));

            setSelectedWell('');
            setTime('');
            setConcentration('');
            setPercentage(null);
        }
    };

    const handleViewResults = async () => {
        setIsViewingResults(true);

        try {
            const response = await axios.post('http://localhost:5000/results', { wellData });
            setResults(response.data);
        } catch (error) {
            console.error('Error fetching results:', error);
        }
    };

    const handleReset = () => {
        setSelectedWell('');
        setTime('');
        setConcentration('');
        setAntibioticType('');
        setPercentage(null);
        setWellData({});
        setResults({});
        setWellConcentration({});
        setIsViewingResults(false);
        setIsStarted(false); 
    };

    const handleStart = () => {
        setIsStarted(true); 
    };

    return (
        <div className="app-container">
            {!isStarted ? (
                <div className="start-screen">
                    <div className="blurred-background"></div>
                    <img src={start_logo} alt="logo" className="logo" />
                    <img src={icon} alt="icon" className="icon" />
                    <button className="start-button" onClick={handleStart}>
                        Start
                    </button>
                </div>
            ) : (
                <>
                    <div className="left-section">
                        <div className="left-section-blurred-background"></div>
                        <img src={logo} alt="logo" className="logo" />
                        <h2>Selected Well: {selectedWell}</h2>
                        {selectedWell && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Antibiotic Type"
                                    value={antibioticType}
                                    onChange={(e) => setAntibioticType(e.target.value)}
                                    className="antibiotic-input"
                                    disabled={wellData[selectedWell]}
                                />

                                <input
                                    type="number"
                                    placeholder="Antibiotic Concentration (ug/mL)"
                                    value={concentration}
                                    onChange={(e) => setConcentration(e.target.value)}
                                    className="concentration-input"
                                    min="0"
                                    step="any"
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                                    }}
                                    disabled={!!wellConcentration[selectedWell]}
                                />
                                <input
                                    type="number"
                                    placeholder="Time Point"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="time-input"
                                    min="0"
                                    step="any"
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                                    }}
                                />
                                <CustomFileUpload onFileSelect={handleImageUpload} />
                                {percentage !== null && <p className="percentage-text">Bacteria Area Percentage: {percentage}%</p>}
                                <button className="save-button" onClick={handleSave}>
                                    Save
                                </button>
                            </>
                        )}
                        <div className="instructions">
                            <h3>Instructions:</h3>
                            <ol>
                                <li>Select a well</li>
                                <li>Enter the antibiotic type (only for the first entry), time point, antibiotic concentration, and upload image</li>
                                <li>Wait for a percentage to show up (may take a while as the model is hefty)</li>
                                <li>Press "Save" to save the percentage for that well at that time point</li>
                                <li>Continue adding data until finished. If there are multiple images for a well at one time point, enter them separately but use the same time point. The results will be averaged for that time point.</li>
                                <li>When all data is done uploading, press "View Results." All growing wells will be <span style={{ color: 'green' }}>GREEN</span> and all non-growing wells will be <span style={{ color: 'red' }}>RED</span>.</li>
                                <li>Press "Reset" to clear all fields and start over again.</li>
                            </ol>
                        </div>
                    </div>

                    <div className="right-section">
                        <div className="right-section-blurred-background"></div>
                        {rows.map(row => (
                            <div key={row} className="row">
                                {cols.map(col => {
                                    const well = `${row}${col}`;
                                    return (
                                        <div
                                            key={well}
                                            className={`well ${selectedWell === well ? 'highlighted' : ''} ${results[well] === 'green' ? 'green' : results[well] === 'red' ? 'red' : ''}`}
                                            onClick={() => handleWellClick(well)}
                                            style={{ pointerEvents: isViewingResults ? 'none' : 'auto' }}
                                        >
                                            {well}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    <div className="bottom-section">
                        <div className="bottom-section-blurred-background"></div>
                        <button onClick={handleViewResults} className="view-results-button">
                            View Results
                        </button>
                        <button onClick={handleReset} className="reset-button">
                            Reset
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default App;
