import React, { useState, useEffect } from 'react'
import { createCube } from '../scripts/setup'
import { GithubPicker } from 'react-color';



const Gui = ({ scene }) => {

    const [selected, setSelected] = useState({})

    useEffect(() => {
        scene.onPointerDown = (event, pickResult) => {
            if (pickResult.hit) {
                console.log('Object clicked:', pickResult.pickedMesh.id)
                if (event.inputIndex === 4) { //right click
                    console.log('clicked left on ', pickResult.pickedMesh.id)
                }
                if (event.inputIndex === 2 && pickResult.pickedMesh.id === "box") { //left click
                    console.log('clicked right:', pickResult.pickedMesh.id)
                    if (!Object.entries(selected).length) {
                        setSelected(pickResult.pickedMesh)
                        highlight(pickResult.pickedMesh)
                    }
                    else {
                        boxDeselected(selected)
                        setSelected(pickResult.pickedMesh)
                        highlight(pickResult.pickedMesh)
                    }
                }
                if (event.inputIndex === 2 &&
                    pickResult.pickedMesh.id &&
                    pickResult.pickedMesh.id !== "box" &&
                    Object.entries(selected).length) {
                        boxDeselected(selected)
                }
            }
        }
    }, [scene, selected])

    const highlight = (box) => {
        box.material.wireframe = true
    }
    const boxDeselected = (box) => {
        box.material.wireframe = false
    }

    const destory = (selected) =>{
        selected.dispose()
    }

    //TODO on click on box make material wireframe
    //click off the box revert color

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
            <div className="dimensions" style={Object.entries(selected).length? {visibility: "visible"}: {visibility: "hidden"}}>
                <h1>{selected.id}
                </h1>
                <label htmlFor="inputX">X</label>
                <input id="inputX" type='number' aria-label='X'></input>
                <label htmlFor="inputY">Y</label>
                <input id="inputY" type='number' aria-label='Y'></input>
                <label htmlFor="inputZ">Z</label>
                <input id="inputZ" type='number' aria-label='Z'></input>
                <GithubPicker onChangeComplete={handleChangeComplete}  >

                </GithubPicker>
                <button onClick={() => destory(selected)}
                >Delete</button>
            </div>

        </div>
    )
}

export default Gui