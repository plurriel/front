/* eslint-disable no-fallthrough */
import { prisma } from './prisma';

// eslint-disable-next-line import/prefer-default-export
export async function hasPermissions([scopeType, originalScopeId], requestedPerms, userId) {
  requestedPerms = new Set(requestedPerms);
  let scopeId = originalScopeId;
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
        // eslint-disable-next-line no-restricted-syntax
        for (const requestedPerm of requestedPerms) {
          const addressAuthorizationValue = addressAuthorization[requestedPerm];
          if (addressAuthorizationValue === false) return false;
          if (addressAuthorizationValue === true) requestedPerms.delete(requestedPerm);
        }
        if (requestedPerms.size === 0) return true;
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
        // eslint-disable-next-line no-restricted-syntax
        for (const requestedPerm of requestedPerms) {
          const subdomainAuthorizationValue = subdomainAuthorization[requestedPerm];
          if (subdomainAuthorizationValue === false) return false;
          if (subdomainAuthorizationValue === true) requestedPerms.delete(requestedPerm);
        }
        if (requestedPerms.size === 0) return true;
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
        // eslint-disable-next-line no-restricted-syntax
        for (const requestedPerm of requestedPerms) {
          const domainAuthorizationValue = domainAuthorization[requestedPerm];
          if (domainAuthorizationValue === false) return false;
          if (domainAuthorizationValue === true) requestedPerms.delete(requestedPerm);
        }
        if (requestedPerms.size === 0) return true;
      }
    default:
      return true;
  }
}
