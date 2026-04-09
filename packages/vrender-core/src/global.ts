import type { IGlobal } from './interface';
import { application } from './application';
import { VGlobal } from './constants';
import { createLegacySingletonProxy, resolveLegacySingleton } from './legacy/bootstrap';

export const vglobal = createLegacySingletonProxy<IGlobal>(() => resolveLegacySingleton<IGlobal>(VGlobal));

application.global = vglobal;
