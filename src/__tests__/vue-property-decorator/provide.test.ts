import { project, expectMigration, expectMigrationToThrow } from '../utils';

describe('@Provide decorator', () => {
  afterAll(() => {
    project.getSourceFiles().forEach((file) => file.deleteImmediatelySync());
  });

  test('provide clazz method', async () => {
    expectMigrationToThrow(
      `@Component
                export default class Test extends Vue {
                    provide() {}
                }`,
      'A method named "provide" should not be here',
    );
  });

  test('@Provide simple', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Provide() foo = 'bar'
                }`,
      // Result
      `import { defineComponent } from "vue";

      export default defineComponent({
                  provide() {
                    return {
                      'foo': this.foo
                    }
                  },
                  data() {
                    return {
                      foo: 'bar'
                    };
                  }
                })`,
    );
  });

  test('@Provide with decorator arguments', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Provide('bar') baz = 'bar'
                }`,
      // Result
      `import { defineComponent } from "vue";

      export default defineComponent({
                  provide() {
                    return {
                      'bar': this.baz
                    }
                  },
                  data() {
                    return {
                      baz: 'bar'
                    };
                  }
                })`,
    );
  });

  test('@Provide with decorator arguments and complex values', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Provide('provide1Key') provide1 = 'provide1Value'
                    @Provide('provide2Key') provide2 = {key: 'some obj'}
                    @Provide() provide3 = ['1', '2']
                }`,
      // Result
      `import { defineComponent } from "vue";

      export default defineComponent({
                  provide() {
                    return {
                      'provide1Key': this.provide1,
                      'provide2Key': this.provide2,
                      'provide3': this.provide3
                    }
                  },
                  data() {
                    return {
                      provide1: 'provide1Value',
                      provide2: {key: 'some obj'},
                      provide3: ['1', '2']
                    };
                  }
                })`,
    );
  });
});
