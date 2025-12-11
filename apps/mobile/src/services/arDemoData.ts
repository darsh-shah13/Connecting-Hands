import { HandModelData, JointData } from '@/store/arStore';

export const createDemoHandModel = (): HandModelData => {
  const joints: JointData[] = [
    {
      id: 'wrist',
      name: 'Wrist',
      position: [0, 0, 0],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'thumb-cmc',
      name: 'Thumb CMC',
      position: [0.02, -0.01, 0.02],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'thumb-mcp',
      name: 'Thumb MCP',
      position: [0.04, -0.01, 0.03],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'thumb-ip',
      name: 'Thumb IP',
      position: [0.06, -0.01, 0.04],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'thumb-tip',
      name: 'Thumb Tip',
      position: [0.07, -0.01, 0.05],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'index-mcp',
      name: 'Index MCP',
      position: [0.05, 0, 0.01],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'index-pip',
      name: 'Index PIP',
      position: [0.08, 0, 0.01],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'index-dip',
      name: 'Index DIP',
      position: [0.1, 0, 0.01],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'index-tip',
      name: 'Index Tip',
      position: [0.12, 0, 0.01],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'middle-mcp',
      name: 'Middle MCP',
      position: [0.05, 0, 0],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'middle-pip',
      name: 'Middle PIP',
      position: [0.09, 0, 0],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'middle-dip',
      name: 'Middle DIP',
      position: [0.11, 0, 0],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'middle-tip',
      name: 'Middle Tip',
      position: [0.13, 0, 0],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'ring-mcp',
      name: 'Ring MCP',
      position: [0.05, 0, -0.01],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'ring-pip',
      name: 'Ring PIP',
      position: [0.08, 0, -0.01],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'ring-dip',
      name: 'Ring DIP',
      position: [0.1, 0, -0.01],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'ring-tip',
      name: 'Ring Tip',
      position: [0.11, 0, -0.01],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'pinky-mcp',
      name: 'Pinky MCP',
      position: [0.04, 0, -0.02],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'pinky-pip',
      name: 'Pinky PIP',
      position: [0.06, 0, -0.02],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'pinky-dip',
      name: 'Pinky DIP',
      position: [0.08, 0, -0.02],
      isActive: false,
      intensity: 0,
    },
    {
      id: 'pinky-tip',
      name: 'Pinky Tip',
      position: [0.09, 0, -0.02],
      isActive: false,
      intensity: 0,
    },
  ];

  return {
    id: 'demo-hand-model',
    glbUrl:
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Hand/glTF/Hand.gltf',
    joints,
    scale: 0.1,
    position: [0, -0.1, 0],
    rotation: [0, 0, 0],
  };
};

export const simulateJointActivation = (
  joints: JointData[],
  activeJointIds: string[],
  intensity: number = 0.8
): JointData[] => {
  return joints.map((joint) => ({
    ...joint,
    isActive: activeJointIds.includes(joint.id),
    intensity: activeJointIds.includes(joint.id) ? intensity : 0,
  }));
};

export const simulateHandGesture = (gesture: 'fist' | 'peace' | 'thumbsup' | 'open'): string[] => {
  switch (gesture) {
    case 'fist':
      return [
        'index-tip',
        'middle-tip',
        'ring-tip',
        'pinky-tip',
        'thumb-tip',
        'index-pip',
        'middle-pip',
        'ring-pip',
        'pinky-pip',
      ];
    case 'peace':
      return ['index-tip', 'middle-tip', 'index-dip', 'middle-dip'];
    case 'thumbsup':
      return ['thumb-tip', 'thumb-ip'];
    case 'open':
      return [];
    default:
      return [];
  }
};
