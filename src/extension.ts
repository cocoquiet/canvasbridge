import * as vscode from 'vscode';
import { Course, CoursesProvider } from './course/course';
import { Assignment, AssignmentsProvider } from './assignment/assignment';
import { displayAssignmentPage } from './assignment/displayAssignmentPage';
import { AutoSubmitProvider } from './auto_submit/autoSubmit';

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

	vscode.commands.registerCommand('autoSubmit.listAutoSubmit', async (assignmentId: number) => {
		await autoSubmitProvider.refresh(assignmentId, context);
	});

	vscode.commands.registerCommand('assignment.displayAssignmentPage', async (assignment: Assignment) => {
		displayAssignmentPage(assignment, context);
	});
}

export function deactivate() {}
