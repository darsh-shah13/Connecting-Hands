import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer, THREE } from 'expo-three';
import { useARStore } from '@/store/arStore';
import { glbLoaderService } from '@/services/glbLoader';
import { hapticService } from '@/services/hapticService';

interface ARSceneProps {
  onModelLoaded?: () => void;
  onError?: (error: Error) => void;
}

export const ARScene: React.FC<ARSceneProps> = ({ onModelLoaded, onError }) => {
  const {
    handModel,
    setModelLoaded,
    setPlaneDetected,
    calibrationSettings,
    updateJoint,
    lastHapticTime,
    setLastHapticTime,
  } = useARStore();

  const [isReady, setIsReady] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const handObjectRef = useRef<THREE.Group | null>(null);
  const jointMarkersRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    if (handModel && isReady) {
      loadHandModel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handModel, isReady]);

  const onContextCreate = async (gl: WebGLRenderingContext) => {
    try {
      const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

      const renderer = new Renderer({ gl });
      renderer.setSize(width, height);
      rendererRef.current = renderer;

      const scene = new THREE.Scene();
      scene.background = null;
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 1000);
      camera.position.set(0, 0, 0.5);
      cameraRef.current = camera;

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 5, 5);
      scene.add(directionalLight);

      const planeGeometry = new THREE.PlaneGeometry(1, 1);
      const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = -0.2;
      scene.add(plane);

      setTimeout(() => {
        setPlaneDetected(true);
      }, 1000);

      setIsReady(true);

      const render = () => {
        requestAnimationFrame(render);

        if (handObjectRef.current) {
          handObjectRef.current.rotation.y += 0.005;
        }

        updateJointMarkers();
        checkProximity();

        renderer.render(scene, camera);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (gl as any).endFrameEXP();
      };
      render();
    } catch (error) {
      console.error('Error creating GL context:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  const loadHandModel = async () => {
    if (!handModel || !sceneRef.current) return;

    try {
      const result = await glbLoaderService.loadFromUrl(handModel.glbUrl);

      const handObject = result.scene;
      handObject.scale.set(handModel.scale, handModel.scale, handModel.scale);
      handObject.position.set(...handModel.position);
      handObject.rotation.set(...handModel.rotation);

      sceneRef.current.add(handObject);
      handObjectRef.current = handObject;

      createJointMarkers(result.joints);

      setModelLoaded(true);
      if (onModelLoaded) {
        onModelLoaded();
      }
    } catch (error) {
      console.error('Error loading hand model:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  const createJointMarkers = (joints: THREE.Object3D[]) => {
    if (!sceneRef.current || !handModel) return;

    jointMarkersRef.current.forEach((marker) => {
      sceneRef.current?.remove(marker);
    });
    jointMarkersRef.current = [];

    joints.forEach((joint, index) => {
      const geometry = new THREE.SphereGeometry(calibrationSettings.markerSize, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color: 0xff6b6b,
        emissive: 0xff0000,
        emissiveIntensity: 0,
        transparent: true,
        opacity: 0.8,
      });

      const marker = new THREE.Mesh(geometry, material);
      const worldPosition = new THREE.Vector3();
      joint.getWorldPosition(worldPosition);
      marker.position.copy(worldPosition);

      sceneRef.current?.add(marker);
      jointMarkersRef.current.push(marker);

      if (handModel.joints[index]) {
        updateJoint(handModel.joints[index].id, {
          position: [worldPosition.x, worldPosition.y, worldPosition.z],
        });
      }
    });
  };

  const updateJointMarkers = () => {
    if (!handModel) return;

    jointMarkersRef.current.forEach((marker, index) => {
      const joint = handModel.joints[index];
      if (!joint) return;

      const material = marker.material as THREE.MeshStandardMaterial;

      if (joint.isActive) {
        material.emissiveIntensity = joint.intensity;

        const pulseSpeed = 2;
        const pulse = (Math.sin(Date.now() * 0.001 * pulseSpeed) + 1) / 2;
        marker.scale.setScalar(1 + pulse * 0.3);
      } else {
        material.emissiveIntensity = 0;
        marker.scale.setScalar(1);
      }
    });
  };

  const checkProximity = () => {
    if (!handObjectRef.current || !handModel) return;

    const now = Date.now();
    if (now - lastHapticTime < 100) return;

    const palmPosition = new THREE.Vector3(0, 0, 0.3);

    let minDistance = Infinity;
    jointMarkersRef.current.forEach((marker) => {
      const distance = marker.position.distanceTo(palmPosition);
      minDistance = Math.min(minDistance, distance);
    });

    if (minDistance < calibrationSettings.proximityThreshold) {
      hapticService.triggerProximityFeedback(minDistance, calibrationSettings.proximityThreshold);
      setLastHapticTime(now);
    }
  };

  return (
    <View style={styles.container}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glView: {
    flex: 1,
  },
});
