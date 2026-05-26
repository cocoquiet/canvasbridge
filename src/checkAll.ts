import * as vscode from 'vscode';
import { CoursesProvider } from './course/course';
import { AssignmentsProvider } from './assignment/assignment';

export async function checkAll(statusBarItem: vscode.StatusBarItem, coursesProvider: CoursesProvider, assignmentsProvider: AssignmentsProvider) {
    statusBarItem.text = `CanvasBridge: Checking for unsubmitted assignments...`;
    let unsubmittedAssignments = [];

    const courses = await coursesProvider.getCourseList();
    coursesProvider.refresh(courses);
    for (const course of courses) {
        const assignments = await assignmentsProvider.getAssignmentList(course.courseId);
        unsubmittedAssignments.push(...assignments.filter(assignment => assignment.workflow_state == 'unsubmitted'));
    }

    statusBarItem.text = `CanvasBridge: ${unsubmittedAssignments.length} Unsubmitted Assignments`;
}