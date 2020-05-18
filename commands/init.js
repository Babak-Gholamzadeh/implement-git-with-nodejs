const path = require('path');

const isInitialized = wd =>
  wd ? _.Right(wd) : _.Left(wd);

const normalizeWorkDir = _.compose(
  _.fold2(
    x => '.',
    path.normalize
  ),
  isInitialized
);

const log = _.curry((label, x) => {
  console.log(`${label}: ${x}`);
  return x;
});

const mkdir = _.curry((dir, base) => {
  console.log('mkdir:\t\t', path.join(base, dir));
  return _.Identity(path.join(base, dir));
});
const writeFile = _.curry((dir, content, base) => {
  console.log('writeFile:\t', path.join(base, dir));
  return _.Identity(path.join(base, dir));
});


// mkdir:     .vcs
// mkdir:     .vcs\objects
// mkdir:     .vcs\refs
// mkdir:     .vcs\refs\heads
// writeFile: .vcs\refs\heads\master
// mkdir:     .vcs\refs\tags
// writeFile: .vcs\HEAD
// 
// List(
// 	Identity(.vcs\objects),
// 	List(
// 		List(
// 			Identity(.vcs\refs\heads\master)
// 		),
// 		Identity(.vcs\refs\tags)
// 	),
// 	Identity(.vcs\HEAD)
// )
const init = _.pipe(
  normalizeWorkDir,
  mkdir(`.${process.env.NAME}`),
  _.pass(
    _.List(
      mkdir('objects'),
      _.pipe(
        mkdir('refs'),
        _.pass(
          _.List(
            _.pipe(
              mkdir('heads'),
              _.pass(
                _.List(
                  writeFile('master', 'master content')
                )
              )
            ),
            mkdir('tags'),
          )
        ),
      ),
      writeFile('HEAD', 'HEAD content')
    )
  ),
  log('result')
);

module.exports = init;

