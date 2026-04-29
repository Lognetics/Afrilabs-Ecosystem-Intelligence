// Role-based access — keep this list authoritative.
// Roles map to capabilities; pages call `can(session, "capability")`.

export type Role = "SUPER_ADMIN" | "COO" | "ED" | "DEPT_HEAD" | "STAFF" | "PARTNER" | "HUB_ADMIN";

export type Capability =
  | "view:all"
  | "view:partnerships" | "edit:partnerships"
  | "view:programs" | "edit:programs"
  | "view:funding" | "edit:funding"
  | "view:members" | "edit:members"
  | "view:events" | "edit:events"
  | "view:campaigns" | "edit:campaigns"
  | "view:finance" | "edit:finance"
  | "view:audit"
  | "view:hr" | "edit:hr"
  | "view:tech" | "edit:tech"
  | "manage:users";

const CAPABILITIES: Record<Role, Capability[]> = {
  SUPER_ADMIN: ["view:all", "manage:users",
    "view:partnerships","edit:partnerships","view:programs","edit:programs",
    "view:funding","edit:funding","view:members","edit:members","view:events","edit:events",
    "view:campaigns","edit:campaigns","view:finance","edit:finance","view:audit",
    "view:hr","edit:hr","view:tech","edit:tech"],
  COO: ["view:all","view:partnerships","view:programs","view:funding","view:members","view:events","view:campaigns","view:finance","view:audit","view:hr","view:tech"],
  ED:  ["view:all","view:partnerships","view:programs","view:funding","view:members","view:events","view:finance"],
  DEPT_HEAD: ["view:partnerships","view:programs","view:funding","view:members","view:events","view:campaigns",
              "edit:partnerships","edit:programs","edit:events","edit:campaigns"],
  STAFF: ["view:partnerships","view:programs","view:funding","view:members","view:events","view:campaigns"],
  PARTNER: ["view:programs","view:events"],
  HUB_ADMIN: ["view:programs","view:events","view:members"],
};

export function can(role: Role | undefined | null, capability: Capability): boolean {
  if (!role) return false;
  const caps = CAPABILITIES[role];
  if (!caps) return false;
  return caps.includes("view:all") && capability.startsWith("view:") || caps.includes(capability);
}

export function rolesOf(): Role[] {
  return Object.keys(CAPABILITIES) as Role[];
}
