module.exports = class JsonGenerator {
  constructor({ parentKeys, valueIndex, contents, excludes }) {
    this.parents = parentKeys;
    this.valueIndex = valueIndex;
    this.contents = contents;
    this.excludes = excludes;
    this.excludedKeyPaths = [];
    this.orderedKeys = [];
    this.nullKeys = [];
    this.duplicates = []
    this.json = {};
    for (const row of this.contents) {
      const valueArr = [];
      for (const keyIndex of this.parents) {
        valueArr.push(row[keyIndex]);
      }
      this.orderedKeys.push(valueArr);
    }
    for (const excludeIndex of this.excludes) {
      const keyPath = this.orderedKeys[excludeIndex].join('.');
      this.excludedKeyPaths.push(keyPath);
    }
  }

  generate() {
    for (const [index, keys] of this.orderedKeys.entries()) {
      if (this.excludes.includes(index)) continue;
      let masterObj = this.json;
      for (const [keyIndex, currentKey] of keys.entries()) {
        if (keyIndex === keys.length - 1) {
          if (currentKey === null) {
            this.nullKeys.push(index);
            continue;
          }
          masterObj[currentKey] = this.contents[index][this.valueIndex];
        } else {
          if (currentKey === null) continue;
          if (!isKeyExists(masterObj, currentKey)) {
            masterObj[currentKey] = {};
          }
          masterObj = masterObj[currentKey];
        }
      }
    }
  }

  checkDuplicates() {
    let duplicates = [];
    const frequency = this.orderedKeys.reduce(function (
      seen,
      currentItem
    ) {
      if (currentItem in seen) {
        seen[currentItem] = seen[currentItem] + 1;
      } else {
        seen[currentItem] = 1;
      }
      return seen;
    }, {});

    for (const key in frequency) {
      const joinedKey = key.split(',').join('.');
      if (this.excludedKeyPaths.includes(joinedKey)) continue;
      if (frequency[key] > 1) {
        duplicates.push(
          key.split(",").map(function (currentItem) {
            return currentItem;
          })
        );
      }
    }

    if (duplicates.length > 0) {
      for (const duplicate of duplicates) {
        for (const [index, keys] of this.orderedKeys.entries()) {
          if (JSON.stringify(keys) !== JSON.stringify(duplicate)) continue;
          this.duplicates.push(index);
        }
      }
    } else {
      return [];
    }
  }
};

function isKeyExists(object, key) {
  if (object[key] === undefined) return false;
  return true;
}
