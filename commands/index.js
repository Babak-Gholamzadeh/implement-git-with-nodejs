const init = require('./init');

const cmdController = program => {
  program
    .command('init [directory]')
    .description(`Create an empty ${process.env.NAME.toUpperCase()} repository or reinitialize an existing one`)
    .action(init);

  program
    .command('hash-object')
    .action(() => {
      console.log('hash-object');
    });


  program.parse(process.argv);
};

module.exports = cmdController;
