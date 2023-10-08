import React, { useState, useEffect, useRef } from 'react'
import { createCube, changeColor, screenPos, scaleAnimation, extrudeCap } from '../scripts/setup'
import { GithubPicker } from 'react-color'
import addcudeUI from '../assets/UI/AddCube.svg'
import extrudeCapUI from '../assets/UI/ExtrudeCap.svg'





/**
 * Handle UI and mouse interactions
 * @param {object} scene from parent 
 * @param {object} canvas from parent 
 * @returns 
 */

const Gui = ({ scene, canvas }) => {

    const [selected, setSelected] = useState({})
    const camera = scene.activeCamera
    const inputX = useRef(null)
    const inputY = useRef(null)
    const inputZ = useRef(null)
    const startingPoint = useRef(null)
    const currentMesh = useRef(null)
    const [count, setCount] = useState(0)
    const [capCount, setCapCount] = useState(0)

    useEffect(() => {

        //click functions 
        scene.onPointerDown = (event, pickResult) => {
            if (pickResult.hit) {
                console.log('Object clicked:', pickResult.pickedMesh.id)
                if (event.inputIndex === 4) { //right click
                    //not used
                }
                if (event.inputIndex === 2) {//left click
                    if (pickResult.pickedMesh.id.includes("box")
                        || pickResult.pickedMesh.id.includes("extruded")) {
                        //nothing selected
                        if (!Object.entries(selected).length) {
                            setSelected(pickResult.pickedMesh)
                            highlight(pickResult.pickedMesh)
                        }
                        else {//select new box to replace selected
                            if (selected.id !== pickResult.pickedMesh.id) {
                                clearInputs()
                                boxDeselected(selected)
                                setSelected(pickResult.pickedMesh)
                                highlight(pickResult.pickedMesh)
                            }
                            //clicking on already selected
                            //get face
                            console.log(pickResult.faceId) //TODO add face changing
                        }
                        pointerDown(pickResult.pickedMesh)
                        mouseDownEvents()
                    }
                    else { //if click off a box, deselect
                        if (Object.entries(selected).length) {
                            clearInputs()
                            boxDeselected(selected)
                            setSelected({})
                        }
                    }
                }
            }
        }

        const mouseDownEvents = () => {
            scene.onPointerUp = () => {
                pointerUp()
            }
            scene.onPointerMove = () => {
                pointerMove()
            }
        }

        const getGroundPosition = () => {
            var pickinfo = scene.pick(scene.pointerX, scene.pointerY, 0)
            if (pickinfo.hit) {
                return pickinfo.pickedPoint
            }
            return null
        }

        //grab mesh and disconnect camera
        const pointerDown = (mesh) => {
            currentMesh.current = mesh
            startingPoint.current = getGroundPosition()
            if (startingPoint) {
                setTimeout(function () {
                    camera.detachControl(canvas)
                }, 0)
            }
        }

        //reconnect camera
        const pointerUp = () => {
            if (startingPoint.current) {
                camera.attachControl(canvas, true)
                startingPoint.current = null
                // if (selected.position.y < selected.scaling.y / 2) {
                //     selected.position = new Vector3(selected.position.x,
                //         selected.scaling.y / 2,
                //         selected.position.z)
                // }
                return
            }
        }

        //drag box
        const pointerMove = () => {
            if (!startingPoint.current) {
                return
            }
            if (!getGroundPosition()) {
                return
            }

            let diff = getGroundPosition().subtract(startingPoint.current)
            currentMesh.current.position.addInPlace(diff)
            startingPoint.current = getGroundPosition()
        }

        //update gui panel position
        // const updatePanel = () => {
        //     if(Object.entries(selected).length){

        //     }
        // }

    }, [scene, selected, canvas, camera])

    const highlight = (mesh) => {
        mesh.material.wireframe = true
    }


    const clearInputs = () => {
        document.querySelector('#inputX').value = ''
        document.querySelector('#inputY').value = ''
        document.querySelector('#inputZ').value = ''
    }

    const boxDeselected = (mesh) => {
        mesh.material.wireframe = false

    }

    const destory = (mesh) => {
        mesh.dispose()
        setSelected({})
        if (selected.id.includes("box")) {

            setCount(count - 1)
        }
        else {
            setCapCount(capCount - 1)
        }
    }


    const scale = (axis, value) => {
        if (value === '' || value == 0) {
            value = 0.1
        }
        const property = "scaling." + axis
        scaleAnimation(selected, property, selected.scaling[axis], value)
        if (axis === 'y') {
            selected.position.y = value / 2 //keep box on the ground
        }
    }

    const [mainColor, setMainColor] = useState("#1273de")

    const handleChangeComplete = (color) => {
        setMainColor(color.hex)
        if (Object.entries(selected).length) {
            changeColor(selected, color.hex, selectedCheckbox)
        }
    }

    const addCube = () => {
        createCube(mainColor)
        setCount(count + 1)

        // console.log(JSON.stringify(scene))
    }
    const cloneObject = (copy) => {
        const color = copy.material.albedoColor
        if (selected.id.includes("box")) {
            createCube(color, copy)
            setCount(count + 1)
        }
        else {
            extrudeCap(2, color, copy)
            setCapCount(capCount + 1)
        }
    }

    const addExtruded = (depth) => {
        extrudeCap(depth, mainColor)
        setCapCount(capCount + 1)
    }

    const handleCheckboxes = (value) => {
        setSelectedCheckbox(value)
    }

    const [selectedCheckbox, setSelectedCheckbox] = useState("surface");



    return (
        <div className="gui">
            <button
                className="buttonSN upper"
                onClick={() => addCube()}
            >{count + " "}
                <img src={addcudeUI} alt='Cube +'></img>
            </button>
            <button
                className="buttonSN lower"
                onClick={() => addExtruded(2)}
            >{capCount + " "}
                <img src={extrudeCapUI} alt='Extrude Cap +'></img>
            </button>
            <div className="dimensions" style={Object.entries(selected).length ?
                { visibility: "visible", top: screenPos(selected)[1] + 80, left: screenPos(selected)[0] - 106 }
                : { visibility: "hidden" }}>
                <h2>{selected.id}
                </h2>
                <div>
                    <label htmlFor="inputX">X</label>
                    <input id="inputX" type='number'
                        placeholder={Object.entries(selected).length ? selected.scaling.x : 1}
                        ref={inputX} aria-label='X'
                        onChange={(e) => scale('x', e.target.value)}
                    >
                    </input>
                    <label htmlFor="inputY">Y</label>
                    <input id="inputY" type='number'
                        placeholder={Object.entries(selected).length ? selected.scaling.y : 1}
                        ref={inputY} aria-label='Y' onChange={(e) => scale('y', e.target.value)}
                    ></input>
                    <label htmlFor="inputZ">Z</label>
                    <input id="inputZ" type='number'
                        placeholder={Object.entries(selected).length ? selected.scaling.z : 1}
                        ref={inputZ} aria-label='Z' onChange={(e) => scale('z', e.target.value)}
                    ></input>
                </div>
                <input type="checkbox" id="surface" name="surface" value="surface" checked={selectedCheckbox === "surface"} onChange={() => handleCheckboxes("surface")}></input>
                <label for="surface">Surface</label>
                <input type="checkbox" id="edge" name="edge" value="edge" checked={selectedCheckbox === "edge"} onChange={() => handleCheckboxes("edge")}></input>
                <label for="edge">Edges</label>
                <GithubPicker triangle='hide' onChangeComplete={handleChangeComplete}  >
                </GithubPicker>
                <button onClick={() => destory(selected)}
                >Delete</button>
                <button onClick={() => cloneObject(selected)}
                >Copy</button>
            </div>


        </div>
    )
}

export default Gui