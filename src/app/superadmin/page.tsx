
import { fetchAllUsers } from "@/app/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserCog } from "lucide-react";
import { SuperAdminActions } from "@/components/SuperAdminActions";
import { Separator } from "@/components/ui/separator";


export default async function SuperAdminPage() {
    const users = await fetchAllUsers();
    const adminUids = (process.env.NEXT_PUBLIC_ADMIN_UIDS || "").split(',');
    const superAdminUids = (process.env.NEXT_PUBLIC_SUPERADMIN_UIDS || "").split(',');

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                 <UserCog className="h-8 w-8 text-purple-500" />
                 <div>
                    <h1 className="text-3xl font-bold">Panel de Superadministrador</h1>
                     <p className="text-muted-foreground">
                        Gestión avanzada de usuarios y datos de la aplicación.
                    </p>
                 </div>
            </div>
           
             <div className="rounded-2xl border bg-card/60 backdrop-blur-xl overflow-hidden">
                <div className="p-6">
                    <h2 className="text-xl font-semibold">Gestión de Roles de Usuario</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Para asignar un rol, copia el UID del usuario y agrégalo a la variable de entorno correspondiente en tu archivo <code className="bg-muted px-1.5 py-0.5 rounded-md text-xs">.env</code>, separado por comas si hay más de uno.
                    </p>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>UID</TableHead>
                            <TableHead>Rol</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.uid}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={user.photoURL || undefined} />
                                            <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{user.displayName || 'Sin Nombre'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <code className="text-sm bg-muted p-2 rounded-lg">{user.uid}</code>
                                </TableCell>
                                <TableCell>
                                     {superAdminUids.includes(user.uid) ? (
                                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-400">Super Admin</Badge>
                                     ) : adminUids.includes(user.uid) ? (
                                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400">Admin</Badge>
                                    ) : <Badge variant="outline">Usuario</Badge>}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {users.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">No se pudieron cargar los usuarios. Asegúrate de que las variables de entorno del Admin SDK (GOOGLE_CLIENT_EMAIL, etc.) estén configuradas correctamente.</p>
                    </div>
                )}
            </div>
            
            <SuperAdminActions />
        </div>
    );
}
