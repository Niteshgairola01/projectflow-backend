export const hasPermission = (role, permission, permissionMap) => {
    return permissionMap[role]?.includes(permission) ?? false;
};