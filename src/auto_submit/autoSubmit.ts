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

    async addAutoSubmit(assignmentId: number, context: vscode.ExtensionContext): Promise<void> {
        const files = await vscode.window.showOpenDialog({
            canSelectMany: true,
            openLabel: '자동 제출할 파일 선택',
            filters: {
                'All Files': ['*']
            }
        });

        for (const file of files || []) {
            if (context.globalState.get<AutoSubmit[]>(`autoSubmits_${assignmentId}`)?.some(submit => submit.fileUri.fsPath === file.fsPath)) {
                continue;
            }
            const newAutoSubmit = new AutoSubmit(file.fsPath.split('/').pop() || 'Unknown File', file, vscode.TreeItemCollapsibleState.None);
            const existingAutoSubmits = context.globalState.get<AutoSubmit[]>(`autoSubmits_${assignmentId}`) || [];
            context.globalState.update(`autoSubmits_${assignmentId}`, [...existingAutoSubmits, newAutoSubmit]);
        }

        this.refresh(assignmentId, context);
    }

    async deleteAutoSubmit(autoSubmitFileUri: vscode.Uri, context: vscode.ExtensionContext): Promise<void> {
        const assignmentId = context.globalState.get<number>('selectedAssignment');
        if (!assignmentId) {
            vscode.window.showInformationMessage('할당된 과제가 없습니다.');
            return;
        }

        const existingAutoSubmits = context.globalState.get<AutoSubmit[]>(`autoSubmits_${assignmentId}`) || [];
        if (existingAutoSubmits.length === 0) {
            vscode.window.showInformationMessage('삭제할 자동 제출 파일이 없습니다.');
            return;
        }

        const updatedAutoSubmits = existingAutoSubmits.filter(submit => submit.fileUri.fsPath !== autoSubmitFileUri.fsPath);
        context.globalState.update(`autoSubmits_${assignmentId}`, updatedAutoSubmits);
        this.refresh(assignmentId, context);
    }
}

export class AutoSubmit extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly fileUri: vscode.Uri,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.contextValue = 'deletable';
    }
}