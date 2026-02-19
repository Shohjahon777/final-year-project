export const Roles = {
    ADMIN: 'ADMIN',
    FACULTY: 'FACULTY',   
} as const;

export type RoleType = keyof typeof Roles;