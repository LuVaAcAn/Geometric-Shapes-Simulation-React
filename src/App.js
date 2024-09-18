import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const GRAVITY = 0.8;
const INITIAL_FORCE = 0;
const SHAPE_SIZE = 100;
const SCREEN_PADDING = 10;
const CEILING_THRESHOLD = 200;
const FORCE_INCREMENT_PER_SECOND = 10;
const MAX_FORCE = 100;

const getRandomPosition = () => ({
  x: Math.random() * (window.innerWidth - SHAPE_SIZE - 2 * SCREEN_PADDING) + SCREEN_PADDING,
  y: Math.random() * (window.innerHeight / 2 - SHAPE_SIZE - SCREEN_PADDING) + SCREEN_PADDING,
});

const INITIAL_SHAPES = [
  { id: 1, ...getRandomPosition(), velocityY: 0, angle: 0, force: 0, type: 'square' },
  { id: 2, ...getRandomPosition(), velocityY: 0, angle: 0, force: 0, type: 'circle' },
  { id: 3, ...getRandomPosition(), velocityY: 0, angle: 0, force: 0, type: 'triangle' }
];

function App() {
  const [shapes, setShapes] = useState(INITIAL_SHAPES);
  const [pressedShapeId, setPressedShapeId] = useState(null);
  const [holdStart, setHoldStart] = useState(null);
  const [force, setForce] = useState(INITIAL_FORCE);
  const intervalRef = useRef(null);

  useEffect(() => {
    const updateShapes = () => {
      setShapes(prevShapes => prevShapes.map(shape => {
        let newY = shape.y + shape.velocityY;
        let newVelocityY = shape.velocityY + GRAVITY;
        let newAngle = shape.angle + 5;
        let newForce = shape.force;

        if (newForce < 0) {
          newY += newForce;
          newForce += 0.5;
          if (newY <= SCREEN_PADDING + CEILING_THRESHOLD) {
            newY = SCREEN_PADDING + CEILING_THRESHOLD;
            newForce = 0;
          }
        }

        // Limitar hacia abajo (sin rebote)
        if (newY >= window.innerHeight - SHAPE_SIZE - SCREEN_PADDING) {
          newY = window.innerHeight - SHAPE_SIZE - SCREEN_PADDING;
          newVelocityY = 0; // Detener la caída al tocar el suelo
          let angle_needed = 360 - shape.angle;
          newAngle = shape.angle + angle_needed;
        }

        return { ...shape, y: newY, velocityY: newVelocityY, angle: newAngle, force: newForce };
      }));
    };

    intervalRef.current = setInterval(updateShapes, 16);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (pressedShapeId !== null && holdStart !== null) {
      const updateForce = () => {
        const holdDuration = (Date.now() - holdStart) / 200;
        let newForce = FORCE_INCREMENT_PER_SECOND * holdDuration;
        newForce = Math.min(newForce, MAX_FORCE); // Limitar la fuerza a MAX_FORCE
        setForce(newForce);
      };

      intervalRef.current = setInterval(updateForce, 30); // Actualizar la fuerza cada 30ms

      return () => clearInterval(intervalRef.current);
    }
  }, [pressedShapeId, holdStart]);

  const handleMouseDown = (id) => {
    setPressedShapeId(id);
    setHoldStart(Date.now());
  };

  const handleMouseUp = () => {
    if (pressedShapeId !== null) {
      const finalForce = force;
      console.log("fuerza + ", finalForce);
      
      setShapes(prevShapes => prevShapes.map(shape =>
        shape.id === pressedShapeId ? { ...shape, force: -finalForce } : shape,
      ));
      
      setPressedShapeId(null);
      setHoldStart(null);
    }
  };

  return (
    <div className="App">
      {/* Línea de límite superior SOLO VISUAL*/}
      <div className="limit-line" />
      {shapes.map(shape => (
        <div
          key={shape.id}
          className={`shape ${shape.type}`}
          style={{
            transform: `translate(${shape.x}px, ${shape.y}px) rotate(${shape.angle}deg)`,
          }}
          onMouseDown={() => handleMouseDown(shape.id)}
          onMouseUp={handleMouseUp}
        />
      ))}
      {/* Mostrar fuerza en la esquina */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '70px',
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'black',
      }}>
        Fuerza: {Math.round(force)}
      </div>
      {/* Barra de fuerza */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '40px',
        width: '20px',
        height: '200px',
        backgroundColor: '#ccc',
        borderRadius: '5px',
        overflow: 'hidden',
        rotate: '180deg',
      }}>
        <div style={{
          height: `${Math.min(force, MAX_FORCE) / MAX_FORCE * 100}%`,
          backgroundColor: '#007bff',
          transition: 'height',
        }} />
      </div>
    </div>
  );
}

export default App;