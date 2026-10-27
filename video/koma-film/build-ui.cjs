const esbuild=require('esbuild');
const path=require('node:path');
esbuild.build({entryPoints:[path.join(__dirname,'ui-harness.jsx')],outfile:path.join(__dirname,'assets/screens/ui-harness.js'),bundle:true,jsx:'automatic',plugins:[{name:'source-preview',setup(b){
  b.onResolve({filter:/^next\/(image|link)$/},a=>({path:a.path,namespace:'shim'}));
  b.onLoad({filter:/.*/,namespace:'shim'},a=>({contents:a.path==='next/image'?`import React from 'react';export default function Image({priority,fill,unoptimized,...props}){return React.createElement('img',props)}`:`import React from 'react';export default function Link(props){return React.createElement('a',props)}`,loader:'js',resolveDir:__dirname}));
  b.onResolve({filter:/^@\//},a=>({path:path.join(__dirname,'../../src',a.path.slice(2))+'.tsx'}));
}}]}).catch(e=>{console.error(e);process.exit(1)});
