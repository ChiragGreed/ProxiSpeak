import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const App = () => {

  const socket = io('localhost:3000');

  socket.on('serverCords', (cords) => {
    console.log(cords);
  })

  const position = useRef({ x: 0, y: 0 });
  const keysPressed = useRef({});
  const carRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'a', 'd', 'w', 's'].includes(key)) {
        keysPressed.current[key] = true;
        event.preventDefault(); // Stop page scrolling
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (key in keysPressed.current) {
        keysPressed.current[key] = false;
      }
    };

    let animationFrameId;
    const gameLoop = () => {
      let dx = 0;
      let dy = 0;
      const speed = 5; // Pixels per frame

      if (keysPressed.current['arrowleft'] || keysPressed.current['a']) dx -= speed;
      if (keysPressed.current['arrowright'] || keysPressed.current['d']) dx += speed;
      if (keysPressed.current['arrowup'] || keysPressed.current['w']) dy -= speed;
      if (keysPressed.current['arrowdown'] || keysPressed.current['s']) dy += speed;


      if (dx !== 0 || dy !== 0) {
        position.current.x += dx;
        position.current.y += dy;

        socket.emit('cords', { X: position.current.x, Y: position.current.y });

        if (carRef.current) {
          carRef.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0)`;
        }
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className='Canvas' style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#222' }}>

      {/* User 1: Car with optimized Direct DOM ref manipulation */}
      <div
        ref={carRef}
        className='Users'
        id='user1'
        style={{ position: 'absolute', left: '0px', top: '0px', willChange: 'transform' }}
      >
        <img src="../public/Formula1.jpg" alt="Formula 1 Car" />
      </div>

      <div
        className='Users'
        id='user2'
        style={{ position: 'absolute', left: '200px', top: '200px' }}
      >
        <img src="../public/DefaultCar.jpg" alt="Default Car" />
      </div>

    </div>
  );
};

export default App;
