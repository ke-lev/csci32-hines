import type { PrismaClient } from '@prisma/client'
import { RoleName, PermissionName } from '@prisma/client'

export const ADMIN_ROLE_ID = 'role-admin'
export const BASIC_ROLE_ID = 'role-basic'

export async function seedRoles(prisma: PrismaClient) {
  const adminRole = await prisma.role.upsert({
    where: { role_id: ADMIN_ROLE_ID },
    update: {},
    create: { role_id: ADMIN_ROLE_ID, name: RoleName.Admin },
  })
  const basicRole = await prisma.role.upsert({
    where: { role_id: BASIC_ROLE_ID },
    update: {},
    create: { role_id: BASIC_ROLE_ID, name: RoleName.Basic },
  })

  const [userRead, userWrite] = await Promise.all([
    prisma.permission.findUnique({ where: { name: PermissionName.UserRead } }),
    prisma.permission.findUnique({ where: { name: PermissionName.UserWrite } }),
  ])
  if (!userRead || !userWrite) throw new Error('Permissions must be seeded first!')

  await prisma.rolePermission.createMany({
    data: [
      { role_id: ADMIN_ROLE_ID, permission_id: userRead.permission_id },
      { role_id: ADMIN_ROLE_ID, permission_id: userWrite.permission_id },
      { role_id: BASIC_ROLE_ID, permission_id: userRead.permission_id },
    ],
    skipDuplicates: true,
  })
  console.log(`✅ Seeded roles: ${adminRole.name}, ${basicRole.name}`)
  return { adminRole, basicRole }
}
