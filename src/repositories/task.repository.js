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
    }).sort({
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
    });
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
    );
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