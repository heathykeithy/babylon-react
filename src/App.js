import { useState } from 'react'

import './App.css'
import BabylonComponent from './scripts/setup'
import Controls from './components/gui'
import Puff from './components/puffAnimation'


function App() {

    const [scene, setScene] = useState({})
    const [canvas, setCanvas] = useState({})

    const handleBabscene = (data) => {
        setScene(data)
    }
    const handleCanvas = (data) => {
        setCanvas(data)
    }


    return (
        <div className="App">
            <Controls scene={scene} canvas={canvas}></Controls>
            {/* <Puff scene={scene}></Puff> */}
            <BabylonComponent babScene={handleBabscene} babCanvas={handleCanvas}>
            </BabylonComponent>

        </div>
    )

}

export default App
