'use strict';

var fs = require('fs');
var util = require('util');
var handlebars = require('handlebars');
var markdown = require('markdown');
var _ = require('lodash');

function convertMarkdownItem(item) {
  return item;
}

function extractStructureFromMarkdownML(markdownMl) {
  var markdownTree = { children: [] };
  var currentElt = markdownTree;
  var currentLevel = 0;
  var currentChildren = markdownTree.children;

  _.forEach(markdownMl, function(item) {
    if (item === 'markdown') {
      return;
    }

    if (_.isArray(item) && item[0] === 'header') {
      var level = item[1]['level'];
      //console.log('>> level = '+level+', currentLevel = '+currentLevel+', title = '+item[2]);
      if (level > currentLevel) {
        var header = {
          title: item[2],
          type: 'header',
          level: level,
          children: [],
          parent: currentElt
        };
        //console.log(' # attach on (1) '+currentElt.title);
        currentChildren.push(header);
        currentLevel++;
        currentElt = header;
        currentChildren = header.children;
      } else if (level === currentLevel) {
        currentElt = currentElt.parent;
        currentChildren = currentElt.children;
        var header = {
          title: item[2],
          type: 'header',
          level: level,
          children: [],
          parent: currentElt
        };
        //console.log(' # attach on (1) '+currentElt.title);
        currentChildren.push(header);
        currentElt = header;
        currentChildren = header.children;
      } else if (level < currentLevel) {
        for (var i = 0; i < currentLevel - level + 1; i++) {
          currentElt = currentElt.parent;
        }
        currentChildren = currentElt.children;
        var header = {
          title: item[2],
          type: 'header',
          level: level,
          children: [],
          parent: currentElt
        };
        //console.log(' # attach on (2) '+currentElt.title);
        currentChildren.push(header);
        currentElt = header;
        currentChildren = header.children;
        currentLevel = level;
      }
    } else {
      currentChildren.push(convertMarkdownItem(item));
    }
  });

  return markdownTree;
}

function formatMarkdownML(markdownMl) {
  return _.map(markdownMl, function(item) {
    if (_.isString(item)) {
      return {
        type: 'intro'
      };
    }

    if (item[0] === 'header') {
      return {
        type: 'header',
        title: item[2],
        properties: item[1]
      };
    } else if (item[0] === 'para') {
      if (_.isString(item[1])) {
        return {
          type: 'para',
          content: item[1]
        };
      } else if (_.isArray(item[1]) && item[1][0] === 'inlinecode') {
        return {
          type: 'inlinecode',
          content: item[1][1]
        };
      }
    }
  });
}

handlebars.registerHelper('ifCond', function(val1, val2, options) {
  if (val1 === val2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

handlebars.registerHelper('generateSectionId', function(val) {
  var id = val.replace(/ /g, '-');
  return new handlebars.SafeString(id.toLowerCase());
});

handlebars.registerHelper('trim', function(val) {
  return new handlebars.SafeString(val.trim());
});

fs.readFile('docs/templates/index.html', 'utf8', function(err, source) {
  var template = handlebars.compile(source);

  fs.readFile('docs/reference/dsl/layer.md', 'utf8', function(err, data) {
    var markdownContent = new markdown.markdown.Markdown();
    var markdownMl = markdownContent.toTree(data);
    // console.log('mk = '+JSON.stringify(markdownMl, null, 2));

    var content = formatMarkdownML(markdownMl);
    var structure = extractStructureFromMarkdownML(markdownMl);

    //console.log('content = '+util.inspect(content));

    //_.forEach(content.children, function(elt) {
    //  console.log('- elt = '+elt.title);
    //  _.forEach(elt.children, function(elt1) {
    //    console.log('  - elt = '+elt1.title);
    //    if (elt1.children) {
    //      _.forEach(elt1.children, function(elt2) {
    //        console.log('    - elt = '+elt2.title);
    //      });
    //    }
    //  });
    //});

    var html = template({raw: content, structure: structure});
    //console.log('html = '+html);
    fs.writeFile('docs/templates/output.html', html, function(err) {
      if (err) {
        throw err;
      }

      console.log('File written');
    });
  });
});