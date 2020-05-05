#!/usr/bin/env node

const fs = require('fs').promises;
const crypto = require('crypto');
const os = require('os');
const path = require('path');
const { program } = require('commander');
const pkg = require('./package.json')
const Tree = require('./tree');
const VCS = 'vcs';
const autor = {
  username: 'Babak Gholamzadeh',
  email: 'babak.gholamzadeh92@gmail.com'
};


program.version(pkg.version);



console.log('running....\n');




(async () => {
  try {

    // Create '.vcs' directory and 'objects' directory inside it
    program
      .command('init')
      .action(init);
    
    await program.parseAsync(process.argv);
      
    // await init();

    // // Add some configs that required to recognize the committer
    // await config(username, email);

    // // Fetch all the files from everwhere
    // const root = new Tree(null, './');
    // await readPaths(root);
    // // Display the files to user to be nice
    // root.traverse(displayNode);

    // // Create blobs and tress
    // const rootHash = await createObjects(root);
    // console.log('rootHash:', rootHash);
    
    // // Commit them automatically
    // const commitHash = await createCommit(process.argv[2] || 'default message', rootHash, null);
    // console.log('commitHash:', commitHash);


  } catch (err) {
    console.log('>>>>>> ERROR:', err);
  }
})();

function dig(tree) {
  return fs.readdir(tree.path);
}

async function readPaths(tree) {
  const branchs = await dig(tree);
  for (let i = 0; i < branchs.length; i++) {
    const fullPathBranch = `${tree.path}${branchs[i]}`;
    if (await isFile(fullPathBranch)) {
      tree.addBranch(branchs[i], 'file');
    }
    else {
      if (branchs[i] !== `.${VCS}`) {
        const newTree = tree.addBranch(branchs[i]);
        await readPaths(newTree);
      }
    }
  }
}

async function isFile(path) {
  const stat = await fs.lstat(path);
  return stat.isFile();
}

function displayNode(node) {
  console.log(`\t${node.type}\t|\t${node.name}\t|\t${node.path}`);
}

async function createObjects(thisTree) {
  if (thisTree.type === 'file') {
    return await createBlob(thisTree); // return hashObject
  }
  var branchObjects = [];
  for (let i = 0; i < thisTree.branchs.length; i++) {
    branchObjects.push({
      type: thisTree.branchs[i].type,
      hash: await createObjects(thisTree.branchs[i]),
      name: thisTree.branchs[i].name
    });
  }
  return await createTree(branchObjects);
}

async function createBlob(file) {
  let content = await fs.readFile(file.path, 'utf8');
  const header = `blob ${content.length}\0`;
  const hash = sha1(header + content);
  content = header + content;
  const objectPath = `.${VCS}/objects/${hash.substr(0, 2)}`;
  await mkdir(objectPath);
  await mkfile(`${objectPath}/${hash.substr(2)}`, content);
  return hash;
}

async function createTree(dir) {
  let content = `${dir.map(path => `${path.type} ${path.hash} ${path.name}`).join('\n')}`;
  const header = `tree ${content.length}\0`;
  const hash = sha1(header + content);
  content = header + content;
  const objectPath = `.${VCS}/objects/${hash.substr(0, 2)}`;
  await mkdir(objectPath);
  await mkfile(`${objectPath}/${hash.substr(2)}`, content);
  return hash;
}

async function createCommit(commitMsg, rootHash, parent) {
  const timestamp = Math.floor(+new Date() / 1000);
  let timezoneOffset = new Date().getTimezoneOffset() * -1;
  let sign = '';
  if(Math.sign(timezoneOffset) === 1) sign = '+';
  else if(Math.sign(timezoneOffset) === -1) sign = '-';
  const hours = Math.floor(timezoneOffset / 60).toString().padStart(2, '0');
  const minutes = (timezoneOffset % 60).toString().padStart(2, '0');
  timezoneOffset = `${sign}${hours}${minutes}`;
  let content = `tree ${rootHash}${parent ? `\nparent ${parent}` : ``}\nauthor ${autor.username} <${autor.email}> ${timestamp} ${timezoneOffset}\ncommiter ${autor.username} <${autor.email}> ${timestamp} ${timezoneOffset}\n\n${commitMsg}\n`;
  const header = `commit ${content.length}\0`;
  const hash = sha1(header + content);
  content = header + content;
  const objectPath = `.${VCS}/objects/${hash.substr(0, 2)}`;
  await mkdir(objectPath);
  await mkfile(`${objectPath}/${hash.substr(2)}`, content);
  return hash;
}

function sha1(data) {
  var generator = crypto.createHash('sha1');
  generator.update(data);
  return generator.digest('hex');
}


async function config(username, email) {
  const content = JSON.stringify({ username, email });
  await mkfile(path.join(os.homedir(), `.${VCS}config`), content);
}


async function init() {
  // Make the root direcotry for repository
  await mkdir(`.${VCS}`);
  // Make the objects direcotory to store objects (blob, tree, commit)
  await mkdir(`.${VCS}/objects`);
  // Make the refs direcotory
  await mkdir(`.${VCS}/refs`);
  // Make the heads direcotory to store branches
  await mkdir(`.${VCS}/refs/heads`);
  // Make the HEAD file to point to the current branch
  await mkfile(`.${VCS}/HEAD`, 'ref: refs/heads/master');
}

async function mkdir(path) {
  try {
    await fs.stat(path);
  } catch (err) {
    await fs.mkdir(path, { recursive: true });
  }
}

function mkfile(path, content = '') {
  return fs.writeFile(path, content);
}



