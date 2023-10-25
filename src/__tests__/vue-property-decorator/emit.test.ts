import { project, expectMigration } from '../utils';

describe('@Emit decorator', () => {
  afterAll(() => {
    project.getSourceFiles().forEach((file) => file.deleteImmediatelySync());
  });

  test('@Emit simple', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Emit('change')
                    emitChangeEvent() {}
                }`,
      // Result
      `import { defineComponent } from "vue";

                export default defineComponent({
                  methods: {
                    emitChangeEvent() {
                      this.$emit('change')
                    }
                  }
                })`,
    );
  });

  test('@Emit with async method', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Emit('change')
                    async emitChangeEvent() {
                      return await someAsyncFunc()
                    }
                }`,
      // Result
      `import { defineComponent } from "vue";

                export default defineComponent({
                  methods: {
                    async emitChangeEvent() {
                      this.$emit('change', await someAsyncFunc())
                    }
                  }
                })`,
    );
  });

  test('@Emit with async method and params', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Emit('change')
                    async emitChangeEvent(param: string) {
                      return await someAsyncFunc()
                    }
                }`,
      // Result
      `import { defineComponent } from "vue";

                export default defineComponent({
                  methods: {
                    async emitChangeEvent(param: string) {
                      this.$emit('change', await someAsyncFunc(), param)
                    }
                  }
                })`,
    );
  });

  test('@Emit with simple params', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Emit('change')
                    emitChangeEvent(someParam: string) {}
                }`,
      // Result
      `import { defineComponent } from "vue";

                export default defineComponent({
                  methods: {
                    emitChangeEvent(someParam: string) {
                      this.$emit('change', someParam)
                    }
                  }
                })`,
    );
  });

  test('@Emit with multiple params', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Emit('change')
                    emitChangeEvent(someParam1: string, someParam2: number) {}
                }`,
      // Result
      `import { defineComponent } from "vue";

                export default defineComponent({
                  methods: {
                    emitChangeEvent(someParam1: string, someParam2: number) {
                      this.$emit('change', someParam1, someParam2)
                    }
                  }
                })`,
    );
  });

  test('@Emit with object param', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Emit('change')
                    emitChangeEvent(someObj: {name: string, age: number}) {}
                }`,
      // Result
      `import { defineComponent } from "vue";

                export default defineComponent({
                  methods: {
                    emitChangeEvent(someObj: {name: string, age: number}) {
                      this.$emit('change', someObj)
                    }
                  }
                })`,
    );
  });

  test('@Emit with simple return values', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Emit('change')
                    emitChangeEvent() {
                      return 'test string'
                    }
                }`,
      // Result
      `import { defineComponent } from "vue";

                export default defineComponent({
                  methods: {
                    emitChangeEvent() {
                      this.$emit('change', 'test string')
                    }
                  }
                })`,
    );
  });

  test('@Emit with class property return values', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Emit('change')
                    emitChangeEvent() {
                      return this.testValue
                    }
                }`,
      // Result
      `import { defineComponent } from "vue";

                export default defineComponent({
                  methods: {
                    emitChangeEvent() {
                      this.$emit('change', this.testValue)
                    }
                  }
                })`,
    );
  });

  test('@Emit with object return values', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Emit('change')
                    emitChangeEvent() {
                      return {key: string}
                    }
                }`,
      // Result
      `import { defineComponent } from "vue";

                export default defineComponent({
                  methods: {
                    emitChangeEvent() {
                      this.$emit('change', {key: string})
                    }
                  }
                })`,
    );
  });

  test('@Emit with return value from params', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Emit('change')
                    emitChangeEvent(someValue: number) {
                      return someValue
                    }
                }`,
      // Result
      `import { defineComponent } from "vue";

                export default defineComponent({
                  methods: {
                    emitChangeEvent(someValue: number) {
                      this.$emit('change', someValue)
                    }
                  }
                })`,
    );
  });

  test('@Emit with variable expression', async () => {
    await expectMigration(
      `@Component
                export default class Test extends Vue {
                    @Emit('change')
                    emitChangeEvent(someValue: number) {
                      const value = 'some value'
                      const unusedValue = 'new unused value'
                      return value
                    }
                }`,
      // Result
      `import { defineComponent } from "vue";

                export default defineComponent({
                  methods: {
                    emitChangeEvent(someValue: number) {
                      const value = 'some value'
                      const unusedValue = 'new unused value'
                      this.$emit('change', value, someValue)
                    }
                  }
                })`,
    );
  });
});
