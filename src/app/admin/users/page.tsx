import { Shell } from "@/components/layout/Shell";
import { PageHeader } from "@/components/ui/Empty";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Field, Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { DEPARTMENTS } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

async function createUser(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = String(formData.get("role") || "STAFF");
  const department = String(formData.get("department") || "") || null;
  const password = String(formData.get("password") || "").trim();
  if (!name || !email || password.length < 6) return;
  await prisma.user.create({
    data: { name, email, role, department, passwordHash: await bcrypt.hash(password, 10) },
  });
  revalidatePath("/admin/users");
}

export default async function UsersAdmin() {
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return (
    <Shell>
      <PageHeader title="Users" subtitle="System accounts and access." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="All users" />
          <table className="table-base">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Active</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="font-medium">{u.name}</td>
                  <td className="text-xs">{u.email}</td>
                  <td><Badge tone="blue">{u.role}</Badge></td>
                  <td>{DEPARTMENTS.find(d=>d.code===u.department)?.name ?? "—"}</td>
                  <td><Badge tone={u.isActive?"green":"gray"}>{u.isActive?"Yes":"No"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <CardHeader title="Add user" />
          <form action={createUser}>
            <CardBody className="space-y-3">
              <Field label="Name"><Input name="name" required /></Field>
              <Field label="Email"><Input name="email" type="email" required /></Field>
              <Field label="Role">
                <Select name="role" defaultValue="STAFF">
                  {["SUPER_ADMIN","COO","ED","DEPT_HEAD","STAFF","PARTNER","HUB_ADMIN"].map(r=><option key={r}>{r}</option>)}
                </Select>
              </Field>
              <Field label="Department">
                <Select name="department" defaultValue="">
                  <option value="">—</option>
                  {DEPARTMENTS.map(d=><option key={d.code} value={d.code}>{d.name}</option>)}
                </Select>
              </Field>
              <Field label="Password" hint="Min 6 chars."><Input name="password" type="password" required /></Field>
            </CardBody>
            <div className="flex justify-end border-t border-gray-100 px-5 py-3"><Button type="submit">Create user</Button></div>
          </form>
        </Card>
      </div>
    </Shell>
  );
}
