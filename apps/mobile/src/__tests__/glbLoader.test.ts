import { GLBLoaderService } from '@/services/glbLoader';
import * as FileSystem from 'expo-file-system';

jest.mock('expo-file-system');

describe('GLB Loader Service', () => {
  let loader: GLBLoaderService;

  beforeEach(() => {
    loader = new GLBLoaderService();
    jest.clearAllMocks();
  });

  describe('GLB Download', () => {
    it('should download GLB file from URL', async () => {
      const mockUrl = 'https://example.com/models/hand.glb';
      const mockLocalUri = `${FileSystem.documentDirectory}hand.glb`;

      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
      (FileSystem.downloadAsync as jest.Mock).mockResolvedValue({ uri: mockLocalUri });

      const result = await loader.downloadGLB(mockUrl);

      expect(FileSystem.downloadAsync).toHaveBeenCalledWith(mockUrl, mockLocalUri);
      expect(result).toBe(mockLocalUri);
    });

    it('should return cached file if already exists', async () => {
      const mockUrl = 'https://example.com/models/hand.glb';
      const mockLocalUri = `${FileSystem.documentDirectory}hand.glb`;

      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });

      const result = await loader.downloadGLB(mockUrl);

      expect(FileSystem.downloadAsync).not.toHaveBeenCalled();
      expect(result).toBe(mockLocalUri);
    });

    it('should handle URLs without filename', async () => {
      const mockUrl = 'https://example.com/';
      const mockLocalUri = `${FileSystem.documentDirectory}hand_model.glb`;

      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
      (FileSystem.downloadAsync as jest.Mock).mockResolvedValue({ uri: mockLocalUri });

      await loader.downloadGLB(mockUrl);

      expect(FileSystem.downloadAsync).toHaveBeenCalledWith(
        mockUrl,
        expect.stringContaining('hand_model.glb')
      );
    });
  });

  describe('GLB Loading', () => {
    it('should load GLB file and extract scene', async () => {
      const result = await loader.loadGLB();

      expect(result.scene).toBeDefined();
      expect(result.animations).toBeDefined();
      expect(result.joints).toBeDefined();
    });
  });

  describe('Joint Extraction', () => {
    it('should extract joints from scene', () => {
      interface MockChild {
        name: string;
        type: string;
      }

      interface MockScene {
        children: MockChild[];
        traverse: (callback: (node: MockChild | MockScene) => void) => void;
      }

      const mockScene: MockScene = {
        children: [
          { name: 'thumb_joint', type: 'Bone' },
          { name: 'index_joint', type: 'Bone' },
          { name: 'mesh', type: 'Mesh' },
        ],
        traverse: function (callback: (node: MockChild | MockScene) => void) {
          callback(this);
          this.children.forEach((child: MockChild) => callback(child));
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const joints = (loader as any).extractJoints(mockScene);

      expect(joints.length).toBeGreaterThan(0);
    });

    it('should identify bones and joint-named objects', () => {
      const mockJoint = { name: 'finger_joint', type: 'Object3D' };
      const mockBone = { name: 'bone', type: 'Bone' };
      const mockMesh = { name: 'mesh', type: 'Mesh' };

      interface MockChild {
        name: string;
        type: string;
      }

      interface MockScene {
        children: MockChild[];
        traverse: (callback: (node: MockChild | MockScene) => void) => void;
      }

      const mockScene: MockScene = {
        children: [mockJoint, mockBone, mockMesh],
        traverse: function (callback: (node: MockChild | MockScene) => void) {
          callback(this);
          this.children.forEach((child: MockChild) => callback(child));
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const joints = (loader as any).extractJoints(mockScene);

      expect(joints).toContain(mockJoint);
      expect(joints).toContain(mockBone);
      expect(joints).not.toContain(mockMesh);
    });
  });

  describe('Full Loading Pipeline', () => {
    it('should download and load GLB from URL', async () => {
      const mockUrl = 'https://example.com/hand.glb';
      const mockLocalUri = `${FileSystem.documentDirectory}hand.glb`;

      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
      (FileSystem.downloadAsync as jest.Mock).mockResolvedValue({ uri: mockLocalUri });

      const mockScene = {
        name: 'hand-scene',
        traverse: jest.fn(),
      };

      jest.spyOn(loader, 'loadGLB').mockResolvedValue({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scene: mockScene as any,
        animations: [],
        joints: [],
      });

      const result = await loader.loadFromUrl(mockUrl);

      expect(result.scene).toBeDefined();
      expect(FileSystem.downloadAsync).toHaveBeenCalled();
    });
  });
});
