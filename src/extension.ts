'use strict';

import * as vscode from 'vscode';
import { selectedText } from './editor';
import { isJSX } from './modules/jsx';
import { ProviderResult } from 'vscode';
import { isStatelessComp, statelessToStatefulComponent } from './modules/statless-to-stateful';
import { isStatefulComp, statefulToStatelessComponent } from './modules/stateful-to-stateless';
import { extractToFile } from './modules/extract-to-file';
import { extractJSXToComponentToFile, extractJSXToComponent } from './modules/extract-to-component';
import { wrapJSXWithCondition } from './modules/wrap-with-conditional';
import { renameState, isStateVariable } from './modules/rename-state';
import { wrapWithUseEffect, isWrappableByEffect } from './modules/wrap-with-useeffect';
import { isFunctionInsideAFunction, wrapWithUseCallback } from './modules/wrap-with-usecallback';
import { isVariableDeclarationWithNonFunctionInit, wrapWithUseMemo } from './modules/wrap-with-usememo';

export class CompleteActionProvider implements vscode.CodeActionProvider {
  public provideCodeActions(): ProviderResult<vscode.Command[]> {
    const exportToFileAction = {
      command: 'extension.glean',
      title: 'Export to File'
    };

    const text = selectedText()

    if (isStateVariable(text)) {
      return [{
        command: 'extension.glean.react.rename-state-hook',
        title: 'Rename State'
      }];
    }

    if (isVariableDeclarationWithNonFunctionInit(text)) {
      return [{
        command: 'extension.glean.react.wrap-with-usememo',
        title: 'Wrap with useMemo'
      }];
    }

    if (isFunctionInsideAFunction()) {
      return [{
        command: 'extension.glean.react.wrap-with-usecallback',
        title: 'Wrap with useCallback'
      }];
    }

    if (isWrappableByEffect(text) && !isJSX(text)) {
      return [{
        command: 'extension.glean.react.wrap-with-useeffect',
        title: 'Wrap with useEffect'
      }];
    }

    if (isJSX(text)) {
      return [{
        command: 'extension.glean.react.extract-component-to-file',
        title: 'Extract Component to File'
      }, {
        command: 'extension.glean.react.extract-component',
        title: 'Extract Component'
      }, {
        command: 'extension.glean.react.render-conditionally',
        title: 'Render Conditionally'
      }];
    }

    if (isStatelessComp(text)) {
      return [
        exportToFileAction,
        {
          command: 'extension.glean.react.stateless-to-stateful',
          title: 'Convert Function to Class Component'
        }]
    }

    if (isStatefulComp(text)) {
      return [exportToFileAction, {
        command: 'extension.glean.react.stateful-to-stateless',
        title: 'Convert Class to Function Component'
      }]
    }


    return [exportToFileAction];
  }
}



export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.languages.registerCodeActionsProvider({ pattern: '**/*.*' }, new CompleteActionProvider()));

  vscode.commands.registerCommand('extension.glean', extractToFile);

  vscode.commands.registerCommand('extension.glean.react.extract-component-to-file', extractJSXToComponentToFile);

  vscode.commands.registerCommand('extension.glean.react.extract-component', extractJSXToComponent);

  vscode.commands.registerCommand('extension.glean.react.render-conditionally', wrapJSXWithCondition);

  vscode.commands.registerCommand('extension.glean.react.stateless-to-stateful', statelessToStatefulComponent);

  vscode.commands.registerCommand('extension.glean.react.stateful-to-stateless', statefulToStatelessComponent);

  vscode.commands.registerCommand('extension.glean.react.rename-state-hook', renameState);

  vscode.commands.registerCommand('extension.glean.react.wrap-with-useeffect', wrapWithUseEffect);

  vscode.commands.registerCommand('extension.glean.react.wrap-with-usecallback', wrapWithUseCallback);

  vscode.commands.registerCommand('extension.glean.react.wrap-with-usememo', wrapWithUseMemo);


}



// this method is called when your extension is deactivated
export function deactivate() {
}
