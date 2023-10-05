import { useState, useCallback } from 'react';

import './App.css';
import BabylonComponent from './scripts/setup';
import Gui from './components/gui';


 function App() {
//     const [ShowHide, setShowHide] = useState({
//         "frame": true,
//         "window": true,
//         "door": true,
//         "wall": true
//     })


    // const clickHandler = useCallback((key) => {
    //     setShowHide(prevState => ({
    //       ...prevState,
    //       [key]: !prevState[key]
    //     }));
    //   }, []);

    return (
        <div className="App">
            <Gui ></Gui>
            <BabylonComponent >
            </BabylonComponent>
        </div>
    );

}

export default App;
