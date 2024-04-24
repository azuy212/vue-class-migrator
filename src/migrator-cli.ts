import { Command } from 'commander';
import { migrateDirectory } from './migrator';
import { parseAndMigrateFile } from './migrator/migrator';

const program = new Command()
  .option('-d, --directory <string>', 'Directory to migrate')
  .option('-f, --file <string>', 'File to migrate')
  .option(
    '-s, --sfc',
    'If you would like to generate a SFC and remove the original scss and ts files',
    false,
  )
  .action((options) => (options.directory
    ? migrateDirectory(options.directory, options.sfc)
    : parseAndMigrateFile(options.file, options.sfc)))
  .parse(process.argv);

export default program;
