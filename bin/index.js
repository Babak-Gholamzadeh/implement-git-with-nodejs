#!/usr/bin/env node

// Define a temporary conventional name
// to avoid the conflict of using 'git'
process.env.NAME = 'vcs';

const { program } = require('commander');
const commands = require('./../commands');
const pkg = require('./../package.json');

program.version(pkg.version);

program
  .name(process.env.Name)
  .description(`This cli application is a simple clone of Git with for educational purposes`);


commands(program);
