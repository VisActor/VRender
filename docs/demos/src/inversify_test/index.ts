import 'reflect-metadata';
import { ContainerModule, inject, injectable, Container, multiInject } from 'inversify';
@injectable()
class GlobalGun {}

const rect = Symbol.for('rect');

@injectable()
class DefaultRect {}

@injectable()
class RoughRect {}

@injectable()
class APP {
  constructor(@inject(GlobalGun) public globalGun: GlobalGun, @multiInject(rect) public rects: any) {}
}

const container = new Container();

const globalContainer = new ContainerModule(bind => {
  bind(APP).toSelf();
  bind(GlobalGun).toSelf();
  bind(DefaultRect).toSelf();
  bind(RoughRect).toSelf();

  bind(rect).to(DefaultRect);
  bind(rect).to(RoughRect);
});

container.load(globalContainer);

const app1 = container.get(APP);

const app2 = container.get(APP);

console.log(app1, app1.globalGun, app2, app1.globalGun);
