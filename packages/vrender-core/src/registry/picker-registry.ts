import type { IGraphicPicker } from '../interface/picker';
import type { IPickerRegistry, RegistryKey } from './types';

export class PickerRegistry implements IPickerRegistry {
  private readonly entries = new Map<RegistryKey, IGraphicPicker>();

  register(key: RegistryKey, picker: IGraphicPicker): void {
    this.entries.set(key, picker);
  }

  registerMany(entries: Iterable<[RegistryKey, IGraphicPicker]>): void {
    for (const [key, picker] of entries) {
      this.register(key, picker);
    }
  }

  get(key: RegistryKey): IGraphicPicker | undefined {
    return this.entries.get(key);
  }

  getAll(): IGraphicPicker[] {
    return Array.from(this.entries.values());
  }

  clear(): void {
    this.entries.clear();
  }
}
