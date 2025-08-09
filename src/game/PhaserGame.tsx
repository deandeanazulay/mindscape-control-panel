import { useEffect, useRef } from "react";
import Phaser from "phaser";
import MindWorldScene from "./MindWorldScene";
import type { OverlayId } from "@/components/mindworld/WorldOverlayRouter";

export type Vec2 = { x: number; y: number };

interface Props {
  inputVec: Vec2;
  actionTick: number; // increments on each Action press
  overlayId: OverlayId | null;
  onEnter: (id: OverlayId) => void;
}

export default function PhaserGame({ inputVec, actionTick, overlayId, onEnter }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<MindWorldScene | null>(null);

  // Bridge object shared with the scene (simple React -> Phaser link)
  const bridgeRef = useRef({
    input: { x: 0, y: 0 } as Vec2,
    actionTick: 0,
    onEnter,
  });

  // Keep bridge updated from React props
  useEffect(() => {
    bridgeRef.current.input = inputVec;
  }, [inputVec]);

  useEffect(() => {
    bridgeRef.current.actionTick = actionTick;
  }, [actionTick]);

  useEffect(() => {
    bridgeRef.current.onEnter = onEnter;
  }, [onEnter]);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: "#00000000",
      transparent: true,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 900 },
          debug: false,
        },
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    const scene = new MindWorldScene();
    (scene as any).bridge = bridgeRef.current;
    sceneRef.current = scene;
    game.scene.add("mind", scene, true);

    const onResize = () => {
      game.scale.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      game.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  // Pause/resume scene when overlays are open/closed
  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    const key = "mind";
    const mgr = game.scene;
    if (overlayId) {
      if (mgr.isActive(key)) mgr.pause(key);
    } else {
      if (mgr.isPaused(key)) mgr.resume(key);
    }
  }, [overlayId]);

  return <div ref={containerRef} className="absolute inset-0" aria-label="Phaser Side-Scroll World" />;
}

