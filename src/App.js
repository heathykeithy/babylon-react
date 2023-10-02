import { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import setup from './scripts/setup';




function App() {
    const [IsReady, setIsReady] = useState(false)
    const [ShowHide, setShowHide] = useState(false)
    // const [windowSize, setWindowSize] = useState({
    //     width: window.innerWidth,
    //     height: window.innerHeight
    // });
    let windowSize = useRef([]);
    


    useEffect(() => {
        
        if(!IsReady){
            setup.setupBaby(document.querySelector('#renderCanvas'))
        }
        setIsReady(true);
        //handle rerender on window size change

        const printsize = () =>{
            windowSize = [window.innerWidth,window.innerHeight]
            console.log(windowSize)
            
        }

        // if(ShowHide){
        //     building.forEach(element => {
        //         element.isVisible = true
        //     });
        // }
        window.addEventListener('resize', printsize);

        // Cleanup 
        return () => {
            setIsReady(false);
           // window.removeEventListener('resize', updateWindowSize);
        };
    }, []);


    return (


        <div className="App">
            <canvas
                id="renderCanvas" >
            </canvas>
            <button
            id='show-hide'
            onClick={() => setShowHide(!ShowHide)}
            >
                show
                </button>
            {/* <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header> */}

        </div>

    );

}



export default App;
