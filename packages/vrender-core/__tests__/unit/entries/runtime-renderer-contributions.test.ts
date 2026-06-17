export {};
declare const require: any;

type RenderContributionCase = {
  moduleExport?: string;
  rendererName: string;
  contributionExport: string;
  contributionListProperty?: string;
};

describe('runtime graphic renderer contributions', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  const cases: RenderContributionCase[] = [
    {
      rendererName: 'DefaultCanvasGroupRender',
      contributionExport: 'GroupRenderContribution',
      contributionListProperty: '_groupRenderContribitions'
    },
    {
      moduleExport: 'imageModule',
      rendererName: 'DefaultCanvasImageRender',
      contributionExport: 'ImageRenderContribution'
    },
    {
      moduleExport: 'textModule',
      rendererName: 'DefaultCanvasTextRender',
      contributionExport: 'TextRenderContribution'
    },
    {
      moduleExport: 'arcModule',
      rendererName: 'DefaultCanvasArcRender',
      contributionExport: 'ArcRenderContribution'
    },
    {
      moduleExport: 'areaModule',
      rendererName: 'DefaultCanvasAreaRender',
      contributionExport: 'AreaRenderContribution'
    },
    {
      moduleExport: 'pathModule',
      rendererName: 'DefaultCanvasPathRender',
      contributionExport: 'PathRenderContribution'
    },
    {
      moduleExport: 'symbolModule',
      rendererName: 'DefaultCanvasSymbolRender',
      contributionExport: 'SymbolRenderContribution'
    },
    {
      moduleExport: 'circleModule',
      rendererName: 'DefaultCanvasCircleRender',
      contributionExport: 'CircleRenderContribution'
    },
    {
      moduleExport: 'polygonModule',
      rendererName: 'DefaultCanvasPolygonRender',
      contributionExport: 'PolygonRenderContribution'
    },
    {
      moduleExport: 'rectModule',
      rendererName: 'DefaultCanvasRectRender',
      contributionExport: 'RectRenderContribution'
    },
    {
      moduleExport: 'starModule',
      rendererName: 'DefaultCanvasStarRender',
      contributionExport: 'StarRenderContribution'
    }
  ];

  test.each(cases.map(testCase => [testCase.rendererName, testCase]))(
    '%s uses runtime-bound render contributions',
    (_rendererName, testCase) => {
      jest.isolateModules(() => {
        const {
          createNodeApp,
          getRuntimeInstallerBindingContext,
          installRuntimeGraphicRenderersToApp
        } = require('../../../src/entries');
        const { BaseRenderContributionTime } = require('../../../src/common/enums');
        const graphicModules = require('../../../src/graphic/modules');
        const contributionConstants = require('../../../src/render/contributions/render/contributions/constants');

        const bindingContext = getRuntimeInstallerBindingContext();
        if (testCase.moduleExport) {
          graphicModules[testCase.moduleExport]({ bind: bindingContext.bind, isBound: bindingContext.isBound });
        }

        const contribution = {
          time: BaseRenderContributionTime.beforeFillStroke,
          useStyle: false,
          order: 999,
          drawShape: jest.fn()
        };
        bindingContext.bind(contributionConstants[testCase.contributionExport]).toConstantValue(contribution);

        const app = createNodeApp();
        installRuntimeGraphicRenderersToApp(app);

        const renderer = app.registry.renderer
          .getAll()
          .find((entry: any) => entry?.constructor?.name === testCase.rendererName);

        expect(renderer).toBeTruthy();
        expect((renderer as any)[testCase.contributionListProperty ?? '_renderContribitions']).toContain(contribution);
      });
    }
  );

  test.each([
    ['lineModule', 'DefaultCanvasLineRender'],
    ['glyphModule', 'DefaultCanvasGlyphRender'],
    ['richtextModule', 'DefaultCanvasRichTextRender'],
    ['arc3dModule', 'DefaultCanvasArc3DRender'],
    ['rect3dModule', 'DefaultCanvasRect3dRender'],
    ['pyramid3dModule', 'DefaultCanvasPyramid3dRender']
  ])('%s installs a factory-bound renderer', (moduleExport, rendererName) => {
    jest.isolateModules(() => {
      const {
        createNodeApp,
        getRuntimeInstallerBindingContext,
        installRuntimeGraphicRenderersToApp
      } = require('../../../src/entries');
      const graphicModules = require('../../../src/graphic/modules');

      const bindingContext = getRuntimeInstallerBindingContext();
      graphicModules[moduleExport]({ bind: bindingContext.bind, isBound: bindingContext.isBound });

      const app = createNodeApp();
      installRuntimeGraphicRenderersToApp(app);

      expect(app.registry.renderer.getAll().some((entry: any) => entry?.constructor?.name === rendererName)).toBe(true);
    });
  });
});
