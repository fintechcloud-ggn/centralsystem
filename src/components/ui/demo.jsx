import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

export default function BalloonBackground({ className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let balloons = [];
    let particles = [];
    let animationFrameId = 0;
    const mouse = { x: -2000, y: -2000 };
    const balloonCount = 30;

    const colors = [
      { base: "#ff2e63", light: "#ff6b8f", dark: "#9d0b2e" },
      { base: "#00d2ff", light: "#80eaff", dark: "#006a80" },
      { base: "#ffd700", light: "#fff080", dark: "#998100" },
      { base: "#9d50bb", light: "#c089d8", dark: "#4f285e" },
      { base: "#43e97b", light: "#a6f7c1", dark: "#1e6a38" },
      { base: "#ff9a9e", light: "#fecfef", dark: "#cc7a7e" },
      { base: "#00c9ff", light: "#92fe9d", dark: "#00607a" }
    ];

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 12;
        this.speedY = (Math.random() - 0.5) * 12;
        this.gravity = 0.2;
        this.opacity = 1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.opacity -= 0.025;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class Balloon {
      constructor(first = true) {
        this.x = 0;
        this.y = 0;
        this.r = 0;
        this.speed = 0;
        this.angle = 0;
        this.wobbleSpeed = 0;
        this.popped = false;
        this.colorSet = colors[0];
        this.tailMidY = 0;
        this.tailEndY = 0;
        this.tailVelMid = 0;
        this.tailVelEnd = 0;
        this.prevX = 0;
        this.init(first);
      }

      init(firstLoad) {
        this.r = Math.random() * 15 + 30;
        this.x = Math.random() * canvas.clientWidth;
        this.y = firstLoad
          ? Math.random() * canvas.clientHeight
          : canvas.clientHeight + this.r + 200;

        this.colorSet = colors[Math.floor(Math.random() * colors.length)];
        this.speed = Math.random() * 1 + 0.4;
        this.wobbleSpeed = Math.random() * 0.02 + 0.01;
        this.angle = Math.random() * Math.PI * 2;
        this.popped = false;
        this.prevX = this.x;
        this.tailMidY = this.r + 40;
        this.tailEndY = this.r + 120;
        this.tailVelMid = 0;
        this.tailVelEnd = 0;
      }

      drawBalloonPath(r) {
        ctx.beginPath();
        ctx.moveTo(0, r);
        ctx.bezierCurveTo(-r * 1.2, r * 0.8, -r * 1.3, -r * 1.2, 0, -r * 1.2);
        ctx.bezierCurveTo(r * 1.3, -r * 1.2, r * 1.2, r * 0.8, 0, r);
        ctx.closePath();
      }

      drawString() {
        const dx = this.x - this.prevX;
        this.prevX = this.x;

        const stiffness = 0.08;
        const damping = 0.85;
        const gravity = 0.35;

        const midTarget = this.r + 40 + Math.abs(dx) * 8;
        this.tailVelMid += (midTarget - this.tailMidY) * stiffness;
        this.tailVelMid *= damping;
        this.tailMidY += this.tailVelMid;

        const endTarget = this.r + 120 + Math.abs(dx) * 14;
        this.tailVelEnd += (endTarget - this.tailEndY) * stiffness;
        this.tailVelEnd *= damping;
        this.tailVelEnd += gravity;
        this.tailEndY += this.tailVelEnd;

        const sway = Math.sin(this.angle * 1.8) * 6 + dx * 4;

        ctx.beginPath();
        ctx.moveTo(0, this.r + 5);
        ctx.bezierCurveTo(
          sway,
          this.tailMidY * 0.5,
          -sway,
          this.tailMidY,
          sway * 0.6,
          this.tailEndY
        );
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }

      pop() {
        if (this.popped) return;
        this.popped = true;

        for (let i = 0; i < 20; i += 1) {
          particles.push(new Particle(this.x, this.y, this.colorSet.base));
        }

        window.setTimeout(() => this.init(false), 1000 + Math.random() * 1000);
      }

      update() {
        if (this.popped) return;

        this.y -= this.speed;
        this.angle += this.wobbleSpeed;
        this.x += Math.sin(this.angle * 0.6) * 0.8;

        const dx = this.x - mouse.x;
        const dy = this.y - this.r * 0.2 - mouse.y;
        if (Math.sqrt(dx * dx + dy * dy) < this.r + 10) {
          this.pop();
        }

        if (this.y < -this.r - 200) this.init(false);

        this.draw();
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.sin(this.angle) * 0.06);
        this.drawString();
        this.drawBalloonPath(this.r);

        const gradient = ctx.createRadialGradient(
          -this.r * 0.3,
          -this.r * 0.5,
          this.r * 0.1,
          0,
          0,
          this.r * 1.5
        );

        gradient.addColorStop(0, this.colorSet.light);
        gradient.addColorStop(0.4, this.colorSet.base);
        gradient.addColorStop(1, this.colorSet.dark);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.92;
        ctx.fill();
        ctx.restore();
      }
    }

    const resize = () => {
      const parent = canvas.parentElement;
      const width = parent?.clientWidth || window.innerWidth;
      const height = parent?.clientHeight || window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      balloons = [];
      for (let i = 0; i < balloonCount; i += 1) {
        balloons.push(new Balloon(true));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      particles = particles.filter((particle) => particle.opacity > 0);
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      balloons.forEach((balloon) => balloon.update());
      animationFrameId = window.requestAnimationFrame(animate);
    };

    const onMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);

    resize();
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full overflow-hidden",
        className
      )}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
