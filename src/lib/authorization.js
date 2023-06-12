/* eslint-disable no-fallthrough */
import { prisma } from './prisma';
import { SomeTrueTree } from './sometruetree';

function hasPermissionsLocal(localPerms, oldRequestedPerms) {
  const requestedPerms = new Set(oldRequestedPerms);
  // eslint-disable-next-line no-restricted-syntax
  for (const requestedPerm of requestedPerms) {
    const localAuthorizationValue = localPerms[requestedPerm];
    if (localAuthorizationValue === false) return false;
    if (localAuthorizationValue === true) requestedPerms.delete(requestedPerm);
  }
  if (requestedPerms.size === 0) return true;
  return requestedPerms;
}

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
        const currScopePermCheck = hasPermissionsLocal(addressAuthorization, requestedPerms);
        if (currScopePermCheck !== null) return currScopePermCheck;
        requestedPerms = currScopePermCheck;
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
        const currScopePermCheck = hasPermissionsLocal(subdomainAuthorization, requestedPerms);
        if (currScopePermCheck !== null) return currScopePermCheck;
        requestedPerms = currScopePermCheck;
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
        const currScopePermCheck = hasPermissionsLocal(domainAuthorization, requestedPerms);
        if (currScopePermCheck !== null) return currScopePermCheck;
        requestedPerms = currScopePermCheck;
      }
    default:
      return false;
  }
}

// eslint-disable-next-line import/prefer-default-export
export async function hasPermissionsWithin([scopeType, originalScopeId], requestedPerms, userId) {
  requestedPerms = new Set(requestedPerms);
  const scopeId = originalScopeId;
  let nextQuery;
  let mapHigherUp = false;
  const domains = {};
  const subdomains = {};
  const addresses = {};
  switch (scopeType) {
    case 'domain':
      const domainAuthorization = await prisma.usersOnDomainsLink.findUnique({
        where: {
          userId_domainId: {
            userId,
            domainId: scopeId,
          },
        },
      });
      domains[domainAuthorization.domainId] = domainAuthorization;
      nextQuery = {
        subdomain: {
          domainId: scopeId,
        },
      };
      mapHigherUp = true;
    case 'subdomain':
      if (!nextQuery) {
        nextQuery = {
          subdomainId: scopeId,
        };
      }
      const subdomainAuthorizations = await prisma.usersOnSubdomainsLink.findMany({
        where: {
          userId,
          ...nextQuery,
        },
        include: {
          subdomain: {
            select: {
              domainId: mapHigherUp,
            },
          },
        },
      });
      console.log(subdomainAuthorizations, {
        where: {
          userId,
          ...nextQuery,
        },
      });
      subdomainAuthorizations.forEach((subdomainAuthorization) => {
        subdomains[subdomainAuthorization.subdomainId] = subdomainAuthorization;
        const domainId = subdomainAuthorization.subdomain?.domainId;
        console.log(domainId);
        if (domainId && domainId in domains) {
          subdomains[domainId].next ??= [];
          subdomains[domainId].next.push(['subdomain', subdomainAuthorization.addressId]);
        }
      });
      nextQuery = {
        address: nextQuery,
      };
    case 'address':
      if (!nextQuery) {
        nextQuery = {
          subdomainId: scopeId,
        };
      }
      const addressAuthorizations = await prisma.usersOnAddressesLink.findMany({
        where: {
          userId,
          ...nextQuery,
        },
        include: {
          address: {
            select: {
              subdomainId: mapHigherUp,
            },
          },
        },
      });
      addressAuthorizations.forEach((addressAuthorization) => {
        if (!hasPermissionsLocal(addressAuthorization, requestedPerms)) return;
        addresses[addressAuthorization.addressId] = addressAuthorization;
        const subdomainId = addressAuthorization.address?.subdomainId;
        if (subdomainId && subdomainId in subdomains) {
          subdomains[subdomainId].next ??= [];
          subdomains[subdomainId].next.push(['address', addressAuthorization.addressId]);
        }
      });
      break;
    default:
      throw new Error(`Unknown scope type: ${scopeType}`);
  }
  const result = new SomeTrueTree([scopeType, scopeId]);
  const nextScope = {
    domain: 'subdomain',
    subdomain: 'address',
  };
  function recursiveTreeTraversal(currentNode, [traversalScopeType, traversalScopeId]) {
    const scopes = {
      address: addresses,
      subdomain: subdomains,
      domain: domains,
    };

    const { next, ...currentObject } = scopes[traversalScopeType][traversalScopeId];

    currentNode.value = hasPermissionsLocal(currentObject, requestedPerms) === true;

    const override = next?.some((oneOfNext) => {
      const label = [nextScope[traversalScopeType], oneOfNext.id];
      const newCurrentNode = currentNode.set(
        oneOfNext.id,
        new SomeTrueTree(label),
      );
      return recursiveTreeTraversal(newCurrentNode, label);
    });

    return currentNode.value || override;
  }
  recursiveTreeTraversal(result, [scopeType, scopeId]);
  return result;
}
