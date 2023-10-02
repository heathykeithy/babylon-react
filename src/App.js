import { useState } from 'react';

import './App.css';
import  BabylonComponent from './scripts/setup';

function App() {
    const [ShowHide, setShowHide] = useState(false)


    return (
        <div className="App">
            <BabylonComponent></BabylonComponent>
            <button
            id='show-hide'
            onClick={() => setShowHide(!ShowHide)}
            >
                show
                </button>
        </div>
    );

}



export default App;
