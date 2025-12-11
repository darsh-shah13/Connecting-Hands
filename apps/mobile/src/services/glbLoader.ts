import * as FileSystem from 'expo-file-system';
import * as THREE from 'three';

export interface GLBLoadResult {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  joints: THREE.Object3D[];
}

export class GLBLoaderService {
  constructor() {}

  async downloadGLB(url: string): Promise<string> {
    const filename = url.split('/').pop() || 'hand_model.glb';
    const localUri = `${FileSystem.documentDirectory}${filename}`;

    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) {
      return localUri;
    }

    const downloadResult = await FileSystem.downloadAsync(url, localUri);
    return downloadResult.uri;
  }

  async loadGLB(): Promise<GLBLoadResult> {
    return new Promise((resolve) => {
      const scene = new THREE.Group();
      scene.name = 'hand-model';

      const handGeometry = new THREE.BoxGeometry(0.05, 0.1, 0.03);
      const handMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
      const handMesh = new THREE.Mesh(handGeometry, handMaterial);
      scene.add(handMesh);

      const fingerGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.04);
      const fingerMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });

      for (let i = 0; i < 5; i++) {
        const finger = new THREE.Mesh(fingerGeometry, fingerMaterial);
        finger.position.set((i - 2) * 0.012, 0.07, 0);
        finger.name = `finger-${i}-joint`;
        scene.add(finger);
      }

      const joints = this.extractJoints(scene);
      resolve({
        scene,
        animations: [],
        joints,
      });
    });
  }

  private extractJoints(scene: THREE.Group): THREE.Object3D[] {
    const joints: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if (child.name.toLowerCase().includes('joint') || child.type === 'Bone') {
        joints.push(child);
      }
    });
    return joints;
  }

  async loadFromUrl(url: string): Promise<GLBLoadResult> {
    await this.downloadGLB(url);
    return this.loadGLB();
  }
}

export const glbLoaderService = new GLBLoaderService();
