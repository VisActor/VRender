import type { IFederatedMouseEvent, InputEventSource } from '../interface/event';

type Listener = (event: IFederatedMouseEvent) => void;

/** Copy-on-write subscriptions: dispatch allocates nothing and cancellation can stop remaining listeners. */
export class InputSource {
  private listeners: Record<string, Listener[]> = {};
  readonly source: InputEventSource = {
    on: (type, listener) => {
      this.listeners[type] = (this.listeners[type] ?? []).concat(listener);
    },
    off: (type, listener) => {
      const list = this.listeners[type];
      if (list) {
        this.listeners[type] = list.filter(fn => fn !== listener);
      }
    }
  };

  emit(type: string, event: IFederatedMouseEvent, valid: () => boolean): void {
    const list = this.listeners[type];
    if (!list) {
      return;
    }
    const originalType = event.type;
    event.type = type;
    try {
      for (let i = 0; i < list.length && valid(); i++) {
        list[i](event);
      }
    } finally {
      event.type = originalType;
    }
  }

  clear(): void {
    this.listeners = {};
  }
}
