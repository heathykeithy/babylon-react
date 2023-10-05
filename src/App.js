import { useState } from 'react'

import './App.css'
import BabylonComponent from './scripts/setup'
import Gui from './components/gui'


 function App() {

const [scene,setScene] = useState({})
const [canvas,setCanvas] = useState({})

    const handleBabscene = (data) =>{
        setScene(data)
    }
    const handleCanvas = (data) =>{
        setCanvas(data)
    }


    return (
        <div className="App">
            <Gui scene={scene} canvas={canvas}></Gui>
            <BabylonComponent babScene={handleBabscene} babCanvas={handleCanvas}>
            </BabylonComponent>
        </div>
    )

}

export default App
