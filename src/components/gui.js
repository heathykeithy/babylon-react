import React, { useState, useEffect, useRef } from 'react'
import { createCube, changeColor, screenPos } from '../scripts/setup'
import { GithubPicker } from 'react-color';



const Gui = ({ scene }) => {

    const [selected, setSelected] = useState({})
    const inputX = useRef(null)
    const inputY = useRef(null)
    const inputZ = useRef(null)

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
                    setSelected({})
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

    const destory = (box) => {
        box.dispose()
        setSelected({})
    }


    const scale = (box, axis, value) => {
        box.scaling[axis] = value
        if (axis === 'y') {
            box.position.y = value / 2 //keep box on the ground
        }
    }


    const [mainColor, setMainColor] = useState("#1273de")

    const handleChangeComplete = (color) => {
        setMainColor(color.hex)
        if (Object.entries(selected).length) {
            changeColor(selected, color.hex)
        }
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
            <div className="dimensions" style={Object.entries(selected).length ?
                { visibility: "visible", top: screenPos(selected)[1] +80, left: screenPos(selected)[0] - 106 }
                : { visibility: "hidden" }}>
                {/* <h2>{selected.id}
                </h2> */}

                <div>
                    <label htmlFor="inputX">X</label>
                    <input id="inputX" type='number'
                        placeholder={Object.entries(selected).length ? selected.scaling.x : 0}
                        ref={inputX} aria-label='X' onChange={(e) => scale(selected, 'x', e.target.value)}></input>
                    <label htmlFor="inputY">Y</label>
                    <input id="inputY" type='number'
                        placeholder={Object.entries(selected).length ? selected.scaling.y : 0}
                        ref={inputY} aria-label='Y' onChange={(e) => scale(selected, 'y', e.target.value)}></input>
                    <label htmlFor="inputZ">Z</label>
                    <input id="inputZ" type='number'
                        placeholder={Object.entries(selected).length ? selected.scaling.z : 0}
                        ref={inputZ} aria-label='Z' onChange={(e) => scale(selected, 'z', e.target.value)}></input>
                </div>
                <GithubPicker triangle='hide' onChangeComplete={handleChangeComplete}  >
                </GithubPicker     >
                <button onClick={() => destory(selected)}
                >Delete</button>
            </div>

        </div>
    )
}

export default Gui