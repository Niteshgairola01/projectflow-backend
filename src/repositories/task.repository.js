import Task from "../models/task.model.js";
import { escapeSearch } from "../validations/list.validation.js";

export function taskFilter(workspaceId, projectId, filters = {}) {
    const query = { workspace: workspaceId, project: projectId };
    if (filters.search) {
        const regex = { $regex: escapeSearch(filters.search), $options: "i" };
        query.$or = [{ title: regex }, { description: regex }];
    }
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.assignee) query.assignedTo = filters.assignee === "unassigned" ? null : filters.assignee;
    return query;
}

export async function getFilteredTasks(workspaceId, projectId, filters) {
    const base = { workspace: workspaceId, project: projectId };
    const [tasks, total] = await Promise.all([
        Task.find(taskFilter(workspaceId, projectId, filters)).populate("assignedTo", "name email").sort({ createdAt: -1, _id: -1 }),
        Task.countDocuments(base),
    ]);
    return { tasks, total, matching: tasks.length };
}

export const createTask = (taskData) => {
    return Task.create(taskData).then((task) => task.populate("assignedTo", "name email"));
};

export const getTasksByProject = (
    workspaceId,
    projectId
) => {
    return Task.find({
        workspace: workspaceId,
        project: projectId,
    }).populate("assignedTo", "name email").sort({
        createdAt: -1,
    });
};

export const getTaskById = (
    workspaceId,
    projectId,
    taskId
) => {
    return Task.findOne({
        _id: taskId,
        workspace: workspaceId,
        project: projectId,
    }).populate("assignedTo", "name email");
};

export const updateTask = (
    taskId,
    workspaceId,
    projectId,
    taskData
) => {
    return Task.findOneAndUpdate(
        {
            _id: taskId,
            workspace: workspaceId,
            project: projectId,
        },
        taskData,
        {
            new: true,
            runValidators: true,
        }
    ).populate("assignedTo", "name email");
};

export const deleteTask = (
    taskId,
    workspaceId,
    projectId
) => {
    return Task.findOneAndDelete({
        _id: taskId,
        workspace: workspaceId,
        project: projectId,
    });
};
