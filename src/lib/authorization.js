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
  // OMG MY EYES ARE BLEEDING OUT PLEASE CHANGE THIS
  if (requestedPerms.size === 0 && !localPerms.inexistant) return true;
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
      const {
        id,
        usersLink: [domainAuthorization],
      } = await prisma.domain.findUnique({
        where: {
          id: scopeId,
        },
        select: {
          id: true,
          usersLink: {
            where: {
              userId,
            },
          },
        },
      });
      domains[id] = domainAuthorization || { inexistant: true };
      nextQuery = {
        domainId: scopeId,
      };
      mapHigherUp = true;
    case 'subdomain':
      if (!nextQuery) {
        nextQuery = {
          id: scopeId,
        };
      }
      const subdomainAuthorizations = await prisma.subdomain.findMany({
        where: nextQuery,
        select: {
          id: true,
          usersLink: {
            where: {
              userId,
            },
          },
          domainId: mapHigherUp,
        },
      });
      subdomainAuthorizations.forEach((subdomainAuthorizationObj) => {
        const subdomainAuthorization = subdomainAuthorizationObj.usersLink[0];
        subdomains[subdomainAuthorizationObj.id] = subdomainAuthorization || { inexistant: true };
        const { domainId } = subdomainAuthorizationObj;
        if (domainId && domainId in domains) {
          domains[domainId].next ??= [];
          domains[domainId].next.push(['subdomain', subdomainAuthorizationObj.id]);
        }
      });
      nextQuery = {
        subdomain: nextQuery,
      };
    case 'address':
      if (!nextQuery) {
        nextQuery = {
          id: scopeId,
        };
      }
      const addressAuthorizations = await prisma.address.findMany({
        where: nextQuery,
        select: {
          id: true,
          usersLink: {
            where: {
              userId,
            },
          },
          subdomainId: mapHigherUp,
        },
      });
      addressAuthorizations.forEach((addressAuthorizationObj) => {
        const addressAuthorization = addressAuthorizationObj.usersLink[0];
        addresses[addressAuthorizationObj.id] = addressAuthorization || { inexistant: true };
        const { subdomainId } = addressAuthorizationObj;
        if (subdomainId && subdomainId in subdomains) {
          subdomains[subdomainId].next ??= [];
          subdomains[subdomainId].next.push(['address', addressAuthorizationObj.id]);
        }
      });
      break;
    default:
      throw new Error(`Unknown scope type: ${scopeType}`);
  }
  const result = new SomeTrueTree([scopeType, scopeId]);
  // const nextScope = {
  //   domain: 'subdomain',
  //   subdomain: 'address',
  // };
  function recursiveTreeTraversal(
    currentNode,
    [traversalScopeType, traversalScopeId],
    permissionsLocalLatest = false,
  ) {
    const scopes = {
      address: addresses,
      subdomain: subdomains,
      domain: domains,
    };

    const { next, ...currentObject } = scopes[traversalScopeType][traversalScopeId];

    const hasPermissionsResult = hasPermissionsLocal(currentObject, requestedPerms);
    currentNode.value = hasPermissionsResult instanceof Set
      ? permissionsLocalLatest
      : hasPermissionsResult;

    const override = next?.map(([type, id]) => {
      const label = [type, id];
      const newCurrentNode = currentNode.set(
        id,
        new SomeTrueTree(label),
      );
      const traversal = recursiveTreeTraversal(
        newCurrentNode,
        label,
        hasPermissionsResult instanceof Set
          ? permissionsLocalLatest
          : hasPermissionsResult,
      );
      // console.log(
      //   `TRAVERSING NODE ${id}`,
      //   hasPermissionsResult,
      //   newCurrentNode,
      //   label,
      //   scopes[type][id],
      //   hasPermissionsResult instanceof Set
      //     ? permissionsLocalLatest
      //     : hasPermissionsResult,
      //   traversal,
      // );
      return traversal;
    }).some(Boolean) || permissionsLocalLatest;

    return hasPermissionsResult instanceof Set
      ? override
      : hasPermissionsResult;
  }
  recursiveTreeTraversal(result, [scopeType, scopeId]);
  return result;
}
