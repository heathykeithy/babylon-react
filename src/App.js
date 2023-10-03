import { useState, useCallback } from 'react';

import './App.css';
import BabylonComponent from './scripts/setup';


function App() {
    const [ShowHide, setShowHide] = useState({
        "frame": true,
        "window": true,
        "door": true,
        "wall": true
    })


    const clickHandler = useCallback((key) => {
        setShowHide(prevState => ({
          ...prevState,
          [key]: !prevState[key]
        }));
      }, []);

    return (
        <div className="App">
            <div className="gui">
                <button
                    id='show-hide'
                    className="button-87"
                    onClick={() => clickHandler('frame')}
                    >
                    Frame
                </button>
            </div>
            <BabylonComponent hideflags={ShowHide}>
            </BabylonComponent>
        </div>
    );

}

export default App;
