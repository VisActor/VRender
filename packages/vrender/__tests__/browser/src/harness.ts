export interface IPageEntry {
  name: string;
  path: string;
  type?: 'ts' | 'tsx' | 'spec';
}

export interface IPageGroup {
  menu?: string;
  children?: Array<IPageEntry>;
  name?: string;
  path?: string;
  type?: 'ts' | 'tsx' | 'spec';
}

export interface IFlatPageEntry extends IPageEntry {
  category: string;
  type: 'ts' | 'tsx' | 'spec';
}

export interface IInitialPathResolution {
  isSmokeMode: boolean;
  requestedPath: string | null;
  path: string | null;
}

const DEFAULT_CATEGORY = 'ungrouped';
const DEFAULT_PAGE_TYPE: IFlatPageEntry['type'] = 'ts';

export const flattenPages = (entries: IPageGroup[]): IFlatPageEntry[] => {
  return entries.flatMap(entry => {
    if (entry.menu && entry.children?.length) {
      return entry.children.map(child => ({
        category: entry.menu!,
        name: child.name,
        path: child.path,
        type: (child.type as IFlatPageEntry['type']) ?? DEFAULT_PAGE_TYPE
      }));
    }

    if (entry.name && entry.path) {
      return [
        {
          category: DEFAULT_CATEGORY,
          name: entry.name,
          path: entry.path,
          type: (entry.type as IFlatPageEntry['type']) ?? DEFAULT_PAGE_TYPE
        }
      ];
    }

    return [];
  });
};

export const resolveInitialPath = (
  search: string,
  previousPath: string | null,
  pages: IFlatPageEntry[]
): IInitialPathResolution => {
  const params = new URLSearchParams(search);
  const requestedPath = params.get('route');
  const isSmokeMode = params.get('smoke') === '1';
  const candidatePath = requestedPath ?? previousPath;
  const firstPath = pages[0]?.path ?? null;
  const path = pages.some(page => page.path === candidatePath) ? candidatePath : firstPath;

  return {
    isSmokeMode,
    requestedPath,
    path
  };
};

export const isSmokeMode = (): boolean => {
  return Boolean((window as any).__D3_SMOKE__?.isSmokeMode);
};

export const setHarnessStage = (stage: unknown) => {
  (window as any).stage = stage ?? null;
};

export const setHarnessApp = (app: unknown) => {
  (window as any).__D3_HARNESS_APP__ = app ?? null;
};

export const setHarnessReactRoot = (root: unknown) => {
  (window as any).__D3_REACT_ROOT__ = root ?? null;
};

export const setHarnessCleanup = (cleanup?: (() => void) | null) => {
  (window as any).__D3_HARNESS_CLEANUP__ = cleanup ?? null;
};
