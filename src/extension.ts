import * as vscode from 'vscode';
import { Course, CoursesProvider } from './course/course';
import { Assignment, AssignmentsProvider } from './assignment/assignment';
import { displayAssignmentPage } from './assignment/displayAssignmentPage';
import { checkAll } from './checkAll';

let interval: ReturnType<typeof setInterval> | null = null;

export async function activate(context: vscode.ExtensionContext) {
	const coursesProvider = new CoursesProvider([]);
	vscode.window.createTreeView('course', {
		treeDataProvider: coursesProvider
	});
	coursesProvider.refresh(await coursesProvider.getCourseList());

	const assignmentsProvider = new AssignmentsProvider([]);
	vscode.window.createTreeView('assignment', {
		treeDataProvider: assignmentsProvider
	});

	vscode.commands.registerCommand('course.refreshEntry', async () => {
		const courses = await coursesProvider.getCourseList();
		coursesProvider.refresh(courses);
	});

	vscode.commands.registerCommand('course.listAssignment', async (course: Course) => {
		assignmentsProvider.refresh(course.courseId);
	});

	vscode.commands.registerCommand('assignment.displayAssignmentPage', async (assignment: Assignment) => {
		displayAssignmentPage(assignment, context);
	});

	vscode.commands.registerCommand('canvasbridge.checkall', async () => {
		checkAll(statusBarItem, coursesProvider, assignmentsProvider);
	});

	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	statusBarItem.command = 'canvasbridge.checkall';
	statusBarItem.show();
	
	vscode.commands.executeCommand('canvasbridge.checkall');
	const intervalCheckAll = async () => {
		vscode.commands.executeCommand('canvasbridge.checkall');
	};
	interval = setInterval(intervalCheckAll, 60 * 1000);
}

export function deactivate() {
	if (interval) {
		clearInterval(interval);
	}
}
