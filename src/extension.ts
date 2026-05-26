import * as vscode from 'vscode';
import { Course, CoursesProvider } from './course/course';
import { Assignment, AssignmentsProvider } from './assignment/assignment';
import { displayAssignmentPage } from './assignment/displayAssignmentPage';

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
		statusBarItem.text = `CanvasBridge: Checking for unsubmitted assignments...`;
		let unsubmittedAssignments = [];

		const courses = await coursesProvider.getCourseList();
		coursesProvider.refresh(courses);
		for (const course of courses) {
			const assignments = await assignmentsProvider.getAssignmentList(course.courseId);
			unsubmittedAssignments.push(...assignments.filter(assignment => assignment.workflow_state == 'unsubmitted'));
		}

		statusBarItem.text = `CanvasBridge: ${unsubmittedAssignments.length} Unsubmitted Assignments`;
	});

	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	statusBarItem.command = 'canvasbridge.checkall';
	vscode.commands.executeCommand('canvasbridge.checkall');
	statusBarItem.show();

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
