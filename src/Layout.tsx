import { useEffect, useState, type ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const [angle, setAngle] = useState(0);
  const [hueRotation, setHueRotation] = useState(0);

  useEffect(() => {
    let lastTime = 0;
    const animationSpeed = 0.2; // Скорость вращения

    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;

      // Плавное изменение угла и цвета
      setAngle((prev) => (prev + animationSpeed * (delta / 16)) % 360);
      setHueRotation((prev) => (prev + 0.3) % 360);

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const calculatePosition = (offset: number) => {
    const radius = 50;
    const currentAngle = (angle + offset) % 360;
    const rad = (currentAngle * Math.PI) / 180;
    return {
      x: 50 + radius * Math.cos(rad),
      y: 50 + radius * Math.sin(rad),
    };
  };

  // Динамические цвета с плавными переходами
  const getDynamicColor = (baseHue: number) => {
    const currentHue = (baseHue + hueRotation) % 360;
    return `hsla(${currentHue}, 80%, 70%, 0.7)`;
  };

  const gradients = [
    { color: getDynamicColor(0), offset: 0 }, // Красный
    { color: getDynamicColor(60), offset: 90 }, // Желтый
    { color: getDynamicColor(120), offset: 180 }, // Зеленый
    { color: getDynamicColor(270), offset: 270 }, // Фиолетовый
  ];

  return (
    <div
      className="min-h-[100vh] w-full p-[20px] transition-all duration-1000"
      style={{
        backgroundImage: gradients
          .map((grad) => {
            const pos = calculatePosition(grad.offset);
            return `radial-gradient(at ${pos.x}% ${pos.y}%, ${grad.color} 0px, transparent 50%)`;
          })
          .join(","),
        transition: "background-image 1s ease-in-out",
      }}
    >
      <main className="">{children}</main>
    </div>
  );
}
