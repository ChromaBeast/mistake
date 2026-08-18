package rbac

import "mistake-backend/internal/domain"

type Permission string

const (
	PermTenantRead        Permission = "tenant:read"
	PermTenantWrite       Permission = "tenant:write"
	PermUserList          Permission = "user:list"
	PermUserInvite        Permission = "user:invite"
	PermUserRoleUpdate    Permission = "user:role_update"
	PermUserStatusUpdate  Permission = "user:status_update"
	PermDataSourceUpload  Permission = "data_source:upload"
	PermDataSourceView    Permission = "data_source:view"
	PermEntityView        Permission = "entity:view"
	PermEntityMerge       Permission = "entity:merge"
	PermEventView         Permission = "event:view"
	PermMistakeView       Permission = "mistake:view"
	PermMistakeAct        Permission = "mistake:act"
	PermMistakeAssign     Permission = "mistake:assign"
	PermDashboardView     Permission = "dashboard:view"
	PermSearchView        Permission = "search:view"
	PermAuditRead         Permission = "audit:read"
	PermRetentionManage   Permission = "retention:manage"
	PermBillingView       Permission = "billing:view"
	PermBillingManage     Permission = "billing:manage"
	PermAccountDelete     Permission = "account:delete"
)

var rolePermissions = map[domain.UserRole]map[Permission]bool{
	domain.RoleOwner: {
		PermTenantRead: true, PermTenantWrite: true, PermUserList: true, PermUserInvite: true,
		PermUserRoleUpdate: true, PermUserStatusUpdate: true, PermDataSourceUpload: true,
		PermDataSourceView: true, PermEntityView: true, PermEntityMerge: true, PermEventView: true,
		PermMistakeView: true, PermMistakeAct: true, PermMistakeAssign: true,
		PermDashboardView: true, PermSearchView: true, PermAuditRead: true, PermRetentionManage: true,
		PermBillingView: true, PermBillingManage: true, PermAccountDelete: true,
	},
	domain.RoleAdmin: {
		PermTenantRead: true, PermTenantWrite: true, PermUserList: true, PermUserInvite: true,
		PermUserRoleUpdate: true, PermUserStatusUpdate: true, PermDataSourceUpload: true,
		PermDataSourceView: true, PermEntityView: true, PermEntityMerge: true, PermEventView: true,
		PermMistakeView: true, PermMistakeAct: true, PermMistakeAssign: true,
		PermDashboardView: true, PermSearchView: true, PermAuditRead: true, PermRetentionManage: true,
		PermBillingView: true, PermBillingManage: false, PermAccountDelete: false,
	},
	domain.RoleManager: {
		PermTenantRead: true, PermTenantWrite: false, PermUserList: true, PermUserInvite: false,
		PermUserRoleUpdate: false, PermUserStatusUpdate: false, PermDataSourceUpload: true,
		PermDataSourceView: true, PermEntityView: true, PermEntityMerge: true, PermEventView: true,
		PermMistakeView: true, PermMistakeAct: true, PermMistakeAssign: true,
		PermDashboardView: true, PermSearchView: true, PermAuditRead: false, PermRetentionManage: false,
		PermBillingView: true, PermBillingManage: false, PermAccountDelete: false,
	},
	domain.RoleAnalyst: {
		PermTenantRead: true, PermTenantWrite: false, PermUserList: true, PermUserInvite: false,
		PermUserRoleUpdate: false, PermUserStatusUpdate: false, PermDataSourceUpload: true,
		PermDataSourceView: true, PermEntityView: true, PermEntityMerge: true, PermEventView: true,
		PermMistakeView: true, PermMistakeAct: true, PermMistakeAssign: false,
		PermDashboardView: true, PermSearchView: true, PermAuditRead: false, PermRetentionManage: false,
		PermBillingView: false, PermBillingManage: false, PermAccountDelete: false,
	},
	domain.RoleViewer: {
		PermTenantRead: true, PermTenantWrite: false, PermUserList: true, PermUserInvite: false,
		PermUserRoleUpdate: false, PermUserStatusUpdate: false, PermDataSourceUpload: false,
		PermDataSourceView: true, PermEntityView: true, PermEntityMerge: false, PermEventView: true,
		PermMistakeView: true, PermMistakeAct: false, PermMistakeAssign: false,
		PermDashboardView: true, PermSearchView: true, PermAuditRead: false, PermRetentionManage: false,
		PermBillingView: false, PermBillingManage: false, PermAccountDelete: false,
	},
}

// HasPermission checks if the specified role has the requested permission.
func HasPermission(role domain.UserRole, perm Permission) bool {
	perms, ok := rolePermissions[role]
	if !ok {
		return false
	}
	return perms[perm]
}
