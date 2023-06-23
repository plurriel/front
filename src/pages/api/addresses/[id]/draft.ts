// import { getLogin } from '@/lib/login';
// import { prisma } from '@/lib/prisma';
// import { hasPermissions } from '@/lib/authorization';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   return res.status(501).json({
//     message: 'To come',
//   });
//   // switch (req.method) {
//   //   case 'POST':
//   //     const user = await getLogin(req);
//   //     if (user instanceof Error) {
//   //       return res.status(412).json({
//   //         message: `Precondition Failed - Must log in before continuing + ${user.message}`,
//   //       });
//   //     }

//   //     const address = await prisma.address.findUnique({
//   //       where: {
//   //         id: crackOpen(req.query.id),
//   //       },
//   //     });

//   //     if (!address) {
//   //       return res.status(404).json({
//   //         message: 'No such address',
//   //       });
//   //     }

//   //     if (!(await hasPermissions(['address', address.id], ['view', 'consult'], user.id))) {
//   //       return res.status(401).json({
//   //         message: 'Insufficient permissions - Must be able to view and consult address',
//   //       });
//   //     }
//   //     return res.status(200).json(mail);
//   //   default:
//   //     return res.status(405).json({
//   //       message: 'Method not allowed',
//   //     });
//   // }
// }
