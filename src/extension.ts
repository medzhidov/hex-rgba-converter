'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "px-to-rem-with-scss" is now active!');

    // create a new word counter
    let selections = new Selections();

    var disposable = vscode.commands.registerCommand('extension.toggle', () => {
        selections.toggleSelections();
    });

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(selections);
    context.subscriptions.push(disposable);
}

const   patternRgb = /(rgb)(\s*?)(\()(\s*?)([0-9]{1,3})(\s*?)(\,)(\s*?)([0-9]{1,3})(\s*?)(\,)(\s*?)([0-9]{1,3})(\s*?)(\))/g, 
        patternRgba = /(rgba)(\s*?)(\()(\s*?)([0-9]{1,3})(\s*?)(\,)(\s*?)([0-9]{1,3})(\s*?)(\,)(\s*?)([0-9]{1,3})(\s*?)(\,)(\s*?)(0?)(\.?)([0-9]*)(\s*?)(\))/g,
        patternHex = /\#[0-9a-fA-F]{6}|\#[0-9a-fA-F]{3}/g;

class Selections {
    
    public detect(string){
        if ( !!~string.search(patternRgb) ){
            return {
                type: 'rgb',
                string: string.match(patternRgb)[0].replace(/\s*/g, ''),
                realString: string
            };
        } else if (!!~string.search(patternRgba)){
            return {
                type: 'rgba',
                string: string.match(patternRgba)[0].replace(/\s*/g, ''),
                realString: string
            };
        } else if (!!~string.search(patternHex)){
            return {
                type: 'hex',
                string: string.match(patternHex)[0].replace(/\s*/g, ''),
                realString: string
            };
        }
    }
    
    public hexToRgba(string, realString): string{
        string = string.replace('#', '');
        
        var color = 'rgba(';
        
        if (string.length == 3){
            color += parseInt(string.slice(0,1) + '' + string.slice(0,1), 16) + ',';
            color += parseInt(string.slice(1,2) + '' + string.slice(1,2), 16) + ',';
            color += parseInt(string.slice(2,3) + '' + string.slice(2,3), 16);
        } else if (string.length == 6){
            color += parseInt(string.slice(0,2), 16) + ',';
            color += parseInt(string.slice(2,4), 16) + ',';
            color += parseInt(string.slice(4,6), 16);
        }
        
        color += ', 1)';
        
        realString = realString.replace(realString.match(patternHex)[0], color); 
        
        return realString;
    }
    
    public rgbaToHex(string, realString, type): string{
        var colors = string.replace('rgb', '').replace('a', '').replace('(', '').replace(')').split(',').slice(0,3).map(function(v){
            v = parseInt(v).toString(16);
            return ( v.length == 1 ) ? '0' + v : v;
        });
        
        var color = '#' + colors.join('');
        
        if( type == 'rgba' ){
            realString = realString.replace(realString.match(patternRgba)[0], color);
        } else if( type == 'rgb' ) {
            realString = realString.replace(realString.match(patternRgb)[0], color);
        }
        
        return realString;
    }
    
    public toggleSelections(): void {
        var editor = vscode.window.activeTextEditor;

        const selections: vscode.Selection[] = editor.selections;
        

        editor.edit(builder => {
            for (const selection of selections) {
                var text = editor.document.getText(new vscode.Range(selection.start, selection.end));
                var detect = this.detect(text);
                
                
                if( detect.type == 'rgba' || detect.type == 'rgb'){
                    text = this.rgbaToHex(detect.string, detect.realString, detect.type);
                    console.log(text, 'rgba');
                } else {
                    text = this.hexToRgba(detect.string, detect.realString);
                    console.log(text, 'hex');
                }
                
                
                builder.replace(selection, text);
            }
        });
    }

    dispose() {
    } 
}

// this method is called when your extension is deactivated
export function deactivate() {
}