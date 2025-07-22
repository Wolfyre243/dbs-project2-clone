import RequireAuth from '~/components/RequireAuth';
import Roles from '~/rolesConfig';

export default function AdminRegisterPage() {
  return (
    <RequireAuth allowedRoles={[Roles.SUPERADMIN]}>
      <div className='space-y-6 px-4 py-6'>
        <h1 className='text-3xl font-bold'>Manage site settings here</h1>
      </div>
    </RequireAuth>
  );
}
