// frontend/src/components/DriverSim.jsx

export default function DriverSim() {
  const SERVER = "http://${window.location.hostname}:5000";
  // const newSocket = io(`http://${window.location.hostname}:5000`);
  const busId = "BUS101";
  const route = [
    [28.7041, 77.1025],
    [28.7052, 77.1040],
    [28.7060, 77.1060],
    [28.7070, 77.1080]
  ];

  function startSimulation() {
    let i = 0;
    setInterval(() => {
      const [lat, lng] = route[i % route.length];
      fetch(SERVER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busId, lat, lng, speed: 20 })
      }).catch(() => {});
      i++;
    }, 3000);
  }

  return <button onClick={startSimulation}>Start Driver Simulation</button>;
}
