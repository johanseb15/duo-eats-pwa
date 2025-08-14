
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


export default async function SuperAdminPage() {
    const users = await fetchAllUsers();
    const adminUids = (process.env.NEXT_PUBLIC_ADMIN_UIDS || "").split(',');

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                 <UserCog className="h-8 w-8 text-purple-500" />
                <h1 className="text-3xl font-bold">Panel de Superadmin</h1>
            </div>
            <p className="text-muted-foreground mb-4">
                Aquí puedes ver todos los usuarios registrados en la aplicación. Para convertir a un usuario en administrador, copia su UID y agrégalo a la variable de entorno <code className="bg-muted px-2 py-1 rounded-md text-sm">NEXT_PUBLIC_ADMIN_UIDS</code> en tu archivo <code className="bg-muted px-2 py-1 rounded-md text-sm">.env</code>, separado por comas.
            </p>
            <div className="rounded-2xl border bg-card/60 backdrop-blur-xl overflow-hidden">
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
                                    {adminUids.includes(user.uid) && (
                                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">Admin</Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             {users.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No se pudieron cargar los usuarios. Asegúrate de que las variables de entorno del Admin SDK (GOOGLE_CLIENT_EMAIL, etc.) estén configuradas correctamente.</p>
                </div>
            )}
        </div>
    );
}

    