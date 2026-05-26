import * as vscode from 'vscode';
import { CoursesProvider } from './course/course';
import { Assignment, AssignmentsProvider } from './assignment/assignment';

export async function checkAll(statusBarItem: vscode.StatusBarItem, coursesProvider: CoursesProvider, assignmentsProvider: AssignmentsProvider) {
    statusBarItem.text = `CanvasBridge: Checking for unsubmitted assignments...`;
    statusBarItem.tooltip = 'CanvasBridge 과제를 확인하는 중...';

    const unsubmittedAssignments: [string, Assignment][] = [];

    try {
        const courses = await coursesProvider.getCourseList();
        coursesProvider.refresh(courses);

        for (const course of courses) {
            const assignments = await assignmentsProvider.getAssignmentList(course.courseId);
            for (const assignment of assignments) {
                if (assignment.workflow_state === 'unsubmitted') {
                    unsubmittedAssignments.push([course.label, assignment]);
                }
            }
        }

        if (unsubmittedAssignments.length === 0) {
            statusBarItem.tooltip = 'CanvasBridge: 미제출 과제가 없습니다.';
            statusBarItem.text = 'CanvasBridge: 0 Unsubmitted Assignments';
            return;
        }

        const lines = [];
        for (const [courseLabel, assignment] of unsubmittedAssignments) {
            const payload = {
                label: assignment.label,
                workflow_state: assignment.workflow_state,
                assignmentId: assignment.assignmentId,
                courseId: assignment.courseId,
                html: assignment.html,
                dueAt: assignment.dueAt,
                pointsPossible: assignment.pointsPossible,
                submissionTypes: assignment.submissionTypes,
                published: assignment.published,
            };
            lines.push(`- [${courseLabel} - ${assignment.label}](command:assignment.displayAssignmentPage?${encodeURIComponent(JSON.stringify([payload]))})`);
        }

        const tooltip = new vscode.MarkdownString(lines.join('\n'));
        tooltip.isTrusted = true;
        statusBarItem.tooltip = tooltip;
        statusBarItem.text = `CanvasBridge: ${unsubmittedAssignments.length} Unsubmitted Assignments`;
    } catch (error) {
        const message = error instanceof Error ? error.message : '알 수 없는 오류';
        statusBarItem.tooltip = `CanvasBridge: 과제 확인에 실패했습니다. (${message})`;
        statusBarItem.text = 'CanvasBridge: Check failed';
    }
}