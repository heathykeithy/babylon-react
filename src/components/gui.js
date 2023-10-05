import React, { useState, useEffect, useRef } from 'react'
import { createCube, changeColor, screenPos, } from '../scripts/setup'
import { GithubPicker } from 'react-color'



const Gui = ({ scene, canvas }) => {

    const [selected, setSelected] = useState({})
    const camera = scene.activeCamera
    const inputX = useRef(null)
    const inputY = useRef(null)
    const inputZ = useRef(null)
    const startingPoint = useRef(null)
    const currentMesh = useRef(null)
    const [count, setCount]  = useState(0)

    useEffect(() => {


        scene.onPointerDown = (event, pickResult) => {
            if (pickResult.hit) {
                console.log('Object clicked:', pickResult.pickedMesh.id)
                if (event.inputIndex === 4) { //right click
                    console.log('clicked left on ', pickResult.pickedMesh.id)
                }
                if (event.inputIndex === 2 && pickResult.pickedMesh.id.includes("box")) { //left click
                    console.log('clicked right:', pickResult.pickedMesh.id)
                    if (!Object.entries(selected).length) {
                        setSelected(pickResult.pickedMesh)
                        highlight(pickResult.pickedMesh)
                        pointerDown(pickResult.pickedMesh)
                        mouseDownEvents()
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

        const mouseDownEvents = () => {
            scene.onPointerUp = () => {
                pointerUp()
            }
            scene.onPointerMove = () => {
                pointerMove()
            }
        }

        const getGroundPosition = () => {
            // var pickinfo = scene.pick(scene.pointerX, scene.pointerY,  (mesh) => { return mesh === scene.meshes.ground })
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
                return
            }
        }

        const pointerMove = () => {
            if (!startingPoint.current) {
                return
            }
           // var current = getGroundPosition()
            if (!getGroundPosition()) {
                return
            }

            let diff = getGroundPosition().subtract(startingPoint.current)
            currentMesh.current.position.addInPlace(diff)
            startingPoint.current = getGroundPosition()
        }




    }, [scene, selected, canvas, camera])

    const highlight = (box) => {
        box.material.wireframe = true
    }
    const boxDeselected = (box) => {
        box.material.wireframe = false
    }

    const destory = (box) => {
        box.dispose()
        setSelected({})
        console.log(scene)
        setCount(count - 1)
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
    }

    const addCube = () => {
        createCube(mainColor)
        setCount(count + 1)
    }

    return (
        <div className="gui">
            <button
                className="button-87"
                onClick={() => addCube()}
            >Cube +</button>
            <h4>Object Count = {count}</h4>
            <div className="dimensions" style={Object.entries(selected).length ?
                { visibility: "visible", top: screenPos(selected)[1] + 80, left: screenPos(selected)[0] - 106 }
                : { visibility: "hidden" }}>
                <h2>{selected.id}
                </h2>

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