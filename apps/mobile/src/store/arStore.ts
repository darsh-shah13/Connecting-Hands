import { create } from 'zustand';

export interface JointData {
  id: string;
  name: string;
  position: [number, number, number];
  isActive: boolean;
  intensity: number;
}

export interface HandModelData {
  id: string;
  glbUrl: string;
  joints: JointData[];
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface CalibrationSettings {
  sensitivity: number;
  hapticIntensity: number;
  proximityThreshold: number;
  markerSize: number;
  autoAlign: boolean;
}

export interface ARState {
  handModel: HandModelData | null;
  isModelLoaded: boolean;
  isPlaneDetected: boolean;
  isCalibrated: boolean;
  calibrationSettings: CalibrationSettings;
  lastHapticTime: number;

  setHandModel: (model: HandModelData) => void;
  updateJoint: (jointId: string, updates: Partial<JointData>) => void;
  setModelLoaded: (loaded: boolean) => void;
  setPlaneDetected: (detected: boolean) => void;
  setCalibrated: (calibrated: boolean) => void;
  updateCalibrationSettings: (settings: Partial<CalibrationSettings>) => void;
  updateHandModelTransform: (
    transform: Partial<Pick<HandModelData, 'scale' | 'position' | 'rotation'>>
  ) => void;
  setLastHapticTime: (time: number) => void;
  reset: () => void;
}

const defaultCalibrationSettings: CalibrationSettings = {
  sensitivity: 0.5,
  hapticIntensity: 0.8,
  proximityThreshold: 0.05,
  markerSize: 0.02,
  autoAlign: true,
};

export const useARStore = create<ARState>((set) => ({
  handModel: null,
  isModelLoaded: false,
  isPlaneDetected: false,
  isCalibrated: false,
  calibrationSettings: defaultCalibrationSettings,
  lastHapticTime: 0,

  setHandModel: (model) =>
    set({
      handModel: model,
    }),

  updateJoint: (jointId, updates) =>
    set((state) => {
      if (!state.handModel) return state;
      return {
        handModel: {
          ...state.handModel,
          joints: state.handModel.joints.map((joint) =>
            joint.id === jointId ? { ...joint, ...updates } : joint
          ),
        },
      };
    }),

  setModelLoaded: (loaded) =>
    set({
      isModelLoaded: loaded,
    }),

  setPlaneDetected: (detected) =>
    set({
      isPlaneDetected: detected,
    }),

  setCalibrated: (calibrated) =>
    set({
      isCalibrated: calibrated,
    }),

  updateCalibrationSettings: (settings) =>
    set((state) => ({
      calibrationSettings: {
        ...state.calibrationSettings,
        ...settings,
      },
    })),

  updateHandModelTransform: (transform) =>
    set((state) => {
      if (!state.handModel) return state;
      return {
        handModel: {
          ...state.handModel,
          ...transform,
        },
      };
    }),

  setLastHapticTime: (time) =>
    set({
      lastHapticTime: time,
    }),

  reset: () =>
    set({
      handModel: null,
      isModelLoaded: false,
      isPlaneDetected: false,
      isCalibrated: false,
      lastHapticTime: 0,
    }),
}));
