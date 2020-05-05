function Node(name, path, type = 'dir') {
  this.name = name;
  this.path = `${path}`;
  this.branchs = [];
  this.type = type;
}
Node.prototype.addBranch = function (name, type = 'dir') {
  const branch = new Node(
    name,
    `${this.path}${name}${type == 'dir' ? `/` : ``}`,
    type
  );
  this.branchs.push(branch);
  return branch;
};
Node.prototype.traverse = function (fn) {
  fn(this);
  for (let i = 0; i < this.branchs.length; i++) {
    this.traverse.call(this.branchs[i], fn);
  }
};
module.exports = Node;


