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
//import { init } from './checkgpu'

let orange = {}

const BabylonComponent = ({ hideflags }) => {

    const [scene, setScene] = useState(null)
    const [GPUengine, setGPUengine] = useState({})
    const [babylonObjects, setBabylonObjects] = useState([])
    const renderCanvas = useRef(null);
    let resizeTimeout
    let windowSize = useRef([]);


    useEffect(() => {
        const createScene = async (GPU) => {
            console.log("building scene")
            const { current: canvas } = renderCanvas
            var engine 
            if(GPU){
                engine = new WebGPUEngine(canvas)
                await engine.initAsync()
            }
            else{
                engine = new Engine(canvas)
            }

            //scene
            const newScene = new Scene(engine)

            //camera
            var camera = new ArcRotateCamera("camera", Tools.ToRadians(45), Tools.ToRadians(65), 10, Vector3.Zero(), newScene)
            camera.setTarget(Vector3.Zero())
            camera.attachControl(canvas, true)
            //lights
            var light = new HemisphericLight("light1", new Vector3(0, 1, 1), newScene)
            light.intensity = 0.7

            //materials
            var pbr = new PBRMaterial()
            pbr.albedoColor = new Color3(1, 0.5, 0)
            pbr.metallic = 0.1
            pbr.roughness = 0.1
            orange = pbr

            var brown = orange.clone("brownMaterial");
            brown.albedoColor = new Color3(0.7, 0.1, 0);

            //3d objects
            var sphere = CreateSphere("sphere1", { segments: 16, diameter: 2 }, newScene)
            sphere.position.y = 2
            sphere.material = pbr

            // ground
            var ground = CreateGround("ground1", { width: 256, height: 256, subdivisions: 2 }, newScene)
            ground.material = brown

            //environment 
            const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, newScene);
            const skyboxMaterial = new StandardMaterial("skyBox", newScene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.reflectionTexture = new CubeTexture("./media/textures/skybox/skybox", newScene);
            skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
            skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
            skyboxMaterial.specularColor = new Color3(0, 0, 0);
            skybox.material = skyboxMaterial;

            //custom mesh loading
            var building = {}
            loadMeshes(building, "./media/", "building.glb", newScene)
            setGPUengine(engine)
            setScene(newScene)
            setBabylonObjects([...babylonObjects, ground, camera, building]);

            //resize engine render on window resize release
            const handleResize = () => {
                clearTimeout(resizeTimeout);
                // eslint-disable-next-line react-hooks/exhaustive-deps
                resizeTimeout = setTimeout(() => {
                    windowSize.current = [window.innerWidth, window.innerHeight];
                    engine.resize();
                }, 200);
            };
            window.addEventListener('resize', handleResize);

            return () => {
                engine.dispose()
                GPUengine.dispose() // Cleanup the engine when the component unmounts
            }
        }
        if (!scene) {
            if (!navigator.gpu) {
                console.warn("WebGPU not supported.")
                console.warn("Switching to WebGL")
                createScene(false) //with webGL
            }
            else{
                console.log("Using WebGPU")
                createScene(true) //with LwebGPU
            }
            
        }

    }, [])

    if (scene) {
        GPUengine.runRenderLoop(() => {
            //  rotateRender(babylonObjects[0])
            scene.render()
        })
    }

    //show or hide meshes
    useEffect(() => {

        if (babylonObjects[2]) {
            let x = 0
            babylonObjects[2].Frame ? babylonObjects[2].Frame.isVisible = hideflags.frame : x = true
            babylonObjects[2].windowsmesh ? babylonObjects[2].windowsmesh.isVisible = hideflags.window : x = true
            babylonObjects[2].door ? babylonObjects[2].door.isVisible = hideflags.door : x = true
            babylonObjects[2].Wall ? babylonObjects[2].Wall.isVisible = hideflags.wall : x = true
        }
    }, [hideflags])

    return (
        <div>
            <canvas
                ref={renderCanvas}
                id="renderCanvas"
            >
            </canvas>
        </div>
    )
}

export default BabylonComponent

function rotateRender(mesh) {
    mesh.rotate(new Vector3(0, 1, 0), 0.002)
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
            element.material = orange
            element.scaling = new Vector3(2, 2, 2)
            element.rotate(new Vector3(0, 1, 0), Tools.ToRadians(side), Space.WORLD)
            side = side + 90
        })
        console.log(obj)
    })
}

