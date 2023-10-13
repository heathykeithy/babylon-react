import React, { useState, useEffect, useRef } from 'react'
import { createCube, changeColor, screenPos, scaleAnimation, extrudeCap, faceColorChange, updateLinesPositions,updateText } from '../scripts/setup'
import { GithubPicker } from 'react-color'
import addcudeUI from '../assets/UI/AddCube.svg'
import extrudeCapUI from '../assets/UI/ExtrudeCap.svg'
import refreshUI from '../assets/UI/arrows-rotate.svg'
import { Color3, Vector3 } from '@babylonjs/core'





/**
 * Handle UI and mouse interactions
 * @param {object} scene from parent 
 * @param {object} canvas from parent 
 * @returns 
 */

const Controls = ({ scene, canvas }) => {

    const [selected, setSelected] = useState({})
    const [faceSelected, setFaceSelected] = useState(null)
    const camera = scene.activeCamera
    const inputX = useRef(null)
    const inputY = useRef(null)
    const inputZ = useRef(null)
    const startingPoint = useRef(null)
    const currentMesh = useRef(null)
    const [count, setCount] = useState(0)
    const [capCount, setCapCount] = useState(0)
    const screenVector = useRef([0, 0])


    useEffect(() => {

        //click functions 
        scene.onPointerDown = (event, pickResult) => {
            if (pickResult.hit) {
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
                            } else {
                                setFaceSelected(pickResult.faceId)
                            }
                        }
                        pointerDown(pickResult.pickedMesh)
                        mouseDownEvents(pickResult.pickedMesh)
                    }
                    else { //if click off a box, deselect
                        if (Object.entries(selected).length) {
                            clearInputs()
                            boxDeselected(selected)
                            setSelected({})
                            setFaceSelected(null)
                        }
                    }
                }
            }
        }




        const mouseDownEvents = (mesh) => {
            scene.onPointerUp = () => {
                pointerUp(mesh)
            }
            scene.onPointerMove = () => {
                pointerMove(mesh)
                updateLinesPositions(mesh)
                updateLinesPositions(mesh, mesh.id.includes("extruded")? true: false )
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
        const pointerUp = (mesh) => {
            if (startingPoint.current) {
                camera.attachControl(canvas, true)
                startingPoint.current = null
                if (mesh.position.y < mesh.scaling.y / 2) {
                    mesh.position = new Vector3(mesh.position.x,
                        mesh.scaling.y / 2, mesh.position.z)
                }

                return
            }
        }

        //drag box
        const pointerMove = (mesh) => {
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
        if (Object.entries(selected).length) {
            screenVector.current = screenPos(selected)
        }


    }, [scene, selected, canvas, camera])




    const highlight = (mesh) => {
        mesh.edgesWidth = 12
    }


    const clearInputs = () => {
        document.querySelector('#inputX').value = ''
        document.querySelector('#inputY').value = ''
        document.querySelector('#inputZ').value = ''
    }

    const boxDeselected = (mesh) => {
        mesh.edgesWidth = 4.0
    }

    const destory = (mesh) => {
        //TODO foreach line in mesh dispose
        mesh.dispose()
        setSelected({})
        if (selected.id.includes("box")) {

            setCount(count - 1)
        }
        if(selected.id.includes("extruded")) {
            setCapCount(capCount - 1)
        }
    }


    const scale = (axis, value) => {

        const offset = 0.5

        // if (value === '' || value == 0) {
        //     value = parseFloat(0.1)
        // }
        // value = parseFloat(value)
        // const property = "scaling." + axis
        // //const propertyPos = "position." + axis
        // //mesh
        // scaleAnimation(selected, property, selected.scaling[axis], value)


        // //lines scale
        // scaleAnimation(selected.lines[axis], property, selected.scaling[axis], value)
        // //lines posistion
        // updateLinesPositions(currentMesh.current)
        // updateText(selected.lines[axis].text, value + "m")

        // if (axis === 'y') {

        //     selected.position.y = value / 2 //keep box on the ground
        // }

        if (value === '' || value == 0) {
            value = parseFloat(0.1)
        }
        value = parseFloat(value)
        const property = "scaling." + axis
        //const propertyPos = "position." + axis
        //mesh
        scaleAnimation(currentMesh.current, property, currentMesh.current.scaling[axis], value)

        //lines scale
        scaleAnimation(currentMesh.current.lines[axis], property, currentMesh.current.scaling[axis], value)
        //lines posistion
        updateLinesPositions(currentMesh.current, currentMesh.current.id.includes("extruded")? true: false )
        updateText(currentMesh.current.lines[axis].text, value + "m")

        if (axis === 'y') {

            currentMesh.current.position.y = value / 2 //keep box on the ground
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
        let color
        if (copy.material) {
            color = copy.material.albedoColor
        }
        else {
            color = new Color3(1, 1, 1)
        }
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



    const deleteAll = () => {
        let newObjects = []
        const keywords = ["extruded", "box", "lines", "textplane"];
        //group all added objects by name 
        for (let i = 0; i < scene.meshes.length; i++) {
            if (keywords.some(keyword => scene.meshes[i].name.includes(keyword))) {
                newObjects.push(scene.meshes[i])
            }
        }
        newObjects.forEach(element => {
            element.dispose()
        })
        setCount(0)
        setCapCount(0)
    }

    const handleCheckboxes = (value) => {
        setSelectedCheckbox(value)
    }

    const handleFaceChange = (color) => {
        faceColorChange(selected, faceSelected, color)
    }

    const [selectedCheckbox, setSelectedCheckbox] = useState("surface");

    //screenPos(selected)

    return (
        <div className="gui">
            <button
                className="buttonSN upper"
                onClick={() => addCube()}
            >{count + " "}
                <img src={addcudeUI} alt='Cube +'></img>
            </button>
            <button
                className="buttonSN middle"
                onClick={() => addExtruded(2)}
            >{capCount + " "}
                <img src={extrudeCapUI} alt='Extrude Cap +'></img>
            </button>
            <button
                className="buttonSN lower "
                onClick={() => deleteAll()}
            >
                <img className='icon' src={refreshUI} alt='Refreash'></img>
            </button>
            <div className="dimensions" style={Object.entries(selected).length ?
                { visibility: "visible", top: screenPos(selected)[1] + 80, left: screenPos(selected)[0] - 120 }
                : { visibility: "hidden" }}>
                <h2>{selected.id}
                </h2>
                <div>
                    <label htmlFor="inputX">X</label>
                    <input id="inputX" type='number'
                        placeholder={Object.entries(selected).length ? selected.scaling.x : 1}
                        ref={inputX} aria-label='X'
                        // onChange={(e) => scale('x', e.target.value)}
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
                <label htmlFor="surface">Surface</label>
                <input type="checkbox" id="edge" name="edge" value="edge" checked={selectedCheckbox === "edge"} onChange={() => handleCheckboxes("edge")}></input>
                <label htmlFor="edge">Edges</label>
                <GithubPicker triangle='hide' onChangeComplete={handleChangeComplete}  >
                </GithubPicker>
                <button onClick={() => destory(selected)}
                >Delete</button>
                <button onClick={() => cloneObject(selected)}
                >Copy</button>
            </div>
            <div className='face-popup' style={faceSelected != null && Object.entries(selected).length ? //if face selected and object selected
                { visibility: "visible", top: screenPos(selected)[1] - 250, left: screenPos(selected)[0] - 120 }
                : { visibility: "hidden" }}>
                <h2>Face Color</h2>
                <GithubPicker triangle='hide' onChangeComplete={handleFaceChange}  >
                </GithubPicker>
            </div>


        </div>
    )
}

export default Controls