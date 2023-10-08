import React, { useState, useEffect, useRef } from 'react'
import star from '../assets/solidStar.png'
import sun from '../assets/sun.png'


import {
    Engine,
    Scene,
    Mesh,
    ArcRotateCamera,
    Vector3,
    CreateGround,
    Tools,
    PBRMaterial,
    WebGPUEngine,
    SceneLoader,
    Color3,
    Color4,
    StandardMaterial,
    MeshBuilder,
    CubeTexture,
    Texture,
    Space,
    Matrix,
    ShadowGenerator,
    DirectionalLight,
    Animation,
    ParticleSystem,
    VolumetricLightScatteringPostProcess,
    SSAORenderingPipeline,
    VertexBuffer,
    GlowLayer
} from "@babylonjs/core"
import "@babylonjs/loaders"


let scene = {}
let shadowGenerator = {}
let camera = {}
let ssao = {}


/**
 * 
 * @param {object} scene prop to partent 
 * @param {object} canvas prop to partent 
 * @returns 
 */
const BabylonComponent = ({ babScene, babCanvas }) => {

    //  let scene = {}

    // const [babylonObjects, setBabylonObjects] = useState([])
    const renderCanvas = useRef(null)
    const webGL = useRef(false)
    let resizeTimeout
    let windowSize = []
    let orange = {}


    const sceneBuild = (engine, canvas) => {
        //scene
        scene = new Scene(engine)
        babScene(scene)
        //camera
        camera = new ArcRotateCamera("camera", Tools.ToRadians(45), Tools.ToRadians(65), 10, Vector3.Zero(), scene)
        camera.setTarget(Vector3.Zero())
        camera.attachControl(canvas, true)


        //lights
        const light = new DirectionalLight("dir01", new Vector3(-1, -2, 1), scene)
        light.position = new Vector3(60, 130, -65)
        light.intensity = 1

        //glow
        // const glow = new GlowLayer("glow", scene)
        // glow.intensity = 0.2
       

        //ambient occlusion
        let ssaoRatio = { ssaoRatio: 0.5, combineRatio: 1.0 }
        ssao = new SSAORenderingPipeline("ssao", scene, ssaoRatio)
        ssao.fallOff = 0.000001
        ssao.area = 1
        ssao.radius = 0.0001
        ssao.totalStrength = 1.0
        ssao.base = 0.5

        // Attach camera to the SSAO render pipeline
        //  scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", camera)

        //shadows
        shadowGenerator = new ShadowGenerator(1024, light)
        shadowGenerator.useExponentialShadowMap = true

        //materials
        let pbr = new PBRMaterial()
        pbr.albedoColor = new Color3(1, 0.5, 0)
        pbr.metallic = 0.1
        pbr.roughness = 0.1
        orange.current = pbr

        let brown = orange.current.clone("brownMaterial")
        brown.albedoColor = new Color3(0.7, 0.1, 0)

        //3d objects
        // let sphere = CreateSphere("sphere1", { segments: 16, diameter: 2 }, scene)
        // sphere.position.y = 2
        // sphere.material = pbr

        // ground
        let ground = CreateGround("ground1", { width: 256, height: 256, subdivisions: 16 }, scene)
        ground.position = new Vector3(0, -0.01, 0)
        ground.material = brown
        ground.receiveShadows = true

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
        // let building = {}
        // loadMeshes(building, "./media/", "building.glb", scene)

        // setBabylonObjects([...babylonObjects, ground, camera, building])

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

        // scene.onPointerDown = (event, pickResult) => {
        //     // pickResult is an object that contains information about the clicked object
        //     if (pickResult.hit) {
        //       console.log('Object clicked:', pickResult.pickedMesh.id)
        //     }
        //   }

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
        babCanvas(renderCanvas)
        const engine = new WebGPUEngine(canvas)
        await engine.initAsync()
        sceneBuild(engine, canvas)
    }

    //webGPU engine
    const createSceneWebGL = () => {
        const { current: canvas } = renderCanvas
        babCanvas(renderCanvas)
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

    const [vol, setVol] = useState(false)
    const [AO, setAO] = useState(false)
    let rays = null
    const volumetricsHandler = () => {

        if (!vol) {
            rays = new VolumetricLightScatteringPostProcess('rays', 1.0, camera, null, 100, Texture.BILINEAR_SAMPLINGMODE, scene.engine, false)
            rays.mesh.material.diffuseTexture = new Texture(sun, scene, true, false, Texture.BILINEAR_SAMPLINGMODE)
            rays.mesh.material.diffuseTexture.hasAlpha = true
            rays.mesh.scaling = new Vector3(30, 30, 30)
            rays.mesh.position = scene.lights[0].position

        }
        else {
            if (rays) {
                rays.dispose()
                rays = null
            }
        }
        setVol(!vol)
    }
    const AOHandler = () => {
        if (AO) { //detach AO
            scene.postProcessRenderPipelineManager.detachCamerasFromRenderPipeline("ssao", camera)
        }
        else {
            //attach AO
            scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", camera)
            scene.postProcessRenderPipelineManager.enableEffectInPipeline("ssao", ssao.SSAOCombineRenderEffect, camera)
        }
        setAO(!AO)

    }

    return (
        <div>
            <canvas
                ref={renderCanvas}
                id="renderCanvas"
            >
            </canvas>
            <div className='settings'>
                <div className='postprocess-option'>
                    <input type="checkbox" id="volumetrics" name="volumetrics" value="volumetrics" checked={vol} onChange={() => volumetricsHandler()}></input>
                    <label htmlFor="volumetrics">Volumetric Lighting</label>
                </div>
                <div className='postprocess-option'>
                    <input type="checkbox" id="oa" name="oa" value="oa" checked={AO} onChange={() => AOHandler()}></input>
                    <label htmlFor="edge">Ambient Occlusion</label>
                </div>

            </div>
            <p id="renderType">{webGL.current ? "Browser or GPU not supported, falling back to WebGL from WebGPU" : "Running on WebGPU"}</p>
        </div>
    )
}

export default BabylonComponent

const createMaterial = (color, clone) => {
    let pbr = new PBRMaterial()
    if (clone) {
        pbr.albedoColor = color
    }
    else {
        pbr.albedoColor = Color3.FromHexString(color)
    }
    pbr.metallic = 0.1
    pbr.roughness = 0.1
    return pbr
}

const addEdges = (mesh, clone) => {
    mesh.enableEdgesRendering()
    mesh.edgesWidth = 4.0
    if (clone) {
        mesh.edgesColor = clone.edgesColor
    }
    else {
        mesh.edgesColor = new Color4(0, 1, 0, 0.5)
    }
}

export let boxCounter = 0
export let capCounter = 0

export const createCube = (color, clone) => {
    const box = MeshBuilder.CreateBox("box " + boxCounter)
    box.material = createMaterial(color, clone)
    if (clone) {
        //  box.scaling = clone.scaling //this does not work, it copies the object not the values
        const { x, y, z } = clone.scaling
        box.scaling = new Vector3(x, y, z)

    }
    addEdges(box, clone)
    box.position = new Vector3(0, box.scaling.y / 2, 0)
    shadowGenerator.addShadowCaster(box)
    boxCounter++
    puff()
    return box
}

export const changeColor = (mesh, color, surface) => {
    const convertColor = Color3.FromHexString(color)
    if (surface === "surface") {
        mesh.material.albedoColor = convertColor
    }
    else { //convert to colour4
        console.log(convertColor)
        mesh.edgesColor = new Color4(convertColor.r, convertColor.g, convertColor.b, 0.5)
    }

}

export const screenPos = (box) => {
    const screenPosition = Vector3.Project(box.position,
        Matrix.Identity(),
        scene.getTransformMatrix(),
        scene.activeCamera.viewport.toGlobal(scene.getEngine().getRenderWidth(),
            scene.getEngine().getRenderHeight()))
    const xy = [screenPosition.x, screenPosition.y]
    return xy
}

export const scaleAnimation = (box, axis, start, end) => {
    const lerpscaling = new Animation("lerpscaling", axis, 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT)
    const keyFrames = []
    keyFrames.push({
        frame: 0,
        value: parseFloat(start) //start value
    })
    keyFrames.push({
        frame: 10,
        value: parseFloat(end) //end value
    })
    lerpscaling.setKeys(keyFrames)
    box.animations.push(lerpscaling) //pass in object
    scene.beginAnimation(box, 0, 2 * 30, true)
}

export const extrudeCap = (extValue, color, clone) => {
    const capShape = [ //create V shape
        new Vector3(-1, 0, 0),
        new Vector3(0, 0.5, 0),
        new Vector3(1, 0, 0),
    ]
    const myPath = [] //extend path from UI
    for (let i = 0; i < extValue; i++) {
        myPath[i] = new Vector3(i, 0, 0)
    }
    const extrusion = MeshBuilder.ExtrudeShapeCustom("extruded" + capCounter, { shape: capShape, path: myPath, updatable: true, sideOrientation: Mesh.DOUBLESIDE })
    extrusion.material = createMaterial(color, clone)
    addEdges(extrusion, clone)
    if (clone) {
        const { x, y, z } = clone.scaling
        extrusion.scaling = new Vector3(x, y, z)
    }
    capCounter++
    return extrusion
}

const puff = () => { //partical animation 
    let particleSystem = new ParticleSystem("stars", 1000, scene)
    particleSystem.particleTexture = new Texture(star, scene)
    particleSystem.createPointEmitter(new Vector3(-1, 0, -1), new Vector3(1, 0.2, 1))
    particleSystem.color1 = new Color4(0.51, 0.13, 0.13)
    particleSystem.color2 = new Color4(1, 1, 1, 0)
    particleSystem.colorDead = new Color4(1, 1, 1, 0)
    particleSystem.emitRate = 6000
    particleSystem.minEmitPower = 1
    particleSystem.maxEmitPower = 20
    particleSystem.addStartSizeGradient(1, 0.1)
    particleSystem.minAngularSpeed = 0
    particleSystem.maxAngularSpeed = 1
    particleSystem.addDragGradient(0, 0.7, 0.7)
    particleSystem.maxLifeTime = 0.001
    particleSystem.targetStopDuration = 0.01
    particleSystem.start()
}

export const faceColorChange = (mesh, face) => {
    let indices = mesh.getIndices()
    let positions = mesh.getVerticesData(VertexBuffer.PositionKind)
    let colorkind = mesh.getVerticesData(VertexBuffer.ColorKind)
    let verts = positions.length / 3
    if (!colorkind) {
        colorkind = new Array(4 * verts)
        colorkind = colorkind.fill(1);
    }
    face = face / 2 
    let facet = 2 * Math.floor(face) //gets matching tris to make quad
    let clr = new Color4(1,0,0,1)
    let vertex
    for (let i = 0; i < 6; i++) { //iterate through verts assigning values 
        vertex = indices[3 * facet + i];
        colorkind[4 * vertex] = clr.r;
        colorkind[4 * vertex + 1] = clr.g;
        colorkind[4 * vertex + 2] = clr.b;
        colorkind[4 * vertex + 3] = clr.a;
    }
    mesh.setVerticesData(VertexBuffer.ColorKind, colorkind);


}