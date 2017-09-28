const marked = require('marked');
const path = require('path');
const fs = require('fs');
const md2bbc = require('./');

var argv = process.argv;
var args = argv.slice(2);
if(args.length == 0){
  console.log('Usage: node md2bbc.js [markdown_file]');
}else{
  var mdFile = args[0];
  var extension = path.extname(mdFile);
  if(extension != '.md'){
    console.log('Input Error: must markdown(*.md) file.');
  }else{
    var name = path.basename(mdFile, extension);
    var dir = path.dirname(mdFile);
    var smfFile = path.join(dir, name + '.smf');
    console.log('input: ', mdFile);
    console.log('output: ', smfFile);

    // Create a new instance of md2bbc renderer
    let renderer = new md2bbc();

    // Override html rendering
    renderer.list = function(body, ordered) {
      let type = ordered ? ' type=decimal' : '';
      return `[list${type}]\n${body}[/list]\n`;
    };

    renderer.tablecell = function(content, flags) {
      var type = 'td';
      let tag = (flags.align && this.options.tableAlign) ?`[${type} align=${flags.align}]`:`[${type}]`;
      return `${tag}${content}[/${type}]\n`;
    };

    renderer.heading = function(text, level, raw) {
      var size = 6 + (6  - level) * 2;
      var hr = (level <= 2 ? '[hr]':'');
      return `[size=${size}pt]${text}[/size]${hr}`;
    };

    marked.setOptions({
      renderer:renderer,

      paragraphTag: '',
      tableAttr: '',
      tableAlign: true
    });

    var bytes = fs.readFileSync(mdFile);
    var content = bytes.toString();
    var result = marked(content);
    fs.writeFileSync(smfFile, result);
    //console.log('content:', result);
    console.log('done.');
  }
}
