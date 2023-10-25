import type MigrationManager from '../migratorManager';
import migrateProps from './prop';
import migratePropSyncs from './propSync';
import migrateModels from './model';
import migrateModelSyncs from './modelSync';
import migrateRefs from './ref';
import migrateWatchers from './watch';
import migrateEmits from './emit';
import migrateProvide from './provide';
import migrateInject from './inject';

export default (migrationManager: MigrationManager) => {
  migrateProps(migrationManager);
  migratePropSyncs(migrationManager);
  migrateModels(migrationManager);
  migrateModelSyncs(migrationManager);
  migrateRefs(migrationManager);
  migrateWatchers(migrationManager);
  migrateEmits(migrationManager);
  migrateProvide(migrationManager);
  migrateInject(migrationManager);
};

export const supportedDecorators = [
  'Prop',
  'PropSync',
  'Ref',
  'Model',
  'ModelSync',
  'Watch',
  'Emit',
  'Provide',
  'Inject',
]; // Class Property decorators
