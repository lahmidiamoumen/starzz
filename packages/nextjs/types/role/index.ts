export type RoleRecord = "ADMIN" | "MODERATOR" | "FAN" | "CS";

export interface CsRecord {
  clubId: bigint;
  clubName: string;
  cs: string;
}
