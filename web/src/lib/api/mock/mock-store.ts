import {
  Tenant,
  User,
  TeamMember,
  DataSource,
  Entity,
  ReviewQueueItem,
  BusinessEvent,
  Mistake,
  AuditLog,
  RetentionPolicy,
} from "@/types";
import { initialMistakes } from "./data-mistakes";
import { initialEntities, initialReviewQueue, initialEvents } from "./data-entities";
import { initialDataSources } from "./data-sources";
import { initialAuditLogs } from "./data-audit";
import {
  initialTenant,
  initialCurrentUser,
  initialTeamMembers,
  initialRetentionPolicies,
} from "./data-tenant";

export class MockDataStore {
  tenant: Tenant = { ...initialTenant };
  currentUser: User = { ...initialCurrentUser };
  teamMembers: TeamMember[] = [...initialTeamMembers];
  dataSources: DataSource[] = [...initialDataSources];
  entities: Entity[] = [...initialEntities];
  reviewQueue: ReviewQueueItem[] = [...initialReviewQueue];
  events: BusinessEvent[] = [...initialEvents];
  mistakes: Mistake[] = [...initialMistakes];
  auditLogs: AuditLog[] = [...initialAuditLogs];
  retentionPolicies: RetentionPolicy[] = [...initialRetentionPolicies];
}
