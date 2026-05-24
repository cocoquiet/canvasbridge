import * as vscode from 'vscode';
import { Course, CoursesProvider } from './course/course';
import { Assignment, AssignmentsProvider } from './assignment/assignment';
import { displayAssignmentPage } from './assignment/displayAssignmentPage';
import { AutoSubmit, AutoSubmitProvider } from './auto_submit/autoSubmit';

export async function activate(context: vscode.ExtensionContext) {
	const coursesProvider = new CoursesProvider([]);
	vscode.window.createTreeView('course', {
		treeDataProvider: coursesProvider
	});
	coursesProvider.refresh();

	const assignmentsProvider = new AssignmentsProvider([]);
	vscode.window.createTreeView('assignment', {
		treeDataProvider: assignmentsProvider
	});

	const autoSubmitProvider = new AutoSubmitProvider([]);
	vscode.window.createTreeView('autoSubmit', {
		treeDataProvider: autoSubmitProvider
	});

	vscode.commands.registerCommand('course.refreshEntry', async () => {
		coursesProvider.refresh();
	});

	vscode.commands.registerCommand('course.listAssignment', async (course: Course) => {
		assignmentsProvider.refresh(course.courseId);
	});

	vscode.commands.registerCommand('assignment.displayAssignmentInfo', async (assignment: Assignment) => {
		context.globalState.update(`selectedAssignment`, assignment.assignmentId);
		displayAssignmentPage(assignment, context);
		await autoSubmitProvider.refresh(assignment.assignmentId, context);
	});

	vscode.commands.registerCommand('assignment.addAutoSubmit', async () => {
		const selectedAssignmentId = context.globalState.get<number>('selectedAssignment');
		if (selectedAssignmentId) {
			await autoSubmitProvider.addAutoSubmit(selectedAssignmentId, context);
		}
	});

	vscode.commands.registerCommand('assignment.deleteAutoSubmit', async (autoSubmit: AutoSubmit) => {
		await autoSubmitProvider.deleteAutoSubmit(autoSubmit.fileUri, context);
	});
}

export function deactivate() {}
