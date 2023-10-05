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
const [scene,setScene] = useState({})

    const handleBabscene = (data) =>{
        setScene(data)
    }
    // const clickHandler = useCallback((key) => {
    //     setShowHide(prevState => ({
    //       ...prevState,
    //       [key]: !prevState[key]
    //     }));
    //   }, []);

    return (
        <div className="App">
            <Gui scene={scene}></Gui>
            <BabylonComponent babScene={handleBabscene}>
            </BabylonComponent>
        </div>
    );

}

export default App;
