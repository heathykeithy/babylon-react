import React, { useEffect, useState, useRef } from "react";
import { ParticleSystem, Vector3, Color4, Texture } from "@babylonjs/core"
import star from '../assets/solidStar.png'

const Puff = ({scene}) => {
  const [starsCount, setStarsCount] = useState(0)

  const prevStarsCountRef = useRef();

  prevStarsCountRef.current = starsCount;

  const puff = () => {
    let particleSystem = new ParticleSystem("stars" + starsCount, 20000, scene)
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
    setStarsCount(starsCount + 1);
  };

  useEffect(() => {
    if (prevStarsCountRef.current !== starsCount) {
        puff();
      }
    }, [starsCount]);

  return (
    <div className="test">
      <button onClick={puff}>Trigger Animation</button>

    </div>
  )
}

export default Puff;
