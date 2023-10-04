import React, { useState, useEffect, useRef } from 'react'

import {
    Engine,
    Scene,
    ArcRotateCamera,
    HemisphericLight,
    Vector3,
    CreateGround,
    CreateSphere,
    Tools,
    PBRMaterial,
    WebGPUEngine,
    SceneLoader,
    Color3,
    StandardMaterial,
    MeshBuilder,
    CubeTexture,
    Texture,
    Space,
} from "@babylonjs/core"
import "@babylonjs/loaders"


const BabylonComponent = ({ hideflags }) => {

    let scene = {}
    const [babylonObjects, setBabylonObjects] = useState([])
    const renderCanvas = useRef(null)
    const webGL = useRef(false)
    let resizeTimeout
    let windowSize = []
    let orange = {}

    const sceneBuild = (engine, canvas) => {
        //scene
        scene = new Scene(engine)

        //camera
        let camera = new ArcRotateCamera("camera", Tools.ToRadians(45), Tools.ToRadians(65), 10, Vector3.Zero(), scene)
        camera.setTarget(Vector3.Zero())
        camera.attachControl(canvas, true)
        //lights
        let light = new HemisphericLight("light1", new Vector3(0, 1, 1), scene)
        light.intensity = 0.7

        //materials
        let pbr = new PBRMaterial()
        pbr.albedoColor = new Color3(1, 0.5, 0)
        pbr.metallic = 0.1
        pbr.roughness = 0.1
        orange.current = pbr

        let brown = orange.current.clone("brownMaterial")
        brown.albedoColor = new Color3(0.7, 0.1, 0)

        //3d objects
        let sphere = CreateSphere("sphere1", { segments: 16, diameter: 2 }, scene)
        sphere.position.y = 2
        sphere.material = pbr

        // ground
        let ground = CreateGround("ground1", { width: 256, height: 256, subdivisions: 2 }, scene)
        ground.material = brown

        //environment 
        const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene)
        const skyboxMaterial = new StandardMaterial("skyBox", scene)
        skyboxMaterial.backFaceCulling = false
        skyboxMaterial.reflectionTexture = new CubeTexture("./media/textures/skybox/skybox", scene)
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0)
        skyboxMaterial.specularColor = new Color3(0, 0, 0)
        skybox.material = skyboxMaterial

        //custom mesh loading
        let building = {}
        loadMeshes(building, "./media/", "building.glb", scene)

        setBabylonObjects([...babylonObjects, ground, camera, building])

        //resize engine render on window resize release
        const handleResize = () => {
            clearTimeout(resizeTimeout)
            // eslint-disable-next-line react-hooks/exhaustive-deps
            resizeTimeout = setTimeout(() => {
                windowSize.current = [window.innerWidth, window.innerHeight]
                engine.resize()
            }, 200)
        }
        window.addEventListener('resize', handleResize)

        engine.runRenderLoop(() => {
            scene.render()
        })

        return () => {
            engine.dispose()
        }
    }

    //webGPU engine
    const createSceneGPU = async () => {
        const { current: canvas } = renderCanvas
        const engine = new WebGPUEngine(canvas)
        await engine.initAsync()
        sceneBuild(engine, canvas)
    }

    //webGPU engine
    const createSceneWebGL = () => {
        const { current: canvas } = renderCanvas
        const engine = new Engine(canvas, true)
        sceneBuild(engine, canvas)
    }


    function isSupportedBrowser() {

        let userAgent = navigator.userAgent
        if (
            (userAgent.includes("CriOS")) || 
            userAgent.includes("Android") ||
            userAgent.includes("SamsungBrowser") ||
            userAgent.includes("iPhone") 

        ) {
            return false
        }
        let chromeMatch = userAgent.match(/Chrome\/(\d+)/)
        let edgeMatch = userAgent.match(/Edge\/(\d+)/)
        let firefoxMatch = userAgent.match(/Firefox\/(\d+)/)
        let operaMatch = userAgent.match(/OPR\/(\d+)/)
        if (
            (chromeMatch && parseInt(chromeMatch[1], 10) >= 113) ||
            (edgeMatch && parseInt(edgeMatch[1], 10) >= 113) ||
            (firefoxMatch && parseInt(firefoxMatch[1], 10) >= 113) ||
            (operaMatch && parseInt(operaMatch[1], 10) >= 100)
        ) {
            return true
        } else {
            return false
        }
    }



    //entry point
    useEffect(() => {
        if (Object.keys(scene).length === 0) {
            if (!isSupportedBrowser()) {
                console.warn("WebGPU not supported by browser")
                createSceneWebGL() //with webGL
                webGL.current = true
                return
            }
            if (!navigator.gpu) {
                console.warn("WebGPU not supported.")
                console.warn("Switching to WebGL")
                createSceneWebGL() //with webGL
                webGL.current = true
            }
            else {
                console.log("Using WebGPU")
                createSceneGPU() //with webGPU
            }
        }

    }, [])

    //show or hide meshes
    if (babylonObjects[2]) {
        let checkvalid = false //HACk had to check if each object are valid first, workaroud error
        babylonObjects[2].Frame ? babylonObjects[2].Frame.isVisible = hideflags.frame : checkvalid = true
        babylonObjects[2].windowsmesh ? babylonObjects[2].windowsmesh.isVisible = hideflags.window : checkvalid = true
        babylonObjects[2].door ? babylonObjects[2].door.isVisible = hideflags.door : checkvalid = true
        babylonObjects[2].Wall ? babylonObjects[2].Wall.isVisible = hideflags.wall : checkvalid = true
    }

    function loadMeshes(obj, path, filename, scene) {
        // obj.file = await SceneLoader.AppendAsync("")
        obj.file = SceneLoader.ImportMesh("", path, filename, scene, (meshes, ps, sk, ani) => {
            console.log("Meshes", meshes)
            console.log("Ani", ani)
            let side = 0
            meshes.forEach(element => {
                obj[element.name] = scene.getMeshByName(element.name)
                console.log(element.name)
                element.material = orange.current
                element.scaling = new Vector3(2, 2, 2)
                element.rotate(new Vector3(0, 1, 0), Tools.ToRadians(side), Space.WORLD)
                side = side + 90
            })
            console.log(obj)
        })
    }

    return (
        <div>
            <canvas
                ref={renderCanvas}
                id="renderCanvas"
            >
            </canvas>
            <p id="renderType">{webGL.current ? "Browser or GPU not supported, falling back to WebGL from WebGPU" : "Running on WebGPU"}</p>
        </div>
    )
}

export default BabylonComponent




