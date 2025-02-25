import { Character } from './character';
import { Circle, Rect } from '@visactor/vrender-core';
import type { ICharacterGraphicAttribute, CharacterDefinition, PoseState } from './interface';
import { merge } from '@visactor/vutils';
import { DEFAULT_HUMAN_PARTS, DEFAULT_HUMAN_POSES, DEFAULT_HUMAN_SKELETON } from './human-character-config';

export interface HumanBodyParts {
  // Head region
  hair?: string;
  faceShape?: string;
  facialHair?: string;
  eyes?: string;
  eyebrows?: string;
  nose?: string;
  lips?: string;
  ears?: string;
  earrings?: string;

  // Body region
  topwear?: string;
  bottomwear?: string;
  footwear?: string;
  eyewear?: string;
  hat?: string;

  // Limbs
  upperLimbs?: string;
  lowerLimbs?: string;
}

export interface HumanCharacterConfig extends ICharacterGraphicAttribute {
  name?: string;
  bodyParts?: HumanBodyParts;
  gender?: 'male' | 'female';
  bodyType?: 'slim' | 'average' | 'athletic' | 'heavy';
}

export class HumanCharacter extends Character {
  private bodyParts: HumanBodyParts;
  private gender: 'male' | 'female';
  private bodyType: 'slim' | 'average' | 'athletic' | 'heavy';

  constructor(params: HumanCharacterConfig) {
    // Create base character definition with human skeleton
    const characterDefinition: CharacterDefinition = {
      name: params.name || 'human_character',
      skeleton: DEFAULT_HUMAN_SKELETON,
      defaultPose: DEFAULT_HUMAN_POSES.stand,
      poses: DEFAULT_HUMAN_POSES,
      parts: []
    };

    // 1. First, add all default parts
    const defaultParts = Object.entries(DEFAULT_HUMAN_PARTS).map(([partName, defaultPart]) => ({
      name: partName,
      jointName: defaultPart.jointName,
      graphic: {
        type: defaultPart.graphic.type,
        attributes: {
          ...defaultPart.graphic.attributes
        }
      },
      offset: defaultPart.offset
    }));

    // 2. If bodyParts is specified, filter out the parts that should be hidden
    if (params.bodyParts) {
      characterDefinition.parts = defaultParts.filter(
        part => params.bodyParts![part.name as keyof HumanBodyParts] !== undefined
      );
    } else {
      characterDefinition.parts = defaultParts;
    }

    // 3. Override with custom parts from params.characterDefinition if provided
    if (params.characterDefinition?.parts) {
      // Create a map of custom parts for easy lookup
      const customPartsMap = new Map(params.characterDefinition.parts.map(part => [part.name, part]));

      // Replace or add custom parts
      characterDefinition.parts = characterDefinition.parts.map(part =>
        customPartsMap.has(part.name) ? customPartsMap.get(part.name)! : part
      );

      // Add any new custom parts that weren't in the defaults
      params.characterDefinition.parts.forEach(customPart => {
        if (!characterDefinition.parts.some(p => p.name === customPart.name)) {
          characterDefinition.parts.push(customPart);
        }
      });
    }

    super({ ...params, characterDefinition });

    this.bodyParts = params.bodyParts || {};
    this.gender = params.gender || 'male';
    this.bodyType = params.bodyType || 'average';
  }

  // Method to update body parts
  updateBodyPart(partName: keyof HumanBodyParts, style: string) {
    this.bodyParts[partName] = style;

    // Find and remove existing part
    const parts = this.toDefinition().parts.filter(p => p.name !== partName);

    // Add new part if it exists in defaults
    const defaultPart = DEFAULT_HUMAN_PARTS[partName as string];
    if (defaultPart) {
      parts.push({
        name: partName,
        jointName: defaultPart.jointName,
        graphic: {
          type: defaultPart.graphic.type,
          attributes: {
            ...defaultPart.graphic.attributes
          }
        },
        offset: defaultPart.offset
      });
    }

    // Update character with new parts
    this.loadFromDefinition({
      ...this.toDefinition(),
      parts
    });
  }
}

export function createHumanCharacter(config: HumanCharacterConfig): HumanCharacter {
  return new HumanCharacter(config);
}
