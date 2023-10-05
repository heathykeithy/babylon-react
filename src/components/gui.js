import React, { useState, useEffect, useRef } from 'react'
import { createCube } from '../scripts/setup'
import { GithubPicker } from 'react-color';



const Gui = ({guiProps}) => {


    // const clickHandler = useCallback((key) => {
    //     setShowHide(prevState => ({
    //       ...prevState,
    //       [key]: !prevState[key]
    //     }));
    //   }, []);


    const [mainColor, setMainColor] = useState("#1273de")

    const handleChangeComplete = (color) => {
        setMainColor(color.hex)
        console.log(color)
      };

    const addCube = () => {
        createCube(mainColor)
    }

    return (
        <div className="gui">
            <button
                className="button-87"
                onClick={() => addCube()}
            >Cube +</button>
            <div className="dimensions">
                <h1>{"Placeholder"}
                </h1>
                <label htmlFor="inputX">X</label>
                <input id="inputX" type='number' aria-label='X'></input>
                <label htmlFor="inputY">Y</label>
                <input id="inputY" type='number' aria-label='Y'></input>
                <label htmlFor="inputZ">Z</label>
                <input id="inputZ" type='number' aria-label='Z'></input>
                <GithubPicker onChangeComplete={handleChangeComplete}  >

                </GithubPicker>
            </div>

        </div>
    )
}

export default Gui