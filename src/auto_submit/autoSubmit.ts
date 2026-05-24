import * as vscode from 'vscode';

export class AutoSubmitProvider implements vscode.TreeDataProvider<AutoSubmit> {
    private _onDidChangeTreeData: vscode.EventEmitter<AutoSubmit | undefined | null | void>
        = new vscode.EventEmitter<AutoSubmit | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<AutoSubmit | undefined | null | void>
        = this._onDidChangeTreeData.event;

    private autoSubmits: AutoSubmit[];
    
    constructor(autoSubmits: AutoSubmit[]) {
        this.autoSubmits = autoSubmits;
    }

    async refresh(assignmentId: number, context: vscode.ExtensionContext): Promise<void> {
        this.autoSubmits = context.globalState.get<AutoSubmit[]>(`autoSubmits_${assignmentId}`) || [];
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: AutoSubmit): vscode.TreeItem {
        return element;
    }

    getChildren(element?: AutoSubmit): Thenable<AutoSubmit[]> {
        return Promise.resolve(this.autoSubmits);
    }
}

export class AutoSubmit extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly fileUri: vscode.Uri,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
    }
}