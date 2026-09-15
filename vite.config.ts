import { defineConfig } from "vite";
import { readFileSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';
import ts from 'typescript';

// Publish only configured media; keep unrelated local originals out of dist.
export default defineConfig({ base: "./", build: { copyPublicDir: false }, plugins: [{
  name: 'configured-public-assets',
  apply: 'build',
  generateBundle() {
    const publicRoot=resolve('public');
    const assets=new Set(['favicon.svg']);
    for(const sourcePath of ['src/content.ts','src/music.ts']) {
      const source=ts.createSourceFile(sourcePath,readFileSync(sourcePath,'utf8'),ts.ScriptTarget.Latest,true);
      const visit=(node:ts.Node)=>{
        if(ts.isPropertyAssignment(node) && ['src','poster'].includes(node.name.getText(source)) && ts.isStringLiteral(node.initializer)) {
          const url=node.initializer.text;
          if(url.startsWith('./')) assets.add(url.slice(2));
        }
        ts.forEachChild(node,visit);
      };
      visit(source);
    }
    for(const name of assets) {
      const path=resolve(publicRoot,name);const local=relative(publicRoot,path);
      if(local.startsWith('..')||isAbsolute(local)) throw new Error('Invalid public asset path');
      this.emitFile({type:'asset',fileName:name,source:readFileSync(path)});
    }
  }
}] });
