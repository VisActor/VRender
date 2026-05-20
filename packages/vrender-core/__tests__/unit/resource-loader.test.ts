import { application } from '../../src/application';
import { ResourceLoader } from '../../src/resource-loader/loader';

describe('ResourceLoader', () => {
  const svg = '<svg></svg>';
  let oldGlobal: any;

  beforeEach(() => {
    oldGlobal = application.global;
    (ResourceLoader as any).cache.clear();
  });

  afterEach(() => {
    application.global = oldGlobal;
    (ResourceLoader as any).cache.clear();
    jest.restoreAllMocks();
  });

  test('marks svg load as failed when the environment rejects', async () => {
    const mark = {
      imageLoadSuccess: jest.fn(),
      imageLoadFail: jest.fn()
    };
    application.global = {
      loadSvg: jest.fn(() => Promise.reject(new Error('unsupported svg')))
    } as any;

    ResourceLoader.GetSvg(svg, mark as any);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mark.imageLoadSuccess).not.toHaveBeenCalled();
    expect(mark.imageLoadFail).toHaveBeenCalledTimes(1);
    expect(mark.imageLoadFail).toHaveBeenCalledWith(svg);
  });
});
