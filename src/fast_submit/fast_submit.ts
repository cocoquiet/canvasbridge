import * as vscode from 'vscode';

export class FastSubmitProvider implements vscode.TreeDataProvider<FastSubmit> {
    private _onDidChangeTreeData: vscode.EventEmitter<FastSubmit | undefined | null | void>
        = new vscode.EventEmitter<FastSubmit | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<FastSubmit | undefined | null | void>
        = this._onDidChangeTreeData.event;

    private fastSubmits: FastSubmit[];
    
    constructor(fastSubmits: FastSubmit[]) {
        this.fastSubmits = fastSubmits;
    }

    refresh(fastSubmits: FastSubmit[]): void {
        this.fastSubmits = fastSubmits;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: FastSubmit): vscode.TreeItem {
        return element;
    }

    getChildren(element?: FastSubmit): Thenable<FastSubmit[]> {
        return Promise.resolve(this.fastSubmits);
    }
}

export class FastSubmit extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly courseId: number,
        public readonly assignmentId: number,
        public readonly uri: vscode.Uri,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
    }
}