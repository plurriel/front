/* eslint-disable no-fallthrough */
import { prisma } from './prisma';

function applyMask(object, mask) {
  return Object.entries(mask)
    .reduce((result, [key, value]) => (value ? { ...result, [key]: object[key] } : result), {});
}

function allValuesTruthy(object) {
  return Object.value(object).every(Boolean);
}

// eslint-disable-next-line import/prefer-default-export
export async function hasPermissions([scopeType, originalScopeId], requestedPerms, userId) {
  let scopeId = originalScopeId;
  let perms;
  switch (scopeType) {
    case 'address':
      const addressAuthorization = await prisma.usersOnAddressesLink.findUnique({
        where: {
          userId_addressId: {
            userId,
            addressId: scopeId,
          },
        },
      });
      if (addressAuthorization) {
        perms = addressAuthorization;
        break;
      }
      const address = await prisma.address.findUnique({
        where: {
          id: scopeId,
        },
      });
      if (!address) return false;
      scopeId = address.subdomainId;
    case 'subdomain':
      const subdomainAuthorization = await prisma.usersOnSubdomainsLink.findUnique({
        where: {
          userId_subdomainId: {
            userId,
            subdomainId: scopeId,
          },
        },
      });
      if (subdomainAuthorization) {
        perms = subdomainAuthorization;
        break;
      }
      const subdomain = await prisma.subdomain.findUnique({
        where: {
          id: scopeId,
        },
      });
      if (!subdomain) return false;
      scopeId = subdomain.domainId;
    case 'domain':
      const domainAuthorization = await prisma.usersOnDomainsLink.findUnique({
        where: {
          userId_domainId: {
            userId,
            domainId: scopeId,
          },
        },
      });
      if (domainAuthorization) {
        perms = domainAuthorization;
        break;
      }
      const domain = await prisma.domain.findUnique({
        where: {
          id: scopeId,
        },
        select: {
          users: {
            where: {
              id: userId,
            },
          },
        },
      });
      if (!domain) return false;
      if (domain.users.length > 0) return true; // I'm gonna regret this
    default:
      return false;
  }
  return allValuesTruthy(applyMask(perms, requestedPerms));
}
