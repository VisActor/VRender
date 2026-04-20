import type { IContributionProvider, IDrawItemInterceptorContribution, IStage, IStageParams } from '../interface';
import type { IPlugin, IPluginContext } from '../plugins';
import { GraphicFactory, LayerFactory, StageFactory } from '../factory';
import {
  ContributionRegistry,
  type IContributionRegistry,
  PickerRegistry,
  PluginRegistry,
  type RegistryKey,
  RendererRegistry
} from '../registry';
import type { IAppContext, IAppContextFactoryName, IAppContextRegistryName } from './types';
import { DefaultDrawContribution } from '../render/contributions/render/draw-contribution';
import { DrawItemInterceptor } from '../render/contributions/render/draw-interceptor';
import { DefaultRenderService } from '../render/render-service';

interface IReleasableResource {
  release?: () => void;
}

const APP_CONTEXT_RELEASED_ERROR = 'AppContext has been released';

function createRegistryContributionProvider<T>(
  registry: IContributionRegistry<T>,
  key: RegistryKey
): IContributionProvider<T> {
  return {
    getContributions: () => registry.get(key)
  };
}

export class AppContext implements IAppContext {
  readonly registry;
  readonly factory;
  private readonly stageResources = new Set<IReleasableResource>();
  private _released = false;

  constructor(context: Partial<IPluginContext> = {}) {
    this.registry = {
      renderer: context.registry?.renderer ?? new RendererRegistry(),
      picker: context.registry?.picker ?? new PickerRegistry(),
      contribution: context.registry?.contribution ?? new ContributionRegistry(),
      plugin: context.registry?.plugin ?? new PluginRegistry()
    };
    this.factory = {
      stage: context.factory?.stage ?? new StageFactory(undefined, () => this.createStageDeps()),
      layer: context.factory?.layer ?? new LayerFactory(),
      graphic: context.factory?.graphic ?? new GraphicFactory()
    };
  }

  get released(): boolean {
    return this._released;
  }

  getRegistry<TKey extends IAppContextRegistryName>(name: TKey): IAppContext['registry'][TKey] {
    this.assertActive();
    return this.registry[name];
  }

  getFactory<TKey extends IAppContextFactoryName>(name: TKey): IAppContext['factory'][TKey] {
    this.assertActive();
    return this.factory[name];
  }

  installPlugin(plugin: IPlugin): void {
    this.assertActive();
    this.registry.plugin.install(plugin);
    plugin.install(this);
  }

  installPlugins(plugins: IPlugin[]): void {
    this.assertActive();
    for (const plugin of plugins) {
      this.installPlugin(plugin);
    }
  }

  uninstallPlugin(name: string): void {
    this.assertActive();
    const plugin = this.registry.plugin.get(name);

    if (!plugin) {
      return;
    }

    plugin.uninstall?.();
    this.registry.plugin.uninstall(name);
  }

  createStage(params: Partial<IStageParams> = {}): IStage {
    this.assertActive();
    const stage = this.factory.stage.create(params);
    const releasableStage = stage as unknown as IReleasableResource;
    const release = releasableStage.release?.bind(stage);
    let released = false;

    if (release) {
      releasableStage.release = () => {
        if (released) {
          return;
        }
        released = true;
        this.stageResources.delete(releasableStage);
        release();
      };
    }

    this.stageResources.add(releasableStage);
    return stage;
  }

  release(): void {
    if (this._released) {
      return;
    }

    const plugins = this.registry.plugin.getAll();
    for (const resource of this.stageResources) {
      resource.release?.();
    }
    this.stageResources.clear();

    for (const plugin of plugins) {
      plugin.uninstall?.();
    }

    this.registry.plugin.clear();
    this.registry.renderer.clear();
    this.registry.picker.clear();
    this.registry.contribution.clear();

    this._released = true;
  }

  private assertActive(): void {
    if (this._released) {
      throw new Error(APP_CONTEXT_RELEASED_ERROR);
    }
  }

  private createStageDeps() {
    return {
      renderService: new DefaultRenderService(
        new DefaultDrawContribution(
          [],
          createRegistryContributionProvider<IDrawItemInterceptorContribution>(
            this.registry.contribution as IContributionRegistry<IDrawItemInterceptorContribution>,
            DrawItemInterceptor
          ),
          {
            rendererRegistry: this.registry.renderer
          }
        )
      )
    };
  }
}
