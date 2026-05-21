"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Line,
  Sphere,
  Billboard,
} from "@react-three/drei";
import * as THREE from "three";
import type { NetworkNode, NetworkEdge, NodeStatus } from "@/types";
import { STATUS_COLORS } from "@/types";

const STATUS_THREE_COLORS: Record<NodeStatus, THREE.Color> = {
  safe: new THREE.Color("#00ff88"),
  suspicious: new THREE.Color("#ffcc00"),
  compromised: new THREE.Color("#ff6600"),
  critical: new THREE.Color("#ff3333"),
  offline: new THREE.Color("#4a7a9b"),
};

function NodeMesh({
  node,
  onClick,
  selected,
}: {
  node: NetworkNode;
  onClick: (n: NetworkNode) => void;
  selected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const color = STATUS_THREE_COLORS[node.status] || STATUS_THREE_COLORS.safe;

  useFrame((state) => {
    if (!meshRef.current || !glowRef.current) return;
    const t = state.clock.getElapsedTime();

    if (node.status === "critical") {
      meshRef.current.scale.setScalar(1 + Math.sin(t * 4) * 0.08);
    } else if (node.status === "compromised") {
      meshRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.04);
    } else {
      meshRef.current.scale.setScalar(1);
    }

    const glowScale = 1.4 + Math.sin(t * 1.5) * 0.1;
    glowRef.current.scale.setScalar(glowScale);
    (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
      0.06 + Math.sin(t * 1.5) * 0.03;
  });

  const nodeSize = {
    server: 0.18,
    database: 0.16,
    firewall: 0.20,
    router: 0.14,
    api: 0.13,
    workstation: 0.12,
    cloud: 0.17,
    iot: 0.10,
  }[node.type] || 0.14;

  const nodeShapeMap: Record<string, string> = {
    router: "octahedron",
    firewall: "box",
    database: "cylinder",
    cloud: "sphere",
    server: "sphere",
    workstation: "sphere",
    api: "sphere",
    iot: "sphere",
  };
  const nodeShape = nodeShapeMap[node.type] || "sphere";

  return (
    <group position={[node.position.x / 80, node.position.y / 80, node.position.z / 80]}>
      {/* Glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[nodeSize * 2, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.06} depthWrite={false} />
      </mesh>

      {/* Main node */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(node); }}
        castShadow
      >
        {nodeShape === "box" ? (
          <boxGeometry args={[nodeSize, nodeSize, nodeSize]} />
        ) : nodeShape === "octahedron" ? (
          <octahedronGeometry args={[nodeSize]} />
        ) : nodeShape === "cylinder" ? (
          <cylinderGeometry args={[nodeSize * 0.7, nodeSize * 0.7, nodeSize * 1.2, 8]} />
        ) : (
          <sphereGeometry args={[nodeSize, 20, 20]} />
        )}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={node.status === "critical" ? 0.8 : node.status === "compromised" ? 0.5 : 0.3}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Selection ring */}
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[nodeSize * 1.8, nodeSize * 2.2, 32]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Label */}
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, nodeSize + 0.12, 0]}
          fontSize={0.08}
          color="#a8d8ea"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.005}
          outlineColor="#020b18"
        >
          {node.label}
        </Text>
        <Text
          position={[0, nodeSize + 0.04, 0]}
          fontSize={0.055}
          color={STATUS_COLORS[node.status]}
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.004}
          outlineColor="#020b18"
        >
          {node.status.toUpperCase()}
        </Text>
      </Billboard>
    </group>
  );
}

function EdgeLine({
  edge,
  nodes,
  active,
}: {
  edge: NetworkEdge;
  nodes: NetworkNode[];
  active: boolean;
}) {
  const lineRef = useRef<any>(null);
  const source = nodes.find((n) => n.id === edge.source);
  const target = nodes.find((n) => n.id === edge.target);

  useFrame((state) => {
    if (!lineRef.current || !active) return;
    const t = state.clock.getElapsedTime();
    lineRef.current.material.opacity = 0.2 + Math.sin(t * 3) * 0.1;
  });

  if (!source || !target) return null;

  const start = new THREE.Vector3(
    source.position.x / 80,
    source.position.y / 80,
    source.position.z / 80
  );
  const end = new THREE.Vector3(
    target.position.x / 80,
    target.position.y / 80,
    target.position.z / 80
  );

  const color = active ? "#ff3333" : edge.encrypted ? "#00d4ff" : "#0a3050";
  const opacity = active ? 0.8 : 0.25;

  return (
    <Line
      ref={lineRef}
      points={[start, end]}
      color={color}
      lineWidth={active ? 2 : 1}
      transparent
      opacity={opacity}
      dashed={active}
      dashSize={active ? 0.1 : 0}
      gapSize={active ? 0.05 : 0}
    />
  );
}

