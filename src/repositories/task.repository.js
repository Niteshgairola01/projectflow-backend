import Task from "../models/task.model.js";

export const createTask = (taskData) => {
    return Task.create(taskData);
};

export const getTasksByProject = (
    workspaceId,
    projectId
) => {
    return Task.find({
        workspace: workspaceId,
        project: projectId,
    }).populate("assignedTo", "name email")
        .sort({
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