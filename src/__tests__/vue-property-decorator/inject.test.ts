import { project, expectMigration } from '../utils';

describe('@Provide decorator', () => {
  afterAll(() => {
    project.getSourceFiles().forEach((file) => file.deleteImmediatelySync());
  });

  test('@Inject simple', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Inject() readonly foo:string
                }`,
      // Result
      `import { defineComponent } from "vue";

      export default defineComponent({
                  inject: {
                    foo: 'foo'
                  }
                })`,
    );
  });

  test('@Inject simple with args', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Inject('injectionKey') readonly foo:string
                }`,
      // Result
      `import { defineComponent } from "vue";

      export default defineComponent({
                  inject: {
                    foo: 'injectionKey'
                  }
                })`,
    );
  });

  test('@Inject simple with identifier', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Inject(symbol) readonly foo:string
                }`,
      // Result
      `import { defineComponent } from "vue";

      export default defineComponent({
                  inject: {
                    foo: symbol
                  }
                })`,
    );
  });

  test('@Inject with object options', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Inject({ from: 'optional', default: 'default' }) readonly optional:string
                }`,
      // Result
      `import { defineComponent } from "vue";

      export default defineComponent({
                  inject: {
                    optional: { from: 'optional', default: 'default' }
                  }
                })`,
    );
  });
});