function AttackParticle({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null);
  const progress = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) return;
    progress.current = (progress.current + delta * 0.8) % 1;
    const pos = from.clone().lerp(to, progress.current);
    ref.current.position.copy(pos);
    (ref.current.material as THREE.MeshBasicMaterial).opacity =
      Math.sin(progress.current * Math.PI);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#ff3333" transparent opacity={0.8} />
    </mesh>
  );
}

function Scene({
  nodes,
  edges,
  activeEdgeIds,
  onNodeClick,
  selectedNodeId,
}: {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  activeEdgeIds: Set<string>;
  onNodeClick: (n: NetworkNode) => void;
  selectedNodeId: string | null;
}) {
  const attackParticles = useMemo(
    () =>
      edges
        .filter((e) => activeEdgeIds.has(e.id))
        .map((e) => {
          const src = nodes.find((n) => n.id === e.source);
          const tgt = nodes.find((n) => n.id === e.target);
          if (!src || !tgt) return null;
          return {
            id: e.id,
            from: new THREE.Vector3(src.position.x / 80, src.position.y / 80, src.position.z / 80),
            to: new THREE.Vector3(tgt.position.x / 80, tgt.position.y / 80, tgt.position.z / 80),
          };
        })
        .filter(Boolean) as { id: string; from: THREE.Vector3; to: THREE.Vector3 }[],
    [edges, nodes, activeEdgeIds]
  );

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#00d4ff" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#aa00ff" />
      <pointLight position={[0, 8, 0]} intensity={0.3} color="#ffffff" />

      {/* Grid */}
      <gridHelper args={[30, 30, "#051a2e", "#051a2e"]} position={[0, -2, 0]} />

      {edges.map((edge) => (
        <EdgeLine
          key={edge.id}
          edge={edge}
          nodes={nodes}
          active={activeEdgeIds.has(edge.id)}
        />
      ))}

      {nodes.map((node) => (
        <NodeMesh
          key={node.id}
          node={node}
          onClick={onNodeClick}
          selected={selectedNodeId === node.id}
        />
      ))}

      {attackParticles.map((p) => (
        <AttackParticle key={p.id} from={p.from} to={p.to} />
      ))}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        zoomSpeed={0.8}
        panSpeed={0.8}
        rotateSpeed={0.5}
        minDistance={3}
        maxDistance={20}
        makeDefault
      />
    </>
  );
}

interface NetworkGraph3DProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  activeEdgeIds?: Set<string>;
  onNodeClick?: (node: NetworkNode) => void;
  selectedNodeId?: string | null;
}

export default function NetworkGraph3D({
  nodes,
  edges,
  activeEdgeIds = new Set(),
  onNodeClick,
  selectedNodeId = null,
}: NetworkGraph3DProps) {
  return (
    <div className="w-full h-full bg-cyber-bg rounded-xl overflow-hidden relative">
      {/* Corner decorations */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyber-cyan/50 z-10" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyber-cyan/50 z-10" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyber-cyan/50 z-10" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyber-cyan/50 z-10" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1">
        {(["safe", "suspicious", "compromised", "critical"] as NodeStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5 text-xs">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[s], boxShadow: `0 0 6px ${STATUS_COLORS[s]}` }}
            />
            <span className="text-cyber-text-dim capitalize">{s}</span>
          </div>
        ))}
      </div>

      {/* Node count */}
      <div className="absolute top-3 right-6 z-10 text-xs text-cyber-text-dim font-mono">
        {nodes.length} nodes · {edges.length} edges
      </div>

      <Canvas
        camera={{ position: [8, 5, 8], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "#020b18" }}
      >
        <fog attach="fog" args={["#020b18", 20, 40]} />
        <Scene
          nodes={nodes}
          edges={edges}
          activeEdgeIds={activeEdgeIds}
          onNodeClick={onNodeClick || (() => {})}
          selectedNodeId={selectedNodeId}
        />
      </Canvas>
    </div>
  );
}
